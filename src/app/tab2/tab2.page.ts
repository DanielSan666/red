import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RanchoModalComponent } from '../modal/rancho-modal/rancho-modal.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})

export class Tab2Page implements OnInit {
  ranchos: any[] = [];
  notificationCount = 0;

  constructor(
    private modalController: ModalController,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRanchos();
  }

  async loadRanchos() {
    this.firestore.collection('ranchos').valueChanges().subscribe((data: any[]) => {
      this.ranchos = data;
    });
  }

  async openAddRancho() {
    const modal = await this.modalController.create({
      component: RanchoModalComponent,
    });
    return await modal.present();
  }

  goToRanchoDetail(nombre: string) {
    this.router.navigate(['/rancho-detail'], { queryParams: { nombre: nombre } });
  }

  openChat() {
    this.router.navigate(['/chatPage']);
    this.notificationCount = 0; // Reiniciar contador al abrir el chat
  }
}
