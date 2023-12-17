import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ElectronService } from '../services/electron.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent {
  configForm = new FormGroup({
    collectionPath: new FormControl<string>('', Validators.required),
    devicePath: new FormControl<string>('', Validators.required)
  })

  constructor(public electronService: ElectronService) {}
}
