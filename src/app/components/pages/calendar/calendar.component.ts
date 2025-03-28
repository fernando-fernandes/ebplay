import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular'
import { CalendarOptions } from '@fullcalendar/core'
import ptbrLocale from '@fullcalendar/core/locales/pt-br'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader'
import { CalendarModule } from 'primeng/calendar'
import { DialogModule } from 'primeng/dialog'
import { InputTextModule } from 'primeng/inputtext'
import { RippleModule } from 'primeng/ripple'
import { SelectButtonModule } from 'primeng/selectbutton'
import { ApiService } from '../../../services/api.service'
import { ContentComponent } from '../../../shared/content/content.component'
import { PageTitleComponent } from '../../../shared/page-title/page-title.component'

dayjs.extend(utc)
dayjs.extend(customParseFormat)

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ContentComponent,
    PageTitleComponent,
    CalendarModule,
    InputTextModule,
    SelectButtonModule,
    FullCalendarModule,
    RippleModule,
    DialogModule,
    NgxSkeletonLoaderModule
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit {

  private apiService = inject(ApiService)

  modal: boolean = false
  isLoading = signal(false)
  search = signal('')
  selectedDate: Date | undefined
  eventos: any = []
  modalInfo = signal({
    titulo: '',
    descricao: '',
    linkImagem: '',
    data: '',
    categoria: '',
    hashtags: [],
  })

  calendarOptions: CalendarOptions = {
    locale: ptbrLocale,
    plugins: [dayGridPlugin, listPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      start: 'prev,next today',
      center: 'title',
      end: 'dayGridMonth,timeGridDay,timeGridWeek,listWeek'
    },
    nowIndicator: true,
    contentHeight: 'auto',
    eventClick: arg => this.handleEventClick(arg)
  };

  @ViewChild('calendar') calendar!: FullCalendarComponent

  ngOnInit(): void {
    this.getCalendarItems()
  }

  getCalendarItems() {

    const params = {
      termo: this.search()
    }

    this.isLoading.set(true)

    this.apiService.getCalendarItems(params).subscribe({
      next: res => {

        if (!!this.search() && res.data.length) {
          let date = dayjs(res.data[0].data).utc().format()
          this.calendar.getApi().gotoDate(date)
        } else {
          this.goToDate()
        }

        const arr = res.data.map((item: any) => {
          return {
            id: item.id,
            title: item.titulo,
            date: dayjs(item.data).format('YYYY-MM-DD'),
            display: 'list-item',
            extendedProps: {
              titulo: item.titulo,
              descricao: item.descricao,
              linkImagem: item.linkImagem,
              data: dayjs(item.data).format('DD/MM/YYYY'),
              categoria: item.categoria,
              hashtags: item.hashtags,
            }
          }
        })

        this.eventos = arr
        this.isLoading.set(false)

      },
      error: err => {
        console.log(err)
        this.isLoading.set(false)
      }
    })
  }

  handleEventClick(arg: any) {

    const event = arg.event.extendedProps

    this.modal = true
    this.modalInfo.set(event)

  }

  goToDate() {
    console.log(this.selectedDate)

    const date = dayjs(this.selectedDate).utc().format()

    this.calendar.getApi().gotoDate(date)
  }

  goToday() {
    this.calendar.getApi().today()
  }
}
