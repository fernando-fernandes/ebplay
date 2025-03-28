import { Component, effect, inject, signal } from '@angular/core'
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { ButtonModule } from 'primeng/button'
import { CheckboxModule } from 'primeng/checkbox'
import { InputTextModule } from 'primeng/inputtext'
import { PasswordModule } from 'primeng/password'
import { RippleModule } from 'primeng/ripple'
import { ApiService } from '../../../services/api.service'
import { ToastModule } from 'primeng/toast'
import { concatMap, tap } from 'rxjs'

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrls: ['../account.component.scss', './login.component.scss'],
})
export class LoginComponent {

  private apiService = inject(ApiService)
  private router = inject(Router)

  isLoading = signal(false)
  erro = signal('')

  formLogin = new UntypedFormGroup({
    email: new FormControl('', { validators: [Validators.required, Validators.email], nonNullable: true }),
    password: new FormControl('', { validators: Validators.required, nonNullable: true }),
    rememberMe: new FormControl(false, { nonNullable: true }),
  })

  onSubmit() {
    this.isLoading.set(true)
    console.log(this.formLogin.value)

    this.apiService.login(this.formLogin.value).pipe(
      tap((res: any) => {
        console.log(res)
        localStorage.setItem('token', JSON.stringify(res))
        localStorage.setItem('refreshToken', JSON.stringify(res.refreshToken))
      }),
      concatMap(() => this.apiService.getManageInfo()),
      tap(res => {
        console.log(res)
        localStorage.setItem('user', JSON.stringify(res))
      })
    )
      .subscribe({
        next: res => {
          this.router.navigate(['/news-list'])
          this.isLoading.set(false)
        },
        error: err => {
          this.isLoading.set(false)
          this.erro.set(err.error)
          console.log(err)
        }
      })
  }
}
