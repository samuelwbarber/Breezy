import { Message } from "./message";

export class User {
  id: string;
  name: string;
  email: string;
  private passwordHash: string;
  messageLog: Message[];

  constructor(id: string, name: string, email: string, messageLog: Message[] = []) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = "";
    this.messageLog = messageLog;
  }

  setPassword(password: string): void {
    this.passwordHash = (password);
  }

  verifyPassword(password: string): boolean {
    return password === this.passwordHash;
  }

  addMessage(latitude: number, longitude: number, value: number, date: Date = new Date()): void {
    const newMessage = new Message(latitude, longitude, value, date);
    this.messageLog = [...this.messageLog, newMessage]; // Ensure React state updates properly
  }

  getMessages(): Message[] {
    return this.messageLog;
  }

  getUserProfile(): string {
    return `User: ${this.name} (${this.email}) - ${this.messageLog.length} messages logged.`;
  }
}
