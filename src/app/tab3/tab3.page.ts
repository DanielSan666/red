import { Component, OnInit} from '@angular/core';
import { ModalEditPerfilComponent } from '../modal-edit-perfil/modal-edit-perfil.component';
import { ActionSheetController, NavController,ModalController } from '@ionic/angular';
import { LoadingController, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from '../services/perfil.service';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
})
export class Tab3Page implements OnInit {
  currentUser: any;
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
    private afAuth: AngularFireAuth,
    private userService: UserService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    await this.loadUserData();
  }

  async loadUserData() {
    let loader = await this.loadingCtrl.create({
      message: "Cargando datos del usuario..."
    });
    await loader.present();

    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        const uid = user.uid;
        this.userService.getUser(uid).subscribe(userDoc => {
          if (userDoc.payload.exists) {
            this.currentUser = userDoc.payload.data();
            console.log(this.currentUser);
          }
        });
      }
    } catch (error) {
      console.error("Error al cargar los datos del usuario", error);
    }

    await loader.dismiss();
  }
  async deleteUser(id: string) {
    let loader = await this.loadingCtrl.create({
      message: "Espere por favor..."
    });
    await loader.present();
    try {
      this.userService.deleteUser(id).then(() => {
        console.log('Usuario eliminado con éxito');
        this.navCtrl.navigateRoot('/login');
  
      }).catch(error => {
        console.error('Error al eliminar el usuario:', error);
      });
      await loader.dismiss();
    } catch (e: any) {
      await loader.dismiss();
      let errorMessage = e.message || e.getLocalizedMessage();
      this.showToast(errorMessage);
    }
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
        this.deleteUser(id);
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
      component: ModalEditPerfilComponent,
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
      component:  ModalEditPerfilComponent,
      componentProps: {
      }
    });
    return await modal.present();

    const {data,  role } = await modal.onWillDismiss();
    if (role === 'confirm') {
    }
  }
  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 5000
    }).then(toastData => toastData.present());
  }
  
}