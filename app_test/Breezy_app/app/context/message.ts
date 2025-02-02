export class Message {
    coordinate: { latitude: number; longitude: number };
    value: number;
    date: Date;
  
    constructor(latitude: number, longitude: number, value: number, date?: Date) {
      this.coordinate = { latitude, longitude };
      this.value = value;
      this.date = date || new Date(); // Default to current date if not provided
    }
  
    getFormattedMessage(): string {
      return `Message recorded at (${this.coordinate.latitude}, ${this.coordinate.longitude}) with value: ${this.value} on ${this.date.toISOString()}`;
    }
  }
  