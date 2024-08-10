import { Component } from '@angular/core';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { SocialService } from '../services/social/social.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ModalComponentAddComponent } from '../modal-component-add/modal-component-add.component';
import { ModalComponentComponent } from '../modal-component/modal-component.component';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DataService } from '../services/publicacion/data.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  comments: any[] = []; // Array para almacenar los comentarios en tiempo real
  reactions: any[] = []; // Array para almacenar las reacciones en tiempo real
  posts: any; // Variable para almacenar las publicaciones obtenidas de Firestore
  currentUser: any; // Variable para almacenar el usuario autenticado actual
  newComment: string = ''; // Cadena para almacenar un nuevo comentario
  users: { [key: string]: any } = {}; // Objeto para almacenar datos de usuarios asociados a publicaciones

  // Configuración de los botones de la hoja de acción (Action Sheet)
  public actionSheetButtons = [
    {
      text: 'Eliminar',
      role: 'destructive',
      data: {
        action: 'delete', // Acción para eliminar una publicación
      },
    },
    {
      text: 'Editar',
      data: {
        action: 'edit', // Acción para editar una publicación
      },
    },
    {
      text: 'Cancelar',
      role: 'cancel',
      data: {
        action: 'cancel', // Acción para cancelar
      },
    },
  ];

  constructor(
    private toastCtrl: ToastController, // Servicio para mostrar toasts
    private loadingCtrl: LoadingController, // Servicio para mostrar loaders
    private afStore: AngularFirestore, // Servicio para interactuar con Firestore
    private actionSheetCtrl: ActionSheetController, // Servicio para mostrar hojas de acción
    private modalCtrl: ModalController, // Servicio para mostrar modales
    private dataService: DataService, // Servicio para interactuar con datos de publicaciones y usuarios
    private afAuth: AngularFireAuth, // Servicio para manejar autenticación con Firebase
    private social: SocialService, // Servicio para manejar interacciones sociales como comentarios y reacciones
    private alertController: AlertController // Servicio para mostrar alertas
  ) {
    addIcons({ add }); // Agrega el ícono "add" a la aplicación
  }

  // Muestra una alerta indicando que una funcionalidad estará disponible próximamente
  async openSoon() {
    const alert = await this.alertController.create({
      header: 'Red-Social',
      message: '!Proximamente!',
      buttons: ['Aceptar'],
    });
    await alert.present();
  }

  // Utiliza la API de Web Share para compartir contenido, si es compatible
  share() {
    if (navigator.share) {
      navigator
        .share({
          title: 'Red-Social',
          text: 'Mira lo que comparti en esta publicacion',
          url: 'https://Red-Social.com',
        })
        .then(() => {
          console.log('Shared successfully!');
        })
        .catch((error) => {
          console.error('Error sharing:', error);
        });
    } else {
      console.log('Sharing not supported');
    }
  }

  // Método que se ejecuta antes de que la vista se muestre al usuario
  ionViewWillEnter() {
    this.getPosts(); // Carga las publicaciones desde Firestore
  }

  // Método que se ejecuta al inicializar el componente
  async ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      this.currentUser = user; // Almacena el usuario autenticado actual
    });

    // Escucha cambios en tiempo real para los comentarios
    this.social.getComments(this.posts).subscribe((comments) => {
      this.comments = comments; // Actualiza la lista de comentarios
    });

    // Escucha cambios en tiempo real para las reacciones
    this.social.getReactions(this.posts).subscribe((reactions) => {
      this.reactions = reactions; // Actualiza la lista de reacciones
    });
  }

  // Agrega un comentario a la publicación actual
  addComment(comment: string) {
    const userId = this.currentUser; // Obtiene el ID del usuario actual
    this.social.addComment(this.posts, comment, userId); // Agrega el comentario usando el servicio SocialService
  }

  // Agrega una reacción a la publicación actual
  addReaction() {
    const userId = this.currentUser; // Obtiene el ID del usuario actual
    this.social.addReaction(this.posts, userId); // Agrega la reacción usando el servicio SocialService
  }

  // Carga los datos de los usuarios para las publicaciones dadas
  loadUsersForPosts(posts: any[]) {
    const userIds = [...new Set(posts.map((post) => post.userId))]; // Obtiene los IDs únicos de los usuarios
    userIds.forEach((userId) => {
      this.dataService.getUserById(userId).subscribe((user) => {
        this.users[userId] = user; // Almacena los datos del usuario
      });
    });
  }

  // Obtiene las publicaciones desde Firestore y las carga en la variable `posts`
  async getPosts() {
    let loader = await this.loadingCtrl.create({
      message: 'Espere por favor...', // Muestra un mensaje de espera
    });
    await loader.present();
    try {
      this.afStore
        .collection('posts') // Obtiene la colección de publicaciones
        .snapshotChanges()
        .subscribe((data: any[]) => {
          this.posts = data.map((e: any) => {
            const postData = e.payload.doc.data();
            return {
              id: e.payload.doc.id, // ID de la publicación
              titulo: postData.titulo, // Título de la publicación
              contenido: postData.contenido, // Contenido de la publicación
              detalles: postData.detalles, // Detalles de la publicación
              imageUrl: postData.imageUrl, // URL de la imagen de la publicación
              userId: postData.userId, // ID del usuario que creó la publicación
            };
          });
          this.loadUsersForPosts(this.posts); // Carga los datos de los usuarios para las publicaciones
        });

      await loader.dismiss(); // Cierra el loader
    } catch (e: any) {
      await loader.dismiss(); // Cierra el loader en caso de error
      let errorMessage = e.message || e.getLocalizedMessage();
      this.showToast(errorMessage); // Muestra un mensaje de error
    }
  }

  // Elimina una publicación basada en su ID
  async deletePost(id: string) {
    let loader = await this.loadingCtrl.create({
      message: 'Espere por favor...', // Muestra un mensaje de espera
    });
    await loader.present();
    try {
      await this.afStore.doc('posts/' + id).delete(); // Elimina la publicación en Firestore
      await loader.dismiss(); // Cierra el loader
    } catch (e: any) {
      await loader.dismiss(); // Cierra el loader en caso de error
      let errorMessage = e.message || e.getLocalizedMessage();
      this.showToast(errorMessage); // Muestra un mensaje de error
    }
  }

  // Muestra un toast con el mensaje dado
  showToast(message: string) {
    this.toastCtrl
      .create({
        message: message, // Mensaje a mostrar
        duration: 5000, // Duración del toast
      })
      .then((toastData) => toastData.present());
  }

  // Muestra una hoja de acción con opciones para la publicación
  async presentActionSheet(id: string) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Acciones', // Título de la hoja de acción
      buttons: this.actionSheetButtons.map((button) => ({
        ...button,
        handler: () => {
          this.handleAction(button.data.action, id); // Maneja la acción seleccionada
        },
      })),
    });
    await actionSheet.present();
  }

  // Maneja la acción seleccionada en la hoja de acción
  async handleAction(action: string, id: string) {
    switch (action) {
      case 'delete':
        this.deletePost(id); // Elimina la publicación
        break;
      case 'edit':
        await this.openEditModal(id); // Abre un modal para editar la publicación
        break;
      case 'cancel':
        break;
      default:
        break;
    }
  }

  // Verifica si el usuario actual es el propietario de una publicación
  isPostOwner(postId: string): boolean {
    const post = this.posts.find((p: any) => p.id === postId); // Busca la publicación por su ID
    return post && this.currentUser && post.userId === this.currentUser.uid; // Verifica si el usuario actual es el propietario
  }

  // Abre un modal para editar una publicación
  async openEditModal(postId: string) {
    const modal = await this.modalCtrl.create({
      component: ModalComponentComponent, // Componente del modal
      componentProps: {
        id: postId, // Pasa el ID de la publicación al modal
      },
    });
    return await modal.present();
  }

  // Abre un modal para agregar una nueva publicación
  async openModal() {
    const modal = await this.modalCtrl.create({
      component: ModalComponentAddComponent, // Componente del modal
      componentProps: {},
    });
    return await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      // Maneja la confirmación de la acción en el modal
    }
  }
}