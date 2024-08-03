import { Component, OnInit} from '@angular/core';
import { ModalEditPerfilComponent } from '../modal-edit-perfil/modal-edit-perfil.component';
import { ActionSheetController, NavController,ModalController } from '@ionic/angular';
import { LoadingController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from '../services/perfil/perfil.service';
import { AuthService } from '../services/auth/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
})
export class Tab3Page implements OnInit {
  currentUser: any;
  ////Variable para las opciones
  constructor(
    private afAuth: AngularFireAuth,
    private userService: UserService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private afStore: AngularFirestore,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private authService: AuthService
  ) {}
  ngOnInit() {
  }
  ///Funcion de cerrar sesion
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
        console.log("UID del usuario:", uid); // Aquí se imprime el UID
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
    this.loadUserData(); // Verifica el valor de currentUser

  }

  /////Funcion para elimiar un usuario
  async deleteUser(uid: string) {
    const user = await this.afAuth.currentUser;
    if (user) {
      const uid = user.uid;
      await this.performDeleteUser(uid);
    } else {
      this.showToast("No se pudo obtener la información del usuario.");
    }
  }

  async performDeleteUser(uid: string) {
    let loader = await this.loadingCtrl.create({
      message: "Espere por favor..."
    });
    await loader.present();
  
    try {
      console.log("UID a eliminar:", uid); // Aquí se imprime el UID
      // Eliminar el documento del usuario de Firestore
      await this.userService.deleteUser(uid);
      // Cerrar la sesión del usuario autenticado
      await this.afAuth.signOut();
      await loader.dismiss();
      // Redirigir a la página de inicio de sesión
      this.navCtrl.navigateRoot("login");
    } catch (e: any) {
      await loader.dismiss();
      let errorMessage = e.message || e.getLocalizedMessage();
      this.showToast(errorMessage);
    }
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
          text: 'Editar',
          handler: () => {
            this.handleAction('edit', uid);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    console.log("UID en presentActionSheet:", uid); // Aquí se imprime el UID
    await actionSheet.present();
  }

  async handleAction(action: string, uid: string) {
    console.log("Acción:", action, "UID:", uid); // Aquí se imprime la acción y el UID
    switch (action) {
      case 'delete':
        this.deleteUser(uid);
        break;
      case 'edit':
        await this.openEditModal(uid);
        break;
      case 'cancel':
        break;
      default:
        break;
    }
  }

  async openEditModal(uid: string) {
    const modal = await this.modalCtrl.create({
      component: ModalEditPerfilComponent,
      componentProps: { data: { uid } }
    });
    console.log("UID en openEditModal:", uid); // Aquí se imprime el UID
    return await modal.present();
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component:  ModalEditPerfilComponent,
      componentProps: {
      }
    });
    return await modal.present();

  }
  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 5000
    }).then(toastData => toastData.present());
  }
  
}