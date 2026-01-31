import { Component, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-aside-m',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './aside-m.html',
  styleUrl: './aside-m.css',
})
export class AsideM {
  @Output() navClicked = new EventEmitter<void>();
  
  isPagesMenuOpen = false;

  togglePagesMenu() {
    this.isPagesMenuOpen = !this.isPagesMenuOpen;
  }

  onNavClick() {
    this.navClicked.emit();
  }
}


