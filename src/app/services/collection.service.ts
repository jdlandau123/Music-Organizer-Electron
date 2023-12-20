import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


export interface IAlbum {
  id: number;
  artist: string;
  album: string;
  fileFormat: string;
  isOnDevice: boolean;
  tracklist?: any;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  electron = (<any>window).require('electron');
  collection: BehaviorSubject<IAlbum[]> = new BehaviorSubject<IAlbum[]>([]);
  albumIdsToSync: number[];
  selectedAlbum: BehaviorSubject<IAlbum | null> = new BehaviorSubject<IAlbum | null>(null);

  constructor(private _zone: NgZone) {
    this.electron.ipcRenderer.on('collection-reply', (event: any, arg: IAlbum[]) => {
      this._zone.run(() => {
        this.collection.next(arg);
        this.albumIdsToSync = arg.filter(a => a.isOnDevice).map(a => a.id);
      })
    })
  }

  queryCollection(search: string = '') {
    this.electron.ipcRenderer.send('collection-query', search); // use the arg to send query params?
  }
  
}
