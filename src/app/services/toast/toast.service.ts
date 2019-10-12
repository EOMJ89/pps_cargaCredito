import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ToastOptions } from '@ionic/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // tslint:disable: variable-name
  constructor(private _toastCtrl: ToastController) { }

  public async presentToast(message: string, duration: number) {
    const toast = await this._toastCtrl.create({
      message,
      duration: (duration * 1000),
      color: 'secondary',
      showCloseButton: true,
    });
    toast.present();
  }
}

