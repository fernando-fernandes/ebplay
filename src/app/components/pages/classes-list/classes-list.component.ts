import { PageTitleComponent } from './../../../shared/page-title/page-title.component'
import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { ContentComponent } from '../../../shared/content/content.component'
import { CardComponent } from '../../../shared/card/card.component'
import { CommonModule } from '@angular/common'
import { ApiService } from '../../../services/api.service'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import { TruncatePipe } from '../../../pipes/truncate.pipe'
import { Router } from '@angular/router'
import { CarouselModule } from 'primeng/carousel'
import { TagModule } from 'primeng/tag'
import { ButtonModule } from 'primeng/button'
import { CardLoadingComponent } from '../../../shared/card-loading/card-loading.component'
import { TipoCategoria } from '../../../models/model'

dayjs.extend(utc)
dayjs.extend(customParseFormat)

@Component({
  selector: 'app-classes-list',
  standalone: true,
  imports: [
    ContentComponent,
    PageTitleComponent,
    CardComponent,
    CardLoadingComponent,
    CommonModule,
    CarouselModule,
    TruncatePipe,
    TagModule,
    ButtonModule
  ],
  templateUrl: './classes-list.component.html',
  styleUrl: './classes-list.component.scss'
})
export class ClassesListComponent implements OnInit {
  private apiService = inject(ApiService)
  private router = inject(Router)

  listClasses = signal<any[]>([])
  isLoading = signal<boolean>(false)
  search = signal('')
  categorias = signal([])
  selectedCategory: any = []
  responsiveOptions: any[] | undefined

  listBanners = signal<any[]>([]);

  responsiveOptionsBanners = [
    { breakpoint: '1024px', numVisible: 1, numScroll: 1 },
    { breakpoint: '768px', numVisible: 1, numScroll: 1 },
    { breakpoint: '560px', numVisible: 1, numScroll: 1 }
  ];

  ngOnInit(): void {
    this.getListClasses()
    this.getCategories()
    this.getBanners()

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

  getDevice(): ('Desktop' | 'Mobile' | 'Tablet') {
    const width = window.innerWidth;

    if (width <= 768) {
      // Considera que é um celular ou tablet
      if (width <= 480) {
        return 'Mobile';
      } else {
        return 'Tablet';
      }
    } else {
      // Considera que é um desktop
      return 'Desktop';
    }
  }

  getBanners() {
    const dispositivo = this.getDevice()

    const params = {
      Tipo: 'Carrossel',
      DataInicio: dayjs(new Date()).format('YYYY/MM/DD'),
      Dispositivos: [dispositivo]
    }

    this.isLoading.set(true)

    // this.listBanners.set([
    //   {
    //     titulo: 'Teste 1',
    //     linkImagem: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0KI8Ji-LEonZbtjfXPy1KnnbL_eEjgy2bBQ&s',
    //   }
    // ])

    // return;

    this.apiService.getBanners(params).subscribe({
      next: res => {
        console.log('Banners', res.data)
        this.listBanners.set(res.data)
        this.isLoading.set(false)
      },
      error: err => {
        this.isLoading.set(false)
      },
    })
  }

  onSelectNews(classes: any) {
    this.router.navigate(['class', classes.id])
  }

  getListClasses() {
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

    this.apiService.getClasses(params).subscribe({
      next: res => {
        this.listClasses.set(res.data)
        this.isLoading.set(false)
      },
      error: err => {
        this.isLoading.set(false)
      },
    })
  }

  getCategories() {

    const tipo: TipoCategoria = 'Aula'

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

  onFilterCategory(e: any) {
    console.log(e)
    this.selectedCategory = e

    this.getListClasses()
  }

  onClearCategory() {
    this.selectedCategory = []

    this.getListClasses()
  }

  onSearch(e: any) {
    this.search.set(e)
    if (this.search().length > 2 || this.search().length === 0) this.getListClasses()
  }

}



