import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class Login {
    isSubmitting = false;
    errorMessage = '';

    loginForm = new FormGroup({
        email: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.email]
        }),
        password: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required]
        })
    });

    constructor(
        private readonly authService: AuthService,
        private readonly router: Router
    ) {}

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        this.authService.login(this.loginForm.getRawValue()).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.router.navigate(['/applications']);
            },
            error: (error) => {
                this.errorMessage = error.error?.message ?? 'Login failed.';
                this.isSubmitting = false;
            }
        });
    }
}