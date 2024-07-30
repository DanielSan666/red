import { Component, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { OverlayEventDetail } from '@ionic/core/components';
import { ToastController, LoadingController } from '@ionic/angular';
import { Post } from '../models/post.model';
import { PhotoService } from '../services/photo.service';
@Component({
  selector: 'app-modal-component-add',
  templateUrl: './modal-component-add.component.html',
  styleUrls: ['./modal-component-add.component.scss'],
})
export class ModalComponentAddComponent {
  post = {} as Post;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private afStore: AngularFirestore,
    public photoService: PhotoService
  ) {}
  async confirm() {
    if (this.formValidation()) {
      let loader = await this.loadingCtrl.create({
        message: "Espere un momento..."
      });
      await loader.present();

      try {
        await this.afStore.collection('posts').add(this.post);
        loader.dismiss();
        this.modalCtrl.dismiss(this.post, 'confirm');
      } catch (e: any) {
        loader.dismiss();
        e.message = "Mensaje de error en el post";
        let errorMessage = e.message || e.getLocalizedMessage();
        this.showToast(errorMessage);
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

  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 4000
    }).then(toastData => toastData.present());
  }
  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
  async ngOnInit() {
    await this.photoService.loadSaved();
  }
  

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }
  
}