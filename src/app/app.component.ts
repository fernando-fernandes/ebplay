import { Component, isDevMode } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { PrimeNGConfig } from 'primeng/api'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'EB-Play'

  constructor(private primengConfig: PrimeNGConfig) { }

  ngOnInit() {

    if (!isDevMode()) {
      console.log = function () { }
    }

    this.primengConfig.ripple = true

    this.primengConfig.setTranslation({
      dateFormat: 'dd/mm/yy',
      today: 'Hoje',
      clear: 'Limpar',
      dayNamesMin: [
        'Dom',
        'Seg',
        'Ter',
        'Qua',
        'Qui',
        'Sex',
        'Sáb'
      ],
      monthNames: [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro'
      ]
    })
  }
}
