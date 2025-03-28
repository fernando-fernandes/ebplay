import { CommonModule } from '@angular/common'
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core'
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms'
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
import { FileUploadModule } from 'primeng/fileupload'
import { IconFieldModule } from 'primeng/iconfield'
import { InputIconModule } from 'primeng/inputicon'
import { InputTextModule } from 'primeng/inputtext'
import { MultiSelectModule } from 'primeng/multiselect'
import { RippleModule } from 'primeng/ripple'
import { TableModule } from 'primeng/table'
import { TagModule } from 'primeng/tag'
import { ToastModule } from 'primeng/toast'
import { forkJoin } from 'rxjs'
import { ApiService } from '../../../services/api.service'
import { ContentComponent } from "../../../shared/content/content.component"
import { PageTitleComponent } from '../../../shared/page-title/page-title.component'
import { TipoCategoria } from '../../../models/model'
import { ExportTableComponent } from '../../../shared/export-table/export-table.component'

dayjs.extend(utc)
dayjs.extend(customParseFormat)
@Component({
  selector: 'app-files',
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
    DropdownModule,
    ChipsModule,
    FileUploadModule,
    ConfirmDialogModule,
    ToastModule,
    NgxSkeletonLoaderModule,
    IconFieldModule,
    InputIconModule,
    MultiSelectModule,
    ExportTableComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './files-admin.component.html',
  styleUrl: './files-admin.component.scss'
})
export class FilesAdminComponent implements OnInit {
  private apiService = inject(ApiService)
  private messageService = inject(MessageService)
  private confirmationService = inject(ConfirmationService)

  files = signal<any[]>([])
  categorias = signal<any[]>([])
  search = signal('')

  selectedCategory: any = []
  selectedItems!: any[] | null
  selectedId = signal<any>(null)
  selectedFile: File | null = null

  modal: boolean = false;
  isLoading = signal(false)
  isBtnAddLoading = signal(false)
  headerModal = signal('')
  isBtnAdd = signal(true)

  exportData = signal<any[]>([])
  exportFileName = signal<string>('Gestão Modelos e Checklists')
  exportCols = signal<any[]>([])

  formFiles = new UntypedFormGroup({
    nome: new FormControl('', { validators: Validators.required, nonNullable: true }),
    dataInicio: new FormControl('', { nonNullable: true }),
    dataFim: new FormControl('', { nonNullable: true }),
    categoriaId: new FormControl('', { nonNullable: true }),
    // hashtags: new FormControl<string[] | null>([], { nonNullable: true })
  })

  @ViewChild('file') file!: ElementRef

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
        this.setDataExport()
        this.isLoading.set(false)
      },
      error: err => {
        console.log(err)
        this.isLoading.set(false)
      }
    })
  }

  onClearFilter() {
    this.selectedCategory = []

    this.getFiles()
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

  addFile() {
    this.isBtnAddLoading.set(true)

    this.formFiles.patchValue({
      dataInicio: dayjs(this.formFiles.get('dataInicio')?.value).utc(true).format(),
      dataFim: dayjs(this.formFiles.get('dataFim')?.value).utc(true).format(),
    })

    if (this.formFiles.valid && this.selectedFile) {

      this.apiService.addFile(this.formFiles.value, this.selectedFile).subscribe({
        next: res => {
          this.messageService.add({ severity: 'success', summary: 'Arquivo adicionado com sucesso!' })
          this.formFiles.reset()
          this.isBtnAddLoading.set(false)
          this.getFiles()
          this.closeModal()
        },
        error: err => {
          this.isBtnAddLoading.set(false)
          this.messageService.add({ severity: 'warn', summary: err.error })
          console.log('❌', err)
        }
      })
    }

  }

  updateFile() {
    this.isBtnAddLoading.set(true)

    this.formFiles.patchValue({
      dataInicio: dayjs(this.formFiles.get('dataInicio')?.value).utc(true).format(),
      dataFim: dayjs(this.formFiles.get('dataFim')?.value).utc(true).format(),
    })

    const body = {
      ...this.formFiles.value,
      id: this.selectedId(),
    }

    if (this.formFiles.valid) {

      this.apiService.updateFile(this.selectedId(), body, this.selectedFile).subscribe({
        next: res => {
          this.messageService.add({ severity: 'success', summary: 'Arquivo alterado com sucesso!' })
          this.isBtnAddLoading.set(false)
          this.closeModal()
        },
        error: err => {
          this.isBtnAddLoading.set(false)
          this.messageService.add({ severity: 'warn', summary: err.error })
        }
      })
    }

  }

  onUpload(event: any) {

    this.selectedFile = event.target.files[0]
    console.log(this.selectedFile)
  }


  deleteFile(event: Event, file: any) {

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente o arquivo ${file.nome.toUpperCase()}?`,
      header: 'Excluir arquivo',
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

        this.apiService.deleteFile(file.id!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Arquivo excluído com sucesso!' })

            this.getFiles()
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir o arquivo.' })
          }
        })
      },
    })
  }

  deleteSelectedItems(event: Event, file: any[] | null) {
    const text = file!.length > 1 ? 'arquivos' : 'arquivo'

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente ${file?.length} ${text}?`,
      header: 'Excluir arquivos selecionados',
      icon: 'pi pi-exclamation-circle text-3xl',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptIcon: "none",
      rejectIcon: "none",
      defaultFocus: 'none',

      accept: () => {

        const arr = file?.map(item => this.apiService.deleteFile(item.id!))

        this.isLoading.set(true)

        forkJoin(arr!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Arquivos selecionados excluídos com sucesso!' })

            this.getFiles()
            this.selectedItems = null
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir ao arquivos selecionados.' })
            this.getFiles()
            this.selectedItems = null
          }
        })

      }
    })
  }

  openModal() {
    this.headerModal.set('Adicionar novo arquivo')
    this.isBtnAdd.set(true)
    this.modal = true
  }

  openUpdateModal(e: Event, file: any) {
    this.headerModal.set('Alterar arquivo')
    this.selectedId.set(file.id)
    this.isBtnAdd.set(false)

    this.formFiles.patchValue({
      nome: file.nome,
      dataInicio: dayjs(file.dataInicio, 'DD/MM/YYYY').toDate(),
      dataFim: dayjs(file.dataFim, 'DD/MM/YYYY').toDate(),
      categoriaId: file.categoriaId,
      hashtags: file.hashtags,
    })

    this.modal = true
  }

  closeModal() {
    this.modal = false
    this.formFiles.reset()
    this.resetFile()
  }

  resetFile() {
    this.file.nativeElement.value = ''
  }

  setDataExport() {
    const data = this.files().map(item => {
      return {
        "Id": item.id,
        "Nome": item.nome,
        "Data Início": item.dataInicio,
        "Data Fim": item.dataFim,
        "Categoria": item.categoria,
      }
    })

    this.exportCols.set(
      [
        { width: 5 }, // Id
        { width: 45 }, // Nome
        { width: 12 }, // Data Início
        { width: 12 }, // Data Fim
        { width: 20 }, // Categoria
      ]
    )
    this.exportData.set(data)
  }
}
