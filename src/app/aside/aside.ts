import { Component, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [CommonModule, RouterModule], // RouterLink y RouterLinkActive ya vienen con RouterModule
  templateUrl: './aside.html',
})
export class Aside {
  isOpen = true;
  isPagesMenuOpen = false;

  constructor(
    private el: ElementRef,
    private router: Router,
  ) {}

  closeSideMenu() {
    this.isOpen = false;
  }

  togglePagesMenu() {
    this.isPagesMenuOpen = !this.isPagesMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node;
    const clickedInside = this.el.nativeElement.contains(target);
    if (!clickedInside && this.isOpen) {
      this.closeSideMenu();
    }
  }
}
