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
  user: User = {} as User;

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private afAuth: AngularFireAuth,
    private navCtrl: NavController,
    private afStore: AngularFirestore,
    private router: Router
  ) { }

  ngOnInit() {}

  navigate(){
    this.router.navigate(['/login'])
  }

  async register(user: User) {
    if (this.formValidation()) {
      let loader = await this.loadingCtrl.create({
        message: "Espere un momento..."
      });
      await loader.present();

      try {
        const userCredential = await this.afAuth.createUserWithEmailAndPassword(user.correo, user.password);
        await this.afStore.collection('users').doc(userCredential.user?.uid).set({
          nombre: user.nombre,
          telefono: user.telefono,
          correo: user.correo
        });
        this.navCtrl.navigateRoot("tabs");
      } catch (error: any) {
        let errorMessage = error.message || "Error al registrar";
        this.showToast(errorMessage);
      }

      await loader.dismiss();
    }
  }

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
      this.showToast("Ingrese tu nombre");
      return false;
    }
    if (!this.user.telefono) {
      this.showToast("Ingrese su numero");
      return false;
    }

    return true;
  }

  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 4000
    }).then(toastData => toastData.present());
  }
}
