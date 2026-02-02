import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';

interface Trainer {
  id: number;
  name: string;
  city: string;
  level: number;
  favoriteType: string;
}

@Component({
  selector: 'app-crud-demo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crud-demo.html',
})
export class CrudDemo {
  
}
