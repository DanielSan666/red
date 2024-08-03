import { Component, ViewChild,Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
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
  

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private afStore: AngularFirestore,
    private actRoute: ActivatedRoute,
    private router: Router,
    private dataService : DataService,
    private navParams:  NavParams
  ) {
    
  }
  ngOnInit(): void {
    // Obtener ID desde el parámetro de la ruta
    this.id = this.actRoute.snapshot.paramMap.get('id');
    console.log('ID from route:', this.id);

    // Si no hay ID en la ruta, obtenerlo de NavParams
    if (!this.id) {
      const data = this.navParams.get('data');
      if (data && data.id) {
        this.id = data.id;
        console.log('ID from NavParams:', this.id);
      } else {
        console.error('No ID found in NavParams');
        return; // Salir si no hay ID disponible
      }
    }

    // Suscribirse al servicio de datos si hay un ID
    if (this.id) {
      this.dataService.getPosts().subscribe({
        next: data => {
          const postData = data.find(p => p.payload.doc.id === this.id);
          if (postData) {
            this.post = postData.payload.doc.data() as Post;
          } else {
            console.warn('Post not found for ID:', this.id);
          }
        },
        error: err => {
          console.error('Error fetching posts:', err);
        }
      });
    }
  }

 async updatePost() {
    let loader = await this.loadingCtrl.create({
      message: "Espere por favor..."
    });
    await loader.present();
    try{
    this.dataService.updatePost(this.id, this.post).then(() => {
    loader.dismiss();
    this.modalCtrl.dismiss(this.post, 'updatePost');

    });
    }catch (e: any) {
      await loader.dismiss();
      let errorMessage = e.message || e.getLocalizedMessage();
      this.showToast(errorMessage);
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
