import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-top-strip',
  imports: [RouterModule],
  templateUrl: './top-strip.component.html',
  styleUrls: ['./top-strip.component.css']
})
export class TopStripComponent implements OnInit {
  currentDateTime: string = '';

  ngOnInit(): void {
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000); // Update every second
  }

  updateDateTime(): void {
    const now = new Date();
    this.currentDateTime = now.toLocaleString();
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  resizeText(size: string): void {
    const body = document.body;
    switch (size) {
      case 'small':
        body.style.fontSize = '10px';
        break;
      case 'normal':
        body.style.fontSize = '16px';
        break;
      case 'large':
        body.style.fontSize = '30px';
        break;
    }
  }
}
