import { Component } from '@angular/core';
import { CollectionService } from '../services/collection.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(private _collectionService: CollectionService) {}

  get onDeviceCount(): number {
    return this._collectionService.collection.value.filter(a => a.isOnDevice).length;
  }
}
