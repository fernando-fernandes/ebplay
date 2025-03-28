import { Component, inject, OnInit, signal } from '@angular/core'
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { ButtonModule } from 'primeng/button'
import { CheckboxModule } from 'primeng/checkbox'
import { InputTextModule } from 'primeng/inputtext'
import { PasswordModule } from 'primeng/password'
import { RippleModule } from 'primeng/ripple'
import { ApiService } from '../../../services/api.service'
import { ToastModule } from 'primeng/toast'

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ButtonModule,
    RippleModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    FormsModule,
    RouterModule,
    ToastModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['../account.component.scss'],
})
export class ResetPasswordComponent implements OnInit {

  private apiService = inject(ApiService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  isLoading = signal(false)
  erro = signal('')
  sucesso = signal(false)
  urlParams = signal({
    userId: this.route.snapshot.queryParamMap.get('userId'),
    token: this.route.snapshot.queryParamMap.get('token')
  })

  form = new UntypedFormGroup({
    email: new FormControl('', { validators: [Validators.required, Validators.email], nonNullable: true }),
    newPassword: new FormControl('', { validators: Validators.required, nonNullable: true }),
  })

  ngOnInit(): void {

    if (!this.checkParams()) {
      this.router.navigate(['login'])
    }
  }

  checkParams(): boolean {
    return !!this.urlParams().token && !!this.urlParams().userId
  }

  onSubmit() {
    this.isLoading.set(true)
    console.log(this.form.value)

    if (this.checkParams()) {
      this.apiService.resetPassword(this.form.value).subscribe({
        next: res => {
          this.sucesso.set(true)
          console.log(res)
          this.isLoading.set(false)
        },
        error: err => {
          this.isLoading.set(false)
          this.erro.set('Erro ao redefinir a senha. Verifique se email está correto ou tente novamente mais tarde.')
          console.log(err)
        }
      })
    }


  }
}
