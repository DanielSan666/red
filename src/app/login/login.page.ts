import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Subscription } from 'rxjs';
import { UserService } from '../services/perfil/perfil.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  // Objeto user inicializado como un User vacío
  user = {} as User;
  
  // Variable para almacenar los datos del usuario actual
  currentUser: any;
  
  // Suscripción al observable que obtiene los datos del usuario
  userSubscription: Subscription | undefined;

  constructor(
    private toastCtrl: ToastController, // Controlador para mostrar mensajes tipo toast
    private loadingCtrl: LoadingController, // Controlador para mostrar el loading
    private afAuth: AngularFireAuth, // Servicio de autenticación de Firebase
    private navCtrl: NavController, // Controlador para la navegación
    private afStore: AngularFireStorage, // Servicio de almacenamiento de Firebase
    private userService: UserService // Servicio para manejar los datos del perfil del usuario
  ) {}

  // Método que se ejecuta al inicializar el componente
  ngOnInit() {}

  // Función para iniciar sesión
  async login(user: User) {
    // Validación del formulario
    if (this.formValidation()) {
      let loader = await this.loadingCtrl.create({
        message: 'Espere por favor....', // Mensaje de carga
      });
      await loader.present(); // Mostrar loading

      try {
        // Intentar iniciar sesión con el correo y la contraseña proporcionados
        const result = await this.afAuth.signInWithEmailAndPassword(
          user.correo,
          user.password
        );
        console.log(result);

        // Obtener el UID del usuario autenticado
        const uid = result.user?.uid;

        // Obtener el token de autenticación
        const token = await result.user?.getIdToken();
        console.log('Authentication Token:', token);

        if (uid) {
          // Obtener los datos del usuario usando el servicio `UserService`
          this.userSubscription = this.userService
            .getUser(uid)
            .subscribe((userDoc) => {
              if (userDoc.payload.exists) {
                // Si el perfil del usuario existe, almacenar los datos en `currentUser`
                this.currentUser = userDoc.payload.data();
                console.log(this.currentUser);
                this.navCtrl.navigateRoot('tabs'); // Navegar a la página principal si el usuario existe
              } else {
                // Si el perfil ha sido eliminado, mostrar mensaje y cerrar sesión
                this.showToast(
                  'Su perfil ha sido eliminado. No puede iniciar sesión.'
                );
                this.afAuth.signOut(); // Cerrar sesión en Firebase
                if (this.userSubscription) {
                  this.userSubscription.unsubscribe(); // Desuscribir del observable para evitar fugas de memoria
                }
              }
            });
        } else {
          this.showToast('Error al obtener los datos del usuario.');
        }
      } catch (error: any) {
        // Manejar diferentes tipos de errores durante el inicio de sesión
        if (error.code === 'auth/wrong-password') {
          this.showToast('La contraseña es incorrecta.');
        } else if (error.code === 'auth/user-not-found') {
          this.showToast('El usuario no existe.');
        } else {
          this.showToast('Error al iniciar sesión: ' + error.message);
        }
        let errorMessage = error.message || error.getLocalizedMessage();
        this.showToast(errorMessage);
      }
      console.error('Error al iniciar sesión:');
      await loader.dismiss(); // Ocultar el loading
    }
  }

  // Validación del formulario de inicio de sesión
  formValidation() {
    if (!this.user.correo) {
      this.showToast('Ingrese su correo electrónico');
      return false;
    }
    if (!this.user.password) {
      this.showToast('Ingrese su contraseña');
      return false;
    }
    return true; // Retorna true si ambos campos están completos
  }

  // Función para mostrar mensajes al usuario
  showToast(message: string) {
    this.toastCtrl
      .create({
        message: message, // Mensaje a mostrar
        duration: 5000, // Duración del mensaje en milisegundos
      })
      .then((toastData) => toastData.present()); // Presentar el toast
  }
}