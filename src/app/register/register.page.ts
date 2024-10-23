import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { LoadingController, NavController, ToastController, ModalController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { TermsModalPage } from '../terms-modal/terms-modal.page';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  user: User = {} as User; // Objeto user inicializado como un User vacío
  termsAccepted: boolean = false; // Estado para saber si los términos han sido aceptados

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private afAuth: AngularFireAuth,
    private navCtrl: NavController,
    private afStore: AngularFirestore,
    private router: Router,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  // Método para navegar a la página de inicio de sesión
  navigate() {
    this.router.navigate(['/login']);
  }

  // Método para mostrar el modal de términos
  async showTermsModal() {
    const modal = await this.modalCtrl.create({
      component: TermsModalPage
    });
    
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.termsAccepted = data.data.accepted; // Obtener el estado de aceptación
      } else {
        this.termsAccepted = false; // Resetear si se rechazó
      }
    });
    
    return await modal.present();
  }

  // Función para registrar un nuevo usuario
  async register() {
    if (this.formValidation()) {
      if (!this.termsAccepted) {
        this.showToast("Debes aceptar los términos y condiciones para registrarte.");
        return;
      }

      let loader = await this.loadingCtrl.create({
        message: "Espere un momento..."
      });
      await loader.present();

      try {
        const userCredential = await this.afAuth.createUserWithEmailAndPassword(this.user.correo, this.user.password);
        await this.afStore.collection('users').doc(userCredential.user?.uid).set({
          nombre: this.user.nombre,
          telefono: this.user.telefono,
          correo: this.user.correo
        });

        this.navCtrl.navigateRoot("tabs");
      } catch (error: any) {
        let errorMessage = error.message || "Error al registrar";
        this.showToast(errorMessage);
      }

      await loader.dismiss();
    }
  }

  // Validación del formulario
  formValidation() {
    if (!this.user.correo) {
      this.showToast("Ingrese un correo electrónico");
      return false;
    }
    if (!this.user.password) {
      this.showToast("Ingrese una contraseña");
      return false;
    }
    if (!this.user.nombre) {
      this.showToast("Ingrese su nombre");
      return false;
    }
    if (!this.user.telefono) {
      this.showToast("Ingrese su número");
      return false;
    }

    return true;
  }

  // Mostrar mensaje de toast
  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 4000
    }).then(toastData => toastData.present());
  }
}
