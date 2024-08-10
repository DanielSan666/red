import { Component } from '@angular/core';
import { PhotoService } from '../services/fotos/photo.service'; // Importa el servicio de fotos

@Component({
  selector: 'app-tab2', // Selector del componente, utilizado para identificar el componente en la plantilla
  templateUrl: 'tab2.page.html', // Ruta a la plantilla HTML asociada a este componente
  styleUrls: ['tab2.page.scss'] // Ruta a la hoja de estilos CSS asociada a este componente
})

export class Tab2Page {

  // El constructor inyecta el servicio PhotoService para que esté disponible en esta clase
  constructor(public photoService: PhotoService) {}

  // ngOnInit es un ciclo de vida de Angular que se ejecuta cuando el componente se inicializa
  async ngOnInit() {
    // Carga las fotos guardadas llamando al método `loadSaved` del servicio PhotoService
    await this.photoService.loadSaved();
  }
  
  // Método para añadir una nueva foto a la galería
  addPhotoToGallery() {
    // Llama al método `addNewToGallery` del servicio PhotoService para agregar una nueva foto
    this.photoService.addNewToGallery();
  }

}