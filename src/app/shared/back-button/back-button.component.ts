import { Location } from '@angular/common'
import { Component, inject } from '@angular/core'

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [],
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.scss'
})
export class BackButtonComponent {
  private location = inject(Location)

  backPage() {
    this.location.back()
  }
}
