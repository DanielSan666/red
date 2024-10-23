import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TermsModalPageRoutingModule } from './terms-modal-routing.module';

import { TermsModalPage } from './terms-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TermsModalPageRoutingModule
  ],
  declarations: [TermsModalPage]
})
export class TermsModalPageModule {}
