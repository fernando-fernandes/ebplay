import { CommonModule } from '@angular/common'
import { Component, inject, Input, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { ApiService } from '../../services/api.service'
import { TipoCategoria } from '../../models/model'

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'
import { DropdownModule } from 'primeng/dropdown'
import { ConfirmationService, MessageService } from 'primeng/api'
import { DialogModule } from 'primeng/dialog'
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
  selector: 'app-community-questions',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule,
    FormsModule,
    DropdownModule,
    DialogModule,
    ConfirmDialogModule,
    // SanitizeURLPipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './community-questions.component.html',
  styleUrl: './community-questions.component.scss'
})
export class CommunityQuestionsComponent {
  private route = inject(ActivatedRoute)
  private apiService = inject(ApiService)
  private messageService = inject(MessageService)
  private confirmationService = inject(ConfirmationService)

  @Input() aulaId: String | null = null;
  @Input() noticiaId: String | null = null;

  user = signal<any>({})
  class = signal<any>({})
  paramID = this.route.snapshot.paramMap.get('id')
  categorias = signal<any[]>([])
  selectedCategory: any = ''
  enunciado = signal('')
  questions = signal<any[]>([])
  isBtnAddLoading = signal(false)
  parametro = signal<any>({})

  player!: YT.Player
  videoId = signal<any>('')

  ngOnInit(): void {
    console.log('this.aulaId', this.aulaId)
    console.log('this.noticiaId', this.aulaId)

    this.getUser()
    this.getCategories()
    this.getQuestions()
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

  savePlayer(player: any) {
    this.player = player
    this.player.loadVideoById(this.videoId())
  }


  addQuestion() {
    this.isBtnAddLoading = signal(true);

    const body = {
      enunciado: this.enunciado(),
      categoriaId: this.selectedCategory,
      aulaId: this.aulaId,
      noticiaId: this.noticiaId
    }

    this.apiService.addQuestion(body).subscribe({
      next: res => {
        this.getQuestions()
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


  getQuestions() {

    if (this.aulaId != null) {
      this.parametro.set({ AulaId: this.aulaId });

    }

    if (this.noticiaId != null) {
      this.parametro.set({ NoticiaId: this.noticiaId });

    }

    console.log('parametro', this.parametro())

    this.apiService.getQuestions(this.parametro())
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
    console.log('11111111')
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
        this.getQuestions()
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: err });
      }
    });
  }
}
