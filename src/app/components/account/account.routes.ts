import { Routes } from '@angular/router'
import { LoginComponent } from './login/login.component'
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component'
import { AccountComponent } from './account.component'
import { ResetPasswordComponent } from './reset-password/reset-password.component'

export const ACCOOUNT_ROUTES: Routes = [
  {
    path: '',
    component: AccountComponent,
    children: [
      {
        path: '',
        component: LoginComponent,
        title: 'EB Play | Login'
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        title: 'EB Play | Recuperar senha'
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
        title: 'EB Play | Redefinir senha'
      },
    ],
  },
]
