import { Component, inject } from '@angular/core'
import { ApiService } from '../../services/api.service'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  private apiService = inject(ApiService)

  versao$ = this.apiService.getVersion()

}
