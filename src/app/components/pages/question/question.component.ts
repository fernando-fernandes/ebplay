import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { PageTitleComponent } from '../../../shared/page-title/page-title.component'
import { ContentComponent } from '../../../shared/content/content.component'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { ApiService } from '../../../services/api.service'

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import { TruncatePipe } from '../../../pipes/truncate.pipe'
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader'
import { FormControl, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms'
import { ToastModule } from 'primeng/toast'
import { DialogModule } from 'primeng/dialog'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { CheckboxModule } from 'primeng/checkbox'
import { ConfirmationService, MessageService } from 'primeng/api'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { LastNewsComponent } from "../../../shared/last-news/last-news.component"
import { BackButtonComponent } from "../../../shared/back-button/back-button.component"

dayjs.extend(utc)
dayjs.extend(customParseFormat)

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [
    CommonModule,
    PageTitleComponent,
    ContentComponent,
    ButtonModule,
    RippleModule,
    //TruncatePipe,
    NgxSkeletonLoaderModule,
    RouterModule,
    ReactiveFormsModule,
    ToastModule,
    DialogModule,
    ConfirmDialogModule,
    CheckboxModule,
    InputTextareaModule,
    LastNewsComponent
    //BackButtonComponent,
    //BackButtonComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss',
})
export class QuestionComponent implements OnInit {
  private messageService = inject(MessageService)
  private confirmationService = inject(ConfirmationService)

  private route = inject(ActivatedRoute)
  private apiService = inject(ApiService)

  paramID = this.route.snapshot.paramMap.get('id')
  question = signal<any>({})
  answers = signal<any[]>([])
  news = signal<any[]>([])
  modal = false
  isBtnAddLoading = signal(false)
  headerModal = signal('')
  isBtnAdd = signal(true)
  questionsLoading = signal(false)
  answersLoading = signal(false)
  newsLoading = signal(false)
  user = signal<any>({})

  formAnswer = new UntypedFormGroup({
    texto: new FormControl('', { validators: Validators.required, nonNullable: true }),
    destaque: new FormControl(false, { nonNullable: true }),
  })

  ngOnInit(): void {
    this.getQuestion()
    this.getAnswers()
    this.getAllNews()
    this.getUser()
  }

  getQuestion() {

    this.questionsLoading.set(true)

    this.apiService.getQuestion(parseInt(this.paramID!)).subscribe({
      next: (res: any) => {
        console.log(res)

        const obj = {
          ...res,
          dataCriacao: dayjs(res.dataCriacao).format('DD/MM/YYYY HH:mm'),
        }

        this.question.set(obj)
        this.questionsLoading.set(false)
      },
      error: err => {
        this.questionsLoading.set(false)
      },

    })
  }

  getAnswers() {
    this.answersLoading.set(true)

    this.apiService.getAnswersFromQuestionId(parseInt(this.paramID!)).subscribe({
      next: (res: any) => {
        console.log(res.data)

        const arr = res.data.map((item: any) => {
          return {
            ...item,
            dataCriacao: dayjs(item.dataCriacao).format('DD/MM/YYYY hh:mm'),
          }
        })

        this.answers.set(arr)
        this.answersLoading.set(false)
      },
      error: err => {
        this.answersLoading.set(false)
      },
    })
  }

  getAllNews() {
    this.newsLoading.set(true)

    const params = {
      page: 1,
      pageSize: 10,
    }

    this.apiService.getAllNews(params).subscribe({
      next: res => {
        this.news.set(res.data)
        this.newsLoading.set(false)
      },
      error: err => {
        console.log(err)
        this.newsLoading.set(false)
      },
    })
  }

  addAnswers() {
    this.isBtnAddLoading.set(true)

    const body = {
      ...this.formAnswer.value,
      perguntaId: this.paramID
    }

    console.log(body)

    this.apiService.addAnswer(body).subscribe({
      next: res => {
        console.log(res)
        this.messageService.add({ severity: 'success', summary: 'Resposta adicionada com sucesso!' })
        this.formAnswer.reset()
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

  closeModal() {
    this.getAnswers()
    this.formAnswer.reset()
    this.modal = false
  }

  openModal() {
    this.getUser();
    if (this.user().perfil.toLowerCase() != 'professor') {
      this.modal = true;
      return;
    }
    this.confirmationService.confirm({
      message: 'Deseja reservar a pergunta por 10 minutos para que outros professores não respondam?',
      header: 'Confirmação',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: ' p-button p-button-sm p-button-primary',
      rejectButtonStyleClass: 'p-button p-component p-button-secondary p-button-text p-button-sm',
      accept: () => {
        this.answerQuestion();
      },
      reject: () => {
        this.modal = true;
      }
    });
  }

  hasReference() {
    return this.question().noticiaId || this.question().aulaId;
  }

  showLink() {
    ;
    if (this.question().noticiaId) {
      window.open(`/news/${this.question().noticiaId}`, '_blank');
    } else if (this.question().aulaId) {
      window.open(`/class/${this.question().aulaId}`, '_blank');
    }
  }

  answerQuestion() {
    let perguntaId
    perguntaId = {
      perguntaId: this.paramID
    }
    this.apiService.bookQuestion(parseInt(this.paramID!)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Pergunta reservada com sucesso!' })
        this.modal = true;
      },
      error: (err) => {
        this.messageService.add({ severity: 'warn', summary: err.error })
        console.error('Erro ao reservar:', err);
      }
    });
  }

  confirmDelete(resposta: any) {
    this.confirmationService.confirm({
      message: `Deseja realmente excluir permanentemente a resposta: "${(resposta.texto.length > 50 ? resposta.texto.substring(0, 50) + '...' : resposta.texto)}"?`,
      header: 'Excluir respota',
      icon: 'pi pi-exclamation-circle text-3xl',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptIcon: 'none',
      rejectIcon: 'none',
      defaultFocus: 'none',
      accept: () => {
        this.deleteAnswer(resposta?.id);

      }
    });
  }

  deleteAnswer(id: number) {

    this.apiService.deleteAnswer(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Resposta excluída com sucesso!' });
        this.getAnswers()

      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: err });
      }
    });
  }

  getUser() {
    if (!!localStorage.getItem('user')) {
      this.user.set(JSON.parse(localStorage.getItem('user')!))
    }
    console.log('Usuarioteste', this.user())
    console.log('localStorage', localStorage.getItem('user'))
  }


}
