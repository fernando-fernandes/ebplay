import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
  Validators
} from '@angular/forms'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader'
import { ConfirmationService, MessageService } from 'primeng/api'
import { ButtonModule } from 'primeng/button'
import { CalendarModule } from 'primeng/calendar'
import { CheckboxModule } from 'primeng/checkbox'
import { ChipsModule } from 'primeng/chips'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { DialogModule } from 'primeng/dialog'
import { DropdownModule } from 'primeng/dropdown'
import { IconFieldModule } from 'primeng/iconfield'
import { InputIconModule } from 'primeng/inputicon'
import { InputTextModule } from 'primeng/inputtext'
import { RippleModule } from 'primeng/ripple'
import { TableModule } from 'primeng/table'
import { TagModule } from 'primeng/tag'
import { ToastModule } from 'primeng/toast'
import { forkJoin } from 'rxjs'
import { SanitizeHTMLPipe } from '../../../pipes/sanitize-html.pipe'
import { ApiService } from '../../../services/api.service'
import { ContentComponent } from "../../../shared/content/content.component"
import { PageTitleComponent } from '../../../shared/page-title/page-title.component'
import { TruncatePipe } from '../../../pipes/truncate.pipe'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { MultiSelectModule } from 'primeng/multiselect'
import { RouterModule } from '@angular/router'
import { TipoCategoria } from '../../../models/model'
import { ExportTableComponent } from '../../../shared/export-table/export-table.component'

dayjs.extend(utc)
dayjs.extend(customParseFormat)

@Component({
  selector: 'app-questions-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageTitleComponent,
    ContentComponent,
    TableModule,
    InputTextModule,
    CalendarModule,
    TagModule,
    ButtonModule,
    RippleModule,
    DialogModule,
    CheckboxModule,
    ConfirmDialogModule,
    ToastModule,
    ChipsModule,
    DropdownModule,
    NgxSkeletonLoaderModule,
    IconFieldModule,
    InputIconModule,
    TruncatePipe,
    InputTextareaModule,
    MultiSelectModule,
    RouterModule,
    ExportTableComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './questions-admin.component.html',
  styleUrl: './questions-admin.component.scss'
})
export class QuestionsAdminComponent {
  private apiService = inject(ApiService)
  private messageService = inject(MessageService)
  private confirmationService = inject(ConfirmationService)

  questions = signal<any[]>([])
  search = signal('')
  rangeDates: Date[] | undefined
  selectedQuestion!: any[] | null
  modal: boolean = false
  isLoading = signal(false)
  isBtnAddLoading = signal(false)
  headerModal = signal('')
  isBtnAdd = signal(true)
  selectedId = signal<any>(null)
  categorias = signal<any[]>([])
  selectedCategory: any = []
  selectedFilter: any | undefined
  exportData = signal<any[]>([])
  exportFileName = signal<string>('Gestão Comunidade Tira-dúvidas')
  exportCols = signal<any[]>([])

  filter = [
    { nome: 'Todas', value: 'Todas' },
    { nome: 'Respondidas', value: 'Respondidas' },
    { nome: 'Não Respondidas', value: 'NaoRespondidas' }
    // { nome: 'Minhas perguntas', value: 'Minhas' },
    // { nome: 'Minhas perguntas respondidas', value: 'MinhasRespondidas' },
    // { nome: 'Minhas perguntas não respondidas', value: 'MinhasNaoRespondidas' }
  ]

  formQuestion = new UntypedFormGroup({
    enunciado: new FormControl('', { validators: Validators.required, nonNullable: true }),
    categoriaId: new FormControl('', { nonNullable: true })
  })

  ngOnInit(): void {
    this.getQuestions()
    this.getCategories()
  }

