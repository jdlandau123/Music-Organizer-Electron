import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  electron = (<any>window).require('electron');
  res: string;

  async testFunc() {
    this.res = await this.electron.ipcRenderer.sendSync('test', 'TESTING');
    console.log(this.res);
  }
}
