import { Routes } from '@angular/router'
import { TermoComponent } from './shared/termo/termo.component'

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./components/pages/pages.routes').then(r => r.PAGES_ROUTES)
  },
  {
    path: 'login',
    loadChildren: () => import('./components/account/account.routes').then(r => r.ACCOOUNT_ROUTES)
  },
  {
    path: 'termo-de-seguranca-e-privacidade',
    component: TermoComponent
  }
]
