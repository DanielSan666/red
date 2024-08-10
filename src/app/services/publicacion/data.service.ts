import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Post } from 'src/app/models/post.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Referencias a las colecciones 'posts' y 'users' en Firestore
  private postsCollection = this.firestore.collection('posts');
  private usersCollection = this.firestore.collection('users');

  constructor(private firestore: AngularFirestore) { }

  // Método para crear un nuevo registro en la colección 'records'
  createRecord(data: any) {
    return this.firestore.collection('records').add(data);
  }

  // Método para obtener todos los posts en la colección 'posts'
  getPosts(): Observable<any[]> {
    return this.postsCollection.snapshotChanges();
  }

  // Método para obtener un usuario por su ID desde la colección 'users'
  getUserById(userId: string): Observable<any> {
    return this.usersCollection.doc(userId).valueChanges();
  }

  // Método para actualizar un post en la colección 'posts' por su ID
  updatePost(id: string, post: any) {
    return this.postsCollection.doc(id).update(post);
  }

  // Método para eliminar un registro en la colección 'records' por su ID
  deleteRecord(id: string) {
    return this.firestore.doc('records/' + id).delete();
  }
}
