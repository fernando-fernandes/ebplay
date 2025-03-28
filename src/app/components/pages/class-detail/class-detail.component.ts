import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { SanitizeURLPipe } from '../../../pipes/sanitize-url.pipe'
import { ApiService } from '../../../services/api.service'
import { BackButtonComponent } from "../../../shared/back-button/back-button.component"
import { YoutubePlayerComponent } from 'ngx-youtube-player'
import { TipoCategoria } from '../../../models/model'

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'
import { DropdownModule } from 'primeng/dropdown'
import { ConfirmationService, MessageService } from 'primeng/api'
import { CommunityQuestionsComponent } from '../../../shared/community-questions/community-questions.component'



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
  selector: 'app-class-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule,
    FormsModule,
    DropdownModule,
    // SanitizeURLPipe,
    BackButtonComponent,
    BackButtonComponent,
    YoutubePlayerComponent,
    CommunityQuestionsComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './class-detail.component.html',
  styleUrl: './class-detail.component.scss'
})
export class ClassDetailComponent {
  private route = inject(ActivatedRoute)
  private apiService = inject(ApiService)
  private messageService = inject(MessageService)
  private confirmationService = inject(ConfirmationService)

  user = signal<any>({})
  class = signal<any>({})
  paramID = this.route.snapshot.paramMap.get('id')
  categorias = signal<any[]>([])
  selectedCategory: any = ''
  enunciado = signal('')
  questions = signal<any[]>([])
  isBtnAddLoading = signal(false)

  player!: YT.Player
  videoId = signal<any>('')

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

  getData(paramaID: any) {

    this.apiService.getClass(parseInt(paramaID))
      .subscribe({
        next: res => {

          console.log('➡️  res: ', res)

          if (res.linkVideo.includes('youtube.com')) {
            const index = res.linkVideo.indexOf('?')
            const searchParams = new URLSearchParams(res.linkVideo.substring(index))
            this.videoId.set(searchParams.get('v'))
            this.class.set({
              ...res,
              linkVideo: `https://www.youtube.com/embed/${searchParams.get('v')}`
            })
          } else if (res.linkVideo.includes('youtu.be')) {
            const videoId = res.linkVideo.split('/').pop().split('?')[0]
            this.videoId.set(videoId)
            this.class.set({
              ...res,
              linkVideo: `https://www.youtube.com/embed/${videoId}`
            })
          } else {
            this.class.set(res)
          }

          this.getQuestions(paramaID);
        },
        error: err => {

        }
      })
  }

  savePlayer(player: any) {
    this.player = player
    this.player.loadVideoById(this.videoId())
  }


  addQuestion() {
    this.isBtnAddLoading = signal(true);

    const body = {
      enunciado: this.enunciado(),
      categoriaId: this.selectedCategory,
      aulaId: this.paramID
    }

    this.apiService.addQuestion(body).subscribe({
      next: res => {
        this.getQuestions(this.paramID)
        this.enunciado.set('')
        this.selectedCategory = ''
        this.isBtnAddLoading = signal(false);
      },
      error: err => {
        console.log(err)
        this.isBtnAddLoading = signal(false);
      }



    })
  }


  getQuestions(paramaID: any) {
    this.apiService.getQuestions({ AulaId: paramaID })
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
