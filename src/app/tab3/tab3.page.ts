import { Component, OnInit } from '@angular/core';
import { ActionSheetController, NavController, ModalController } from '@ionic/angular';
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

  // Constructor que inyecta los servicios necesarios para la autenticación, manejo de usuarios, navegación, etc.
  constructor(
    private afAuth: AngularFireAuth,
    private userService: UserService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private authService: AuthService
  ) {}

  // Método del ciclo de vida de Angular que se ejecuta cuando el componente se inicializa
  ngOnInit() {}

  // Función para cerrar la sesión del usuario
  logout() {
    this.authService.logout();
  }

  // Función para cargar los datos del usuario actual desde Firestore
  async loadUserData() {
    let loader = await this.loadingCtrl.create({
      message: "Cargando datos del usuario..."
    });
    await loader.present(); // Muestra un indicador de carga

    try {
      const user = await this.afAuth.currentUser; // Obtiene el usuario autenticado
      if (user) {
        const uid = user.uid; // Obtiene el UID del usuario
        console.log("UID del usuario:", uid);
        this.userService.getUser(uid).subscribe(userDoc => {
          if (userDoc.payload.exists) {
            this.currentUser = userDoc.payload.data(); // Asigna los datos del usuario a la variable currentUser
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
      await loader.dismiss(); // Oculta el indicador de carga
    }
  }

  // Método que se ejecuta cuando la vista está a punto de mostrarse
  ionViewWillEnter() {
    this.loadUserData(); // Carga los datos del usuario
  }

  // Función para eliminar un usuario autenticado
  async deleteUser(uid: string) {
    const user = await this.afAuth.currentUser;
    if (user) {
      const uid = user.uid;
      await this.performDeleteUser(uid); // Llama a la función que realiza la eliminación
    } else {
      this.showToast("No se pudo obtener la información del usuario."); // Muestra un mensaje de error si no se obtiene el usuario
    }
  }

  // Función que realiza la eliminación del usuario
  async performDeleteUser(uid: string) {
    let loader = await this.loadingCtrl.create({
      message: "Espere por favor..."
    });
    await loader.present(); // Muestra un indicador de carga
  
    try {
      console.log("UID a eliminar:", uid);
      await this.userService.deleteUser(uid); // Elimina el documento del usuario en Firestore
      await this.afAuth.signOut(); // Cierra la sesión del usuario
      await loader.dismiss();
      this.navCtrl.navigateRoot("login"); // Redirige a la página de inicio de sesión
    } catch (e: any) {
      await loader.dismiss();
      let errorMessage = e.message || e.getLocalizedMessage();
      this.showToast(errorMessage); // Muestra un mensaje de error en caso de fallo
    }
  }

  // Función para abrir un modal y editar el nombre del usuario
  async editName(uid: string){
    const modal = await this.modalCtrl.create({
      component: ModalEditNombreComponent,
      componentProps: { data: { uid } }
    });
    console.log("UID en openEditModal:", uid);
    return await modal.present();
  }

  // Función para abrir un modal específico para modificar el nombre del usuario
  async openModalName() {
    const modal = await this.modalCtrl.create({
      component: ModalEditNombreComponent
    });
    return await modal.present();
  }

  // Función para abrir un modal y editar el teléfono del usuario
  async editPhone(uid: string){
    const modal = await this.modalCtrl.create({
      component: ModalEditTelefonoComponent,
      componentProps: { data: { uid } }
    });
    console.log("UID en openEditModal:", uid);
    return await modal.present();
  }

  // Función para abrir un modal específico para modificar el teléfono del usuario
  async openModalPhone() {
    const modal = await this.modalCtrl.create({
      component: ModalEditTelefonoComponent
    });
    return await modal.present();
  }

  // Función para abrir un modal y editar el correo electrónico del usuario
  async editEmail(uid: string){
    const modal = await this.modalCtrl.create({
      component: ModalEditCorreoComponent,
      componentProps: { data: { uid } }
    });
    console.log("UID en openEditModal:", uid);
    return await modal.present();
  }

  // Función para abrir un modal específico para modificar el correo electrónico del usuario
  async openModalEmail() {
    const modal = await this.modalCtrl.create({
      component: ModalEditCorreoComponent
    });
    return await modal.present();
  }

  // Función para abrir un modal y editar la contraseña del usuario
  async editPassword(uid: string){
    const modal = await this.modalCtrl.create({
      component: ModalEditPasComponent,
      componentProps: { data: { uid } }
    });
    console.log("UID en openEditModal:", uid);
    return await modal.present();
  }

  // Función para abrir un modal específico para modificar la contraseña del usuario
  async openModalPassword() {
    const modal = await this.modalCtrl.create({
      component: ModalEditPasComponent
    });
    return await modal.present();
  }

  // Función para mostrar un Action Sheet con opciones de acciones
  async presentActionSheet(uid: string) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Acciones',
      buttons: [
        {
          text: 'Eliminar',
          handler: () => {
            this.handleAction('delete', uid); // Maneja la acción de eliminar
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    console.log("UID en presentActionSheet:", uid);
    await actionSheet.present(); // Muestra el Action Sheet
  }

  // Función que maneja las acciones seleccionadas en el Action Sheet
  async handleAction(action: string, uid: string) {
    console.log("Acción:", action, "UID:", uid);
    switch (action) {
      case 'delete':
        this.deleteUser(uid); // Llama a la función de eliminación de usuario
        break;
      case 'cancel':
        break;
      default:
        break;
    }
  }

  // Función para mostrar un mensaje Toast en la pantalla
  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 5000
    }).then(toastData => toastData.present());
  }
}