import { Component, signal } from '@angular/core'
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader'

@Component({
  selector: 'app-card-loading',
  standalone: true,
  imports: [NgxSkeletonLoaderModule],
  templateUrl: './card-loading.component.html',
  styleUrl: './card-loading.component.scss'
})
export class CardLoadingComponent {
  count = signal('1')
  height = signal('240px')
  width = signal('100%')
  radius = signal('.6rem')
}
