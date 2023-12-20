import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { interval, Subscription } from 'rxjs';
import { CollectionService } from '../services/collection.service';

interface IDialogData {
  cacheKey: string;
  action: string;
}

interface ICacheResult {
  total: number;
  complete: number;
}

@Component({
  selector: 'app-progress-dialog',
  templateUrl: './progress-dialog.component.html',
  styleUrls: ['./progress-dialog.component.css']
})
export class ProgressDialogComponent implements OnInit {
  pollingSub: Subscription;
  albumTotal: number;
  albumComplete: number;

  constructor(public dialogRef: MatDialogRef<ProgressDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: IDialogData,
              private _collectionService: CollectionService) {
    this._collectionService.electron.ipcRenderer.on('cache-reply', (event: any, arg: ICacheResult) => {
      this.albumTotal = arg.total;
      this.albumComplete = arg.complete;
      if (arg.total === arg.complete) {
        this.pollingSub.unsubscribe();
        this.dialogRef.close();
      }
    });
  }

  ngOnInit(): void {
    this.pollProgress();
  }

  get progressValue() {
    return Math.ceil((this.albumComplete / this.albumTotal) * 100);
  }

  pollProgress() {
    this.pollingSub = interval(500).subscribe(() => {
      this._collectionService.electron.ipcRenderer.send('check-cache', this.data.cacheKey);
    })
  }
}
