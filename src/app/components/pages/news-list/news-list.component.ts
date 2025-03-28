import { PageTitleComponent } from './../../../shared/page-title/page-title.component'
import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { ContentComponent } from '../../../shared/content/content.component'
import { CardComponent } from '../../../shared/card/card.component'
import { CommonModule } from '@angular/common'
import { ApiService } from '../../../services/api.service'

import { TruncatePipe } from '../../../pipes/truncate.pipe'
import { Router } from '@angular/router'
import { CarouselModule } from 'primeng/carousel'
import { TagModule } from 'primeng/tag'
import { ButtonModule } from 'primeng/button'
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader'
import { CardLoadingComponent } from '../../../shared/card-loading/card-loading.component'
import { TipoCategoria } from '../../../models/model'

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [
    ContentComponent,
    PageTitleComponent,
    CardComponent,
    CommonModule,
    CarouselModule,
    TruncatePipe,
    CardLoadingComponent,
    TagModule,
    ButtonModule,
    NgxSkeletonLoaderModule
  ],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.scss',
})
export class NewsListComponent implements OnInit {
  private apiService = inject(ApiService)
  private router = inject(Router)

  listNews = signal<any[]>([])
  isLoading = signal<boolean>(false)

  highlights = computed(() => this.listNews().filter(item => item.destaque))
  search = signal('')
  responsiveOptions: any[] | undefined

  categorias = signal([])
  selectedCategory: any = []

  ngOnInit(): void {
    this.getListNews()
    this.getCategories()

    this.responsiveOptions = [
      {
        breakpoint: '1199px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '991px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '767px',
        numVisible: 1,
        numScroll: 1
      }
    ]
  }

  onSelectNews(news: any) {
    this.router.navigate(['news', news.id])
  }

  getListNews() {

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

    this.isLoading.set(true)

    this.apiService.getAllNews(params).subscribe({
      next: res => {
        this.listNews.set(res.data)
        this.isLoading.set(false)
      },
      error: err => {
        this.isLoading.set(false)
      },
    })
  }

  getCategories() {

    const tipo: TipoCategoria = 'Noticia'

    const params = {
      tipoCategoria: tipo
    }

    this.apiService.getCategories(params).subscribe({
      next: res => {
        this.categorias.set(res.data)
        console.log(this.categorias())

      },
      error: err => {
        console.log(err)
      }
    })
  }

  onFilterCategory(e: any) {
    this.selectedCategory = e

    this.getListNews()
  }

  onClearCategory() {
    this.selectedCategory = []

    this.getListNews()
  }

  onSearch(e: any) {
    this.search.set(e)
    if (this.search().length > 2 || this.search().length === 0) this.getListNews()
  }
}