  getQuestions() {

    let data
    let categorias
    let tipoFiltro

    if (this.selectedFilter) {
      tipoFiltro = {
        tipoFiltro: this.selectedFilter
      }
    }

    if (this.rangeDates) {
      data = {
        dataInicio: dayjs(this.rangeDates![0]).utc(true).format(),
        dataFim: dayjs(this.rangeDates![1]).utc(true).format(),
      }
    }

    if (this.selectedCategory.length) {
      categorias = {
        categorias: this.selectedCategory
      }
    }


    const params = {
      ...tipoFiltro,
      ...data,
      ...categorias,
      termo: this.search()
    }

    this.isLoading.set(true)

    this.apiService.getQuestions(params).subscribe({
      next: res => {

        const arr = res.data.map((item: any) => {
          return {
            ...item,
            dataCriacao: dayjs(item.dataCriacao).format('DD/MM/YYYY'),
          }
        })

        console.log(res.data)
        this.questions.set(arr)
        this.setDataExport()
        this.isLoading.set(false)

      },
      error: err => {
        console.log(err)
        this.isLoading.set(false)
      }
    })
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

  addQuestion() {

    this.isBtnAddLoading.set(true)

    this.apiService.addQuestion(this.formQuestion.value).subscribe({
      next: res => {
        console.log(res)
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

  updateQuestion() {
    this.isBtnAddLoading.set(true)

    const body = {
      ...this.formQuestion.value,
      id: this.selectedId(),
    }

    this.apiService.updateQuestion(this.selectedId(), body).subscribe({
      next: res => {
        this.messageService.add({ severity: 'success', summary: 'Pergunta alterada com sucesso!' })
        this.isBtnAddLoading.set(false)
        this.modal = false
      },
      error: err => {
        this.isBtnAddLoading.set(false)
        this.messageService.add({ severity: 'warn', summary: err.error })
      }
    })

  }

  deleteQuestion(event: Event, news: any) {

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente a pergunta ${news.enunciado.substring(0, 20).toUpperCase()}?`,
      header: 'Excluir pergunta',
      icon: 'pi pi-exclamation-circle text-3xl',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptIcon: "none",
      rejectIcon: "none",
      defaultFocus: 'none',

      accept: () => {

        this.isLoading.set(true)

        this.apiService.deleteQuestion(news.id!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Pergunta excluída com sucesso!' })

            this.getQuestions()
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir a pergunta.' })
          }
        })
      },
    })
  }

  deleteSelectedQuestions(event: Event, questions: any[] | null) {
    const textNews = questions!.length > 1 ? 'perguntas' : 'pergunta'

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente ${questions?.length} ${textNews}?`,
      header: 'Excluir perguntas selecionadas',
      icon: 'pi pi-exclamation-circle text-3xl',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptIcon: "none",
      rejectIcon: "none",
      defaultFocus: 'none',

      accept: () => {

        const arr = questions?.map(item => this.apiService.deleteQuestion(item.id!))

        this.isLoading.set(true)

        forkJoin(arr!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Perguntas selecionadas excluídas com sucesso!' })

            this.getQuestions()
            this.selectedQuestion = null
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir as perguntas selecionadas.' })
            this.getQuestions()
            this.selectedQuestion = null
          }
        })

      }
    })
  }

  openModal() {
    this.headerModal.set('Adicionar nova pergunta')
    this.isBtnAdd.set(true)
    this.modal = true
  }

  openUpdateModal(e: Event, question: any) {
    this.headerModal.set('Alterar pergunta')
    this.selectedId.set(question.id)
    this.isBtnAdd.set(false)

    this.formQuestion.patchValue({
      enunciado: question.enunciado,
      categoriaId: question.categoriaId,
      destaque: question.destaque
    })

    this.modal = true
  }

  closeModal() {
    this.getQuestions()
    this.formQuestion.reset()
    this.modal = false
  }

  onClearCategoria() {
    this.selectedCategory = []

    this.getQuestions()
  }

  setDataExport() {
    const data = this.questions().map(item => {

      // const respostas = item.respostas.map((resp: any) => {
      //   return resp.texto
      // })

      return {
        "Id": item.id,
        "Enunciado": item.enunciado,
        "Respostas": item.respostas.length || 'Não respondida',
        "Data de publicação": `${item.dataCriacao} / ${item.dataCriacaoFormatada}`,
        "Categoria": item.categoria,
        "Criador": item.criador,
        "Notícia título": item.noticiaTitulo,
        "Usuário pode responder": item.usuarioPodeResponder ? 'Sim' : 'Não',
      }
    })

    this.exportCols.set(
      [
        { width: 5 }, // Id
        { width: 50 }, // Enunciado
        { width: 15 }, // Respostas
        { width: 23 }, // Data de publicação
        { width: 20 }, // Categoria
        { width: 20 }, // Criador
        { width: 40 }, // Notícia título
        { width: 20 }, // Usuário pode responder
      ]
    )
    this.exportData.set(data)
  }
}
