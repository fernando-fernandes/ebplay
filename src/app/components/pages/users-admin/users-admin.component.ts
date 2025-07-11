import { CommonModule } from '@angular/common'
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core'
import {
  AbstractControl,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
  Validators,
} from '@angular/forms'
import { CKEditorModule } from '@ckeditor/ckeditor5-angular'
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
import { ContentComponent } from '../../../shared/content/content.component'
import { PageTitleComponent } from '../../../shared/page-title/page-title.component'
import { MultiSelectModule } from 'primeng/multiselect'
import { InputMaskModule } from 'primeng/inputmask'
import { PasswordModule } from 'primeng/password'
import { RadioButtonModule } from 'primeng/radiobutton'
import { ExportTableComponent } from '../../../shared/export-table/export-table.component'

dayjs.extend(utc)
dayjs.extend(customParseFormat)

interface City {
  name: string
  code: string
}

@Component({
  selector: 'app-home',
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
    MultiSelectModule,
    InputMaskModule,
    PasswordModule,
    RadioButtonModule,
    ExportTableComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './users-admin.component.html',
  styleUrl: './users-admin.component.scss',
})
export class UsersAdminComponent implements OnInit {
  private apiService = inject(ApiService)
  private messageService = inject(MessageService)
  private confirmationService = inject(ConfirmationService)
  @ViewChild('file') file!: ElementRef

  imagePreview: string | null = null;
  selectedFile: File | null = null

  users = signal<any[]>([])
  search = signal('')
  rangeDates: Date[] | undefined
  selectedItems!: any[] | null
  modal: boolean = false
  isLoading = signal(false)
  isBtnAddLoading = signal(false)
  headerModal = signal('')
  isBtnAdd = signal(true)
  selectedId = signal<any>(null)
  isBtnReset = signal(false)
  isResetLoading = signal(false)
  resetText = signal('')
  selectedEmail = signal('')

  exportData = signal<any[]>([])
  exportFileName = signal<string>('Gestão de usuários')
  exportCols = signal<any[]>([])

  showPassword = signal(true)
  selectedDateType = 'Criacao'
  dateType = [
    { tipo: 'Criação', valor: 'Criacao' },
    { tipo: 'Último login', valor: 'UltimoLogin' },
    { tipo: 'Vencimento', valor: 'Vencimento' },
  ]

  status = [
    { label: 'Ativo', value: 'ativo' },
    { label: 'Inativo', value: 'inativo' },
  ]

  perfil = [
    { label: 'Administrador', value: 'Administrador' },
    { label: 'Professor', value: 'Professor' },
    { label: 'Redator', value: 'redator' },
    { label: 'Comum', value: 'comum' },
  ]

  selectedStatus: any | undefined
  filterStatus = [
    { nome: 'Ativos', value: 0 },
    { nome: 'Inativos', value: 1 },
    { nome: 'Suspensos', value: 2 },
    { nome: 'Deletados', value: 3 }
  ]

