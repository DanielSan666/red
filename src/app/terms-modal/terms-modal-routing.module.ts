import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TermsModalPage } from './terms-modal.page';

const routes: Routes = [
  {
    path: '',
    component: TermsModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TermsModalPageRoutingModule {}
