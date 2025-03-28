import { Component, inject, signal } from '@angular/core'
import { RouterModule } from '@angular/router'
import { CommonModule } from '@angular/common'
import { UtilsService } from '../../services/utils.service'

interface NavMenu {
  route: string,
  text: string,
  icon: string,
  isVisible: boolean
}

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss'
})
export class NavMenuComponent {

  private utilsService = inject(UtilsService)

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
      isVisible: true
    },
    {
      route: 'news-admin',
      text: 'Gestão Novidades e Atualizações',
      icon: `${this.iconType()} fa-megaphone`,
      isVisible: this.utilsService.permission(['administrador', 'redator'])
    },
    {
      route: 'courses-list',
      text: 'Cursos',
      icon: `${this.iconType()} fa-graduation-cap`,
      isVisible: true
    },
    // {
    //   route: 'courses-admin',
    //   text: 'Gestão Cursos',
    //   icon: `${this.iconType()} fa-graduation-cap`,
    //   isVisible: this.utilsService.permission(['administrador', 'redator'])
    // },
    {
      route: 'classes-list',
      text: 'Lives e Imersões',
      icon: `${this.iconType()} fa-circle-play`,
      isVisible: true
    },
    {
      route: 'classes-admin',
      text: 'Gestão Lives e Imersões',
      icon: `${this.iconType()} fa-circle-play`,
      isVisible: this.utilsService.permission(['administrador', 'professor'])
    },
    {
      route: 'useful-links',
      text: 'Links Úteis',
      icon: `${this.iconType()} fa-link`,
      isVisible: true
    },
    {
      route: 'questions-list',
      text: 'Comunidade Tira-dúvidas',
      icon: `${this.iconType()} fa-messages-question`,
      isVisible: true
    },
    {
      route: 'questions-admin',
      text: 'Gestão Comunidade Tira-dúvidas',
      icon: `${this.iconType()} fa-messages-question`,
      isVisible: this.utilsService.permission(['administrador', 'professor'])
    },
    {
      route: 'calendar',
      text: 'Calendário do DP',
      icon: `${this.iconType()} fa-calendar`,
      isVisible: true
    },
    {
      route: 'calendar-admin',
      text: 'Gestão Calendário do DP',
      icon: `${this.iconType()} fa-calendar`,
      isVisible: this.utilsService.permission(['administrador', 'redator'])
    },
    {
      route: 'files',
      text: 'Modelos e Checklists',
      icon: `${this.iconType()} fa-file-lines`,
      isVisible: true
    },
    {
      route: 'files-admin',
      text: 'Gestão Modelos e Checklists',
      icon: `${this.iconType()} fa-file-lines`,
      isVisible: this.utilsService.permission(['administrador', 'redator'])
    },
    {
      route: 'banners-admin',
      text: 'Gestão Banners',
      icon: `${this.iconType()} fa-bullhorn`,
      isVisible: this.utilsService.permission(['administrador', 'professor'])
    },
    {
      route: 'categories-admin',
      text: 'Gestão de categorias',
      icon: `${this.iconType()} fa-tags`,
      isVisible: this.utilsService.permission(['administrador', 'redator'])
    },
    {
      route: 'hashtags-admin',
      text: 'Gestão de hashtags',
      icon: `${this.iconType()} fa-hashtag`,
      isVisible: this.utilsService.permission(['administrador', 'redator'])
    },
    {
      route: 'users',
      text: 'Gestão de usuários',
      icon: `${this.iconType()} fa-users`,
      isVisible: this.utilsService.permission(['administrador'])
    }
  ]



  onToggleNavMenu() {
    this.isNavMenuCollapsed.update(collapsed => collapsed = !collapsed)
    localStorage.setItem('isCollaped', JSON.stringify(this.isNavMenuCollapsed()))
  }

}
