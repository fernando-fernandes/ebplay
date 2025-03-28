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
@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule,
    FormsModule,
    // SanitizeURLPipe,
    BackButtonComponent,
    BackButtonComponent,
    YoutubePlayerComponent
  ],
  templateUrl: './class-detail.component.html',
  styleUrl: './class-detail.component.scss'
})
export class ClassDetailComponent {
  private route = inject(ActivatedRoute)
  private apiService = inject(ApiService)

  class = signal<any>({})
  paramID = this.route.snapshot.paramMap.get('id')

  player!: YT.Player
  videoId = signal<any>('')

  ngOnInit(): void {
    this.getData(this.paramID)
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

        },
        error: err => {

        }
      })
  }

  savePlayer(player: any) {
    this.player = player
    this.player.loadVideoById(this.videoId())
  }


}
