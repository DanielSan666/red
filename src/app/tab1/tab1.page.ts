import { Component } from '@angular/core';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { SocialService } from '../services/social/social.service';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from '../services/perfil/perfil.service';
import { ModalComponentAddComponent } from '../modal-component-add/modal-component-add.component';
import { ModalComponentComponent } from '../modal-component/modal-component.component';
import { ActionSheetController, NavController,ModalController } from '@ionic/angular';
import { LoadingController, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DataService } from '../services/publicacion/data.service';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  comments: any[] = [];
  reactions: any[] = [];
  posts: any;
  currentUser: any;
  newComment: string = '';
  users: { [key: string]: any } = {}; 
  public actionSheetButtons = [
    {
      text: 'Eliminar',
      role: 'destructive',
      data: {
        action: 'delete',
      },
    },
    {
      text: 'Editar',
      data: {
        action: 'edit',
      },
    },
    {
      text: 'Cancelar',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private afStore: AngularFirestore,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private dataService: DataService,
    private userService: UserService,
    private afAuth: AngularFireAuth,
    private social: SocialService

  ) {
    
    addIcons({ add });
  }
  share() {
    if (navigator.share) {
      navigator.share({
        title: 'Red-Social',
        text: 'Mira lo que comparti en esta publicacion',
        url: 'https://Red-Social.com'
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


  ionViewWillEnter() {
    this.getPosts();
  }
  async ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      this.currentUser = user;
    });
      // Escuchar cambios en tiempo real para comentarios
      this.social.getComments(this.posts).subscribe(comments => {
        this.comments = comments;
      });
  
      // Escuchar cambios en tiempo real para reacciones
      this.social.getReactions(this.posts).subscribe(reactions => {
        this.reactions = reactions;
      });
  }
  addComment(comment: string) {
    const userId = this.currentUser;  // Reemplaza con el ID real del usuario
    this.social.addComment(this.posts, comment, userId);
  }

  addReaction() {
    const userId = this.currentUser;  // Reemplaza con el ID real del usuario
    this.social.addReaction(this.posts, userId);
  }

  loadUsersForPosts(posts: any[]) {
    const userIds = [...new Set(posts.map(post => post.userId))]; // Obtener IDs únicos
    userIds.forEach(userId => {
      this.dataService.getUserById(userId).subscribe(user => {
        this.users[userId] = user;
      });
    });
  }


  async getPosts() {
    let loader = await this.loadingCtrl.create({
      message: "Espere por favor..."
    });
    await loader.present();
    try {
      this.afStore.collection('posts')
        .snapshotChanges()
        .subscribe((data: any[]) => {
          this.posts = data.map((e: any) => {
            const postData = e.payload.doc.data();
            return {
              id: e.payload.doc.id,
              titulo: postData.titulo,
              contenido: postData.contenido,
              detalles: postData.detalles,
              imageUrl: postData.imageUrl,
              userId: postData.userId
            };
          });
          this.loadUsersForPosts(this.posts);
        });

      await loader.dismiss();
    } catch (e: any) {
      await loader.dismiss();
      let errorMessage = e.message || e.getLocalizedMessage();
      this.showToast(errorMessage);
    }
  }
  async deletePost(id: string) {
    let loader = await this.loadingCtrl.create({
      message: "Espere por favor..."
    });
    await loader.present();
    try {
      await this.afStore.doc("posts/" + id).delete();
      await loader.dismiss();
    } catch (e: any) {
      await loader.dismiss();
      let errorMessage = e.message || e.getLocalizedMessage();
      this.showToast(errorMessage);
    }
  }

  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 5000
    }).then(toastData => toastData.present());
  }

  async presentActionSheet(id: string) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Acciones',
      buttons: this.actionSheetButtons.map(button => ({
        ...button,
        handler: () => {
          this.handleAction(button.data.action, id);
        }
      }))
    });
    await actionSheet.present();
  }

  async handleAction(action: string, id: string) {
    switch (action) {
      case 'delete':
        this.deletePost(id);
        break;
      case 'edit':
        await this.openEditModal(id);
        break;
      case 'cancel':
        break;
      default:
        break;
    }
  }
  isPostOwner(postId: string): boolean {
    const post = this.posts.find((p: any) => p.id === postId);
    return post && this.currentUser && post.userId === this.currentUser.uid;
  }

  async openEditModal(postId: string) {
    const modal = await this.modalCtrl.create({
      component: ModalComponentComponent,
      componentProps: {
        id: postId // Pasar el ID como un prop
      }
    });
    return await modal.present();
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: ModalComponentAddComponent,
      componentProps: {
      }
    });
    return await modal.present();

    const {data,  role } = await modal.onWillDismiss();
    if (role === 'confirm') {
    }
  }


}
