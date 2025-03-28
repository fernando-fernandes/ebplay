import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core'
import { ContentComponent } from "../../../shared/content/content.component"
import { CommonModule } from '@angular/common'
import { AbstractControl, FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms'
import { ApiService } from '../../../services/api.service'
import { ConfirmationService, MessageService } from 'primeng/api'
import { InputTextModule } from 'primeng/inputtext'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { DialogModule } from 'primeng/dialog'
import { CheckboxModule } from 'primeng/checkbox'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { ToastModule } from 'primeng/toast'
import { DropdownModule } from 'primeng/dropdown'
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader'
import { InputMaskModule } from 'primeng/inputmask'
import { UtilsService } from '../../../services/utils.service'
import { RouterModule } from '@angular/router'

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ContentComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    RippleModule,
    DialogModule,
    CheckboxModule,
    ConfirmDialogModule,
    ToastModule,
    DropdownModule,
    InputMaskModule,
    NgxSkeletonLoaderModule,
    RouterModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  private apiService = inject(ApiService)
  private messageService = inject(MessageService)
  private utilsService = inject(UtilsService)
  private confirmationService = inject(ConfirmationService)

  @ViewChild('file') file!: ElementRef

  imagePreview: string | null = null;
  erro = signal('')
  user = signal<any>({})
  firstName = signal('')
  lastName = signal('')
  modal = signal(false)
  isLoading = signal(false)
  isBtnAddLoading = signal(false)
  headerModal = signal('')
  modalTermo = signal(false)
  termo = this.utilsService.termo

  form = new UntypedFormGroup({
    nome: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { validators: [Validators.required, Validators.email], nonNullable: true }),
    apelido: new FormControl('', { nonNullable: true }),
    telefone: new FormControl('', { nonNullable: true }),
    perfil: new FormControl('', { nonNullable: true }),
    imagemPerfil: new FormControl(null, [this.validateFile]),
  })

  ngOnInit(): void {
    this.getUser()
  }

  getUser() {
    this.isLoading.set(true)
    this.apiService.getManageInfo().subscribe({
      next: (res: any) => {
        this.user.set(res)
        localStorage.setItem('user', JSON.stringify(res))

        this.imagePreview = this.user().imagemPerfilURL;
        const name = res.nome.split(' ')

        this.firstName.set(name[0])
        this.lastName.set(name[name.length - 1])
        this.isLoading.set(false)
      },
      error: err => {
        console.log(err)
        this.isLoading.set(false)
      }
    })
  }

  updateUser() {
    this.isBtnAddLoading.set(true)

    const body = {
      ...this.form.value,
      id: this.user().id,
    }

    this.apiService.postManageInfoWitchImage(body, this.imagePreview).subscribe({
      next: res => {
        this.messageService.add({ severity: 'success', summary: 'Informações alteradas com sucesso!' })
        this.isBtnAddLoading.set(false)
        this.getUser()
        this.closeModal()
      },
      error: err => {
        this.isBtnAddLoading.set(false)
        this.messageService.add({ severity: 'warn', summary: err.error })
      }
    })
  }

  openUpdateModal() {
    this.headerModal.set('Editar informações')
    this.form.patchValue(this.user())
    this.modal.set(true)
    this.imagePreview = this.user().imagemPerfilURL
  }

  closeModal() {
    this.modal.set(false);
    this.resetFile()
  }

  resetFile() {
    this.file.nativeElement.value = ''
    this.imagePreview = null
    this.form.patchValue({ imagemPerfil: null })
    this.form.get('imagemPerfil')?.updateValueAndValidity()
  }

  openModalTermo() {
    this.modalTermo.set(true)
  }


  validateFile(control: AbstractControl): { [key: string]: any } | null {
    const file = control.value;

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

      this.form.patchValue({ imagemPerfil: file });
      this.form.get('imagemPerfil')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
    console.log(this.imagePreview)
  }

}
