import { Component, input, model, output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { IconFieldModule } from 'primeng/iconfield'
import { InputIconModule } from 'primeng/inputicon'
import { InputTextModule } from 'primeng/inputtext'
import { MultiSelectModule } from 'primeng/multiselect'
import { CommonModule } from '@angular/common'
import { BackButtonComponent } from '../back-button/back-button.component'

@Component({
  selector: 'app-page-title',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MultiSelectModule,
    BackButtonComponent
  ],
  templateUrl: './page-title.component.html',
  styleUrl: './page-title.component.scss',
})
export class PageTitleComponent {

  name = input<string>('')

  button = input<boolean>(false)
  buttonIcon = input<string>('pi pi-plus')
  buttonLabel = input<string>('Novo')
  buttonDisabled = input(false)
  btnClick = output()
  backButton = input(false)

  hasSearchFilter = input<boolean>(false)
  onSearchFilter = output()

  hasCategoryFilter = input<boolean>(false)
  category = input([])
  onCategoryFilter = output()
  onClearCategory = output()

  buttonClick() {
    this.btnClick.emit()
  }

  search(e: any) {
    this.onSearchFilter.emit(e.target.value)
  }

  filterCategory(e: any) {
    this.onCategoryFilter.emit(e.value)
  }

  clearCategory() {
    this.onClearCategory.emit()
  }
}
