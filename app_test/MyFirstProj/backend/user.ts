import { Message } from "./message";

export class User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  private passwordHash: string;
  messageLog: Message[];

  constructor(id: string, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.createdAt = new Date();
    this.passwordHash = "";
    this.messageLog = [];  
  }


  setPassword(password: string): void {
    this.passwordHash = this.hashPassword(password);
  }

  private hashPassword(password: string): string {
    return createHash("sha256").update(password).digest("hex");
  }

  verifyPassword(password: string): boolean {
    return this.hashPassword(password) === this.passwordHash;
  }
  
  addMessage(latitude: number, longitude: number, value: number, date?: Date): void {
    const newMessage = new Message(latitude, longitude, value, date);
    this.messageLog.push(newMessage);
  }

  getMessages(): Message[] {
    return this.messageLog;
  }

  getUserProfile(): string {
    return `User: ${this.name} (${this.email}) - ${this.messageLog.length} messages logged.`;
  }
}
