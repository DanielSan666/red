import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Post } from 'src/app/models/post.model';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private postsCollection = this.firestore.collection('posts');
  private usersCollection = this.firestore.collection('users');
  constructor(private firestore: AngularFirestore) { }

  // Métodos CRUD
  createRecord(data: any) {
    return this.firestore.collection('records').add(data);
  }

  getPosts(): Observable<any[]> {
    return this.postsCollection.snapshotChanges();
  }

  getUserById(userId: string): Observable<any> {
    return this.usersCollection.doc(userId).valueChanges();
  }

  updatePost(id: string, post: any) {
    return this.postsCollection.doc(id).update(post);
  }

  deleteRecord(id: string) {
    return this.firestore.doc('records/' + id).delete();
  }
}
