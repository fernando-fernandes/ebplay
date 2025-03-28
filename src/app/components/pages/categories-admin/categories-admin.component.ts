import { Component, inject, OnInit, signal } from '@angular/core'
import { PageTitleComponent } from '../../../shared/page-title/page-title.component'
import { ContentComponent } from '../../../shared/content/content.component'
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { DialogModule } from 'primeng/dialog'
import { CommonModule } from '@angular/common'
import { TableModule } from 'primeng/table'
import { InputTextModule } from 'primeng/inputtext'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { ToastModule } from 'primeng/toast'
import { ConfirmationService, Message, MessageService } from 'primeng/api'
import { ApiService } from '../../../services/api.service'
import { forkJoin, share, shareReplay } from 'rxjs'
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader'
import { IconFieldModule } from 'primeng/iconfield'
import { InputIconModule } from 'primeng/inputicon'
import { TipoCategoria } from '../../../models/model'
import { DropdownModule } from 'primeng/dropdown'
import { ExportTableComponent } from '../../../shared/export-table/export-table.component'

@Component({
  selector: 'app-categories-admin',
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
    DropdownModule,
    ExportTableComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './categories-admin.component.html',
  styleUrl: './categories-admin.component.scss',
})
export class CategoriesAdminComponent implements OnInit {

  private apiService = inject(ApiService)
  private messageService = inject(MessageService)
  private confirmationService = inject(ConfirmationService)

  categories = signal<any[]>([])
  search = signal('')
  selectedCategories!: any[] | null
  modal = false
  isLoading = signal(false)
  isBtnAddLoading = signal(false)
  headerModal = signal('')
  selectedId = signal<any>(null)
  isBtnAdd = signal(true)
  tipoCategoria: TipoCategoria[] = ['Arquivo', 'Aula', 'ItemCalendario', 'Noticia', 'Pergunta']

  exportData = signal<any[]>([])
  exportFileName = signal<string>('Gestão de categorias')
  exportCols = signal<any[]>([])

  formCategory = new UntypedFormGroup({
    nome: new FormControl('', { validators: Validators.required, nonNullable: true }),
    tipoCategoria: new FormControl('', { validators: Validators.required, nonNullable: true }),
  })

  ngOnInit(): void {
    this.getCategories()
  }

  getCategories() {
    this.isLoading.set(true)

    this.apiService.getCategories().subscribe({
      next: res => {
        console.log(res)
        this.categories.set(res.data)
        this.search.set('')
        this.setDataExport()
        this.isLoading.set(false)
      },
      error: err => {
        console.log(err)
        this.isLoading.set(false)
      }
    })
  }

  addCategory() {
    this.isBtnAddLoading.set(true)

    console.log(this.formCategory.value)


    this.apiService.addCategory(this.formCategory.value).subscribe({
      next: res => {
        console.log(res)
        this.messageService.add({ severity: 'success', summary: 'Categoria adicionada com sucesso!' })
        this.formCategory.reset()
        this.isBtnAddLoading.set(false)
      },
      error: err => {
        this.isBtnAddLoading.set(false)
        this.messageService.add({ severity: 'warn', summary: err.error })
        console.log('❌', err)
      }
    })

  }

  updateCategory() {
    this.isBtnAddLoading.set(true)

    const body = {
      ...this.formCategory.value,
      id: this.selectedId()
    }

    this.apiService.updateCategory(this.selectedId(), body).subscribe({
      next: res => {
        this.messageService.add({ severity: 'success', summary: 'Categoria alterada com sucesso!' })
        this.isBtnAddLoading.set(false)
        this.modal = false
      },
      error: err => {
        this.isBtnAddLoading.set(false)
        this.messageService.add({ severity: 'warn', summary: err.error })
      }

    })
  }

  deleteCategory(event: Event, category: any) {

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente a categoria ${category.nome.toUpperCase()}?`,
      header: 'Excluir categoria',
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

        this.apiService.deleteCategory(category.id!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Categoria excluída com sucesso!' })

            this.getCategories()
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir a categoria.' })
          }
        })
      }
    })
  }

  deleteSelectedCategories(event: Event, categories: any[] | null) {

    const textCategory = categories!.length > 1 ? 'categorias' : 'categoria'

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja excluir permanentemente ${categories?.length} ${textCategory}?`,
      header: 'Excluir categorias selecionadas',
      icon: 'pi pi-exclamation-circle text-3xl',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptIcon: "none",
      rejectIcon: "none",
      defaultFocus: 'none',

      accept: () => {

        const arr = categories?.map(item => this.apiService.deleteCategory(item.id!))

        this.isLoading.set(true)

        forkJoin(arr!).subscribe({
          next: res => {
            this.messageService.add({ severity: 'success', summary: 'Categorias selecionadas excluídas com sucesso!' })

            this.getCategories()
            this.selectedCategories = null
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Não foi possível excluir as categorias selecionadas.' })

            this.getCategories()
            this.selectedCategories = null
          }
        })

      }
    })

  }

  openAddModal() {
    this.headerModal.set('Adicionar nova categoria')
    this.isBtnAdd.set(true)
    this.modal = true
  }

  openUpdateModal(e: Event, category: any) {
    this.headerModal.set('Alterar categoria')
    this.formCategory.setValue({ nome: category.nome, tipoCategoria: category.tipoCategoria })
    this.selectedId.set(category.id)
    this.isBtnAdd.set(false)
    this.modal = true
    console.log(this.selectedId())
  }

  closeModal() {
    this.getCategories()
    this.formCategory.reset()
    this.modal = false
  }

  setDataExport() {
    const data = this.categories().map(item => {
      return {
        "Id": item.id,
        "Nome": item.nome,
        "Tipo Categoria": item.tipoCategoria,
      }
    })

    this.exportCols.set(
      [
        { width: 10 }, // Id
        { width: 35 }, // Nome
        { width: 30 }, // Tipo Categoria
      ]
    )
    this.exportData.set(data)
  }

}
