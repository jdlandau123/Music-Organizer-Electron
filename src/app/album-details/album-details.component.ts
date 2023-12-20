import { Component, OnInit, OnDestroy } from '@angular/core';
import { CollectionService } from '../services/collection.service';
import { Subscription } from 'rxjs';
const albumArt = require('album-art');

interface ITrack {
  trackNum: string;
  trackTitle: string;
}

@Component({
  selector: 'app-album-details',
  templateUrl: './album-details.component.html',
  styleUrls: ['./album-details.component.css']
})
export class AlbumDetailsComponent implements OnInit, OnDestroy {
  selectedAlbumSubscription: Subscription;
  artworkUrl: string;
  songsDisplay: ITrack[];

  constructor(public collectionService: CollectionService) {}

  ngOnInit(): void {
    this.selectedAlbumSubscription = this.collectionService.selectedAlbum.subscribe(async album => {
      this.artworkUrl = await albumArt(album?.artist, {album: album?.album});
      this.setSongsDisplay(album?.tracklist);
    })
  }

  ngOnDestroy(): void {
    this.selectedAlbumSubscription.unsubscribe();
  }

  setSongsDisplay(tracklist: any) {
    const songs: ITrack[] = [];
    Object.keys(tracklist).forEach(key => {
      songs.push({trackNum: key, trackTitle: tracklist[key]});
    })
    this.songsDisplay = songs;
  }
}
