import { Component, inject, signal } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NavMenuComponent } from "../../shared/nav-menu/nav-menu.component"
import { TopHeaderComponent } from "../../shared/top-header/top-header.component"
import { FooterComponent } from "../../shared/footer/footer.component"
import { DialogModule } from 'primeng/dialog'
import { ApiService } from '../../services/api.service'
import dayjs from 'dayjs'

@Component({
  selector: 'app-pages',
  standalone: true,
  imports: [DialogModule, RouterModule, NavMenuComponent, TopHeaderComponent, FooterComponent],
  templateUrl: './pages.component.html',
  styleUrl: './pages.component.scss'
})
export class PagesComponent {
  private apiService = inject(ApiService)

  // "mostrarAposXSessoes": 0,
  // "mostrarAteXVezesPorUsuario": 0,
  // "mostrarACadaXMinutos": 0,

  displayDialog = false
  interval?: ReturnType<typeof setInterval>;
  bannerId = signal<number | null>(null);
  bannerTitle = signal('');
  bannerUrl = signal('');
  bannerUrlExterno = signal('');

  ngOnInit(): void {
    this.getBanners();
  }

  seeBanner(bannerId: number) {
    this.apiService.seeBanner(bannerId).subscribe({
      next: res => {
        console.log("SeeBanner: Success.");
      },
      error: err => {
        console.log(err);
      },
    })
  }

  getBanners() {
    const dispositivo = this.getDevice()

    const params = {
      Tipo: 'PopUp',
      DataInicio: dayjs(new Date()).format('YYYY/MM/DD'),
      Dispositivos: [dispositivo]
    }

    this.apiService.getBannersDisplay(params).subscribe({
      next: res => {
        console.log('Banners', res.data)
        this.mount(res.data);
      },
      error: err => {
        console.log(err);
      },
    })
  }

  getDevice(): ('Desktop' | 'Mobile' | 'Tablet') {
    const width = window.innerWidth;

    if (width <= 768) {
      // Considera que é um celular ou tablet
      if (width <= 480) {
        return 'Mobile';
      } else {
        return 'Tablet';
      }
    } else {
      // Considera que é um desktop
      return 'Desktop';
    }
  }

  mount(banners: any[]) {
    banners.forEach(banner => {
      // this.onShow(banner);
      // return;
      // Inicializa o openCount se ainda não existir
      if (banner.openCount === undefined) {
        banner.openCount = 0;
      }
      if (banner.notShow === undefined) {
        banner.notShow = false;
      }
      if (!banner.mostrarAteXVezesPorUsuario) {
        // caso nao for informado mostra sempre que cair nas condicoes
        banner.mostrarAteXVezesPorUsuario = Infinity;
      }

      const sessions = this.getUserSessions();

      if (!banner.notShow && banner.mostrarAposXSessoes && sessions > 0) {
        if ((sessions % banner.mostrarAposXSessoes) === 0) {
          if (banner.openCount < banner.mostrarAteXVezesPorUsuario) {
            this.onShow(banner);
            banner.openCount++; // Incrementa o contador dentro do banner
          } else {
            banner.notShow = true;
          }
        }
      }

      if (!banner.notShow && banner.mostrarACadaXMinutos) {
        const ms = this.minutesToMilliseconds(banner.mostrarACadaXMinutos);

        // Limpa intervalos anteriores para evitar duplicação
        if (banner.interval) {
          clearInterval(banner.interval);
        }

        banner.interval = setInterval(() => {
          if (banner.openCount < banner.mostrarAteXVezesPorUsuario) {
            this.onShow(banner);
            banner.openCount++; // Incrementa o contador dentro do banner
          } else {
            clearInterval(banner.interval);
            banner.notShow = true;
          }
        }, ms);
      }
    });
  }

  minutesToMilliseconds(minutes: number): number {
    return minutes * 60000;
  }

  getUserSessions(): number {
    const storageUser = localStorage.getItem('user');
    if (storageUser) {
      const user = JSON.parse(storageUser);
      const storageSession = localStorage.getItem(`session:${user.id}`);
      return storageSession ? Number(storageSession) : 0;
    }
    return 0;
  }

  onShow(banner: any) {
    this.bannerId.set(banner.id)
    this.bannerUrl.set(banner.linkImagem);
    this.bannerTitle.set(banner.titulo);
    this.bannerUrlExterno.set(banner.linkExterno);
    this.onDialogShow();
  }

  onDialogShow() {
    this.displayDialog = true;
  }

  onDialogHide() {
    this.displayDialog = false;
  }

  onCloseClick() {
    const bannerId = this.bannerId();
    if (bannerId) {
      // this.seeBanner(bannerId);
    }
  }
}
