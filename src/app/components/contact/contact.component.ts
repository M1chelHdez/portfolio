
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
  errorEnvio = '';

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
      ],
      website: ['']
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

  async enviarFormulario(): Promise<void> {
    this.contactForm.markAllAsTouched();
    this.errorEnvio = '';

    if (this.contactForm.invalid || this.intentandoEnviar) {
      return;
    }

    this.intentandoEnviar = true;
    this.enviado = false;

    const { name, email, subject, message, website } =
      this.contactForm.getRawValue();

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          website
        })
      });

      const result: { message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'No se pudo enviar el mensaje.'
        );
      }

      this.enviado = true;
      this.contactForm.reset();

      setTimeout(() => {
        this.enviado = false;
      }, 5000);
    } catch (error: unknown) {
      this.errorEnvio =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado. Inténtalo de nuevo.';
    } finally {
      this.intentandoEnviar = false;
    }
  }

  restablecerConfirmacion(): void {
    this.enviado = false;
    this.errorEnvio = '';
  }
}
