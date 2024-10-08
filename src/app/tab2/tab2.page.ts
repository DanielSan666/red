import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RanchoModalComponent } from '../modal/rancho-modal/rancho-modal.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2', // Selector del componente, utilizado para identificar el componente en la plantilla
  templateUrl: 'tab2.page.html', // Ruta a la plantilla HTML asociada a este componente
  styleUrls: ['tab2.page.scss'] // Ruta a la hoja de estilos CSS asociada a este componente
})

export class Tab2Page implements OnInit {
  ranchos: any[] = [];

  constructor(private modalController: ModalController, private firestore: AngularFirestore, private router: Router) {}

  ngOnInit() {
    this.loadRanchos();
  }

  async loadRanchos() {
    this.firestore.collection('ranchos').valueChanges().subscribe((data: any[]) => {
      this.ranchos = data;
    });
  }

  async openModal() {
    const modal = await this.modalController.create({
      component: RanchoModalComponent,
    });
    return await modal.present();
  }

  goToRanchoDetail(nombre: string) {
    this.router.navigate(['/rancho-detail'], { queryParams: { nombre: nombre } }); // Navegar a la página de detalles
  }
}