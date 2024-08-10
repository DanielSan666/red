import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ToastController, LoadingController } from '@ionic/angular';
import { UserService } from 'src/app/services/perfil/perfil.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from 'src/app/models/user.model';
@Component({
  selector: 'app-modal-edit-nombre',
  templateUrl: './modal-edit-nombre.component.html',
  styleUrls: ['./modal-edit-nombre.component.scss'],
})
export class ModalEditNombreComponent implements OnInit {
  currentUser: any; // Almacena los datos actuales del usuario
  user: User = { nombre: '', telefono: '', correo: '', password: '' }; // Datos del usuario a editar

  constructor(
    private modalCtrl: ModalController, // Controlador para manejar modales
    private toastCtrl: ToastController, // Controlador para mostrar mensajes emergentes
    private loadingCtrl: LoadingController, // Controlador para mostrar indicadores de carga
    private userService: UserService, // Servicio para manejar datos del usuario
    private afAuth: AngularFireAuth // Servicio de autenticación de Firebase
  ) { }

  ngOnInit() {}

  // Método llamado cuando el modal va a ser presentado
  ionViewWillEnter() {
    this.loadUser(); // Cargar los datos del usuario
  }

  // Carga los datos del usuario actual
  async loadUser() {
    let loader = await this.loadingCtrl.create({
      message: "Cargando datos del usuario..." // Mensaje del indicador de carga
    });
    await loader.present(); // Muestra el indicador de carga

    try {
      const user = await this.afAuth.currentUser; // Obtiene el usuario actual autenticado
      if (user) {
        const uid = user.uid; // Obtiene el UID del usuario
        console.log("UID del usuario:", uid); // Imprime el UID en la consola
        this.userService.getUser(uid).subscribe(userDoc => {
          if (userDoc.payload.exists) {
            this.currentUser = userDoc.payload.data(); // Almacena los datos del usuario
            this.currentUser.uid = uid; // Añade el UID a los datos del usuario
            console.log(this.currentUser.uid); // Imprime el UID en la consola
          } else {
            console.error("El documento del usuario no existe."); // Error si el documento no existe
          }
        }, error => {
          console.error("Error al obtener los datos del usuario", error); // Error en la obtención de datos
        });
      } else {
        console.error("Usuario no autenticado."); // Error si no hay usuario autenticado
      }
    } catch (error) {
      console.error("Error al cargar los datos del usuario", error); // Error en el proceso de carga
    } finally {
      await loader.dismiss(); // Oculta el indicador de carga
    }
  }

  // Actualiza el nombre del usuario
  async UpdateUser(uid: string) {
    const user = await this.afAuth.currentUser;
    if (user) {
      const uid = user.uid; // Obtiene el UID del usuario
      const newName = this.user.nombre; // Obtiene el nuevo nombre del formulario
      await this.updateName(uid, newName); // Llama al método para actualizar el nombre
    } else {
      this.showToast("No se pudo obtener la información del usuario."); // Mensaje de error si no se puede obtener el usuario
    }
  }

  // Actualiza el nombre del usuario en Firestore
  async updateName(uid: string, newName: string) {
    if (!this.formValidation()) {
      return; // Si la validación falla, no procede
    }
    const loader = await this.loadingCtrl.create({
      message: "Espere por favor..." // Mensaje del indicador de carga
    });
    await loader.present(); // Muestra el indicador de carga

    try {
      // Actualiza solo el campo 'nombre'
      const updateData = { nombre: newName };

      await this.userService.updateUser(uid, updateData).then(() => {
        loader.dismiss(); // Oculta el indicador de carga
        this.modalCtrl.dismiss(updateData, 'updatePost'); // Cierra el modal y pasa los datos actualizados
      });
    } catch (e: any) {
      await loader.dismiss(); // Oculta el indicador de carga
      let errorMessage = e.message || e.getLocalizedMessage(); // Mensaje de error
      this.showToast(errorMessage); // Muestra el mensaje de error
    }
  }

  // Valida los datos del formulario
  formValidation(): boolean {
    if (!this.user.nombre) {
      this.showToast("Ingrese su nombre"); // Mensaje si el nombre está vacío
      return false;
    }
    // Agrega más validaciones si es necesario
    return true;
  }

  // Muestra un mensaje emergente
  showToast(message: string) {
    this.toastCtrl.create({
      message: message, // Mensaje del toast
      duration: 4000 // Duración del toast
    }).then(toastData => toastData.present()); // Muestra el toast
  }

  // Cierra el modal sin hacer cambios
  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel'); // Cierra el modal y pasa 'cancel' como resultado
  }
}