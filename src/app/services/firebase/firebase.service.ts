import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  // tslint:disable: variable-name
  constructor(private _firebase: AngularFirestore) { }

  public obtenerRegistro(db: string, correo: string) {
    return this._firebase.collection(db).ref.where('email', '==', correo);
  }

  public agregarRegistro(db: string, data: any) {
    return this._firebase.collection(db).add(data);
  }

  public obtenerRegistroKey(db: string, key: string) {
    return this._firebase.collection(db).doc(key);
  }

  public actualizarRegistro(db: string, id: string, data: any) {
    return this._firebase.collection(db).doc(id).update(data);
  }
}
