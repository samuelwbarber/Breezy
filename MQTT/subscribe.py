import random
import os
import paho.mqtt.client as mqtt_client
import ssl

##This code would run on the back-end of the app
##remember to have the certificate broker.emqx.io-ca.crt in the same directory

broker = 'broker.emqx.io'
#port = 1883 # no SSL 
port = 8883 #SSL
topic = "IC.embedded/Breezy/test"
client_id = f'subscribe-{random.randint(0, 100)}-{os.getpid()}'

# Uncomment if username and password are needed
# username = 'emqx'
# password = 'public'

def connect_mqtt() -> mqtt_client:
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print(f"Failed to connect, return code {rc}")

    client = mqtt_client.Client(client_id)
    # Uncomment if username and password are needed
    # client.username_pw_set(username, password)
    client.on_connect = on_connect
    client.tls_set(ca_certs="broker.emqx.io-ca.crt", tls_version= ssl.PROTOCOL_TLSv1_2 )
    client.connect(broker, port)
    return client


def subscribe(client: mqtt_client):
    def on_message(client, userdata, msg):
        print(f"Received `{msg.payload.decode()}` from `{msg.topic}` topic")

    client.subscribe(topic)
    client.on_message = on_message


def run():
    client = connect_mqtt()
    subscribe(client)
    client.loop_forever()  # or client.loop_start() for non-blocking loop


if __name__ == '__main__':
    run()
