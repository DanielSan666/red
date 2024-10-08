import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs';
import { Message } from 'src/app/models/message.model';

@Injectable({
  providedIn: 'root'
})

export class ChatService {

  constructor(private firestore: AngularFirestore) {}

  // Obtener los mensajes en tiempo real
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

  // Enviar un nuevo mensaje
  sendMessage(message: Message) {
    return this.firestore.collection('messages').add(message);
  }
}