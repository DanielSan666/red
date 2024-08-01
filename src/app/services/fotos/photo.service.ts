import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo as CapacitorPhoto } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { finalize } from 'rxjs/operators';

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

export interface Photo {
  url: string;
  description?: string;
  dateTaken: Date;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private PHOTO_STORAGE: string = 'photos';
  public photos: UserPhoto[] = [];
  private platform: Platform;

  constructor(platform: Platform, private storage: AngularFireStorage,
    private firestore: AngularFirestore) {
    this.platform = platform;
  }

  public async loadSaved() {
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];

    if (!this.platform.is('hybrid')) {
      for (let photo of this.photos) {
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data
        });
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }

  private async readAsBase64(photo: CapacitorPhoto) {
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path!
      });
      return file.data;
    } else {
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();
      return await this.convertBlobToBase64(blob) as string;
    }
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  private async savePicture(photo: CapacitorPhoto): Promise<UserPhoto> {
    const base64Data = await this.readAsBase64(photo);
    const fileName = Date.now() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    if (this.platform.is('hybrid')) {
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    } else {
      return {
        filepath: fileName,
        webviewPath: photo.webPath
      };
    }
  }

  public async addNewToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);

    await Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });

    const photoUrl = await this.uploadPhotoToFirebase(savedImageFile);
    const photo: Photo = {
      url: photoUrl,
      description: 'Photo taken on ' + new Date().toLocaleString(),
      dateTaken: new Date(),
      // userId: 'your-user-id' // Add this if you have a user ID
    };

    await this.savePhotoToFirestore(photo);
  }

  private async uploadPhotoToFirebase(photo: UserPhoto): Promise<string> {
    const response = await fetch(photo.webviewPath!);
    const blob = await response.blob();
    const filePath = `photos/${photo.filepath}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, blob);

    return new Promise<string>((resolve, reject) => {
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(url => {
            resolve(url);
          }, reject);
        })
      ).subscribe();
    });
  }

  private async savePhotoToFirestore(photo: Photo) {
    await this.firestore.collection('photos').add(photo);
  }
}
