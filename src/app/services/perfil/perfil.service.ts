import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private firestore: AngularFirestore) { }

  // Métodos CRUD
  createRecord(data: any) {
    return this.firestore.collection('records').add(data);
  }

  getUser(uid: string) {
    return this.firestore.collection('users').doc(uid).snapshotChanges();
  }

  updateUser(id: string, user: User) {
    return this.firestore.doc('users/' + id).update(user);
  }

  deleteUser(id: string) {
    return this.firestore.doc('users/' + id).delete();
  }
}