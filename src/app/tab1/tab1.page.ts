import { Component } from '@angular/core';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { SocialService } from '../services/social/social.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ModalComponentAddComponent } from '../modal-component-add/modal-component-add.component';
import { ModalComponentComponent } from '../modal-component/modal-component.component';
import { ActionSheetController, ModalController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DataService } from '../services/publicacion/data.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification/notification.service'; // Ensure to import the notification service

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  comments: any[] = [];
  reactions: any[] = [];
  posts: any;
  currentUser: any;
  newComment: string = '';
  users: { [key: string]: any } = {};
  notificationCount: number = 0; // Notification counter

  public actionSheetButtons = [
    {
      text: 'Eliminar',
      role: 'destructive',
      data: { action: 'delete' },
    },
    {
      text: 'Editar',
      data: { action: 'edit' },
    },
    {
      text: 'Cancelar',
      role: 'cancel',
      data: { action: 'cancel' },
    },
  ];

  constructor(
    private notificationService: NotificationService, // Inject the notification service
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private afStore: AngularFirestore,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private dataService: DataService,
    private afAuth: AngularFireAuth,
    private social: SocialService,
    private alertController: AlertController,
    private router: Router
  ) {
    addIcons({ add });

    // Listen for notifications
    this.notificationService.currentNotification.subscribe((message: string | null) => {
      if (message) {
        this.openNotification(message); // Check if message is not null
      }
    });
  }

  // Opens a notification alert
  async openNotification(message: string) {
    const alert = await this.alertController.create({
      header: 'Notificación',
      message: message,
      buttons: ['Aceptar'],
    });
    await alert.present();
  }

  // Uses the Web Share API to share content, if supported
  share() {
    if (navigator.share) {
      navigator.share({
        title: 'Red-Social',
        text: 'Mira lo que compartí en esta publicación',
        url: 'https://Red-Social.com',
      })
      .then(() => console.log('Shared successfully!'))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      console.log('Sharing not supported');
    }
  }

  // Runs before the view is displayed to the user
  ionViewWillEnter() {
    this.getPosts(); // Load posts from Firestore
  }

  // Initializes the component
  async ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      this.currentUser = user; // Store the authenticated user
    });

    // Listen for real-time changes to comments
    this.social.getComments(this.posts).subscribe((comments) => {
      this.comments = comments; // Update comment list
    });

    // Listen for real-time changes to reactions
    this.social.getReactions(this.posts).subscribe((reactions) => {
      this.reactions = reactions; // Update reaction list
    });
  }

  // Adds a comment to the current post
  addComment(comment: string) {
    const userId = this.currentUser; // Get the current user's ID
    this.social.addComment(this.posts, comment, userId); // Add the comment using the SocialService
  }

  // Adds a reaction to the current post
  addReaction() {
    const userId = this.currentUser; // Get the current user's ID
    this.social.addReaction(this.posts, userId); // Add the reaction using the SocialService
  }

  // Loads user data for the given posts
  loadUsersForPosts(posts: any[]) {
    const userIds = [...new Set(posts.map((post) => post.userId))]; // Get unique user IDs
    userIds.forEach((userId) => {
      this.dataService.getUserById(userId).subscribe((user) => {
        this.users[userId] = user; // Store user data
      });
    });
  }

  // Fetches posts from Firestore and loads into `posts`
  async getPosts() {
    let loader = await this.loadingCtrl.create({ message: 'Espere por favor...' });
    await loader.present();
    try {
      this.afStore
        .collection('posts') // Fetch the posts collection
        .snapshotChanges()
        .subscribe((data: any[]) => {
          this.posts = data.map((e: any) => {
            const postData = e.payload.doc.data();
            return {
              id: e.payload.doc.id, // Post ID
              titulo: postData.titulo, // Post title
              contenido: postData.contenido, // Post content
              detalles: postData.detalles, // Post details
              imageUrl: postData.imageUrl, // Post image URL
              userId: postData.userId, // User ID who created the post
            };
          });
          this.loadUsersForPosts(this.posts); // Load user data for posts
        });

      await loader.dismiss(); // Dismiss loader
    } catch (e: any) {
      await loader.dismiss(); // Dismiss loader on error
      let errorMessage = e.message || e.getLocalizedMessage();
      this.showToast(errorMessage); // Show error message
    }
  }

  // Deletes a post based on its ID
  async deletePost(id: string) {
    let loader = await this.loadingCtrl.create({ message: 'Espere por favor...' });
    await loader.present();
    try {
      await this.afStore.doc('posts/' + id).delete(); // Delete the post in Firestore
      await loader.dismiss(); // Dismiss loader
    } catch (e: any) {
      await loader.dismiss(); // Dismiss loader on error
      let errorMessage = e.message || e.getLocalizedMessage();
      this.showToast(errorMessage); // Show error message
    }
  }

  // Shows a toast with the given message
  showToast(message: string) {
    this.toastCtrl.create({
      message: message, // Message to display
      duration: 5000, // Toast duration
    }).then((toastData) => toastData.present());
  }

  // Shows an action sheet with options for the post
  async presentActionSheet(id: string) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Acciones', // Action sheet title
      buttons: this.actionSheetButtons.map((button) => ({
        ...button,
        handler: () => {
          this.handleAction(button.data.action, id); // Handle selected action
        },
      })),
    });
    await actionSheet.present();
  }

  // Handles the selected action in the action sheet
  async handleAction(action: string, id: string) {
    switch (action) {
      case 'delete':
        this.deletePost(id); // Delete the post
        break;
      case 'edit':
        await this.openEditModal(id); // Open modal to edit the post
        break;
      case 'cancel':
        break;
      default:
        break;
    }
  }

  // Checks if the current user is the owner of a post
  isPostOwner(postId: string): boolean {
    const post = this.posts.find((p: any) => p.id === postId); // Find the post by its ID
    return post && this.currentUser && post.userId === this.currentUser.uid; // Check if the current user is the owner
  }

  // Opens a modal to edit a post
  async openEditModal(postId: string) {
    const modal = await this.modalCtrl.create({
      component: ModalComponentComponent, // Modal component
      componentProps: { id: postId }, // Pass post ID to modal
    });
    return await modal.present();
  }

  // Opens the chat page
  openChat() {
    this.router.navigate(['/chatPage']);
    this.notificationCount = 0; // Reiniciar contador al abrir el chat
  }

  // Opens a modal to add a new post
  async openModal() {
    const modal = await this.modalCtrl.create({
      component: ModalComponentAddComponent, // Modal component
      componentProps: {},
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      // Handle the confirmation action in the modal
    }
  }
}
