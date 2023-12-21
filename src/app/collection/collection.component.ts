import { Component, OnInit } from '@angular/core';
import { CollectionService, IAlbum } from '../services/collection.service';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit {
  tableColumns = ['select', 'artist', 'album', 'fileFormat'];

  constructor(public collectionService: CollectionService) {}

  ngOnInit(): void {
    this.collectionService.queryCollection();
  }

  selectAlbum(event: MatCheckboxChange, album: IAlbum) {
    if (event.checked) {
      this.collectionService.albumIdsToSync.push(album.id);
    } else {
      this.collectionService.albumIdsToSync = this.collectionService.albumIdsToSync.filter(n => n !== album.id);
    }
  }

  selectAllAlbums(event: MatCheckboxChange) {
    if (event.checked) {
      this.collectionService.albumIdsToSync = this.collectionService.collection.value.map(a => a.id);
    } else {
      this.collectionService.albumIdsToSync = [];
    }
  }

  sortTable(event: any) {
    this.collectionService.searchObject.order = [
      event.active,
      event.direction === '' ? 'ASC' : event.direction.toUpperCase()
    ];
    this.collectionService.queryCollection();
  }

}
