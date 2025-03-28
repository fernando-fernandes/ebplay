import { Component, computed, inject, signal } from '@angular/core'
import { ContentComponent } from '../../../shared/content/content.component'
import { PageTitleComponent } from '../../../shared/page-title/page-title.component'
import { CardComponent } from '../../../shared/card/card.component'
import { CommonModule } from '@angular/common'
import { CarouselModule } from 'primeng/carousel'
import { TruncatePipe } from '../../../pipes/truncate.pipe'
import { CardLoadingComponent } from '../../../shared/card-loading/card-loading.component'
import { TagModule } from 'primeng/tag'
import { ButtonModule } from 'primeng/button'
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader'
import { ApiService } from '../../../services/api.service'
import { Router } from '@angular/router'
import { TipoCategoria } from '../../../models/model'
import { PaginatorModule } from 'primeng/paginator'

@Component({
  selector: 'app-courses',
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
    NgxSkeletonLoaderModule,
    PaginatorModule
  ],
  templateUrl: './courses-list.component.html',
  styleUrl: './courses-list.component.scss'
})
export class CoursesComponent {


  private apiService = inject(ApiService)
  private router = inject(Router)

  listCourses = signal<any[]>([])
  isLoading = signal<boolean>(false)

  highlights = computed(() => this.listCourses().filter(item => item.destaque))
  search = signal('')
  responsiveOptions: any[] | undefined

  categorias = signal([])
  selectedCategory: any = []

  coursesByCategory = computed(() => {
    return Object.groupBy(this.listCourses(), course => course.categoria)
  })

  //Paginação
  first = 0;
  rows = 20;

  ngOnInit(): void {
    this.getListCourses()
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

  onSelectCourse(course: any) {
    this.router.navigate(['course', course.id])
  }

  getListCourses() {

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

    this.apiService.getCourses(params).subscribe({
      next: res => {
        this.listCourses.set(res.data)
        this.isLoading.set(false)
      },
      error: err => {
        this.isLoading.set(false)
      },
    })
  }

  getCategories() {

    const tipo: TipoCategoria = 'Curso'

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

    this.getListCourses()
  }

  onClearCategory() {
    this.selectedCategory = []

    this.getListCourses()
  }

  onSearch(e: any) {
    this.search.set(e)
    if (this.search().length > 2 || this.search().length === 0) this.getListCourses()
  }

  onPageChange(event: any) {
    this.first = event.first
    this.rows = event.rows
  }

}
