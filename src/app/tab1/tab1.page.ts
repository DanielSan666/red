import { Component } from '@angular/core';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { ModalComponentAddComponent } from '../modal-component-add/modal-component-add.component';
import { ModalComponentComponent } from '../modal-component/modal-component.component';
import { ActionSheetController, NavController,ModalController } from '@ionic/angular';
import { PhotoService } from '../services/photo.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  posts: any;

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
    public photoService: PhotoService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private afStore: AngularFirestore,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController
  ) {
    
    addIcons({ add });
  }
  async ngOnInit() {
    await this.photoService.loadSaved();
  }
  get latestPhoto() {
    const photos = this.photoService.photos;
    return photos.length > 0 ? photos[photos.length - 1] : null;
  }
  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }
  ionViewWillEnter() {
    this.getPosts();
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
            return {
              id: e.payload.doc.id,
              titulo: e.payload.doc.data()["titulo"],
              contenido: e.payload.doc.data()["contenido"],
              detalles: e.payload.doc.data()["detalles"]
            }
          });
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

  async openEditModal(id: string) {
    const modal = await this.modalCtrl.create({
      component: ModalComponentComponent,
      componentProps: { data: { id } }
    });
    return await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      // Handle the data from the modal if necessary
    }
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
