import { Component, NgZone, OnInit } from '@angular/core';
import { CollectionService } from '../services/collection.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl } from '@angular/forms';
import { tap, debounceTime } from 'rxjs';

interface ISyncResult {
  status: string;
  message: string;
  cacheKey: string;
}

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css']
})
export class ControlPanelComponent implements OnInit {
  isLoading = false;
  searchForm = new FormGroup({
    search: new FormControl<string>('')
  })

  constructor(private _zone: NgZone, private _collectionService: CollectionService,
              private _snackBar: MatSnackBar) {
    this._collectionService.electron.ipcRenderer.on('sync-collection-reply', (event: any, arg: ISyncResult) => {
      this.finishOperation(arg);
    });

    this._collectionService.electron.ipcRenderer.on('sync-device-reply', (event: any, arg: ISyncResult) => {
      this.finishOperation(arg);
    });

    this._collectionService.electron.ipcRenderer.on('scan-device-reply', (event: any, arg: ISyncResult) => {
      this.finishOperation(arg);
    });
  }

  ngOnInit(): void {
    this.searchForm.controls.search.valueChanges.pipe(
      debounceTime(1000),
      tap((v: any) => this._collectionService.searchObject.search = v),
      tap(() => this._collectionService.queryCollection())
    ).subscribe();
  }

  syncMusicCollection() {
    this.isLoading = true;
    this._collectionService.electron.ipcRenderer.send('sync-collection');
  }

  syncDevice() {
    this.isLoading = true;
    this._collectionService.electron.ipcRenderer.send('sync-device', this._collectionService.albumIdsToSync);
  }

  scanDevice() {
    this.isLoading = true;
    this._collectionService.electron.ipcRenderer.send('scan-device');
  }

  finishOperation(result: ISyncResult) {
    this._zone.run(() => {
      if (result.status === 'error') {
        this._snackBar.open(result.message);
      }
      this.isLoading = false;
      this._collectionService.queryCollection();
    })
  }

}
