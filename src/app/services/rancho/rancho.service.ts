// rancho.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { Rancho } from 'src/app/models/rancho.model';

@Injectable({
  providedIn: 'root'
})
export class RanchoService {
  constructor(private firestore: AngularFirestore) {}

  getRanchos() {
    return this.firestore.collection('ranchos').snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Rancho;
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }
}
