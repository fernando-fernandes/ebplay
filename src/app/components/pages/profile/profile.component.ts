import { ChangeDetectorRef, Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core'
import { ContentComponent } from "../../../shared/content/content.component"
import { CommonModule } from '@angular/common'
import { AbstractControl, FormArray, FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms'
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
import { TableModule } from 'primeng/table'
import { NotificationService } from '../../../services/notification.service'

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
    RouterModule,
    TableModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  private apiService = inject(ApiService)
  private messageService = inject(MessageService)
  private utilsService = inject(UtilsService)
  private notificationService = inject(NotificationService)

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

  actionNotification = [
    { id: 0, nome: 'NewQuestion', descricao: 'Novas perguntas', whatsApp: true, email: true, push: true },
    { id: 1, nome: 'NewAnswer', descricao: 'Novas respostas', whatsApp: true, email: true, push: true },
    { id: 2, nome: 'NewFile', descricao: 'Novos arquivos', whatsApp: true, email: true, push: true },
    { id: 3, nome: 'NewCalendarItem', descricao: 'Novos itens no calendário', whatsApp: true, email: true, push: true },
    { id: 4, nome: 'NewNews', descricao: 'Novas notícias', whatsApp: true, email: true, push: true },
    { id: 5, nome: 'NewClasses', descricao: 'Novas aulas', whatsApp: true, email: true, push: true }
  ];

  formPreferences = new UntypedFormGroup({
    action: new FormArray(this.actionNotification.map(action =>
      new UntypedFormGroup({
        id: new FormControl(action.id),
        whatsApp: new FormControl(action.whatsApp),
        email: new FormControl(action.email),
        push: new FormControl(action.push)
      })
    ))
  });


  ngOnInit(): void {
    this.getUser()
  }

  get actionControls() {
    return (this.formPreferences.get('action') as FormArray).controls;
  }

  getFormControl(index: number, field: string): FormControl {
    return (this.actionControls[index].get(field) as FormControl);
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

        this.getPreferenceNotification();

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

  getPreferenceNotification() {
    this.isLoading.set(true)
    this.notificationService.getPreferences(this.user().id).subscribe({
      next: (res: any) => {
        console.log('res', res)
        this.setActionPreferences(res);

        this.isLoading.set(false)
      },
      error: err => {
        console.log(err)
        this.isLoading.set(false)
      }
    })
  }

  setPreferences(res: any) {
    this.isLoading.set(true)
    if (res.length > 0) {
      const actionArray = this.formPreferences.get('action') as FormArray;

      res.forEach((preference: any) => {
        const index = this.actionNotification.findIndex(action => action.nome === preference.action);
        if (index !== -1) {
          actionArray.at(index).patchValue({
            whatsApp: preference.whatsApp,
            email: preference.email,
            push: preference.pushNotification
          });
        }
      });

      console.log('Estado final do formPreferences:   ', this.formPreferences.value)
    }
    this.isLoading.set(false)

  }

  setActionPreferences(res: any) {
    console.log('res', res)

    // Atualizar actionNotification com base no response recebido
    this.actionNotification = this.actionNotification.map(action => {
      // Encontrar a preferência correspondente no response
      const preference = res.find((p: any) => p.action === action.nome);

      // Se encontrou a preferência correspondente, atualiza os valores
      if (preference) {

        return {
          ...action,
          whatsApp: preference.whatsApp,
          email: preference.email,
          push: preference.pushNotification
        };
      }

      // Se não encontrou, mantém os valores originais
      return action;
    });

    this.setPreferences(res);

  }

  postPreferences(index: number) {
    this.isLoading.set(true)
    const actionArray = this.formPreferences.get('action') as FormArray;

    const control = actionArray.at(index) as UntypedFormGroup;

    const body = [{
      action: this.actionNotification.find(action => action.id === control.get('id')?.value)?.nome || '',
      whatsApp: control.get('whatsApp')?.value,
      email: control.get('email')?.value,
      pushNotification: control.get('push')?.value
    }];
    console.log(body)
    this.notificationService.postPreference(this.user().id, body).subscribe({
      next: (res: any) => {
        this.setPreferences(res);
        this.isLoading.set(false)
        this.messageService.add({ severity: 'success', summary: 'Preferências de notificações alteradas com sucesso!' })

      },
      error: err => {
        console.log(err)
        this.isLoading.set(false)
      }
    })


    console.log(body);
    this.isLoading.set(false);
  }
}
