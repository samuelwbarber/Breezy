export class Message {
    coordinate: { latitude: number; longitude: number };
    //  LONGITUDE, LATITUDE, ECO2, TVOC, ENTRY_TIME
    eco2: number;
    tvoc: number;
    date: Date;
  
    constructor(latitude: number, longitude: number, eco2: number, tvoc: number,  date?: Date) {
      this.coordinate = { latitude, longitude };
      this.eco2 = eco2;
      this.tvoc = tvoc;
      this.date = date || new Date(); // Default to current date if not provided
    }
  
  }
  