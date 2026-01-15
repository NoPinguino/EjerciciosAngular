import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-formularios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formularios.html',
})
export class Formularios {
  // Formulario reactivo solo con los campos visibles
  practicaForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    apellido1: new FormControl('', Validators.required),
    apellido2: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    aceptoPolitica: new FormControl(false, Validators.requiredTrue), // true para checkbox
  });

  // Método de envío
  enviarFormulario() {
    if (this.practicaForm.valid) {
      console.log('Formulario enviado:', this.practicaForm.value);
      alert('Formulario enviado correctamente 🎉');
    } else {
      console.log('Formulario inválido');
      this.practicaForm.markAllAsTouched();
    }
  }
}
