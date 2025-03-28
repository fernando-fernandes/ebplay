import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { inject, Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'sanitizeHTML',
  standalone: true
})
export class SanitizeHTMLPipe implements PipeTransform {

  private sanitizer = inject(DomSanitizer)

  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value)
  }

}
