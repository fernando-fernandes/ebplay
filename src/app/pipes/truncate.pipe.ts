import { Pipe, PipeTransform } from '@angular/core'
import { SafeHtml } from '@angular/platform-browser'

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {

  transform(value: any, length = 150): any {
    return value.length > length
      ? value.replace(/<[^>]*>?/gm, '').substring(0, length) + '...'
      : value.replace(/<[^>]*>?/gm, '')
  }

}
