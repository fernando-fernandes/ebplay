import { CommonModule } from '@angular/common'
import { Component, input } from '@angular/core'

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule],
  template: `

    <div class="inner-content"
      [ngClass]="{ background: background(), narrow: narrow() }"
      >
      <ng-content></ng-content>
    </div>

  `,
  styleUrl: './content.component.scss',
})
export class ContentComponent {
  background = input<boolean>(true)
  narrow = input<boolean>(false)
}
