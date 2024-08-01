import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { UserService } from '../services/perfil.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  user = {} as User;
  currentUser: any;


  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private afAuth: AngularFireAuth,
    private navCtrl: NavController,
    private afStore: AngularFireStorage,
    private userService: UserService
  ) { }

  ngOnInit() {}

  async login(user: User) {
    if (this.formValidation()) {
      let loader = await this.loadingCtrl.create({
        message: "Espere por favor...."
      });
      await loader.present();

      try {
        const result = await this.afAuth.signInWithEmailAndPassword(user.correo, user.password);
        console.log(result);

        // Obtener el UID del usuario autenticado
        const uid = result.user?.uid;

        if (uid) {
          // Obtener datos del usuario usando el servicio
          this.userService.getUser(uid).subscribe(userDoc => {
            if (userDoc.payload.exists) {
              this.currentUser = userDoc.payload.data();
              console.log(this.currentUser);
            }
          });
        }

        this.navCtrl.navigateRoot("tabs");
      } catch (error: any) {
        error.message = "Error al iniciar sesión";
        let errorMessage = error.message || error.getLocalizedMessage();
        this.showToast(errorMessage);
      }
      await loader.dismiss();
    }
  }
  
  formValidation(){
    if (!this.user.correo) {
      this.showToast("Ingrese su correo electronico");
      return false;
      
    }
    if (!this.user.password) {
      this.showToast("Ingrese su contraseña")
      return false;
      
    }
    return true;
  }
  showToast(message:string){
    this.toastCtrl.create({
      message:message,
      duration:5000
    }).then(toastData => toastData.present());
  }
}
