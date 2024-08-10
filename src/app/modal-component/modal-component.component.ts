import { Component, ViewChild, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { LoadingController } from '@ionic/angular';
import { Post } from '../models/post.model';
import { DataService } from '../services/publicacion/data.service';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'app-modal-component',
  templateUrl: './modal-component.component.html',
  styleUrls: ['./modal-component.component.scss'],
})
export class ModalComponentComponent implements OnInit {
  // Objeto post inicializado con valores vacíos
  post: Post = { titulo: '', detalles: '', contenido: '', imageUrl: '', userId: '' };
  
  // Variable para almacenar el ID de la publicación
  public id!: any;
  
  // Variable para almacenar el archivo de imagen seleccionado
  file: File | null = null;
  
  // URL de la imagen, inicialmente vacía
  imageUrl: string = '';

  constructor(
    private afStorage: AngularFireStorage, // Servicio para manejar el almacenamiento en Firebase
    private modalCtrl: ModalController, // Controlador para manejar los modales
    private loadingCtrl: LoadingController, // Controlador para mostrar el loading
    private dataService: DataService, // Servicio para manejar los datos de las publicaciones
    private navParams: NavParams // Servicio para acceder a los parámetros pasados al modal
  ) {}
  
  ngOnInit(): void {
    // Obtener el ID pasado al modal
    this.id = this.navParams.get('id');
    
    if (this.id) {
      // Si se pasa un ID, obtener la publicación correspondiente desde el servicio
      this.dataService.getPosts().subscribe(posts => {
        const postData = posts.find(p => p.payload.doc.id === this.id);
        if (postData) {
          // Si se encuentra la publicación, se asigna a la variable `post`
          this.post = postData.payload.doc.data() as Post;
          this.imageUrl = this.post.imageUrl; // Actualizar la URL de la imagen
        }
      });
    }
  }

  // Maneja la selección de archivos
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.file = input.files[0]; // Guardar el archivo seleccionado
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result as string; // Mostrar la imagen seleccionada en la UI
      };
      reader.readAsDataURL(this.file);
    }
  }

  // Función para actualizar la publicación
  async updatePost() {
    const loader = await this.loadingCtrl.create({
      message: 'Espere por favor...' // Mostrar un mensaje de espera
    });
    await loader.present();

    try {
      if (this.file) {
        // Si se seleccionó una nueva imagen, subirla a Firebase Storage
        const filePath = `images/${Date.now()}_${this.file.name}`;
        const fileRef = this.afStorage.ref(filePath);
        const task = this.afStorage.upload(filePath, this.file);

        task.snapshotChanges().pipe(
          finalize(async () => {
            const url = await fileRef.getDownloadURL().toPromise();
            this.post.imageUrl = url; // Actualizar la URL de la imagen en el post
            await this.savePost(); // Guardar la publicación en Firestore
            loader.dismiss(); // Cerrar el loading
            this.modalCtrl.dismiss(this.post, 'updatePost'); // Cerrar el modal y pasar la publicación actualizada
          })
        ).subscribe();
      } else {
        // Si no se seleccionó una nueva imagen, solo actualizar los datos de la publicación
        await this.savePost();
        loader.dismiss();
        this.modalCtrl.dismiss(this.post, 'updatePost');
      }
    } catch (e: any) {
      loader.dismiss(); // Cerrar el loading en caso de error
      this.showToast(e.message || 'Error al actualizar la publicación'); // Mostrar mensaje de error
    }
  }

  // Función para guardar la publicación en Firestore
  async savePost() {
    if (this.id) {
      await this.dataService.updatePost(this.id, this.post);
      this.showToast('Publicación actualizada con éxito.'); // Mostrar mensaje de éxito
    } else {
      this.showToast('Error: No se pudo encontrar el ID de la publicación.'); // Mostrar mensaje de error si no se encuentra el ID
    }
  }

  // Función para mostrar un mensaje al usuario
  showToast(message: string) {
    this.loadingCtrl.create({
      message,
      duration: 3000 // Duración del mensaje
    }).then(toast => toast.present());
  }

  // Función para cancelar la acción y cerrar el modal
  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}