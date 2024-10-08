import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RanchoDetailPageRoutingModule } from './rancho-detail-routing.module';

import { RanchoDetailPage } from './rancho-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RanchoDetailPageRoutingModule
  ],
  declarations: [RanchoDetailPage]
})
export class RanchoDetailPageModule {}
