import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { ButtonModule } from 'primeng/button'
import { CheckboxModule } from 'primeng/checkbox'
import { InputTextModule } from 'primeng/inputtext'
import { PasswordModule } from 'primeng/password'
import { RippleModule } from 'primeng/ripple'

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    ButtonModule,
    RippleModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent {

}
