import { Component, inject, signal } from '@angular/core'
import { RouterModule } from '@angular/router'
import { CommonModule } from '@angular/common'
import { UtilsService } from '../../services/utils.service'
import { ApiService } from '../../services/api.service'
import { MessageService } from 'primeng/api'

interface NavMenu {
  route: string,
  text: string,
  icon: string,
  isVisible: boolean,
  apiExterna: boolean,
  children?: NavMenu[]
}

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss',
  providers: [MessageService]
})
export class NavMenuComponent {
  private apiService = inject(ApiService)
  private utilsService = inject(UtilsService)
  private messageService = inject(MessageService)

  iconType = signal<string>('fa-light')
  hasCollapseState = signal<string>(localStorage.getItem('isCollaped')!)
  isNavMenuCollapsed = signal<boolean>(
    this.hasCollapseState()
      ? JSON.parse(this.hasCollapseState())
      : false
  )

  routes: NavMenu[] = [
    {
      route: 'news-list',
      text: 'Novidades e Atualizações',
      icon: `${this.iconType()} fa-megaphone`,
      isVisible: true,
      apiExterna: false,
      children: [
        {
          route: 'news-admin',
          text: 'Gestão Novidades e Atualizações',
          icon: `${this.iconType()} fa-megaphone`,
          isVisible: this.utilsService.permission(['administrador', 'redator']),
          apiExterna: false
        }
      ]
    },
    {
      route: '',
      text: 'Cursos',
      icon: `${this.iconType()} fa-graduation-cap`,
      isVisible: this.utilsService.permission(['administrador', 'redator', 'professor', 'aluno-completo', 'aluno-comunidade']),
      apiExterna: true,
      //children: [
      //{
      //   route: 'courses-admin',
      //  text: 'Gestão Cursos',
      //  icon: `${this.iconType()} fa-graduation-cap`,
      //  isVisible: this.utilsService.permission(['administrador', 'redator']),
      //  apiExterna: false
      //}
      //]
    },
    {
      route: 'classes-list',
      text: 'Lives e Imersões',
      icon: `${this.iconType()} fa-circle-play`,
      isVisible: true,
      apiExterna: false,
      children: [
        {
          route: 'classes-admin',
          text: 'Gestão Lives e Imersões',
          icon: `${this.iconType()} fa-circle-play`,
          isVisible: this.utilsService.permission(['administrador', 'professor']),
          apiExterna: false
        }
      ]
    },
    {
      route: 'useful-links',
      text: 'Links Úteis',
      icon: `${this.iconType()} fa-link`,
      isVisible: true,
      apiExterna: false
    },
    {
      route: 'questions-list',
      text: 'Comunidade Tira-dúvidas',
      icon: `${this.iconType()} fa-messages-question`,
      isVisible: this.utilsService.permission(['administrador', 'redator', 'professor', 'aluno-completo', 'aluno-comunidade']),
      apiExterna: false,
      children: [
        {
          route: 'questions-admin',
          text: 'Gestão Comunidade Tira-dúvidas',
          icon: `${this.iconType()} fa-messages-question`,
          isVisible: this.utilsService.permission(['administrador', 'professor']),
          apiExterna: false
        }
      ]
    },
    {
      route: 'calendar',
      text: 'Calendário do DP',
      icon: `${this.iconType()} fa-calendar`,
      isVisible: true,
      apiExterna: false,
      children: [
        {
          route: 'calendar-admin',
          text: 'Gestão Calendário do DP',
          icon: `${this.iconType()} fa-calendar`,
          isVisible: this.utilsService.permission(['administrador', 'redator']),
          apiExterna: false
        }
      ]
    },
    {
      route: 'files',
      text: 'Modelos e Checklists',
      icon: `${this.iconType()} fa-file-lines`,
      isVisible: true,
      apiExterna: false,
      children: [
        {
          route: 'files-admin',
          text: 'Gestão Modelos e Checklists',
          icon: `${this.iconType()} fa-file-lines`,
          isVisible: this.utilsService.permission(['administrador', 'redator']),
          apiExterna: false
        }
      ]
    },
    {
      route: '',
      text: 'Sistema',
      icon: `${this.iconType()} fa-sliders`,
      isVisible: this.utilsService.permission(['administrador', 'redator', 'professor']),
      apiExterna: true,
      children: [
        {
          route: 'banners-admin',
          text: 'Gestão Banners',
          icon: `${this.iconType()} fa-bullhorn`,
          isVisible: this.utilsService.permission(['administrador', 'professor']),
          apiExterna: false
        },
        {
          route: 'categories-admin',
          text: 'Gestão de categorias',
          icon: `${this.iconType()} fa-tags`,
          isVisible: this.utilsService.permission(['administrador', 'redator']),
          apiExterna: false
        },
        {
          route: 'hashtags-admin',
          text: 'Gestão de hashtags',
          icon: `${this.iconType()} fa-hashtag`,
          isVisible: this.utilsService.permission(['administrador', 'redator']),
          apiExterna: false
        },
        {
          route: 'users',
          text: 'Gestão de usuários',
          icon: `${this.iconType()} fa-users`,
          isVisible: this.utilsService.permission(['administrador']),
          apiExterna: false
        }
      ]
    },
  ]

  apiExterna(item: any) {
    if (item.text === 'Cursos' && item.apiExterna) {
      this.apiService.getCoursesSSO().subscribe({
        next: res => {
          window.open(res.url, '_blank');
        },
        error: err => {
          this.messageService.add({ severity: 'error', summary: 'Não foi possível acessar a página de cursos.' })
        }
      })
    }
  }

  onToggleNavMenu() {
    this.isNavMenuCollapsed.update(collapsed => collapsed = !collapsed)
    localStorage.setItem('isCollaped', JSON.stringify(this.isNavMenuCollapsed()))
  }
}
