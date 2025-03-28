import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
  Validators
} from '@angular/forms'
import { CKEditorModule } from '@ckeditor/ckeditor5-angular'
import { ClassicEditor, EditorConfig } from 'ckeditor5'
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
import { CkEditorService } from '../../../services/ck-editor.service'
import { ContentComponent } from "../../../shared/content/content.component"
import { PageTitleComponent } from '../../../shared/page-title/page-title.component'
import { TruncatePipe } from '../../../pipes/truncate.pipe'
import { ImageSizeComponent } from "../../../shared/image-size/image-size.component"
import { TipoCategoria } from '../../../models/model'
import { ExportTableComponent } from '../../../shared/export-table/export-table.component'

dayjs.extend(utc)
dayjs.extend(customParseFormat)

@Component({
  selector: 'app-news-admin',
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
    CKEditorModule,
    SanitizeHTMLPipe,
    TruncatePipe,
    ImageSizeComponent,
    ExportTableComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './news-admin.component.html',
  styleUrl: './news-admin.component.scss'
})
export class NewsAdminComponent implements OnInit {

  private apiService = inject(ApiService)
  private messageService = inject(MessageService)
  private confirmationService = inject(ConfirmationService)
  private ckEditorConfig = inject(CkEditorService)

  news = signal<any[]>([])
  search = signal('')
  rangeDates: Date[] | undefined
  selectedItems!: any[] | null
  modal: boolean = false;
  isLoading = signal(false)
  isBtnAddLoading = signal(false)
  headerModal = signal('')
  isBtnAdd = signal(true)
  selectedId = signal<any>(null)
  categorias = signal<any[]>([])
  exportData = signal<any[]>([])
  exportFileName = signal<string>('Gestão Novidades e Atualizações')
  exportCols = signal<any[]>([])

  formNews = new UntypedFormGroup({
    linkImagem: new FormControl('', { nonNullable: true }),
    titulo: new FormControl('', { validators: Validators.required, nonNullable: true }),
    descricao: new FormControl('', { validators: Validators.required, nonNullable: true }),
    dataInicio: new FormControl('', { validators: Validators.required, nonNullable: true }),
    dataFim: new FormControl('', { nonNullable: true }),
    destaque: new FormControl(false, { nonNullable: true }),
    categoriaId: new FormControl('', { nonNullable: true }),
    hashtags: new FormControl<string[] | null>([], { nonNullable: true })
  })

  public Editor = ClassicEditor;
  public config: EditorConfig = this.ckEditorConfig.config as EditorConfig;

  ngOnInit(): void {
    this.getAllNews()
    this.getCategories()
  }

