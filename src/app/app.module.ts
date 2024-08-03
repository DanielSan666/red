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
import { ModalComponentComponent } from './modal-component/modal-component.component';
import { ModalEditPerfilComponent } from './modal-edit-perfil/modal-edit-perfil.component';
@NgModule({
  declarations: [AppComponent, ModalComponentAddComponent,ModalComponentComponent, ModalEditPerfilComponent],
  imports: [FormsModule ,BrowserModule, IonicModule.forRoot(), AppRoutingModule, AngularFireModule.initializeApp(environment.FIREBASE_CONFIG),AngularFireAuthModule, AngularFirestoreModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  
})
export class AppModule {}
