import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { inject, Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'sanitizeURL',
  standalone: true
})
export class SanitizeURLPipe implements PipeTransform {

  private sanitizer = inject(DomSanitizer)

  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value)
  }

}
