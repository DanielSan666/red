import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private firestore: AngularFirestore) { }

  // Métodos CRUD
  createRecord(data: any) {
    return this.firestore.collection('records').add(data);
  }

  getPosts() {
    return this.firestore.collection('posts').snapshotChanges();
  }

  updatePost(id: string, post: Post) {
    return this.firestore.doc('posts/' + id).update(post);
  }

  deleteRecord(id: string) {
    return this.firestore.doc('records/' + id).delete();
  }
}
