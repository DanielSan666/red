import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ToastController, LoadingController } from '@ionic/angular';
import { UserService } from 'src/app/services/perfil/perfil.service';

@Component({
  selector: 'app-modal-edit-correo',
  templateUrl: './modal-edit-correo.component.html',
  styleUrls: ['./modal-edit-correo.component.scss'],
})
export class ModalEditCorreoComponent implements OnInit {
  currentUser: any;
  newEmail: string = '';

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private userService: UserService,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit() {
    this.loadUser();
  }

  async loadUser() {
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
  
  async updateEmail() {
    if (this.newEmail.trim() === '') {
      this.showToast("Ingrese un correo electrónico válido");
      return;
    }

    const user = await this.afAuth.currentUser;
    if (user) {
      let loader = await this.loadingCtrl.create({
        message: "Actualizando correo..."
      });
      await loader.present();

      try {
        // Enviar correo de verificación al nuevo correo electrónico
        await user.verifyBeforeUpdateEmail(this.newEmail);

        this.showToast("Correo de verificación enviado. Por favor, verifique su nuevo correo electrónico.");
        loader.dismiss();
        this.modalCtrl.dismiss(this.currentUser, 'updateEmail');
      } catch (error: any) {
        console.error("Error al enviar el correo de verificación:", error);
        this.showToast(error.message || "Error al enviar el correo de verificación");
      } finally {
        await loader.dismiss();
      }
    } else {
      this.showToast("Usuario no autenticado.");
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }
}