import { Component, ViewChild,Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastController, LoadingController } from '@ionic/angular';
import { Post } from '../models/post.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-modal-component',
  templateUrl: './modal-component.component.html',
  styleUrls: ['./modal-component.component.scss'],
})
export class ModalComponentComponent{
  post={} as Post;
  id: any;

  @Input() data: any;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private afStore: AngularFirestore,
    private actRoute: ActivatedRoute,
    private router: Router
  ) {
    this.id = this.actRoute.snapshot.paramMap.get("id");
  }
  ngOnInit(){
    this.getPostById(this.id);
  }
  async getPostById(id: string) {
    let loader = await this.loadingCtrl.create({
      message: "Espera un momento......."
    });
    await loader.present();
  
    this.afStore
      .doc("posts/" + id)
      .valueChanges()
      .subscribe((data: any) => {
        if (data) {
          const { titulo, contenido, detalles } = data as { titulo: string, contenido: string, detalles: string };
          this.post.titulo = titulo;
          this.post.contenido = contenido;
          this.post.detalles = detalles;
        } else {
          console.error("No se encontraron datos para el ID proporcionado.");
        }
        loader.dismiss();
      }, (error) => {
        console.error("Error al obtener los datos:", error);
        loader.dismiss();
      });
  }
  async confirm(post:Post){
    let loader = await this.loadingCtrl.create({
      message:"Actualizando"
    });
    await loader.present();

    this.afStore
    .doc("posts/"+this.id)
    .update(post)
    .then(()=>{
      console.log("Elemento actualizado correctamente");
      this.router.navigate(['/home'])
      loader.dismiss();
    })
    .catch((error)=>{
      console.error("Error al actualizar el elemento", error);
      loader.dismiss();
    });
    
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
}
