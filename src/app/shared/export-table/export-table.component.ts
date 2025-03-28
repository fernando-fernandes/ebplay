import { Component, input, output } from '@angular/core'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import * as XLSX from 'xlsx'
import jsonToCsvExport from "json-to-csv-export"

type file = 'xlsx' | 'csv'

@Component({
  selector: 'app-export-table',
  standalone: true,
  imports: [
    ButtonModule,
    RippleModule,
  ],
  templateUrl: './export-table.component.html',
  styleUrl: './export-table.component.scss'
})
export class ExportTableComponent {

  data = input<any[]>([])
  fileName = input<string>('')
  cols = input<any[]>([])

  exportExcel() {

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.data())
    const wb: XLSX.WorkBook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(wb, ws, 'Planilha 1')

    ws['!cols'] = this.cols()

    XLSX.writeFile(wb, `${this.fileName()}.xlsx`)

  }

  exportCSV() {
    jsonToCsvExport({
      data: this.data(),
      filename: this.fileName()
    })
  }

}
