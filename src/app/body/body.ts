import { Component, ElementRef, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-body',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './body.html',
  styleUrl: './body.css',
})
export class Body {
  constructor(private el: ElementRef) { }

  isOpen = true;


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

  closeProfileMenu() {

  }

  toggleProfileMenu() {

  }

  togglePagesMenu() {

  }

  closeNotificationsMenu() {

  }

  toggleNotificationsMenu() {

  }

  toggleTheme() {

  }

  toggleSideMenu() {

  }

}
