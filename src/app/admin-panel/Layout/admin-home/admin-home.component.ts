import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-home',
  imports: [CommonModule],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent {
  isCollapsed = false;
  activeView: string = 'dashboard';

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  switchView(item: any) {
    this.activeView = item;
  }
}
