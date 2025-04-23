import { Injectable } from '@angular/core';
import * as L from 'leaflet';

// Fix for missing marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'marker-icon-2x.png',
  iconUrl: 'marker-icon.png',
  shadowUrl: 'marker-shadow.png'
});

@Injectable({
  providedIn: 'root'
})
export class LeafletMapService {
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  initializeMap(containerId: string, coords: L.LatLngExpression = [28.6139, 77.2090], zoom: number = 13): L.Map {
    if (this.map) {
      this.map.remove(); // Prevent double init
    }

    this.map = L.map(containerId).setView(coords, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker(coords, { draggable: true }).addTo(this.map);

    return this.map;
  }

  getMap(): L.Map | null {
    return this.map;
  }

  setMarker(coords: L.LatLngExpression): void {
    if (this.marker) {
      this.marker.setLatLng(coords);
    }
  }

  getMarkerCoords(): L.LatLng | null {
    return this.marker?.getLatLng() ?? null;
  }

  onMarkerDrag(callback: (latlng: L.LatLng) => void): void {
    if (this.marker) {
      this.marker.on('dragend', () => {
        const latlng = this.marker!.getLatLng();
        callback(latlng);
      });
    }
  }

  invalidateSize(): void {
    this.map?.invalidateSize();
  }

  destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
  }
}