  getAllNews() {

    let data

    if (this.rangeDates) {
      data = {
        dataInicio: dayjs(this.rangeDates![0]).utc(true).format(),
        dataFim: dayjs(this.rangeDates![1]).utc(true).format(),
      }

      console.log(data)
    }

    const params = {
      ...data,
      termo: this.search()
    }

    this.isLoading.set(true)

    this.apiService.getAllNews(params).subscribe({
      next: res => {

        const arr = res.data.map((item: any) => {
          return {
            ...item,
            dataInicio: dayjs(item.dataInicio).format('DD/MM/YYYY'),
            dataFim: dayjs(item.dataFim).format('DD/MM/YYYY'),
          }
        })

        this.news.set(arr)
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

    const tipo: TipoCategoria = 'Noticia'

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

  addNews() {

    this.isBtnAddLoading.set(true)

    this.formNews.patchValue({
      dataInicio: dayjs(this.formNews.get('dataInicio')?.value).utc(true).format(),
      dataFim: dayjs(this.formNews.get('dataFim')?.value).utc(true).format(),
    })

    this.apiService.addNews(this.formNews.value).subscribe({
      next: res => {
        this.messageService.add({ severity: 'success', summary: 'Notícia adicionada com sucesso!' })
        this.formNews.reset()
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

  updateNews() {
    this.isBtnAddLoading.set(true)

    this.formNews.patchValue({
      dataInicio: dayjs(this.formNews.get('dataInicio')?.value).utc(true).format(),
      dataFim: dayjs(this.formNews.get('dataFim')?.value).utc(true).format(),
    })

    const body = {
      ...this.formNews.value,
      id: this.selectedId(),
    }

    this.apiService.updateNews(this.selectedId(), body).subscribe({
      next: res => {
        this.messageService.add({ severity: 'success', summary: 'Notícia alterada com sucesso!' })
        this.isBtnAddLoading.set(false)
        this.modal = false
      },
      error: err => {
        this.isBtnAddLoading.set(false)
        this.messageService.add({ severity: 'warn', summary: err.error })
      }
    })

  }

  deleteNews(event: Event, news: any) {

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente a notícia ${news.titulo.toUpperCase()}?`,
      header: 'Excluir notícia',
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

        this.apiService.deleteNews(news.id!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Notícia excluída com sucesso!' })

            this.getAllNews()
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir a notícia.' })
          }
        })
      },
    })
  }

  deleteSelectedItems(event: Event, news: any[] | null) {
    const text = news!.length > 1 ? 'notícias' : 'notícia'

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente ${news?.length} ${text}?`,
      header: 'Excluir notícias selecionadas',
      icon: 'pi pi-exclamation-circle text-3xl',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptIcon: "none",
      rejectIcon: "none",
      defaultFocus: 'none',

      accept: () => {

        const arr = news?.map(item => this.apiService.deleteNews(item.id!))

        this.isLoading.set(true)

        forkJoin(arr!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Notícias selecionadas excluídas com sucesso!' })

            this.getAllNews()
            this.selectedItems = null
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir as notícias selecionadas.' })
            this.getAllNews()
            this.selectedItems = null
          }
        })

      }
    })
  }

  openModal() {
    this.headerModal.set('Adicionar nova notícia')
    this.isBtnAdd.set(true)
    this.modal = true
  }

  openUpdateModal(e: Event, news: any) {
    this.headerModal.set('Alterar notícia')
    this.selectedId.set(news.id)
    this.isBtnAdd.set(false)

    this.formNews.patchValue({
      linkImagem: news.linkImagem,
      titulo: news.titulo,
      descricao: news.descricao,
      dataInicio: dayjs(news.dataInicio, 'DD/MM/YYYY').toDate(),
      dataFim: dayjs(news.dataFim, 'DD/MM/YYYY').toDate(),
      categoriaId: news.categoriaId,
      destaque: news.destaque,
      hashtags: news.hashtags
    })

    this.modal = true
  }

  closeModal() {
    this.getAllNews()
    this.formNews.reset()
    this.modal = false
  }

  setDataExport() {
    const data = this.news().map(item => {
      return {
        "Id": item.id,
        "Imagem": item.linkImagem,
        "Título": item.titulo,
        "Descrição": item.descricaoReduzida,
        "Data Início": item.dataInicio,
        "Data Fim": item.dataFim,
        "Categoria": item.categoria,
        "Destaque": item.destaque ? 'Sim' : 'Não',
        "Data Criação": dayjs(item.dataCriacao).format('DD/MM/YYYY'),
        "Data Atualização": dayjs(item.dataAtualizacao).format('DD/MM/YYYY'),
        "Criador": item.criador,
      }
    })



    this.exportCols.set(
      [
        { width: 5 }, // Id
        { width: 35 }, // Imagem
        { width: 30 }, // Título
        { width: 35 }, // Descrição
        { width: 12 }, // Data Início
        { width: 12 }, // Data Fim
        { width: 15 }, // Categoria
        { width: 10 }, // Destaque
        { width: 15 }, // Data Criação
        { width: 15 }, // Data Atualização
        { width: 20 }, // Criador
      ]
    )
    this.exportData.set(data)
  }
}
