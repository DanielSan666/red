import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  // Objeto user inicializado como un User vacío
  user: User = {} as User;

  constructor(
    private toastCtrl: ToastController, // Controlador para mostrar mensajes tipo toast
    private loadingCtrl: LoadingController, // Controlador para mostrar el loading
    private afAuth: AngularFireAuth, // Servicio de autenticación de Firebase
    private navCtrl: NavController, // Controlador para la navegación
    private afStore: AngularFirestore, // Servicio de Firestore
    private router: Router // Servicio de enrutamiento
  ) { }

  // Método que se ejecuta al inicializar el componente
  ngOnInit() {}

  // Navegar a la página de inicio de sesión
  navigate() {
    this.router.navigate(['/login']);
  }

  // Función para registrar un nuevo usuario
  async register(user: User) {
    // Validación del formulario
    if (this.formValidation()) {
      // Mostrar un loader mientras se realiza el registro
      let loader = await this.loadingCtrl.create({
        message: "Espere un momento..."
      });
      await loader.present();

      try {
        // Crear un nuevo usuario en Firebase Authentication
        const userCredential = await this.afAuth.createUserWithEmailAndPassword(user.correo, user.password);

        // Guardar los datos del usuario en la colección 'users' de Firestore
        await this.afStore.collection('users').doc(userCredential.user?.uid).set({
          nombre: user.nombre,
          telefono: user.telefono,
          correo: user.correo
        });

        // Navegar a la página principal después de un registro exitoso
        this.navCtrl.navigateRoot("tabs");
      } catch (error: any) {
        // Manejar errores de registro
        let errorMessage = error.message || "Error al registrar";
        this.showToast(errorMessage);
      }

      // Ocultar el loader
      await loader.dismiss();
    }
  }

  // Validación del formulario de registro
  formValidation() {
    // Verificar que todos los campos necesarios estén completos
    if (!this.user.correo) {
      this.showToast("Ingrese un correo electrónico");
      return false;
    }
    if (!this.user.password) {
      this.showToast("Ingrese una contraseña");
      return false;
    }
    if (!this.user.nombre) {
      this.showToast("Ingrese tu nombre");
      return false;
    }
    if (!this.user.telefono) {
      this.showToast("Ingrese su número");
      return false;
    }

    return true; // Retorna true si todos los campos están completos
  }

  // Función para mostrar mensajes al usuario
  showToast(message: string) {
    this.toastCtrl.create({
      message: message, // Mensaje a mostrar
      duration: 4000 // Duración del mensaje en milisegundos
    }).then(toastData => toastData.present()); // Presentar el toast
  }
}