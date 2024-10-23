import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-terms-modal',
  templateUrl: './terms-modal.page.html',
  styleUrls: ['./terms-modal.page.scss'],
})
export class TermsModalPage {
  accepted: boolean = false; // Estado para saber si los términos han sido aceptados

  constructor(private modalCtrl: ModalController) {}

  // Método para aceptar los términos
  acceptTerms() {
    this.accepted = true;
    this.modalCtrl.dismiss({ accepted: this.accepted });
  }

  // Método para rechazar los términos
  rejectTerms() {
    this.accepted = false;
    this.modalCtrl.dismiss({ accepted: this.accepted });
  }

  // Método para cerrar el modal sin aceptar
  dismiss() {
    this.modalCtrl.dismiss({ accepted: this.accepted });
  }
}
