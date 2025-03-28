import { inject, Injectable, signal } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router'
import { ApiService } from './api.service'
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, tap, throwError } from 'rxjs'

interface Token {
  accessToken: string
  expiresIn: string
  refreshToken: string
  sucesso: boolean
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private router = inject(Router)
  private apiService = inject(ApiService)
  // isLoggedIn = signal(!!localStorage.getItem('token'))

  private refreshTokenInProgress = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);


  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    this.router.navigate(['login'])
  }

  getUserIdFromToken(): string {
    const token = localStorage.getItem('token')
    if (token) {
      const parsedToken = JSON.parse(token)
      return parsedToken.userId
    }

    return ""
  }

  getAccessToken() {
    const token = localStorage.getItem('token')

    return !!token ?
      JSON.parse(token!).accessToken
      : null
  }

  getRefreshToken() {
    const refreshToken = localStorage.getItem('refreshToken')

    return !!refreshToken ?
      JSON.parse(refreshToken!)
      : null
  }

  saveTokens(access: string, refresh: string): void {
    localStorage.setItem('token', JSON.stringify(access))
    localStorage.setItem('refreshToken', refresh)
  }

  refreshToken(): Observable<any> {
    if (this.refreshTokenInProgress) {
      return this.refreshTokenSubject.pipe(
        filter(result => result !== null),
        take(1)
      )
    } else {
      this.refreshTokenInProgress = true
      this.refreshTokenSubject.next(null)

      return this.apiService.refreshToken(this.getRefreshToken()).pipe(
        switchMap((response: any) => {
          this.refreshTokenInProgress = false
          this.refreshTokenSubject.next(response)

          console.log('➡️', response)


          // Salvar os novos tokens
          this.saveTokens(response, response.refreshToken)

          // return Observable.create((observer: any) => {
          //   observer.next(response)
          //   observer.complete()
          // })
          return new Observable<void>((observer) => {
            observer.next(response)
            observer.complete()
          })
        }),
        catchError((error) => {
          console.log('⛔ erro: ', error)
          this.refreshTokenInProgress = false
          this.logout()
          return throwError(() => error)
        })
      )
    }
  }

}
