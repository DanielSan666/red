import { Component, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastController, LoadingController } from '@ionic/angular';
import { Post } from '../models/post.model';
import { finalize } from 'rxjs/operators';
@Component({
  selector: 'app-modal-component-add',
  templateUrl: './modal-component-add.component.html',
  styleUrls: ['./modal-component-add.component.scss'],
})
export class ModalComponentAddComponent {
  post = {} as Post;
  imageUrl: string = '';
  file: File | null = null;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private afStore: AngularFirestore,
    private afStorage: AngularFireStorage
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.file = input.files[0];
      const reader = new FileReader();
      reader.onload = e => this.imageUrl = reader.result as string;
      reader.readAsDataURL(this.file);
    }
  }

  async confirm() {
    if (this.formValidation()) {
      let loader = await this.loadingCtrl.create({
        message: "Espere un momento..."
      });
      await loader.present();

      try {
        if (this.file) {
          const filePath = `images/${Date.now()}_${this.file.name}`;
          const fileRef = this.afStorage.ref(filePath);
          const task = this.afStorage.upload(filePath, this.file);

          task.snapshotChanges().pipe(
            finalize(async () => {
              const url = await fileRef.getDownloadURL().toPromise();
              this.post.imageUrl = url;
              await this.savePost();
              loader.dismiss();
              this.modalCtrl.dismiss(this.post, 'confirm');
            })
          ).subscribe();
        } else {
          await this.savePost();
          loader.dismiss();
          this.modalCtrl.dismiss(this.post, 'confirm');
        }
      } catch (e: any) {
        loader.dismiss();
        this.showToast("Mensaje de error en el post");
      }
    }
  }

  formValidation() {
    if (!this.post.titulo) {
      this.showToast("Ingrese un título");
      return false;
    }
    if (!this.post.detalles) {
      this.showToast("Ingrese detalles");
      return false;
    }
    if (!this.post.contenido) {
      this.showToast("Ingrese el contenido");
      return false;
    }
    return true;
  }

  async savePost() {
    try {
      await this.afStore.collection('posts').add(this.post);
    } catch (e: any) {
      throw new Error("Error guardando el post");
    }
  }

  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 4000
    }).then(toastData => toastData.present());
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
}