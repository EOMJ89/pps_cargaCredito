import { Component, OnInit } from '@angular/core';
import { SpinnerService } from 'src/app/services/spinner/spinner.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { Platform, ModalController } from '@ionic/angular';
import { ResultPage } from '../result/result.page';
import { QrService } from 'src/app/services/qr/qr.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(
    // tslint:disable: variable-name
    private _spinnerServ: SpinnerService,
    private _authServ: AuthService,
    private _router: Router,
    private _platform: Platform,
    private _modalCtrl: ModalController,
    private _qrServ: QrService,
    private _toastServ: ToastService
  ) { }

  ionViewDidEnter() {
    // console.log(this._authServ.username);
    this._qrServ.inicializarDatos(this._authServ.username)
      .then(() => {
        this._spinnerServ.hideSpinner();
      })
      .catch((err) => {
        console.log('Error en ionViewDidEnter', err);
        this._toastServ.presentToast('No hay datos de su usuario.', 4);
        this.cerrarSesion();
      });
  }

  public cerrarSesion() {
    this._spinnerServ.showSpinner();
    this._authServ.cerrarSesion().then(() => {
      this._router.navigate(['login']);
      this._spinnerServ.hideSpinner();
    });
  }

  public scanQR() {
    // console.log('Escaneo codigo');
    this._qrServ.scanCode().then((mensaje: string) => {
      if (mensaje !== '') {
        // mensaje = '+' + mensaje + '+';
        this.showModal(mensaje);
      }
    });
  }

  private async showModal(mensaje: string) {
    const modal = await this._modalCtrl.create({
      component: ResultPage,
      componentProps: {
        mensaje,
      }
    });

    modal.present();
  }

  public reiniciar() {
    this._qrServ.reiniciarCodigo();
  }
}
