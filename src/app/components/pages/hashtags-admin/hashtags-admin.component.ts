import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms'
import { PageTitleComponent } from '../../../shared/page-title/page-title.component'
import { ContentComponent } from '../../../shared/content/content.component'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { DialogModule } from 'primeng/dialog'
import { TableModule } from 'primeng/table'
import { InputTextModule } from 'primeng/inputtext'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { ToastModule } from 'primeng/toast'
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader'
import { IconFieldModule } from 'primeng/iconfield'
import { InputIconModule } from 'primeng/inputicon'
import { ApiService } from '../../../services/api.service'
import { ConfirmationService, MessageService } from 'primeng/api'
import { forkJoin } from 'rxjs'
import { ExportTableComponent } from '../../../shared/export-table/export-table.component'

@Component({
  selector: 'app-hashtags-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageTitleComponent,
    ContentComponent,
    ButtonModule,
    RippleModule,
    DialogModule,
    TableModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    NgxSkeletonLoaderModule,
    IconFieldModule,
    InputIconModule,
    ExportTableComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './hashtags-admin.component.html',
  styleUrl: './hashtags-admin.component.scss'
})
export class HashtagsAdminComponent implements OnInit {

  private apiService = inject(ApiService)
  private messageService = inject(MessageService)
  private confirmationService = inject(ConfirmationService)

  hashtags = signal<any[]>([])
  search = signal('')
  selectedHashtags!: any[] | null
  modal = false
  isLoading = signal(false)
  isBtnAddLoading = signal(false)
  headerModal = signal('')
  selectedId = signal<any>(null)
  isBtnAdd = signal(true)
  exportData = signal<any[]>([])
  exportFileName = signal<string>('Gestão de hashtags')
  exportCols = signal<any[]>([])

  formHashtag = new UntypedFormGroup({
    nome: new FormControl('', [Validators.required]),
  })

  ngOnInit(): void {
    this.getHashtags()
  }

  getHashtags() {
    this.isLoading.set(true)

    this.apiService.getHashtags().subscribe({
      next: res => {
        console.log(res)
        this.hashtags.set(res.data)
        this.search.set('')
        this.setDataExport()
        this.isLoading.set(false)
      },
      error: err => {
        this.isLoading.set(false)
        console.log(err)
      }
    })

  }

  addHashtag() {
    this.isBtnAddLoading.set(true)

    this.apiService.addHashtag(this.formHashtag.value).subscribe({
      next: res => {
        console.log(res)
        this.messageService.add({ severity: 'success', summary: 'Hashtag adicionada com sucesso!' })
        this.formHashtag.reset()
        this.isBtnAddLoading.set(false)
      },
      error: err => {
        this.isBtnAddLoading.set(false)
        this.messageService.add({ severity: 'warn', summary: err.error })
        console.log('❌', err)
      }
    })
  }

  updateHahstag() {
    this.isBtnAddLoading.set(true)

    const body = {
      ...this.formHashtag.value,
      id: this.selectedId()
    }

    this.apiService.updateHashtag(this.selectedId(), body).subscribe({
      next: res => {
        this.messageService.add({ severity: 'success', summary: 'Hashtag alterada com sucesso!' })
        this.isBtnAddLoading.set(false)
        this.modal = false
      },
      error: err => {
        this.isBtnAddLoading.set(false)
        this.messageService.add({ severity: 'warn', summary: err.error })
      }
    })
  }

  deleteHashtag(event: Event, hashtag: any) {

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente a hashtag ${hashtag.nome.toUpperCase()}?`,
      header: 'Excluir hashtag',
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

        this.apiService.deleteHashtag(hashtag.id!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Hashtag excluída com sucesso!' })

            this.getHashtags()
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir a hashtag.' })
          }
        })
      }
    })
  }

  deleteSelectedHashTags(event: Event, hashtags: any[] | null) {
    const textHashtag = hashtags!.length > 1 ? 'hashtags' : 'hashtag'

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente ${hashtags?.length} ${textHashtag}?`,
      header: 'Excluir hashtags selecionadas',
      icon: 'pi pi-exclamation-circle text-3xl',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptIcon: "none",
      rejectIcon: "none",
      defaultFocus: 'none',

      accept: () => {

        const arr = hashtags?.map(item => this.apiService.deleteHashtag(item.id!))

        this.isLoading.set(true)

        forkJoin(arr!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Hashtags selecionadas excluídas com sucesso!' })

            this.getHashtags()
            this.selectedHashtags = null
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir as hashtags selecionadas.' })
            this.getHashtags()
            this.selectedHashtags = null
          }
        })

      }
    })

  }

  openModal() {
    this.headerModal.set('Adicionar nova hahstag')
    this.isBtnAdd.set(true)
    this.modal = true
  }

  openUpdateModal(e: Event, hashtag: any) {
    this.headerModal.set('Alterar hashtag')
    this.formHashtag.setValue({ nome: hashtag.nome })
    this.selectedId.set(hashtag.id)
    this.isBtnAdd.set(false)

    this.modal = true
  }

  closeModal() {
    this.getHashtags()
    this.formHashtag.reset()
    this.modal = false
  }

  setDataExport() {
    const data = this.hashtags().map(item => {
      return {
        "Id": item.id,
        "Nome": item.nome,
      }
    })

    this.exportCols.set(
      [
        { width: 5 }, // Id
        { width: 35 }, // Nome
      ]
    )
    this.exportData.set(data)
  }

}
