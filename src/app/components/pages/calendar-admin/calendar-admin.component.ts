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
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { DialogModule } from 'primeng/dialog'
import { DropdownModule } from 'primeng/dropdown'
import { IconFieldModule } from 'primeng/iconfield'
import { InputIconModule } from 'primeng/inputicon'
import { InputTextModule } from 'primeng/inputtext'
import { RippleModule } from 'primeng/ripple'
import { TableModule } from 'primeng/table'
import { ToastModule } from 'primeng/toast'
import { ApiService } from '../../../services/api.service'
import { ContentComponent } from "../../../shared/content/content.component"
import { PageTitleComponent } from '../../../shared/page-title/page-title.component'
import { forkJoin } from 'rxjs'
import { TagModule } from 'primeng/tag'
import { ChipsModule } from 'primeng/chips'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { TruncatePipe } from '../../../pipes/truncate.pipe'
import { ImageSizeComponent } from '../../../shared/image-size/image-size.component'
import { TipoCategoria } from '../../../models/model'
import { ExportTableComponent } from '../../../shared/export-table/export-table.component'

dayjs.extend(utc)
dayjs.extend(customParseFormat)

@Component({
  selector: 'app-calendar-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageTitleComponent,
    ContentComponent,
    TableModule,
    TagModule,
    ChipsModule,
    InputTextModule,
    CalendarModule,
    ButtonModule,
    RippleModule,
    DialogModule,
    CheckboxModule,
    ConfirmDialogModule,
    ToastModule,
    DropdownModule,
    NgxSkeletonLoaderModule,
    IconFieldModule,
    InputIconModule,
    InputTextareaModule,
    TruncatePipe,
    ImageSizeComponent,
    ExportTableComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './calendar-admin.component.html',
  styleUrl: './calendar-admin.component.scss'
})
export class CalendarAdminComponent implements OnInit {

  private apiService = inject(ApiService)
  private messageService = inject(MessageService)
  private confirmationService = inject(ConfirmationService)

  calendar = signal<any[]>([])
  search = signal('')
  rangeDates: Date[] | undefined
  selectedCalendar!: any[] | null
  modal: boolean = false;
  isLoading = signal(false)
  isBtnAddLoading = signal(false)
  headerModal = signal('')
  isBtnAdd = signal(true)
  selectedId = signal<any>(null)
  categorias = signal<any[]>([])
  exportData = signal<any[]>([])
  exportFileName = signal<string>('Gestão de calendário do DP')
  exportCols = signal<any[]>([])

  formCalendar = new UntypedFormGroup({
    titulo: new FormControl('', { validators: Validators.required, nonNullable: true }),
    descricao: new FormControl('', { validators: Validators.required, nonNullable: true }),
    linkImagem: new FormControl('', { nonNullable: true }),
    data: new FormControl('', { validators: Validators.required, nonNullable: true }),
    categoriaId: new FormControl('', { nonNullable: true }),
    hashtags: new FormControl([], { nonNullable: true }),
  })

  ngOnInit(): void {
    this.getCalendarItems()
    this.getCategories()
  }

  getCalendarItems() {

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

    this.apiService.getCalendarItems(params).subscribe({
      next: res => {

        const arr = res.data.map((item: any) => {
          return {
            ...item,
            data: dayjs(item.data).format('DD/MM/YYYY'),
          }
        })

        this.calendar.set(arr)

        console.log(res)
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

    const tipo: TipoCategoria = 'ItemCalendario'

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

  addEvent() {

    this.isBtnAddLoading.set(true)

    this.formCalendar.patchValue({
      data: dayjs(this.formCalendar.get('data')?.value).utc(true).format(),
    })

    console.log(this.formCalendar.value)

    this.apiService.addCalendarItem(this.formCalendar.value).subscribe({
      next: res => {
        console.log(res)
        this.modal = false
        this.messageService.add({ severity: 'success', summary: 'Evento adicionado com sucesso!' })
        this.formCalendar.reset()
        this.isBtnAddLoading.set(false)
      },
      error: err => {
        this.isBtnAddLoading.set(false)
        this.messageService.add({ severity: 'warn', summary: err.error })
        console.log('❌', err)
      }
    })
  }

  updateEvent() {
    this.isBtnAddLoading.set(true)

    this.formCalendar.patchValue({
      data: dayjs(this.formCalendar.get('data')?.value).utc(true).format(),
    })

    const body = {
      ...this.formCalendar.value,
      id: this.selectedId(),
    }

    console.log('➡️ Update Body', body)

    this.apiService.updateCalendarItem(this.selectedId(), body).subscribe({
      next: res => {
        this.messageService.add({ severity: 'success', summary: 'Evento alterado com sucesso!' })
        this.isBtnAddLoading.set(false)
        this.modal = false
      },
      error: err => {
        this.isBtnAddLoading.set(false)
        this.messageService.add({ severity: 'warn', summary: err.error })
      }
    })

  }

  deleteEvent(event: Event, calendar: any) {

    console.log(calendar.id)

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente o evento ${calendar.titulo.toUpperCase()}?`,
      header: 'Excluir evento',
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

        this.apiService.deleteCalendarItem(calendar.id!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Evento excluído com sucesso!' })

            this.getCalendarItems()
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir o evento  .' })
          }
        })
      },
    })
  }

  deleteSelectedProducts(event: Event, calendar: any[] | null) {
    const text = calendar!.length > 1 ? 'eventos' : 'evento'

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente ${calendar?.length} ${text}?`,
      header: 'Excluir eventos selecionadas',
      icon: 'pi pi-exclamation-circle text-3xl',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptIcon: "none",
      rejectIcon: "none",
      defaultFocus: 'none',

      accept: () => {

        const arr = calendar?.map(item => this.apiService.deleteCalendarItem(item.id!))

        this.isLoading.set(true)

        forkJoin(arr!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Eventos selecionados excluídos com sucesso!' })

            this.getCalendarItems()
            this.selectedCalendar = null
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir os eventos selecionados.' })
            this.getCalendarItems()
            this.selectedCalendar = null
          }
        })

      }
    })
  }

  openModal() {
    this.headerModal.set('Adicionar novo evento')
    this.isBtnAdd.set(true)
    this.modal = true
  }

  openUpdateModal(e: Event, calendar: any) {
    this.headerModal.set('Alterar evento')
    this.selectedId.set(calendar.id)
    this.isBtnAdd.set(false)

    this.formCalendar.patchValue({
      titulo: calendar.titulo,
      descricao: calendar.descricao,
      linkImagem: calendar.linkImagem,
      data: dayjs(calendar.data, 'DD/MM/YYYY').toDate(),
      categoriaId: calendar.categoriaId,
      hashtags: calendar.hashtags,
    })

    console.log(this.formCalendar.value)

    this.modal = true
  }

  closeModal() {
    this.getCalendarItems()
    this.formCalendar.reset()
    this.modal = false
  }

  setDataExport() {
    const data = this.calendar().map(item => {
      return {
        "Id": item.id,
        "Imagem": item.linkImagem,
        "Título": item.titulo,
        "Descrição": item.descricao,
        "Data": item.data,
        "Categoria": item.categoria,
        "Destaque": item.destaque ? 'Sim' : 'Não',
      }
    })

    this.exportCols.set(
      [
        { width: 5 }, // Id
        { width: 35 }, // Imagem
        { width: 55 }, // Título
        { width: 55 }, // Descrição
        { width: 12 }, // Data
        { width: 20 }, // Categoria
        { width: 10 }, // Destaque
      ]
    )
    this.exportData.set(data)
  }

}
