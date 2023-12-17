import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface IAlbum {
  artist: string;
  album: string;
  fileFormat: string;
  isOnDevice: boolean;
  tracklist?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  electron = (<any>window).require('electron');
  collection: BehaviorSubject<IAlbum[]> = new BehaviorSubject<IAlbum[]>([]);

  constructor() {
    this.electron.ipcRenderer.on('collection-reply', (event: any, arg:any) => {
      // possible to pipe this?
      console.log(arg); // arg will store the result
    });
  }

  queryCollection() {
    this.electron.ipcRenderer.send('collection-query', {}); // use the arg to send query params?
  }
}
