import { Component, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-aside-m',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './aside-m.html',
  styleUrl: './aside-m.css',
})
export class AsideM {

  constructor(private el: ElementRef, private router: Router) { }

  isOpen = true;

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.closeSideMenu();
    }
  }

  closeSideMenu() {
    this.isOpen = false;
  }

  togglePagesMenu() {

  }
}


