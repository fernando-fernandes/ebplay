import { Component, inject, OnInit, signal } from '@angular/core'
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular'
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader'
import { ButtonModule } from 'primeng/button'
import { CalendarModule } from 'primeng/calendar'
import { CheckboxModule } from 'primeng/checkbox'
import { ChipsModule } from 'primeng/chips'
import { DropdownModule } from 'primeng/dropdown'
import { IconFieldModule } from 'primeng/iconfield'
import { InputIconModule } from 'primeng/inputicon'
import { InputTextModule } from 'primeng/inputtext'
import { RippleModule } from 'primeng/ripple'
import { TableModule } from 'primeng/table'
import { TagModule } from 'primeng/tag'
import { ToastModule } from 'primeng/toast'

@Component({
  selector: 'app-terms-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    CKEditorModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './terms-popup.component.html',
  styleUrl: './terms-popup.component.scss',
})
export class TermsPopupComponent implements OnInit {
  modal: boolean = false;
  termsVersion = '1.0.0';
  headerModal = signal('');
  isBtnAdd = signal(true);
  isBtnAddLoading = signal(false);

  private apiService = inject(ApiService)

  classes = signal<any[]>([])
  search = signal('')
  rangeDates: Date[] | undefined
  selectedItems!: any[] | null
  isLoading = signal(false)
  selectedId = signal<any>(null)
  categorias = signal<any[]>([])
  exportData = signal<any[]>([])
  exportFileName = signal<string>('Gestão-Live-e-Imersões')
  exportCols = signal<any[]>([])

  formClass = new UntypedFormGroup({
  })

  ngOnInit() {
    this.isBtnAddLoading.set(true);
    this.apiService.checkTermsStatus().subscribe(response => {
      if (!response.accepted || response.termsVersion !== this.termsVersion) {
        this.modal = true;
        this.headerModal.set('Aceite dos Termos e Condições da Plataforma');
        this.isBtnAdd.set(true);
        this.isBtnAddLoading.set(false);
      }
    });
  }

  acceptTerms() {
    this.isBtnAddLoading.set(true);
    this.apiService.acceptTerms(this.termsVersion).subscribe(() => {
      this.modal = false;
      this.isBtnAddLoading.set(false);
    });
  }

  closePopup() {
    this.modal = false;
    this.isBtnAddLoading.set(false);
  }
}
