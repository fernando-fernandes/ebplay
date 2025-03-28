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
  selector: 'app-courses-admin',
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
  templateUrl: './courses-admin.component.html',
  styleUrl: './courses-admin.component.scss'
})
export class CoursesAdminComponent {
  private apiService = inject(ApiService)
  private messageService = inject(MessageService)
  private confirmationService = inject(ConfirmationService)
  private ckEditorConfig = inject(CkEditorService)

  courses = signal<any[]>([])
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

  formCourses = new UntypedFormGroup({
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
    this.getAllCourses()
    this.getCategories()
  }

  getAllCourses() {

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

    this.apiService.getCourses(params).subscribe({
      next: res => {

        const arr = res.data.map((item: any) => {
          return {
            ...item,
            dataInicio: dayjs(item.dataInicio).format('DD/MM/YYYY'),
            dataFim: dayjs(item.dataFim).format('DD/MM/YYYY'),
          }
        })

        this.courses.set(arr)
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

    const tipo: TipoCategoria = 'Curso'

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

  addCourses() {

    this.isBtnAddLoading.set(true)

    this.formCourses.patchValue({
      dataInicio: dayjs(this.formCourses.get('dataInicio')?.value).utc(true).format(),
      dataFim: dayjs(this.formCourses.get('dataFim')?.value).utc(true).format(),
    })

    this.apiService.addCourse(this.formCourses.value).subscribe({
      next: res => {
        this.messageService.add({ severity: 'success', summary: 'Curso adicionado com sucesso!' })
        this.formCourses.reset()
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

  updateCourses() {
    this.isBtnAddLoading.set(true)

    this.formCourses.patchValue({
      dataInicio: dayjs(this.formCourses.get('dataInicio')?.value).utc(true).format(),
      dataFim: dayjs(this.formCourses.get('dataFim')?.value).utc(true).format(),
    })

    const body = {
      ...this.formCourses.value,
      id: this.selectedId(),
    }

    this.apiService.updateCourse(this.selectedId(), body).subscribe({
      next: res => {
        this.messageService.add({ severity: 'success', summary: 'Curso alterado com sucesso!' })
        this.isBtnAddLoading.set(false)
        this.modal = false
      },
      error: err => {
        this.isBtnAddLoading.set(false)
        this.messageService.add({ severity: 'warn', summary: err.error })
      }
    })

  }

  deleteCourses(event: Event, courses: any) {

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente a curso ${courses.titulo.toUpperCase()}?`,
      header: 'Excluir curso',
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

        this.apiService.deleteCourse(courses.id!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Curso excluído com sucesso!' })

            this.getAllCourses()
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir o curso.' })
          }
        })
      },
    })
  }

  deleteSelectedItems(event: Event, courses: any[] | null) {
    const text = courses!.length > 1 ? 'cursos' : 'curso'

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente ${courses?.length} ${text}?`,
      header: 'Excluir cursos selecionados',
      icon: 'pi pi-exclamation-circle text-3xl',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptIcon: "none",
      rejectIcon: "none",
      defaultFocus: 'none',

      accept: () => {

        const arr = courses?.map(item => this.apiService.deleteCourse(item.id!))

        this.isLoading.set(true)

        forkJoin(arr!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Cursos selecionados excluídas com sucesso!' })

            this.getAllCourses()
            this.selectedItems = null
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir os cursos selecionadas.' })
            this.getAllCourses()
            this.selectedItems = null
          }
        })

      }
    })
  }

  openModal() {
    this.headerModal.set('Adicionar novo curso')
    this.isBtnAdd.set(true)
    this.modal = true
  }

  openUpdateModal(e: Event, courses: any) {
    this.headerModal.set('Alterar curso')
    this.selectedId.set(courses.id)
    this.isBtnAdd.set(false)

    this.formCourses.patchValue({
      linkImagem: courses.linkImagem,
      titulo: courses.titulo,
      descricao: courses.descricao,
      dataInicio: dayjs(courses.dataInicio, 'DD/MM/YYYY').toDate(),
      dataFim: dayjs(courses.dataFim, 'DD/MM/YYYY').toDate(),
      categoriaId: courses.categoriaId,
      destaque: courses.destaque,
      hashtags: courses.hashtags
    })

    this.modal = true
  }

  closeModal() {
    this.getAllCourses()
    this.formCourses.reset()
    this.modal = false
  }

  setDataExport() {
    const data = this.courses().map(item => {
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
