#!/usr/bin/env python3
import os
import time
import requests
from PIL import Image, ImageDraw, ImageFont
from gpiozero import Button
import board
import digitalio
import busio
import adafruit_ssd1306  # Used for spi comms to display
import RPi.GPIO as GPIO  # Used to create virtual I2C port

WIDTH = 128
HEIGHT = 32
AWS_SERVER_URL = "http://18.134.180.224:5000/data"
REGISTRATION_URL = "http://18.134.180.224:5000/register" 
oled = None
device_id = os.getenv("ID")


class ReadSensor:
    def __init__(self, scl_pin, sda_pin, address=0x5A, delay=0.00001):
        self.scl_pin = scl_pin
        self.sda_pin = sda_pin
        self.delay = delay
        self.address = address
        GPIO.setmode(GPIO.BCM)
        self._scl_release()
        self._sda_release()
        self._app_start()
        time.sleep(1)
        self._write_register(0x01, bytes([0x10]))

    def _scl_low(self):
        GPIO.setup(self.scl_pin, GPIO.OUT)
        GPIO.output(self.scl_pin, GPIO.LOW)

    def _scl_release(self):
        GPIO.setup(self.scl_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    def _sda_low(self):
        GPIO.setup(self.sda_pin, GPIO.OUT)
        GPIO.output(self.sda_pin, GPIO.LOW)

    def _sda_release(self):
        GPIO.setup(self.sda_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    def start_condition(self):
        self._sda_release()
        self._scl_release()
        time.sleep(self.delay)
        self._sda_low()
        time.sleep(self.delay)
        self._scl_low()

    def stop_condition(self):
        self._sda_low()
        self._scl_release()
        start_time = time.time()
        while GPIO.input(self.scl_pin) == 0:
            if time.time() - start_time > 0.01:
                break
            time.sleep(self.delay)
        time.sleep(self.delay)
        self._sda_release()
        time.sleep(self.delay)

    def write_bit(self, bit):
        if bit:
            self._sda_release()
        else:
            self._sda_low()
        time.sleep(self.delay)
        self._scl_release()
        start_time = time.time()
        while GPIO.input(self.scl_pin) == 0:
            if time.time() - start_time > 0.01:
                break
            time.sleep(self.delay)
        time.sleep(self.delay)
        self._scl_low()
        time.sleep(self.delay)

    def read_bit(self):
        self._sda_release()
        time.sleep(self.delay)
        self._scl_release()
        start_time = time.time()
        while GPIO.input(self.scl_pin) == 0:
            if time.time() - start_time > 0.01:
                break
            time.sleep(self.delay)
        bit = GPIO.input(self.sda_pin)
        time.sleep(self.delay)
        self._scl_low()
        time.sleep(self.delay)
        return bit

    def write_byte(self, byte):
        for i in range(7, -1, -1):
            self.write_bit((byte >> i) & 0x01)
        ack = self.read_bit()
        return (ack == 0)

    def read_byte(self, ack=True):
        value = 0
        for _ in range(8):
            value = (value << 1) | self.read_bit()
        self.write_bit(0 if ack else 1)
        return value

    def write(self, addr, data):
        self.start_condition()
        self.write_byte((addr << 1) | 0)
        for byte in data:
            self.write_byte(byte)
        self.stop_condition()

    def read(self, addr, length):
        self.start_condition()
        self.write_byte((addr << 1) | 1)
        result = []
        for i in range(length):
            ack_bit = True if i < (length - 1) else False
            result.append(self.read_byte(ack=ack_bit))
        self.stop_condition()
        return bytes(result)

    def writeto_then_readfrom(self, addr, out_data, length):
        self.start_condition()
        self.write_byte((addr << 1) | 0)
        for byte in out_data:
            self.write_byte(byte)
        self.start_condition()
        self.write_byte((addr << 1) | 1)
        result = []
        for i in range(length):
            ack_bit = True if i < (length - 1) else False
            result.append(self.read_byte(ack=ack_bit))
        self.stop_condition()
        return bytes(result)

    def _app_start(self):
        self.write(self.address, bytes([0xF4]))

    def _read_register(self, reg, length):
        return self.writeto_then_readfrom(self.address, bytes([reg]), length)

    def _write_register(self, reg, data):
        self.write(self.address, bytes([reg]) + data)

    def data_ready(self):
        status = self._read_register(0x00, 1)[0]
        return (status & 0x08) != 0

    def read_alg_result_data(self):
        return self._read_register(0x02, 8)

    @property
    def eco2(self):
        data = self.read_alg_result_data()
        return (data[0] << 8) | data[1]

    @property
    def tvoc(self):
        data = self.read_alg_result_data()
        return (data[2] << 8) | data[3]

def initialize_oled():
    spi = busio.SPI(board.SCK, MOSI=board.MOSI)
    dc_pin = digitalio.DigitalInOut(board.D25)
    cs_pin = digitalio.DigitalInOut(board.CE0)
    reset_pin = digitalio.DigitalInOut(board.D24)
    oled_device = adafruit_ssd1306.SSD1306_SPI(WIDTH, HEIGHT, spi, dc_pin, reset_pin, cs_pin)
    oled_device.fill(0)
    oled_device.show()
    return oled_device

def display_message(oled_device, message):
    image = Image.new("1", (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
    lines = message.split('\n')
    if len(lines) < 2:
        lines.append("")
    line_heights = [font.getsize(line)[1] for line in lines]
    total_text_height = sum(line_heights)
    y_offset = (HEIGHT - total_text_height) // 2
    for line in lines:
        draw.text((0, y_offset), line, font=font, fill=255)
        y_offset += font.getsize(line)[1]
    oled_device.image(image)
    oled_device.show()

def wait_for_registration():
    global device_id, oled
    registered = False
    while not registered:
        try:
            print(f"Sending registration request: {REGISTRATION_URL} with ID: {device_id}")
            response = requests.post(REGISTRATION_URL, json={"id": device_id})
            print(f"Response Status: {response.status_code}")
            print(f"Response Body: {response.text}")

            if response.ok:
                data = response.json()
                if data.get("exists"):
                    registered = True
                    break
        except Exception as e:
            print("Registration error:", e)

        display_message(oled, f"Device ID:\n{device_id}")
        time.sleep(5)

def main():
    global oled
    oled = initialize_oled()
    display_message(oled, "Starting...")
    time.sleep(2)
    
    # Check registration with the server.
    wait_for_registration()
    display_message(oled, "Registered!")
    time.sleep(1)
    

    # Initialize the sensor.
    sensor = ReadSensor(scl_pin=4, sda_pin=5)
    while not sensor.data_ready():
        time.sleep(0.1)
    count=0
    # Main loop: read sensor data, update display, and send data to the server.
    while True:
        if sensor.data_ready() and count % 10==0:
            count+=1
            data = sensor.read_alg_result_data()
            eco2 = (data[0] << 8) | data[1]
            tvoc = (data[2] << 8) | data[3]
            sensor_data = {
                "id": device_id,
                "eco2": eco2,
                "tvoc": tvoc
            }

            image = Image.new("1", (WIDTH, HEIGHT))
            draw = ImageDraw.Draw(image)
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
            draw.text((10, 0), "ECO2: " + str(eco2), font=font, fill=255)
            draw.text((10, 13), "TVOC: " + str(tvoc), font=font, fill=255)
            oled.image(image)
            oled.show()

            # Send sensor data to the server.
            try:
                print(f"Sending sensor data to {AWS_SERVER_URL}: {sensor_data}")
                response = requests.post(AWS_SERVER_URL, json=sensor_data)
                print(f"Response Status: {response.status_code}")
                print(f"Response Body: {response.text}")
            except Exception as e:
                print("Error sending sensor data:", e)
        elif sensor.data_ready():
            count+=1
            data = sensor.read_alg_result_data()
            eco2 = (data[0] << 8) | data[1]
            tvoc = (data[2] << 8) | data[3]
            sensor_data = {
                "id": device_id,
                "eco2": eco2,
                "tvoc": tvoc
            }

            image = Image.new("1", (WIDTH, HEIGHT))
            draw = ImageDraw.Draw(image)
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
            draw.text((10, 0), "ECO2: " + str(eco2), font=font, fill=255)
            draw.text((10, 13), "TVOC: " + str(tvoc), font=font, fill=255)
            oled.image(image)
            oled.show()
        time.sleep(0.2)
    GPIO.cleanup()

if __name__ == "__main__":
    main()
