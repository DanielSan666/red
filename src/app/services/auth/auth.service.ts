import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Importa el servicio de autenticación de Firebase
import { Router } from '@angular/router'; // Importa el servicio de enrutamiento de Angular

@Injectable({
  providedIn: 'root', // Define que este servicio está disponible en toda la aplicación
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  // Método para cerrar sesión
  async logout() {
    // Llama al método signOut de AngularFireAuth para cerrar la sesión del usuario
    await this.afAuth.signOut();
    // Navega a la página de inicio de sesión después de cerrar la sesión
    this.router.navigate(['/login']);
  }
}