import { Component, OnInit } from '@angular/core';
import { ElectronService } from './services/electron.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(public electronService: ElectronService) {}

  ngOnInit(): void {
    this.electronService.checkConfig();
  }
}
