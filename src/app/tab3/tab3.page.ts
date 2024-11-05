import { Component, OnInit } from '@angular/core';
import { ActionSheetController, NavController, ModalController, AlertController } from '@ionic/angular';
import { LoadingController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from '../services/perfil/perfil.service';
import { AuthService } from '../services/auth/auth.service';
import { ModalEditNombreComponent } from '../modal-edit/modal-edit-nombre/modal-edit-nombre.component';
import { ModalEditTelefonoComponent } from '../modal-edit/modal-edit-telefono/modal-edit-telefono.component';
import { ModalEditPasComponent } from '../modal-edit/modal-edit-pas/modal-edit-pas.component';
import { ModalEditCorreoComponent } from '../modal-edit/modal-edit-correo/modal-edit-correo.component';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
})
export class Tab3Page implements OnInit {
  currentUser: any; // Variable para almacenar los datos del usuario actual

  constructor(
    private afAuth: AngularFireAuth,
    private userService: UserService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private authService: AuthService,
    private alertCtrl: AlertController // Added AlertController
  ) {}

  ngOnInit() {}

  logout() {
    this.authService.logout();
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
        console.log("UID del usuario:", uid);
        this.userService.getUser(uid).subscribe(userDoc => {
          if (userDoc.payload.exists) {
            this.currentUser = userDoc.payload.data();
            this.currentUser.uid = uid;
            console.log(this.currentUser.uid);
          } else {
            console.error("El documento del usuario no existe.");
          }
        }, error => {
          console.error("Error al obtener los datos del usuario", error);
        });
      } else {
        console.error("Usuario no autenticado.");
      }
    } catch (error) {
      console.error("Error al cargar los datos del usuario", error);
    } finally {
      await loader.dismiss();
    }
  }

  ionViewWillEnter() {
    this.loadUserData();
  }

  async deleteUser(uid: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmación',
      message: '¿Seguro que deseas eliminar el usuario?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sí',
          handler: () => {
            this.performDeleteUser(uid);
          }
        }
      ]
    });
    await alert.present();
  }

  async performDeleteUser(uid: string) {
    let loader = await this.loadingCtrl.create({
      message: "Espere por favor..."
    });
    await loader.present();
  
    try {
      console.log("UID a eliminar:", uid);
      await this.userService.deleteUser(uid);
      await this.afAuth.signOut();
      await loader.dismiss();
      this.navCtrl.navigateRoot("login");
    } catch (e: any) {
      await loader.dismiss();
      let errorMessage = e.message || e.getLocalizedMessage();
      this.showToast(errorMessage);
    }
  }

  async editName(uid: string) {
    const modal = await this.modalCtrl.create({
      component: ModalEditNombreComponent,
      componentProps: { data: { uid } }
    });
    return await modal.present();
  }

  async editPhone(uid: string) {
    const modal = await this.modalCtrl.create({
      component: ModalEditTelefonoComponent,
      componentProps: { data: { uid } }
    });
    return await modal.present();
  }

  async editEmail(uid: string) {
    const modal = await this.modalCtrl.create({
      component: ModalEditCorreoComponent,
      componentProps: { data: { uid } }
    });
    return await modal.present();
  }

  async editPassword(uid: string) {
    const modal = await this.modalCtrl.create({
      component: ModalEditPasComponent,
      componentProps: { data: { uid } }
    });
    return await modal.present();
  }

  async presentActionSheet(uid: string) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Acciones',
      buttons: [
        {
          text: 'Eliminar',
          handler: () => {
            this.handleAction('delete', uid);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async handleAction(action: string, uid: string) {
    switch (action) {
      case 'delete':
        this.deleteUser(uid);
        break;
      case 'cancel':
        break;
      default:
        break;
    }
  }

  async updateUserInfo() {
    if (this.currentUser) {
      this.userService.updateUser(this.currentUser.uid, {
        nombre: this.currentUser.nombre,
        telefono: this.currentUser.telefono
      }).then(() => {
        this.showToast("Información actualizada con éxito.");
      }).catch((error) => {
        console.error("Error al actualizar la información:", error);
        this.showToast("Error al actualizar la información.");
      });
    } else {
      this.showToast("No se encontró al usuario.");
    }
  }

  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 5000
    }).then(toastData => toastData.present());
  }
}
