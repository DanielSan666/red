import { Component, ViewChild,Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastController, LoadingController } from '@ionic/angular';
import { Post } from '../models/post.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/publicacion/data.service';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'app-modal-component',
  templateUrl: './modal-component.component.html',
  styleUrls: ['./modal-component.component.scss'],
})
export class ModalComponentComponent implements OnInit {
  post: Post = { titulo: '', detalles: '', contenido: '',imageUrl:'', userId: '' };
  public id!: any;
  file: File | null = null;
  imageUrl: string = '';
  

  constructor(
    private afStorage: AngularFireStorage,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private actRoute: ActivatedRoute,
    private dataService : DataService,
    private navParams:  NavParams
  ) {
    
  }
  ngOnInit(): void {
    this.id = this.navParams.get('id');
    if (this.id) {
      this.dataService.getPosts().subscribe(posts => {
        const postData = posts.find(p => p.payload.doc.id === this.id);
        if (postData) {
          this.post = postData.payload.doc.data() as Post;
          this.imageUrl = this.post.imageUrl;
        }
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result as string;
      };
      reader.readAsDataURL(this.file);
    }
  }

  async updatePost() {
    const loader = await this.loadingCtrl.create({
      message: 'Espere por favor...'
    });
    await loader.present();
  
    try {
      if (this.file) {
        // Cargar la nueva imagen a Firebase Storage
        const filePath = `images/${Date.now()}_${this.file.name}`;
        const fileRef = this.afStorage.ref(filePath);
        const task = this.afStorage.upload(filePath, this.file);
  
        task.snapshotChanges().pipe(
          finalize(async () => {
            const url = await fileRef.getDownloadURL().toPromise();
            this.post.imageUrl = url; // Actualizar la URL de la imagen en el post
            await this.savePost();
            loader.dismiss();
            this.modalCtrl.dismiss(this.post, 'updatePost');
          })
        ).subscribe();
      } else {
        // Si no se selecciona una nueva imagen, solo actualizar los datos del post
        await this.savePost();
        loader.dismiss();
        this.modalCtrl.dismiss(this.post, 'updatePost');
      }
    } catch (e: any) {
      loader.dismiss();
      this.showToast(e.message || 'Error al actualizar la publicación');
    }
  }

  async savePost() {
    if (this.id) {
      await this.dataService.updatePost(this.id, this.post);
      this.showToast('Publicación actualizada con éxito.');
    } else {
      this.showToast('Error: No se pudo encontrar el ID de la publicación.');
    }
  }

  showToast(message: string) {
    this.loadingCtrl.create({
      message,
      duration: 3000
    }).then(toast => toast.present());
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}