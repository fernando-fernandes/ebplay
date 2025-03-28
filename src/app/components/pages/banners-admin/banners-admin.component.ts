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
import { ApiService } from '../../../services/api.service'
import { CkEditorService } from '../../../services/ck-editor.service'
import { ContentComponent } from "../../../shared/content/content.component"
import { PageTitleComponent } from '../../../shared/page-title/page-title.component'
import { TruncatePipe } from '../../../pipes/truncate.pipe'
import { ImageSizeComponent } from '../../../shared/image-size/image-size.component'
import { ExportTableComponent } from '../../../shared/export-table/export-table.component'
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';

dayjs.extend(utc)
dayjs.extend(customParseFormat)

@Component({
  selector: 'app-banners-admin',
  standalone: true,
  imports: [
    CommonModule,
    MultiSelectModule,
    InputNumberModule,
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
    TruncatePipe,
    ImageSizeComponent,
    ExportTableComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './banners-admin.component.html',
  styleUrl: './banners-admin.component.scss'
})
export class BannersAdminComponent implements OnInit {
  private apiService = inject(ApiService)
  private messageService = inject(MessageService)
  private confirmationService = inject(ConfirmationService)
  private ckEditorConfig = inject(CkEditorService)

  banners = signal<any[]>([])
  search = signal('')
  rangeDates: Date[] | undefined
  selectedItems!: any[] | null
  modal: boolean = false;
  isLoading = signal(false)
  isBtnAddLoading = signal(false)
  headerModal = signal('')
  isBtnAdd = signal(true)
  selectedId = signal<any>(null)
  selectedFile: File | null = null

  dispositivoss = [
    { name: 'Desktop', value: 'Desktop' },
    { name: 'Mobile', value: 'Mobile' },
    { name: 'Tablet', value: 'Tablet' },
  ]

  localizacoes = [
    { name: 'Novidades e Atualizações', value: 'NovidadesAtualizacoes' },
    { name: 'Lives e Imersões', value: 'LivesImersoes' },
    { name: 'Comunidade Tira-Dúvidas', value: 'Comunidade' },
    { name: 'Calendário do DP', value: 'Calendario' },
    { name: 'Modelos e Checklists', value: 'Checklists' },
  ]

  tipos = [
    { name: 'Carrossel', value: 'Carrossel' },
    { name: 'PopUp', value: 'PopUp' },
  ]

  categorias = signal<any[]>([])
  exportData = signal<any[]>([])
  exportFileName = signal<string>('Gestão-Banners')
  exportCols = signal<any[]>([])

  formBanner = new UntypedFormGroup({
    mostrarAposXSessoes: new FormControl('', { nonNullable: true }),
    mostrarAteXVezesPorUsuario: new FormControl('', { nonNullable: true }),
    mostrarACadaXMinutos: new FormControl('', { nonNullable: true }),

    titulo: new FormControl('', { validators: Validators.required, nonNullable: true }),
    linkExterno: new FormControl('', { validators: Validators.required, nonNullable: true }),
    localizacao: new FormControl('', { validators: Validators.required, nonNullable: true }),
    tipo: new FormControl('', { validators: Validators.required, nonNullable: true }),
    dispositivos: new FormControl('', { validators: Validators.required, nonNullable: true }),

    dataInicio: new FormControl('', { validators: Validators.required, nonNullable: true }),
    dataFim: new FormControl('', { nonNullable: true }),
    ativo: new FormControl(false, { nonNullable: true }),
    // categoriaId: new FormControl('', { nonNullable: true }),
    // hashtags: new FormControl<string[] | null>([], { nonNullable: true })
  })

  public Editor = ClassicEditor;
  public config: EditorConfig = this.ckEditorConfig.config as EditorConfig;

  ngOnInit(): void {
    this.getBanners()
  }

  getBanners() {

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

    this.apiService.getBanners(params).subscribe({
      next: res => {

        console.log({ res });

        const arr = (res?.data || res)?.map?.((item: any) => {
          return {
            ...item,
            dataInicio: dayjs(item.dataInicio).format('DD/MM/YYYY'),
            dataFim: dayjs(item.dataFim).format('DD/MM/YYYY'),
            tipo: item.tipo,
            localizacao: item.localizacao,
            dispositivos: item.dispositivos,
            ativo: item.ativo
          }
        })

        console.log('BANNERS', res)
        this.banners.set(arr)
        this.setDataExport()
        this.isLoading.set(false)

      },
      error: err => {
        console.log(err)
        this.isLoading.set(false)
      }
    })
  }

  addBanner() {

    this.isBtnAddLoading.set(true)

    this.formBanner.patchValue({
      dataInicio: dayjs(this.formBanner.get('dataInicio')?.value).utc(true).format(),
      dataFim: dayjs(this.formBanner.get('dataFim')?.value).utc(true).format(),
    })

    console.log('❌', { body: this.formBanner.value });

    if (!this.selectedFile) {
      this.isBtnAddLoading.set(false)
      this.messageService.add({ severity: 'warn', summary: 'Selecione uma imagem para o banner.' })
      console.log('❌', 'Selecione uma imagem para o banner.')
      return;
    }

    if (this.formBanner.valid && this.selectedFile) {
      this.apiService.addBanner(this.formBanner.value, this.selectedFile).subscribe({
        next: res => {
          console.log(res)
          this.messageService.add({ severity: 'success', summary: 'Banner adicionado com sucesso!' })
          this.formBanner.reset()
          this.isBtnAddLoading.set(false)
          this.getBanners()
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

  updateBanners() {
    this.isBtnAddLoading.set(true)

    this.formBanner.patchValue({
      dataInicio: dayjs(this.formBanner.get('dataInicio')?.value).utc(true).format(),
      dataFim: dayjs(this.formBanner.get('dataFim')?.value).utc(true).format(),
    })

    const body = {
      ...this.formBanner.value,
      id: this.selectedId(),
    }

    this.apiService.updateBanner(this.selectedId(), body, this.selectedFile).subscribe({
      next: res => {
        this.messageService.add({ severity: 'success', summary: 'Banner alterado com sucesso!' })
        this.isBtnAddLoading.set(false)
        this.modal = false
      },
      error: err => {
        this.isBtnAddLoading.set(false)
        this.messageService.add({ severity: 'warn', summary: err.error })
      }
    })

  }

  onUpload(event: any) {

    this.selectedFile = event.target.files[0]
    console.log(this.selectedFile)
  }

  deleteBanner(event: Event, banner: any) {

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente o banner ${banner.titulo.toUpperCase()}?`,
      header: 'Excluir banner',
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

        this.apiService.deleteBanner(banner.id!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Banner excluído com sucesso!' })

            this.getBanners()
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir o banner.' })
          }
        })
      },
    })
  }

  deleteSelectedItems(event: Event, banners: any[] | null) {
    const text = banners!.length > 1 ? 'aulas' : 'aula'

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente ${banners?.length} ${text}?`,
      header: 'Excluir banners selecionados',
      icon: 'pi pi-exclamation-circle text-3xl',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptIcon: "none",
      rejectIcon: "none",
      defaultFocus: 'none',

      accept: () => {

        const arr = banners?.map(item => this.apiService.deleteBanner(item.id!))

        this.isLoading.set(true)

        forkJoin(arr!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Banners selecionados excluídos com sucesso!' })

            this.getBanners()
            this.selectedItems = null
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir as banners selecionados.' })
            this.getBanners()
            this.selectedItems = null
          }
        })

      }
    })
  }

  openModal() {
    this.headerModal.set('Adicionar novo banner')
    this.isBtnAdd.set(true)
    this.modal = true
  }

  openUpdateModal(e: Event, banner: any) {
    this.headerModal.set('Alterar banner')
    this.selectedId.set(banner.id)
    this.isBtnAdd.set(false)

    this.formBanner.patchValue({
      titulo: banner.titulo,
      localizacao: banner.localizacao,
      tipo: banner.tipo,
      linkImagem: banner.linkImagem,
      linkExterno: banner.linkExterno,
      mostrarAposXSessoes: banner.mostrarAposXSessoes,
      mostrarAteXVezesPorUsuario: banner.mostrarAteXVezesPorUsuario,
      mostrarACadaXMinutos: banner.mostrarACadaXMinutos,
      dispositivos: banner.dispositivos,
      dataInicio: dayjs(banner.dataInicio, 'DD/MM/YYYY').toDate(),
      dataFim: dayjs(banner.dataFim, 'DD/MM/YYYY').toDate(),
      ativo: banner.ativo
      // categoriaId: banner.categoriaId,
      // hashtags: banner.hashtags
    })

    this.modal = true
  }

  closeModal() {
    this.getBanners()
    this.formBanner.reset()
    this.modal = false
  }

  setDataExport() {
    const data = this.banners().map(item => {
      return {
        "Id": item.id,
        "Imagem": item.linkImagem,
        "Título": item.titulo,
        "Localização": item.localizacao,
        "Tipo": item.tipo,
        "Mostrar Apos X Sessoes": item.mostrarAposXSessoes,
        "Mostrar Ate X Vezes Por Usuario": item.mostrarAteXVezesPorUsuario,
        "Mostrar A Cada XMinutos": item.mostrarACadaXMinutos,
        "Dispositivos": item.dispositivos,
        "Data Início": item.dataInicio,
        "Data Fim": item.dataFim,
        "Categoria": item.categoria,
        "Link Externo": item.linkExterno,
        "Link Imagem": item.linkImagem,
        "Data Criação": dayjs(item.dataCriacao).format('DD/MM/YYYY'),
        "Data Atualização": dayjs(item.dataAtualizacao).format('DD/MM/YYYY'),
        "Ativo": item.ativo
      }
    })

    this.exportCols.set(
      [
        { width: 5 }, // Id
        { width: 35 }, // Imagem
        { width: 30 }, // Título
        { width: 35 }, // Localização
        { width: 35 }, // Tipo
        { width: 35 }, // Mostrar Apos X Sessoes
        { width: 35 }, // Mostrar Ate X Vezes Por Usuario
        { width: 35 }, // Mostrar A Cada XMinutos
        { width: 35 }, // Dispositivos
        { width: 12 }, // Data Início
        { width: 12 }, // Data Fim
        { width: 15 }, // Categoria
        { width: 35 }, // Link Externo
        { width: 15 }, // Data Criação
        { width: 15 }, // Data Atualização
        { width: 5 }, // Ativo
      ]
    )
    this.exportData.set(data)
  }
}
