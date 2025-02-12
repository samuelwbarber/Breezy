import { Message } from "./message";

export class User {
  id: string;
  name: string;
  email: string;
  messageLog: Message[];

  constructor(id: string, name: string, email: string, messageLog: Message[] = []) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.messageLog = messageLog;
  }



  addMessage(latitude: number, longitude: number, eco2: number, tvoc: number, date: Date = new Date()): void {
    const newMessage = new Message(latitude, longitude, eco2, tvoc, date);
    this.messageLog = [...this.messageLog, newMessage]; // Ensure React state updates properly
  }

  getMessages(): Message[] {
    return this.messageLog;
  }

  getUserProfile(): string {
    return `User: ${this.name} (${this.email}) - ${this.messageLog.length} messages logged.`;
  }

  

}
