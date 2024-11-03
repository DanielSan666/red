import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { Rancho } from 'src/app/models/rancho.mmodel'; // Importa el modelo

@Component({
  selector: 'app-rancho-modal',
  templateUrl: './rancho-modal.component.html',
  styleUrls: ['./rancho-modal.component.scss'],
})

export class RanchoModalComponent implements OnInit {
  rancho: Rancho = { // Usa el modelo aquí
    nombre: '',
    informacion: '',
    imagenUrl: ''
  };
  selectedFile: File | null = null;

  constructor(
    private modalController: ModalController,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async onSubmit() {
    if (this.selectedFile) {
      const filePath = `rancho-images/${this.selectedFile.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, this.selectedFile);

      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(async (url: string) => {
            this.rancho.imagenUrl = url;
            await this.saveRancho();
          });
        })
      ).subscribe();
    }
  }

  async saveRancho() {
    try {
      await this.firestore.collection('ranchos').add(this.rancho);
      this.modalController.dismiss();

      const userName = 'Usuario'; // Reemplaza esto con el nombre del usuario que sube el rancho
      this.notificationService.sendNotification(`${userName} ha subido un rancho.`);

      this.resetForm(); // Llama a la función para limpiar el formulario
    } catch (error) {
      console.error('Error al agregar rancho:', error);
    }
  }

  resetForm() {
    this.rancho = { nombre: '', informacion: '', imagenUrl: '' }; // Limpia el objeto rancho
    this.selectedFile = null; // Limpia el archivo seleccionado
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
