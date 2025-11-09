export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface Message {
  id: number;
  sender: Sender;
  text: string;
  encryptedText: string | null;
  decryptedText?: string | null;
  isRead?: boolean;
}