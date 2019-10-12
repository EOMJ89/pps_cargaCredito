import { Component, OnInit, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
})
export class ResultPage implements OnInit {
  @Input() mensaje: string;
  // tslint:disable-next-line: variable-name
  constructor(private _navParams: NavParams, private _modalCtrl: ModalController) { }

  ngOnInit() { console.log(this.mensaje); }

  public closeModal() {
    this._modalCtrl.dismiss();
  }
}
