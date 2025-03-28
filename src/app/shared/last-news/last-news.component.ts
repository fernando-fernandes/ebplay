import { Component, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { TruncatePipe } from '../../pipes/truncate.pipe'

@Component({
  selector: 'app-last-news',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TruncatePipe,
  ],
  templateUrl: './last-news.component.html',
  styleUrl: './last-news.component.scss'
})
export class LastNewsComponent {

  news = input<any[]>()

}
