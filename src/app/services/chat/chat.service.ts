import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { map } from "rxjs";
import { Message } from "src/app/models/message.model";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private firestore: AngularFirestore) {}

  getMessages() {
    return this.firestore.collection('messages', ref => ref.orderBy('timestamp'))
      .snapshotChanges().pipe(
        map((actions: any[]) => {
          return actions.map(a => {
            const data = a.payload.doc.data() as Message;
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }

  sendMessage(message: Message) {
    return this.firestore.collection('messages').add(message);
  }

  // Lógica para enviar el archivo de audio
  async sendAudioMessage(message: Message, audioBlob: Blob) {
    const audioRef = await this.firestore.collection('audioMessages').add({
      audioBlob, // Aquí puedes procesar el audioBlob para guardarlo
      ...message
    });
    return audioRef;
  }
}


