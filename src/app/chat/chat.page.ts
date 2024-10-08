import { Component, OnInit } from '@angular/core';
import { Message } from '../models/message.model';
import { ChatService } from '../services/chat/chat.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  messages: Message[] = [];
  newMessageText = '';

  private colors: string[] = [
    '#f28b82', '#fbbc04', '#34a853', '#4285f4', '#ff6d01', '#00bcd4', '#8e44ad', '#e84393'
  ];

  constructor(
    private chatService: ChatService,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit() {
    this.getMessages();
  }

  getMessages() {
    this.chatService.getMessages().subscribe((messages) => {
      this.messages = messages;
    });
  }

  async sendMessage() {
    const user = await this.afAuth.currentUser;
    if (user) {
      const uid = user.uid;
      const userName = user.displayName || 'Desconocido';

      const message: Message = {
        text: this.newMessageText,
        sender: userName,
        timestamp: new Date().getTime(),
        userId: uid,
        nombre: userName
      };

      this.chatService.sendMessage(message).then(() => {
        this.newMessageText = '';
      });
    }
  }

  getFormattedTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getUserColor(userId: string): string {
    const index = parseInt(userId, 36) % this.colors.length;
    return this.colors[index];
  }
}