  formUser = new UntypedFormGroup({
    nome: new FormControl('', { nonNullable: true }),
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
    telefone: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { validators: Validators.required, nonNullable: true }),
    apelido: new FormControl('', { nonNullable: true }),
    perfil: new FormControl('', { nonNullable: true }),
    dataVencimento: new FormControl('', { nonNullable: true }),
    status: new FormControl('Ativo', { nonNullable: true }),
    imagemPerfil: new FormControl(null, [this.validateFile]),

  })

  ngOnInit(): void {
    this.getUsers()
  }

  getUsers() {
    let data
    let status: any = []

    if (this.rangeDates) {
      data = {
        dataInicio: dayjs(this.rangeDates![0]).utc(true).format(),
        dataFim: dayjs(this.rangeDates![1]).utc(true).format(),
      }

    }

    if (this.selectedStatus) {
      status = this.selectedStatus
    }

    const params = {
      ...data,
      tipoData: this.selectedDateType,
      status: status,
      termo: this.search()
    }

    this.isLoading.set(true)

    this.apiService.getUsers(params).subscribe({
      next: res => {

        const arr = res.data.map((item: any) => {
          return {
            ...item,
            dataCriacao: dayjs(item.dataCriacao).format('DD/MM/YYYY'),
            dataVencimento: dayjs(item.dataVencimento).format('DD/MM/YYYY'),
            ultimoLogin: dayjs(item.ultimoLogin).format('DD/MM/YYYY'),
          }
        })

        this.users.set(arr)
        this.setDataExport()
        this.isLoading.set(false)

      },
      error: err => {
        console.log(err)
        this.isLoading.set(false)
      }
    })
  }

  addUser() {
    this.isBtnAddLoading.set(true)

    this.formUser.patchValue({
      dataVencimento: dayjs(this.formUser.get('dataVencimento')?.value).utc(true).format(),
    })

    console.log(this.formUser.value)

    this.apiService.registerUser(this.formUser.value).subscribe({
      next: res => {
        this.messageService.add({ severity: 'success', summary: 'Usuário adicionado com sucesso!' })
        this.formUser.reset()
        this.isBtnAddLoading.set(false)
        this.modal = false
      },
      error: err => {
        this.isBtnAddLoading.set(false)
        this.messageService.add({ severity: 'warn', summary: err.error })
        console.log('❌', err)
      },
    })
  }

  updateUser() {
    this.isBtnAddLoading.set(true)

    this.formUser.patchValue({
      dataVencimento: dayjs(this.formUser.get('dataVencimento')?.value).utc(true).format(),
    })

    const body = {
      ...this.formUser.value,
      id: this.selectedId(),
    }
    delete body.password

    this.apiService.updateUser(this.selectedId(), body, this.imagePreview).subscribe({
      next: res => {
        this.messageService.add({ severity: 'success', summary: 'Usuário alterado com sucesso!' })
        this.isBtnAddLoading.set(false)
        this.modal = false
        this.closeModal()
      },
      error: err => {
        this.isBtnAddLoading.set(false)
        this.messageService.add({ severity: 'warn', summary: err.error })
        this.closeModal()
      },
    })
  }

  deleteUsers(event: Event, user: any) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente o usuário ${user.nome.toUpperCase()}?`,
      header: 'Excluir usuário',
      icon: 'pi pi-exclamation-circle text-3xl',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptIcon: 'none',
      rejectIcon: 'none',
      defaultFocus: 'none',

      accept: () => {
        this.isLoading.set(true)

        this.apiService.deleteUser(user.id!).subscribe({
          next: res => {
            this.messageService.add({
              severity: 'success',
              summary: 'Usuário excluído com sucesso!',
            })

            this.getUsers()
          },
          error: err => {
            this.messageService.add({
              severity: 'error',
              summary: 'Não foi possível excluir o usuário.',
            })
          },
        })
      },
    })
  }

  deleteSelectedItems(event: Event, user: any[] | null) {
    const text = user!.length > 1 ? 'usuários' : 'usuário'

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente ${user?.length} ${text}?`,
      header: 'Excluir usuários selecionados',
      icon: 'pi pi-exclamation-circle text-3xl',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptIcon: 'none',
      rejectIcon: 'none',
      defaultFocus: 'none',

      accept: () => {
        const arr = user?.map(item => this.apiService.deleteUser(item.id!))

        this.isLoading.set(true)

        forkJoin(arr!).subscribe({
          next: res => {
            this.messageService.add({
              severity: 'success',
              summary: 'Usuários selecionados excluídos com sucesso!',
            })

            this.getUsers()
            this.selectedItems = null
          },
          error: err => {
            this.messageService.add({
              severity: 'error',
              summary: 'Não foi possível excluir os usuários selecionados.',
            })
            this.getUsers()
            this.selectedItems = null
          },
        })
      },
    })
  }

  selectDateType() {

    if (this.rangeDates) {
      this.getUsers()
    }
  }

  onClearStatus() {
    this.selectedStatus = []
    this.getUsers()
  }

  openModal() {
    this.headerModal.set('Adicionar novo usuário')
    this.isBtnAdd.set(true)
    this.showPassword.set(true)
    this.modal = true
    this.isBtnReset.set(false)
  }

  openUpdateModal(e: Event, user: any) {
    this.headerModal.set('Alterar usuário')
    this.selectedId.set(user.id)
    this.isBtnAdd.set(false)
    this.showPassword.set(false)
    this.isBtnReset.set(true)
    this.formUser.get('password')?.setValidators([])
    this.formUser.get('password')?.updateValueAndValidity()

    this.imagePreview = user.imagemPerfilURL

    this.formUser.patchValue({
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      apelido: user.apelido,
      perfil: user.perfil,
      dataVencimento: dayjs(user.dataVencimento, 'DD/MM/YYYY').toDate(),
      status: user.status,
      imagemPerfil: user.imagemPerfil
    })

    this.selectedEmail.set(user.email)

    this.modal = true
  }

  closeModal() {
    this.getUsers()
    this.formUser.reset()
    this.modal = false
    this.resetFile()
  }

  resetFile() {
    this.file.nativeElement.value = ''
    this.imagePreview = null
  }

  resetPassword() {
    this.isResetLoading.set(true)
    this.resetText.set('')

    const email = { email: this.selectedEmail() }

    this.apiService.forgotPassword(email).subscribe({
      next: res => {
        this.isResetLoading.set(false)
        this.resetText.set('Link de recuperação enviado com sucesso.')
      },
      error: err => {
        this.resetText.set('')
        this.isResetLoading.set(false)
        this.resetText.set('Erro ao enviar link de recuperação. Tente novamente mais tarde.')
      }
    })
  }

  setDataExport() {
    const data = this.users().map(item => {
      return {
        "Id": item.id,
        "Nome": item.nome,
        "E-mail": item.email,
        "Telefone": item.telefone,
        "Apelido": item.apelido,
        "Perfil": item.perfil,
        "Data de criação": item.dataCriacao,
        "Vencimento": item.dataVencimento,
        "Último login": item.ultimoLogin,
        "Staus": item.status,
      }
    })

    this.exportCols.set(
      [
        { width: 5 }, // Id
        { width: 30 }, // Nome
        { width: 35 }, // E-mail
        { width: 18 }, // Telefone
        { width: 25 }, // Apelido
        { width: 15 }, // Perfil
        { width: 15 }, // Data de criação
        { width: 12 }, // Vencimento
        { width: 12 }, // Último login
        { width: 10 }, // Status
      ]
    )
    this.exportData.set(data)
  }


  validateFile(control: AbstractControl): { [key: string]: any } | null {
    const file = control.value;
    console.log("Valiidation")
    if (!file) {
      return null;
    }

    const maxSizeMB = 2;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (file.size > maxSizeMB * 1024 * 1024) {
      return { fileSize: true };
    }

    if (!allowedTypes.includes(file.type)) {
      return { fileType: true };
    }

    return null;
  }

  onUpload(event: any) {

    const fileInput = event.target as HTMLInputElement

    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0]

      this.formUser.patchValue({ imagemPerfil: file });
      this.formUser.get('imagemPerfil')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
    console.log(this.imagePreview)
  }

}
