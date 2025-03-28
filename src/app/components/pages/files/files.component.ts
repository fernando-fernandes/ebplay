import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import dayjs from 'dayjs'
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader'
import { ButtonModule } from 'primeng/button'
import { DropdownModule } from 'primeng/dropdown'
import { InputTextModule } from 'primeng/inputtext'
import { MultiSelectModule } from 'primeng/multiselect'
import { RippleModule } from 'primeng/ripple'
import { TableModule } from 'primeng/table'
import { TagModule } from 'primeng/tag'
import { ApiService } from '../../../services/api.service'
import { ContentComponent } from "../../../shared/content/content.component"
import { PageTitleComponent } from '../../../shared/page-title/page-title.component'
import { TipoCategoria } from '../../../models/model'
@Component({
  selector: 'app-files',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageTitleComponent,
    ContentComponent,
    TableModule,
    InputTextModule,
    TagModule,
    ButtonModule,
    RippleModule,
    DropdownModule,
    NgxSkeletonLoaderModule,
    MultiSelectModule
  ],
  templateUrl: './files.component.html',
  styleUrl: './files.component.scss'
})
export class FilesComponent implements OnInit {
  private apiService = inject(ApiService)

  files = signal<any[]>([])
  categorias = signal<any[]>([])
  search = signal('')
  selectedCategory: any = []
  isLoading = signal(false)

  ngOnInit(): void {
    this.getFiles()
    this.getCategories()
  }

  getFiles() {

    this.isLoading.set(true)

    let categorias

    if (this.selectedCategory.length) {
      categorias = {
        categorias: this.selectedCategory
      }
    }

    const params = {
      ...categorias,
      termo: this.search()
    }

    console.log(params)


    this.apiService.getFiles(params).subscribe({
      next: res => {

        const arr = res.data.map((item: any) => {
          return {
            ...item,
            dataInicio: dayjs(item.dataInicio).format('DD/MM/YYYY'),
            dataFim: dayjs(item.dataFim).format('DD/MM/YYYY'),
          }
        })

        this.files.set(arr)
        console.log(res.data)
        this.isLoading.set(false)
      },
      error: err => {
        console.log(err)
        this.isLoading.set(false)
      }
    })
  }

  getCategories() {

    const tipo: TipoCategoria = 'Arquivo'

    const params = {
      tipoCategoria: tipo
    }

    this.apiService.getCategories(params).subscribe({
      next: res => {
        this.categorias.set(res.data)
      },
      error: err => {
        console.log(err)
      }
    })
  }

  onClearFilter() {
    this.selectedCategory = []

    this.getFiles()
  }

}
