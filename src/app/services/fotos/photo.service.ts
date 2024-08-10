import { Injectable } from '@angular/core';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo as CapacitorPhoto,
} from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { finalize } from 'rxjs/operators';

// Interfaz para representar una foto del usuario
export interface UserPhoto {
  filepath: string; // Ruta del archivo en el dispositivo
  webviewPath?: string; // Ruta para mostrar la imagen en una vista web
}

// Interfaz para representar una foto con metadatos
export interface Photo {
  url: string; // URL de la foto en Firebase Storage
  description?: string; // Descripción opcional de la foto
  dateTaken: Date; // Fecha en que se tomó la foto
  userId?: string; // ID del usuario que subió la foto (opcional)
}

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private PHOTO_STORAGE: string = 'photos'; // Clave para almacenar fotos en Preferences
  public photos: UserPhoto[] = []; // Array para almacenar las fotos del usuario
  private platform: Platform; // Instancia de la plataforma para verificar el entorno (web o híbrido)

  constructor(
    platform: Platform,
    private storage: AngularFireStorage, // Servicio para interactuar con Firebase Storage
    private firestore: AngularFirestore // Servicio para interactuar con Firestore
  ) {
    this.platform = platform;
  }

  // Método para cargar fotos guardadas desde Preferences
  public async loadSaved() {
    // Obtener las fotos guardadas desde Preferences
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];

    // Si no estamos en un entorno híbrido (web), leer el archivo desde el sistema de archivos
    if (!this.platform.is('hybrid')) {
      for (let photo of this.photos) {
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data,
        });
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }

  // Método para leer una foto como base64
  private async readAsBase64(photo: CapacitorPhoto) {
    if (this.platform.is('hybrid')) {
      // Leer archivo desde el sistema de archivos en entornos híbridos
      const file = await Filesystem.readFile({
        path: photo.path!,
      });
      return file.data;
    } else {
      // Obtener archivo como blob y convertirlo a base64 en la web
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();
      return (await this.convertBlobToBase64(blob)) as string;
    }
  }

  // Convertir un blob a una cadena base64
  private convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  // Método para guardar una foto en el sistema de archivos
  private async savePicture(photo: CapacitorPhoto): Promise<UserPhoto> {
    const base64Data = await this.readAsBase64(photo);
    const fileName = Date.now() + '.jpeg'; // Generar un nombre único para el archivo
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    // Retornar la ruta del archivo dependiendo del entorno
    if (this.platform.is('hybrid')) {
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    } else {
      return {
        filepath: fileName,
        webviewPath: photo.webPath,
      };
    }
  }

  // Método para agregar una nueva foto a la galería
  public async addNewToGallery() {
    // Capturar una foto usando la cámara
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    // Guardar la imagen capturada
    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);

    // Guardar la lista de fotos en Preferences
    await Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });

    // Subir la foto a Firebase Storage y obtener la URL
    const photoUrl = await this.uploadPhotoToFirebase(savedImageFile);
    const photo: Photo = {
      url: photoUrl,
      description: 'Photo taken on ' + new Date().toLocaleString(),
      dateTaken: new Date(),
      // userId: 'your-user-id' // Agregar ID de usuario si está disponible
    };

    // Guardar la foto en Firestore
    await this.savePhotoToFirestore(photo);
  }

  // Método para subir una foto a Firebase Storage
  private async uploadPhotoToFirebase(photo: UserPhoto): Promise<string> {
    const response = await fetch(photo.webviewPath!);
    const blob = await response.blob();
    const filePath = `photos/${photo.filepath}`; // Ruta del archivo en Firebase Storage
    const fileRef = this.storage.ref(filePath); // Referencia al archivo en Firebase Storage
    const task = this.storage.upload(filePath, blob); // Tarea de subida

    return new Promise<string>((resolve, reject) => {
      task
        .snapshotChanges()
        .pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe((url) => {
              resolve(url); // Obtener la URL de descarga del archivo
            }, reject);
          })
        )
        .subscribe();
    });
  }

  // Método para guardar la información de la foto en Firestore
  private async savePhotoToFirestore(photo: Photo) {
    await this.firestore.collection('photos').add(photo);
  }
}