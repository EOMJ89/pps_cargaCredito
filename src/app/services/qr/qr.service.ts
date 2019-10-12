import { Injectable } from '@angular/core';
import { ZBar, ZBarOptions } from '@ionic-native/zbar/ngx';
import { FirebaseService } from '../firebase/firebase.service';
import { SpinnerService } from '../spinner/spinner.service';
import { AuthService } from '../auth/auth.service';
import { Datos } from 'src/app/interfaces/datos/datos';
import { Keylessdatos } from 'src/app/interfaces/datos/keylessdatos';
import { ToastService } from '../toast/toast.service';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QrService {
  // tslint:disable: variable-name
  private _datosActuales: Datos;
  private _zbarOptions: ZBarOptions;
  private _sub: Subscription;
  //#region Saldo
  public get saldo(): number {
    return this._datosActuales !== undefined ? this._datosActuales.credito : 0;
  }

  public set saldo(v: number) {
    this._datosActuales.credito = v;
  }
  //#endregion

  constructor(
    private _zbar: ZBar,
    private _firebaseServ: FirebaseService,
    private _spinnerServ: SpinnerService,
    private _toastServ: ToastService) {
    this._zbarOptions = {
      flash: 'off',
      drawSight: false,
      text_title: 'Escanear QR',
      text_instructions: 'Apunte al código QR con su camara.',
    };
  }

  public async inicializarDatos(email: string) {
    return this._firebaseServ.obtenerRegistro('creditos', email).get().then((documento) => {
      if (documento.size > 0) {
        this._sub = this.crearRealtime(documento.docs[0].id).subscribe((data: Datos) => {
          // console.log(data);
          this._datosActuales = data;
        });
      } else {
        throw new Error('No hay documento con ese correo');
      }
    });
  }

  public crearRealtime(id: string) {
    return this._firebaseServ.obtenerRegistroKey('creditos', id).snapshotChanges().pipe(map((all) => {
      // console.log('data', all.payload.data());
      const newData = all.payload.data() as Datos;
      newData.key = all.payload.id;
      return newData;
    }));
  }

  public async scanCode() {
    let auxReturn = '';
    await this._zbar.scan(this._zbarOptions)
      .then(async (result) => {
        auxReturn = await this.manejarQR(result);
      })
      .catch(error => {
        switch (error) {
          case 'cancelled': {
            break;
          }
          case 'cordova_not_available': {
            this._toastServ.presentToast('Esta función no está disponible.', 4);
            break;
          }
          default: {
            this._toastServ.presentToast('Ha ocurrido un error con su codigo', 4);
            break;
          }
        }

        console.log('Agregar mensajes extra', error); // Mensaje de error
      });

    return auxReturn;
  }

  private async manejarQR(qr: string) {
    this._spinnerServ.showSpinner(); // Muestro el spinner
    let auxReturn = ''; // Coloco un mensaje default

    if (this._datosActuales !== undefined) {
      qr = qr.trim(); // Se eliminan los errores posibles en los códigos

      // Se verifica que el código sea valido para los créditos
      if (this.esCodigoValido(qr)) {
        if (this.esCodigoCanjeado(qr)) {
          const dat: Keylessdatos = this.crearUpdate(qr);
          await this._firebaseServ.actualizarRegistro('creditos', this._datosActuales.key, dat.toJson())
            .then(() => {
              auxReturn = 'Credito Cargado Exitosamente.';
            })
            .catch(err => {
              this._toastServ.presentToast('Ha ocurrido un error al actualizar', 4);
              console.log('Error al actualizar registro', err);
              auxReturn = '';
            });
        } else {
          auxReturn = 'El código ya fue canjeado.';
        }
      } else {
        auxReturn = 'El código escaneado no es valido.';
      }
    } else {
      auxReturn = 'No hay datos disponibles';
    }

    this._spinnerServ.hideSpinner();
    return auxReturn;
  }

  private crearUpdate(qr: string): Keylessdatos {
    const array = this._datosActuales.codigosCargados;
    array.push(qr);
    return new Keylessdatos(this._datosActuales.email, array, this._datosActuales.credito + this.determinarCantidad(qr));
  }

  private esCodigoValido(qr: string): boolean {
    let auxReturn = false;
    if (qr === '8c95def646b6127282ed50454b73240300dccabc'
      || qr === 'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172'
      || qr === '2786f4877b9091dcad7f35751bfcf5d5ea712b2f') {
      auxReturn = true;
    }
    return auxReturn;
  }

  private determinarCantidad(qr: string): number {
    let auxReturn = -1;
    switch (qr) {
      case '8c95def646b6127282ed50454b73240300dccabc': {
        auxReturn = 10;
        break;
      }
      case 'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172': {
        auxReturn = 50;
        break;
      }
      case '2786f4877b9091dcad7f35751bfcf5d5ea712b2f': {
        auxReturn = 100;
        break;
      }
      default: {
        auxReturn = 0;
        break;
      }
    }
    return auxReturn;
  }

  private esCodigoCanjeado(qr: string): boolean {
    let auxReturn = true;
    for (const codigo of this._datosActuales.codigosCargados) {
      if (codigo === qr) {
        auxReturn = false;
      }
    }
    return auxReturn;
  }

  /* private agregarNuevosDatos() {
    return this._firebaseServ.agregarRegistro('creditos', (new Keylessdatos(this._auth.username)).toJson());
  } */

  public async reiniciarCodigo() {
    this._spinnerServ.showSpinner();
    const dat = new Keylessdatos(this._datosActuales.email, new Array<string>(), 0);

    await this._firebaseServ.actualizarRegistro('creditos', this._datosActuales.key, dat.toJson())
      .then(() => {
        console.log('Cambio completo');
        this._spinnerServ.hideSpinner();
      })
      .catch(err => {
        this._spinnerServ.hideSpinner();
        console.log('Error en actualizarRegistro para update', err);
        this._toastServ.presentToast('Error en la actualización', 4);
      });
  }
}
