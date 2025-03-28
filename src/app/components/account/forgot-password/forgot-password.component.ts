import { Component, inject, signal } from '@angular/core'
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { RippleModule } from 'primeng/ripple'
import { ApiService } from '../../../services/api.service'

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ButtonModule,
    ReactiveFormsModule,
    RippleModule,
    InputTextModule,
    FormsModule,
    RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: '../account.component.scss'
})
export class ForgotPasswordComponent {

  private apiService = inject(ApiService)

  email = signal('')

  isLoading = signal(false)
  erro = signal('')
  sucesso = signal(false)

  form = new UntypedFormGroup({
    email: new FormControl('', { validators: [Validators.required, Validators.email], nonNullable: true }),
  })

  onSubmit() {
    this.isLoading.set(true)
    console.log(this.form.value)

    this.apiService.forgotPassword(this.form.value).subscribe({
      next: res => {
        console.log(res)
        this.email.set(this.form.get('email')?.value)
        this.isLoading.set(false)
        this.sucesso.set(true)
      },
      error: err => {
        this.isLoading.set(false)
        this.erro.set(err.error)
        console.log(err)
      }
    })
  }

}
