import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocialService {

  constructor(
    private firestore: AngularFirestore
  ) { }
   // Método para agregar un comentario
   addComment(postId: string, comment: string, userId: string) {
    const commentData = {
      comment,
      userId,
      timestamp: new Date()
    };
    return this.firestore.collection('posts').doc(postId).collection('comments').add(commentData);
  }

  // Método para agregar una reacción
  addReaction(postId: string, userId: string) {
    const reactionData = {
      userId,
      timestamp: new Date()
    };
    return this.firestore.collection('posts').doc(postId).collection('reactions').add(reactionData);
  }

    // Obtener comentarios en tiempo real
    getComments(postId: string): Observable<any[]> {
      return this.firestore.collection('posts').doc(postId).collection('comments', ref => ref.orderBy('timestamp')).valueChanges();
    }
  
    // Obtener reacciones en tiempo real
    getReactions(postId: string): Observable<any[]> {
      return this.firestore.collection('posts').doc(postId).collection('reactions').valueChanges();
    }
}
