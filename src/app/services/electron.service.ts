import { Injectable, NgZone } from '@angular/core';

export interface IConfig {
  collectionPath: string;
  devicePath: string;
}

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  electron = (<any>window).require('electron');
  config: IConfig;

  constructor(private _ngZone: NgZone) {
    this.electron.ipcRenderer.on('config-reply', (event: any, arg: any) => {
      this._ngZone.run(() => this.config = arg) // necessary bc electron doesn't trigger dom updates?
    });
  }

  checkConfig() {
    this.electron.ipcRenderer.send('check-config', null);
  }

  saveConfig(config: any) {
    this.electron.ipcRenderer.send('create-config', config);
  }
}
