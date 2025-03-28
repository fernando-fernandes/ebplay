import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { concatMap, of, tap } from 'rxjs'
import { ApiService } from '../../../services/api.service'
import { TipoCategoria } from '../../../models/model'
import { DropdownModule } from 'primeng/dropdown'

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'
import { BackButtonComponent } from "../../../shared/back-button/back-button.component"
import { ConfirmationService, MessageService } from 'primeng/api'
import { ConfirmDialogModule } from 'primeng/confirmdialog'

dayjs.extend(utc)
dayjs.extend(customParseFormat)
dayjs.extend(relativeTime)
dayjs.extend(updateLocale)

dayjs.updateLocale('en', {
  relativeTime: {
    future: "em %s",
    past: "%s atrás",
    s: 'há alguns segundos',
    m: "há um minuto",
    mm: "há %d minutos",
    h: "há uma hora",
    hh: "há %d horas",
    d: "há um dia",
    dd: "há %d dias",
    M: "há um mês",
    MM: "há %d meses",
    y: "há um ano",
    yy: "há %d anos"
  }
})

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule,
    FormsModule,
    DropdownModule,
    ConfirmDialogModule,
    BackButtonComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.scss'
})
export class NewsDetailComponent implements OnInit {

  private route = inject(ActivatedRoute)
  private apiService = inject(ApiService)
  private confirmationService = inject(ConfirmationService)
  private messageService = inject(MessageService)

  news = signal<any>({})
  questions = signal<any[]>([])
  paramID = this.route.snapshot.paramMap.get('id')
  enunciado = signal('')
  user = signal<any>({})
  categorias = signal<any[]>([])
  selectedCategory: any = ''


  ngOnInit(): void {
    this.getData(this.paramID)
    this.getUser()
    this.getCategories()
  }

  getUser() {
    if (!!localStorage.getItem('user')) {
      this.user.set(JSON.parse(localStorage.getItem('user')!))
    }
  }

  getData(paramaID: any) {

    this.apiService.getNewsById(parseInt(paramaID)).pipe(
      tap(res => this.news.set(res)),
      concatMap(() => of(this.getQuestions(paramaID)))
    )
      .subscribe({
        next: res => {
          // this.questions.set(res.data)
        },
        error: err => {

        }
      })
  }

  getQuestions(paramaID: any) {
    this.apiService.getQuestions({ NoticiaId: paramaID })
      .subscribe({
        next: res => {
          const arr = res.data.map((item: any) => {

            const respostas = item.respostas.map((resp: any) => {
              return {
                ...resp,
                dataCriacao: dayjs(item.dataCriacao).fromNow(true)
              }
            })

            return {
              ...item,
              dataCriacao: dayjs(item.dataCriacao).format('DD/MM/YYYY HH:mm'),
              //dataCriacao: dayjs(item.dataCriacao).fromNow(true),
              respostas: respostas
            }
          })


          this.questions.set(arr)
          console.log(arr)

        },
        error: err => {

        }
      })
  }

  getCategories() {

    const tipo: TipoCategoria = 'Pergunta'

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

  addQuestion() {

    const body = {
      enunciado: this.enunciado(),
      categoriaId: this.selectedCategory,
      noticiaId: this.paramID
    }

    this.apiService.addQuestion(body).subscribe({
      next: res => {
        console.log(res)
        this.getQuestions(this.paramID)
        this.enunciado.set('')
        this.selectedCategory = ''
      },
      error: err => {
        console.log(err)
      }
    })
  }

  updateAnswer(id: any) {

    console.log(id)

  }


  confirmDeleteAnswer(resposta: any) {
    this.confirmationService.confirm({
      message: `Deseja realmente excluir a resposta: "${(resposta.texto.length > 50 ? resposta.texto.substring(0, 50) + '...' : resposta.texto)}"?`,
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
        this.getData(this.paramID)
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: err });
      }
    });
  }

}
