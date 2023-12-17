import { Component } from '@angular/core';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  electron = (<any>window).require('electron');
  res: string;

  constructor(private _zone: NgZone) {
    this.electron.ipcRenderer.on('test-reply', (event: any, arg:any) => {
      // forces a dom update since electron is annoying
      this._zone.run(() => this.res = arg);
    });
  }

  testFunc() {
    this.electron.ipcRenderer.send('test', 'TESTING');
  }
}
