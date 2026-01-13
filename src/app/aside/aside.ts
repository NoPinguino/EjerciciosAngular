import { Component, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './aside.html',
  styleUrl: './aside.css',
})
export class Aside {
  constructor(
    private el: ElementRef,
    private router: Router,
  ) {}

  isOpen = true;
  isPagesMenuOpen = false;

  closeSideMenu() {
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node;
    const clickedInside = this.el.nativeElement.contains(target);
    if (!clickedInside && this.isOpen) {
      this.closeSideMenu();
    }
  }

  togglePagesMenu() {
    this.isPagesMenuOpen = !this.isPagesMenuOpen;
  }
}
