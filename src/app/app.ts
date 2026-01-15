import { Component, ElementRef, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Aside } from './aside/aside';
import { AsideM } from './aside-m/aside-m';
import { Header } from './header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Aside, AsideM, Header],
  templateUrl: './app.html',
  styleUrls: ['./app.css'], // <-- CORREGIDO
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
