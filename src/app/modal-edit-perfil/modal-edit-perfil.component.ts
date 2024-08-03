import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastController, LoadingController } from '@ionic/angular';
import { UserService } from '../services/perfil/perfil.service';
import { NavParams } from '@ionic/angular';
import { User } from '../models/user.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-modal-edit-perfil',
  templateUrl: './modal-edit-perfil.component.html',
  styleUrls: ['./modal-edit-perfil.component.scss'],
})
export class ModalEditPerfilComponent implements OnInit {
currentUser: any;
  user: User = { nombre: '', telefono: '', correo: '', password: '' };

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private userService: UserService,
    private afAuth: AngularFireAuth
  ) { }

  ngOnInit() {
  }
  
  ionViewWillEnter() {
    this.loadUser(); // Verifica el valor de currentUser

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

  async UpdateUser(uid: string) {
    const user = await this.afAuth.currentUser;
    if (user) {
      const uid = user.uid;
      await this.updateProfile(uid);
    } else {
      this.showToast("No se pudo obtener la información del usuario.");
    }
  }
  
  async updateProfile(uid: string) {
    if (!this.formValidation()) {
      return; // Si la validación falla, no proceder
    }
    const loader = await this.loadingCtrl.create({
      message: "Espere por favor..."
    });
    await loader.present();

    try {
        await this.userService.updateUser(uid, this.user).then(() => {
        loader.dismiss();
        this.modalCtrl.dismiss(this.user, 'updatePost');
    
        });
        }catch (e: any) {
          await loader.dismiss();
          let errorMessage = e.message || e.getLocalizedMessage();
          this.showToast(errorMessage);
        }
  }

  formValidation(): boolean {
    if (!this.user.nombre) {
      this.showToast("Ingrese su nombre");
      return false;
    }
    if (!this.user.correo) {
      this.showToast("Ingrese su correo electrónico");
      return false;
    }
    if (!this.user.telefono) {
      this.showToast("Ingrese su número de teléfono");
      return false;
    }
    // Agrega más validaciones según sea necesario
    return true;
  }

  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 4000
    }).then(toastData => toastData.present());
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
}