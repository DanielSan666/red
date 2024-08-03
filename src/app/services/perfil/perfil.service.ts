import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from 'src/app/models/user.model';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersCollection = this.firestore.collection('users');
  constructor(private firestore: AngularFirestore) { }

  // Métodos CRUD
  getUserById(userId: string): Observable<any> {
    return this.firestore.collection('users').doc(userId).valueChanges();
  }

  getUser(uid: string) {
    return this.firestore.collection('users').doc(uid).snapshotChanges();
  }
  

  updateUser(id: string, user: User){
    return this.usersCollection.doc(id).update(user);
  }

 deleteUser(id: string) {
    return this.usersCollection.doc(id).delete();
  }
}