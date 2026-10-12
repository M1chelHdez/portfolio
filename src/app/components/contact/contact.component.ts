
import { Component } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  enviado = false;
  intentandoEnviar = false;

  readonly contactForm;

  constructor(private formBuilder: FormBuilder) {
    this.contactForm = this.formBuilder.nonNullable.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(80)
        ]
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(254)
        ]
      ],
      subject: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(120)
        ]
      ],
      message: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(2000)
        ]
      ]
    });
  }

  get name() {
    return this.contactForm.controls.name;
  }

  get email() {
    return this.contactForm.controls.email;
  }

  get subject() {
    return this.contactForm.controls.subject;
  }

  get message() {
    return this.contactForm.controls.message;
  }

  enviarFormulario(): void {
    this.contactForm.markAllAsTouched();

    if (this.contactForm.invalid || this.intentandoEnviar) {
      return;
    }

    // Por ahora solo validamos los datos.
    // El envío real se implementará después.
    this.enviado = true;
  }

  restablecerConfirmacion(): void {
  this.enviado = false;
}
}
