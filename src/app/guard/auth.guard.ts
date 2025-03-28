import { inject, Injectable, signal } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router'
import { AuthService } from '../services/auth.service'

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  private authService = inject(AuthService)
  private router = inject(Router)
  // private isLoggedIn = signal(!!localStorage.getItem('token'))

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {

    if (!!localStorage.getItem('token')) {
      return true
    } else {
      this.router.navigate(['/login'])
      return false
    }
  }

}
