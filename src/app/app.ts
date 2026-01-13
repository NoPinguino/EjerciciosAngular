import { Component, ElementRef, HostListener, signal } from '@angular/core';
import { Aside } from './aside/aside';
import { AsideM } from './aside-m/aside-m';
import { Body } from './body/body';
import { Header } from './header/header';

@Component({
  selector: 'app-root',
  imports: [Aside, AsideM, Body, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Ejercicios Angular');

  constructor(private el: ElementRef) {}

  isSideMenuOpen = signal(false);

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.closeSideMenu();
    }
  }

  toggleSideMenu() {
    this.isSideMenuOpen.set(!this.isSideMenuOpen());
  }

  closeSideMenu() {
    this.isSideMenuOpen.set(false);
  }
}
