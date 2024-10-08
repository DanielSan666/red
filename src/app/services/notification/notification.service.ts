import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class NotificationService {
  private notificationSource = new BehaviorSubject<string | null>(null); // Allow null

  currentNotification = this.notificationSource.asObservable();

  constructor() { }

  // Method to send notifications
  sendNotification(message: string) {
    this.notificationSource.next(message); // Emit the new notification message
  }
}