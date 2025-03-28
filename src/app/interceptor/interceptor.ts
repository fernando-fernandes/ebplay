import { HttpContextToken, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from "@angular/common/http"
import { inject, Injectable, signal } from "@angular/core"
import { ActivatedRoute, NavigationStart, Router } from "@angular/router"
import { catchError, concatMap, filter, Observable, switchMap, throwError } from "rxjs"
import { AuthService } from "../services/auth.service"

export const LOGIN_ENABLED = new HttpContextToken<boolean>(() => false)
export const UPLOAD_ENABLED = new HttpContextToken<boolean>(() => false)
export const RESET_ENABLED = new HttpContextToken<boolean>(() => false)

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private authService = inject(AuthService)

  urlParams = signal({
    userId: this.route.snapshot.queryParamMap.get('userId'),
    token: this.route.snapshot.queryParamMap.get('token')
  })

  intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {

    if (req.context.get(LOGIN_ENABLED)) {
      // console.log(req)

      return handler.handle(req)

    }

    else if (req.context.get(RESET_ENABLED)) {
      const header = req.clone({
        headers: req.headers
          .set('Content-Type', 'application/json')
          .set('Access-Control-Allow-Credentials', 'true')
          .set('userId', this.urlParams().userId!)
          .set('token', this.urlParams().token!),
      })
      return handler.handle(header)
    }

    else if (req.context.get(UPLOAD_ENABLED)) {
      const header = req.clone({
        headers: req.headers
          .set('Authorization', `Bearer ${JSON.parse(localStorage.getItem('token')!).accessToken}`)
          .set('Access-Control-Allow-Credentials', 'true')
      })
      return handler.handle(header)
    }

    else {

      // return this.handle401Error(req, handler)

      if (!req.url.includes('refresh')) {
        req = this.addToken(req, this.authService.getAccessToken())
      }

      return handler.handle(req).pipe(
        catchError(error => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            // Tentar renovar o token
            console.log('➡️ Tentar renovar o token: ')
            return this.handle401Error(req, handler)
          } else {
            return throwError(() => error)
          }
        })
      )
    }
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      headers: request.headers
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Access-Control-Allow-Credentials', 'true')
        .set('Access-Control-Expose-Headers', '*')
    })
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.refreshToken().pipe(
      switchMap(response => {

        console.log(response)

        return next.handle(this.addToken(request, response.accessToken))
      }),
      catchError(error => {
        console.log('⛔ handle401Error: ', error)
        // Se não conseguir renovar o token, deslogar o usuário
        this.authService.logout()
        return throwError(() => error)
      })
    )
  }

}