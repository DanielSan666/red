import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ModalComponentAddComponent } from './modal-component-add/modal-component-add.component';
import { environment } from 'src/environments/environment';
import {AngularFireAuthModule} from '@angular/fire/compat/auth';
import {AngularFireModule} from '@angular/fire/compat';
import {AngularFirestoreModule} from '@angular/fire/compat/firestore';
import { FormsModule } from '@angular/forms';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { ModalComponentComponent } from './modal-component/modal-component.component';
import { ModalEditNombreComponent } from './modal-edit/modal-edit-nombre/modal-edit-nombre.component';
import { ModalEditTelefonoComponent } from './modal-edit/modal-edit-telefono/modal-edit-telefono.component';
import { ModalEditCorreoComponent } from './modal-edit/modal-edit-correo/modal-edit-correo.component';
import { ModalEditPasComponent } from './modal-edit/modal-edit-pas/modal-edit-pas.component';
import { RanchoModalComponent } from './modal/rancho-modal/rancho-modal.component';
import { ModalExampleComponent } from './notification/notification.component';
@NgModule({
  declarations: [AppComponent,ModalExampleComponent ,RanchoModalComponent,ModalComponentAddComponent,ModalComponentComponent, ModalEditNombreComponent,  ModalEditTelefonoComponent, ModalEditCorreoComponent,  ModalEditPasComponent],
  imports: [FormsModule ,
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule, 
    AngularFireModule.initializeApp(environment.FIREBASE_CONFIG)
    ,AngularFireAuthModule, 
    AngularFirestoreModule],
  providers: [SocialSharing,{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  
})
export class AppModule {}
