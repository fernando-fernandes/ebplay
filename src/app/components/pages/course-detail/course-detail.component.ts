import { AccordionModule } from 'primeng/accordion'
import { CommonModule } from '@angular/common'
import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { concatMap, of, tap } from 'rxjs'
import { ApiService } from '../../../services/api.service'
import { TipoCategoria } from '../../../models/model'
import { DropdownModule } from 'primeng/dropdown'
import { DialogModule } from 'primeng/dialog'

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'
import { BackButtonComponent } from "../../../shared/back-button/back-button.component"
import { YoutubePlayerComponent } from 'ngx-youtube-player'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader'

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule,
    BackButtonComponent,
    AccordionModule,
    NgxSkeletonLoaderModule,
    DialogModule
    // YoutubePlayerComponent
  ],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent {
  private route = inject(ActivatedRoute)
  private apiService = inject(ApiService)
  private sanitizer = inject(DomSanitizer)

  course = signal<any>({})
  isLoading = signal<boolean>(false)
  paramID = this.route.snapshot.paramMap.get('id')

  playerUrl = 'https://player.vimeo.com/video/'
  video: any


  moduleTitle = signal('')
  classTitle = signal('')

  currentModule = signal(0)
  currentClass = signal(0)
  isClassList = false

  // player!: YT.Player
  // hasVideo = signal(false)

  ngOnInit(): void {
    console.log(this.paramID)

    this.getCourse(this.paramID)
  }

  getCourse(paramaID: any) {

    this.isLoading.set(true)

    this.apiService.getCourse(paramaID).subscribe({
      next: res => {
        var linkVideo = res.Modulos[0].Aulas[0].linkVideo;
        if (linkVideo != null) {
          const unsafeUrl = this.playerUrl + linkVideo.slice(18, 27)
          this.video = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl)
        } else {
          this.video = "Não há video disponível para esta aula";
        }

        this.moduleTitle.set(res.Modulos[0].titulo)
        this.classTitle.set(res.Modulos[0].Aulas[0].titulo)

        this.currentModule.set(res.Modulos[0])
        this.currentClass.set(res.Modulos[0].Aulas[0])

        this.course.set(res)

        this.isLoading.set(false)
      },
      error: err => {
        this.isLoading.set(false)
      }
    })
  }

  onSetVideo(aula: any, modulo: any, indexModulo: number, indexAula: number) {
    var linkVideo = aula.linkVideo;
    if (linkVideo != null) {
      const unsafeUrl = this.playerUrl + linkVideo.slice(18, 27)
      this.video = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl)
    } else {
      this.video = null;
    }
    this.moduleTitle.set(modulo.titulo)
    this.classTitle.set(aula.titulo)

    console.log('VideoId', aula.linkVideo.slice(18, 27))
    console.log('Aula: ', aula)
    console.log('Modulo: ', modulo)
    console.log('indexModulo: ', indexModulo)
    console.log('indexAula: ', indexAula)


    // this.hasVideo.set(true)
    // this.player.loadVideoById(video)
  }

  showClassList() {
    this.isClassList = true
  }

  onPlayNextVideo() {

  }

  index(e: any) {
    console.log(e)
  }

  // savePlayer(player: any) {
  //   this.player = player
  //   console.log("player instance", player)
  // }

  // onStateChange(event: any) {
  //   console.log("player state", event.data)
  // }


}
