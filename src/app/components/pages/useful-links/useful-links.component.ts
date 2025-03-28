import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import dayjs from 'dayjs'
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader'
import { ButtonModule } from 'primeng/button'
import { DropdownModule } from 'primeng/dropdown'
import { InputTextModule } from 'primeng/inputtext'
import { MultiSelectModule } from 'primeng/multiselect'
import { RippleModule } from 'primeng/ripple'
import { TableModule } from 'primeng/table'
import { TagModule } from 'primeng/tag'
import { ApiService } from '../../../services/api.service'
import { ContentComponent } from "../../../shared/content/content.component"
import { PageTitleComponent } from '../../../shared/page-title/page-title.component'
import { TipoCategoria } from '../../../models/model'

@Component({
  selector: 'app-useful-links',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageTitleComponent,
    ContentComponent,
    TableModule,
    InputTextModule,
    TagModule,
    ButtonModule,
    RippleModule,
    DropdownModule,
    NgxSkeletonLoaderModule,
    MultiSelectModule
  ],
  templateUrl: './useful-links.component.html',
  styleUrls: ['./useful-links.component.scss']
})
export class UsefulLinksComponent {
  links = [
    { name: 'CLT - ATUALIZADA', url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm', icon: 'fa-light fa-file-pen' },
    { name: 'DIÁRIO OFICIAL DA UNIÃO', url: 'https://www.gov.br/imprensanacional/pt-br', icon: 'fa-light fa-balance-scale' },
    { name: 'PORTAL - ESOCIAL', url: 'https://www.gov.br/esocial/pt-br', icon: 'fa-light fa-globe' },
    { name: 'PORTAL - FGTS DIGITAL', url: 'https://fgtsdigital.sistema.gov.br/portal/login', icon: 'fa-light fa-handshake' },
    { name: 'MANUAL - ESOCIAL (MOS)', url: 'https://www.gov.br/esocial/pt-br/documentacao-tecnica', icon: 'fa-light fa-book-open' },
    { name: 'MANUAL - FGTS DIGITAL', url: 'https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/manual-e-documentacao-tecnica', icon: 'fa-light fa-money-bill-trend-up' },
    { name: 'MANUAL - RECLAMATÓRIA', url: 'https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/manual-do-usuario-esocial-web-processo-trabalhista.pdf', icon: 'fa-light fa-file-contract' },
    { name: 'MANUAL - DCTFWEB', url: 'https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/manual-do-usuario-esocial-web-processo-trabalhista.pdf', icon: 'fa-light fa-file-arrow-up' },
    { name: 'CONSULTA - FAP', url: 'https://fap.dataprev.gov.br/', icon: 'fa-light fa-search' },
    { name: 'CONSULTA - CBO', url: 'http://www.mtecbo.gov.br/cbosite/pages/pesquisas/BuscaPorTitulo.jsf', icon: 'fa-light fa-file-search' },
    { name: 'CONSULTA - JULGADOS DO TST', url: 'https://tst.jus.br/web/guest/jurisprudencia', icon: 'fa-light fa-gavel' },
    { name: 'DET - DOMICÍLIO ELETRÔNICO', url: 'https://det.sit.trabalho.gov.br/login?r=%2Fservicos', icon: 'fa-light fa-house-chimney-user' },
    { name: 'CONSULTA - JURISPRUDÊNCIA', url: 'https://www.jusbrasil.com.br/jurisprudencia/', icon: 'fa-light fa-balance-scale-right' },
    { name: 'CONSULTA - RF (COSIT)', url: 'http://normas.receita.fazenda.gov.br/sijut2consulta/consulta.action', icon: 'fa-light fa-globe' },
    { name: 'EMPREGADOR WEB', url: 'https://sd.maisemprego.mte.gov.br/sdweb/empregadorweb/index.jsf', icon: 'fa-light fa-briefcase' },
    { name: 'LEI DO ESTAGIÁRIO', url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11788.htm', icon: 'fa-light fa-book' },
    { name: 'SPE - PROCURAÇÃO ELETRÔNICA', url: 'https://spe.sistema.gov.br/login?r=%2Fprocuracao', icon: 'fa-light fa-user-shield' },
    { name: 'CONECTIVIDADE V2', url: 'https://conectividadesocialv2.caixa.gov.br/sicns/', icon: 'fa-light fa-network-wired' },
    { name: 'DÚVIDAS FREQUENTES - ESOCIAL', url: 'https://www.gov.br/esocial/pt-br/empresas/perguntas-frequentes', icon: 'fa-light fa-question-circle' },
    { name: 'INSTRUÇÃO NORMATIVA RFV 2110', url: 'http://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=126687', icon: 'fa-light fa-info-circle' },
    { name: 'BUSCA DE CNPJ', url: 'https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp', icon: 'fa-light fa-building' },
    { name: 'CERTIDÃO DE REGULARIDADE', url: 'https://certidoes.sit.trabalho.gov.br/', icon: 'fa-light fa-certificate' }
  ];

  openLink(url: string) {
    window.open(url, '_blank');
  }
}
