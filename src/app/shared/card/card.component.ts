import { CommonModule } from '@angular/common'
import { Component, input, output } from '@angular/core'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {

  image = input.required()
  title = input.required()
  date = input.required()
  text = input.required()

  selectedNews = output<any>()

  onSelectNews(e: any) {
    this.selectedNews.emit(e)
  }
}
