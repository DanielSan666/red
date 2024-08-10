import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from 'src/app/models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Referencia a la colección 'users' en Firestore
  private usersCollection = this.firestore.collection('users');

  constructor(private firestore: AngularFirestore) { }

  // Método para obtener un usuario por su ID usando `valueChanges`
  // `valueChanges` devuelve un observable que emite los datos del documento en formato JSON
  getUserById(userId: string): Observable<any> {
    return this.firestore.collection('users').doc(userId).valueChanges();
  }

  // Método para obtener un usuario por su ID usando `snapshotChanges`
  // `snapshotChanges` devuelve un observable que emite los cambios en el documento, 
  // incluyendo la metadata del documento (e.g., id)
  getUser(uid: string) {
    return this.firestore.collection('users').doc(uid).snapshotChanges();
  }

  // Método para actualizar un documento en la colección 'users'
  // `data` es un objeto que contiene las propiedades a actualizar en el documento
  updateUser(uid: string, data: Partial<User>) {
    return this.firestore.collection('users').doc(uid).update(data);
  }

  // Método para eliminar un documento de la colección 'users' por su ID
  deleteUser(id: string) {
    return this.usersCollection.doc(id).delete();
  }
}