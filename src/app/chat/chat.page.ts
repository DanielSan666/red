import { Component, OnInit } from '@angular/core';
import { Message } from '../models/message.model';
import { ChatService } from '../services/chat/chat.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from '../services/perfil/perfil.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  messages: Message[] = [];
  newMessageText = '';
  currentUser: any;
  mediaRecorder: any;
  audioChunks: any[] = [];

  private colors: string[] = [
    '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', 
    '#BAE1FF', '#E0BBE4', '#FFCCF9', '#C9C9FF'
  ];

  constructor(
    private chatService: ChatService,
    private afAuth: AngularFireAuth,
    private userService: UserService,
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
    if (this.newMessageText.trim() === '') {
      console.log('El mensaje está vacío, no se puede enviar.');
      return;
    }

    const user = await this.afAuth.currentUser;
    if (user) {
      const uid = user.uid;

      this.userService.getUser(uid).subscribe(userDoc => {
        if (userDoc.payload.exists) {
          this.currentUser = userDoc.payload.data();
          this.currentUser.uid = uid;

          const message: Message = {
            text: this.newMessageText,
            sender: this.currentUser.nombre,
            timestamp: new Date().getTime(),
            userId: uid,
            nombre: this.currentUser.nombre
          };

          this.chatService.sendMessage(message).then(() => {
            this.newMessageText = '';
          });
        } else {
          console.error("El documento del usuario no existe.");
        }
      });
    }
  }

  // Iniciar la grabación de voz
  startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event: { data: any; }) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();
    }).catch(error => {
      console.error("Error al acceder al micrófono: ", error);
    });
  }

  // Detener la grabación y enviar el archivo de audio
  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Aquí puedes subir el archivo de audio a tu servidor o Firebase Storage
        this.uploadAudio(audioBlob);
      };
    }
  }

  // Subir el archivo de audio
  uploadAudio(audioBlob: Blob) {
    const user = this.currentUser;
    const timestamp = new Date().getTime();

    const message: Message = {
      text: '[Audio]',
      sender: user.nombre,
      timestamp,
      userId: user.uid,
      nombre: user.nombre
    };

    // Agregar lógica para almacenar el audio en Firestore o tu backend
    this.chatService.sendAudioMessage(message, audioBlob).then(() => {
      console.log('Mensaje de voz enviado');
    });
  }

  getUserColor(userId: string): string {
    const hash = this.hashString(userId);
    const index = hash % this.colors.length;
    return this.colors[index];
  }

  hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
