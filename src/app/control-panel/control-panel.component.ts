import { Component, NgZone, OnInit } from '@angular/core';
import { CollectionService } from '../services/collection.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl } from '@angular/forms';
import { tap, debounceTime } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';

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
              private _snackBar: MatSnackBar, public dialog: MatDialog) {
    this._collectionService.electron.ipcRenderer.on('sync-collection-reply', (event: any, arg: ISyncResult) => {
      this._zone.run(() => {
        if (arg.status === 'error') {
          this._snackBar.open(arg.message);
        }
        this.isLoading = false;
        if (arg.cacheKey) {
          this.openProgressDialog(arg.cacheKey, 'Sync Music Collection');
        }
        this._collectionService.queryCollection();
      })
    });

    this._collectionService.electron.ipcRenderer.on('sync-device-reply', (event: any, arg: ISyncResult) => {
      this._zone.run(() => {
        if (arg.status === 'error') {
          this._snackBar.open(arg.message);
        }
        this.isLoading = false;
        if (arg.cacheKey) {
          this.openProgressDialog(arg.cacheKey, 'Sync Device');
        }
        this._collectionService.queryCollection();
      })
    });

    this._collectionService.electron.ipcRenderer.on('scan-device-reply', (event: any, arg: ISyncResult) => {
      this._zone.run(() => {
        if (arg.status === 'error') {
          this._snackBar.open(arg.message);
        }
        this.isLoading = false;
        this._collectionService.queryCollection();
      })
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

  openProgressDialog(cacheKey: string, action: string): void {
    this.dialog.open(ProgressDialogComponent, {
      data: {cacheKey, action},
    });
  }

}
