import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms'
import { RouterModule } from '@angular/router'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader'
import { ConfirmationService, MessageService } from 'primeng/api'
import { ButtonModule } from 'primeng/button'
import { CheckboxModule } from 'primeng/checkbox'
import { ChipsModule } from 'primeng/chips'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { DialogModule } from 'primeng/dialog'
import { DropdownModule } from 'primeng/dropdown'
import { InputTextModule } from 'primeng/inputtext'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { MultiSelectModule } from 'primeng/multiselect'
import { RippleModule } from 'primeng/ripple'
import { TagModule } from 'primeng/tag'
import { ToastModule } from 'primeng/toast'
import { TipoCategoria } from '../../../models/model'
import { TruncatePipe } from '../../../pipes/truncate.pipe'
import { ApiService } from '../../../services/api.service'
import { ContentComponent } from "../../../shared/content/content.component"
import { LastNewsComponent } from '../../../shared/last-news/last-news.component'
import { PageTitleComponent } from '../../../shared/page-title/page-title.component'

dayjs.extend(utc)
dayjs.extend(customParseFormat)

@Component({
  selector: 'app-questions-list',
  standalone: true,
  imports: [
    PageTitleComponent,
    CommonModule,
    ContentComponent,
    InputTextModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    DropdownModule,
    RouterModule,
    ConfirmDialogModule,
    DialogModule,
    ChipsModule,
    NgxSkeletonLoaderModule,
    TagModule,
    CheckboxModule,
    ReactiveFormsModule,
    ToastModule,
    InputTextareaModule,
    LastNewsComponent,
    MultiSelectModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './questions-list.component.html',
  styleUrl: './questions-list.component.scss'
})
export class QuestionsListComponent {

  private apiService = inject(ApiService)
  private messageService = inject(MessageService)
  private confirmationService = inject(ConfirmationService)

  questions = signal<any[]>([])
  news = signal<any[]>([])
  search = signal('')
  rangeDates: Date[] | undefined
  selectedQuestion!: any[] | null
  modal: boolean = false
  isBtnAddLoading = signal(false)
  headerModal = signal('')
  isBtnAdd = signal(true)
  selectedId = signal<any>(null)
  categorias = signal<any[]>([])
  selectedFilter: any | undefined
  selectedCategory: any = []
  isNewQuestionDisabled = signal(false)
  filter = [
    { nome: 'Todas', value: 'Todas' },
    { nome: 'Todas respondidas', value: 'Respondidas' },
    { nome: 'Todas não respondidas', value: 'NaoRespondidas' },
    { nome: 'Minhas perguntas', value: 'Minhas' },
    { nome: 'Minhas perguntas respondidas', value: 'MinhasRespondidas' },
    { nome: 'Minhas perguntas não respondidas', value: 'MinhasNaoRespondidas' }
  ]

  questionsLoading = signal(false)
  newsLoading = signal(false)

  formQuestion = new UntypedFormGroup({
    enunciado: new FormControl('', { validators: Validators.required, nonNullable: true }),
    categoriaId: new FormControl('', { validators: Validators.required, nonNullable: true })
  })

  ngOnInit(): void {
    this.getQuestions()
    this.getCategories()
    this.getAllNews()
    this.disabled()
  }

  disabled() {
    const date = dayjs().get('hour')
    var userPerfil = JSON.parse(localStorage.getItem('user')!).perfil.toLowerCase()
    console.log(userPerfil);
    if ((date < 9 || date >= 19) && userPerfil === 'aluno') {
      this.isNewQuestionDisabled.set(true)
    }

  }

  getQuestions() {

    this.questionsLoading.set(true)

    let tipoFiltro
    let categorias

    if (this.selectedFilter) {
      tipoFiltro = {
        tipoFiltro: this.selectedFilter
      }
    }

    if (this.selectedCategory.length) {
      categorias = {
        categorias: this.selectedCategory
      }
    }

    const params = {
      ...tipoFiltro,
      ...categorias,
      termo: this.search()
    }

    this.apiService.getQuestions(params).subscribe({
      next: res => {

        const arr = res.data.map((item: any) => {
          return {
            ...item,
            dataCriacao: dayjs(item.dataCriacao).format('DD/MM/YYYY HH:mm')
          }
        })

        this.questions.set(arr)
        this.questionsLoading.set(false)

      },
      error: err => {
        console.log(err)
        this.questionsLoading.set(false)
      }
    })
  }

  // onClearFilter() {
  //   this.selectedFilter = undefined

  //   this.getQuestions()
  // }

  onClearCategoria() {
    this.selectedCategory = []

    this.getQuestions()
  }

  getCategories() {

    const tipo: TipoCategoria = 'Pergunta'

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

  getAllNews() {

    this.newsLoading.set(true)

    const params = {
      page: 1,
      pageSize: 10
    }

    this.apiService.getAllNews(params).subscribe({
      next: res => {
        this.news.set(res.data)
        this.newsLoading.set(false)
      },
      error: err => {
        console.log(err)
        this.newsLoading.set(false)
      }
    })
  }

  addQuestion() {

    this.isBtnAddLoading.set(true)

    this.apiService.addQuestion(this.formQuestion.value).subscribe({
      next: res => {
        this.messageService.add({ severity: 'success', summary: 'Pergunta adicionada com sucesso!' })
        this.formQuestion.reset()
        this.isBtnAddLoading.set(false)
        this.modal = false
      },
      error: err => {
        this.isBtnAddLoading.set(false)
        this.messageService.add({ severity: 'warn', summary: err.error })
        console.log('❌', err)
      }
    })
  }

  openModal() {
    this.headerModal.set('Adicionar nova pergunta')
    this.isBtnAdd.set(true)
    this.modal = true
  }

  closeModal() {
    this.getQuestions()
    this.formQuestion.reset()
    this.modal = false
  }

}
