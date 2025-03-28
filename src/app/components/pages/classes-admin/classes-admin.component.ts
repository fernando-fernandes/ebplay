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
import { ImageSizeComponent } from '../../../shared/image-size/image-size.component'
import { TipoCategoria } from '../../../models/model'
import { ExportTableComponent } from '../../../shared/export-table/export-table.component'

dayjs.extend(utc)
dayjs.extend(customParseFormat)

@Component({
  selector: 'app-classes-admin',
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
  templateUrl: './classes-admin.component.html',
  styleUrl: './classes-admin.component.scss'
})
export class ClassesAdminComponent implements OnInit {
  private apiService = inject(ApiService)
  private messageService = inject(MessageService)
  private confirmationService = inject(ConfirmationService)
  private ckEditorConfig = inject(CkEditorService)

  classes = signal<any[]>([])
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
  exportFileName = signal<string>('Gestão-Live-e-Imersões')
  exportCols = signal<any[]>([])

  formClass = new UntypedFormGroup({
    titulo: new FormControl('', { validators: Validators.required, nonNullable: true }),
    linkImagem: new FormControl('', { nonNullable: true }),
    linkExterno: new FormControl('', { nonNullable: true }),
    linkVideo: new FormControl('', { nonNullable: true }),
    descricao: new FormControl('', { validators: Validators.required, nonNullable: true }),
    dataInicio: new FormControl('', { validators: Validators.required, nonNullable: true }),
    dataFim: new FormControl('', { nonNullable: true }),
    categoriaId: new FormControl('', { nonNullable: true }),
    hashtags: new FormControl<string[] | null>([], { nonNullable: true })
  })

  public Editor = ClassicEditor;
  public config: EditorConfig = this.ckEditorConfig.config as EditorConfig;

  ngOnInit(): void {
    this.getClasses()
    this.getCategories()
  }

  getClasses() {

    let data

    if (this.rangeDates) {
      data = {
        dataInicio: dayjs(this.rangeDates![0]).utc(true).format(),
        dataFim: dayjs(this.rangeDates![1]).utc(true).format(),
      }
    }

    const params = {
      ...data,
      termo: this.search()
    }

    this.isLoading.set(true)

    this.apiService.getClasses(params).subscribe({
      next: res => {

        const arr = res.data.map((item: any) => {
          return {
            ...item,
            dataInicio: dayjs(item.dataInicio).format('DD/MM/YYYY'),
            dataFim: dayjs(item.dataFim).format('DD/MM/YYYY'),
          }
        })

        console.log('AULAS', res)
        this.classes.set(arr)
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

  addClass() {

    this.isBtnAddLoading.set(true)

    this.formClass.patchValue({
      dataInicio: dayjs(this.formClass.get('dataInicio')?.value).utc(true).format(),
      dataFim: dayjs(this.formClass.get('dataFim')?.value).utc(true).format(),
    })

    this.apiService.addClass(this.formClass.value).subscribe({
      next: res => {
        console.log(res)
        this.messageService.add({ severity: 'success', summary: 'Aula adicionada com sucesso!' })
        this.formClass.reset()
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

  updateClass() {
    this.isBtnAddLoading.set(true)

    this.formClass.patchValue({
      dataInicio: dayjs(this.formClass.get('dataInicio')?.value).utc(true).format(),
      dataFim: dayjs(this.formClass.get('dataFim')?.value).utc(true).format(),
    })

    const body = {
      ...this.formClass.value,
      id: this.selectedId(),
    }

    this.apiService.updateClass(this.selectedId(), body).subscribe({
      next: res => {
        this.messageService.add({ severity: 'success', summary: 'Aula alterada com sucesso!' })
        this.isBtnAddLoading.set(false)
        this.modal = false
      },
      error: err => {
        this.isBtnAddLoading.set(false)
        this.messageService.add({ severity: 'warn', summary: err.error })
      }
    })

  }

  deleteClass(event: Event, classes: any) {

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente a aula ${classes.titulo.toUpperCase()}?`,
      header: 'Excluir aula',
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

        this.apiService.deleteClass(classes.id!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Aula excluída com sucesso!' })

            this.getClasses()
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir a aula.' })
          }
        })
      },
    })
  }

  deleteSelectedItems(event: Event, classes: any[] | null) {
    const text = classes!.length > 1 ? 'aulas' : 'aula'

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente ${classes?.length} ${text}?`,
      header: 'Excluir aulas selecionadas',
      icon: 'pi pi-exclamation-circle text-3xl',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptIcon: "none",
      rejectIcon: "none",
      defaultFocus: 'none',

      accept: () => {

        const arr = classes?.map(item => this.apiService.deleteClass(item.id!))

        this.isLoading.set(true)

        forkJoin(arr!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Aulas selecionadas excluídas com sucesso!' })

            this.getClasses()
            this.selectedItems = null
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir as aulas selecionadas.' })
            this.getClasses()
            this.selectedItems = null
          }
        })

      }
    })
  }

  openModal() {
    this.headerModal.set('Adicionar nova aula')
    this.isBtnAdd.set(true)
    this.modal = true
  }

  openUpdateModal(e: Event, classes: any) {
    this.headerModal.set('Alterar aula')
    this.selectedId.set(classes.id)
    this.isBtnAdd.set(false)

    this.formClass.patchValue({
      linkImagem: classes.linkImagem,
      titulo: classes.titulo,
      linkExterno: classes.linkExterno,
      linkVideo: classes.linkVideo,
      descricao: classes.descricao,
      dataInicio: dayjs(classes.dataInicio, 'DD/MM/YYYY').toDate(),
      dataFim: dayjs(classes.dataFim, 'DD/MM/YYYY').toDate(),
      categoriaId: classes.categoriaId,
      hashtags: classes.hashtags
    })

    this.modal = true
  }

  closeModal() {
    this.getClasses()
    this.formClass.reset()
    this.modal = false
  }

  setDataExport() {
    const data = this.classes().map(item => {
      return {
        "Id": item.id,
        "Imagem": item.linkImagem,
        "Título": item.titulo,
        "Descrição": item.descricaoReduzida,
        "Data Início": item.dataInicio,
        "Data Fim": item.dataFim,
        "Categoria": item.categoria,
        "Link Externo": item.linkExterno,
        "Link Vídeo": item.linkVideo,
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
        { width: 35 }, // Link Externo
        { width: 35 }, // Link Vídeo
        { width: 10 }, // Destaque
        { width: 15 }, // Data Criação
        { width: 15 }, // Data Atualização
        { width: 20 }, // Criador
      ]
    )
    this.exportData.set(data)
  }
}
