import { Component, input } from '@angular/core'

@Component({
  selector: 'app-image-size',
  standalone: true,
  imports: [],
  template: `
    <span>Tamanho recomendado: {{ width() }}px de largura e {{ height() }}px de altura.</span>
  `,
  styles: `
    span {
      font-size: .8rem;
      color: #888;
    }
  `
})
export class ImageSizeComponent {
  width = input('1800')
  height = input('400')
}
