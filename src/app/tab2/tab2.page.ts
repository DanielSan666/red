import { Component } from '@angular/core';
import { PhotoService } from '../services/fotos/photo.service';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})

export class Tab2Page {

  constructor(public photoService: PhotoService) {}
  async ngOnInit() {
    await this.photoService.loadSaved();
  }
  

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  }






