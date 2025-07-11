import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'
import { provideRouter } from '@angular/router'

import { provideAnimations } from '@angular/platform-browser/animations'
import { routes } from './app.routes'
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { AuthenticationInterceptor } from './interceptor/interceptor'

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    provideAnimations(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true },
  ]
}
