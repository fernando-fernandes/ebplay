import { Routes } from "@angular/router"
import { PagesComponent } from "./pages.component"
import { UsersAdminComponent } from "./users-admin/users-admin.component"
import { NewsListComponent } from "./news-list/news-list.component"
import { NewsDetailComponent } from "./news-detail/news-detail.component"
import { NewsAdminComponent } from "./news-admin/news-admin.component"
import { FilesComponent } from "./files/files.component"
import { FilesAdminComponent } from "./files-admin/files-admin.component"
import { ProfileComponent } from "./profile/profile.component"
import { QuestionsListComponent } from "./questions-list/questions-list.component"
import { QuestionComponent } from "./question/question.component"
import { CalendarComponent } from "./calendar/calendar.component"
import { CategoriesAdminComponent } from "./categories-admin/categories-admin.component"
import { HashtagsAdminComponent } from "./hashtags-admin/hashtags-admin.component"
import { CalendarAdminComponent } from "./calendar-admin/calendar-admin.component"
import { QuestionsAdminComponent } from "./questions-admin/questions-admin.component"
import { ClassesAdminComponent } from "./classes-admin/classes-admin.component"
import { ClassesListComponent } from "./classes-list/classes-list.component"
import { ClassDetailComponent } from "./class-detail/class-detail.component"
import { AuthGuard } from "../../guard/auth.guard"
import { UsefulLinksComponent } from "./useful-links/useful-links.component"
import { CoursesComponent } from "./courses-list/courses-list.component"
import { CoursesAdminComponent } from "./courses-admin/courses-admin.component"
import { CourseDetailComponent } from "./course-detail/course-detail.component"
import { BannersAdminComponent } from "./banners-admin/banners-admin.component"

export const PAGES_ROUTES: Routes = [
  {
    path: '',
    component: PagesComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'news-list',
        pathMatch: 'full'
      },
      {
        path: 'users',
        component: UsersAdminComponent,
        title: 'EB Play | Gestão de usuários'
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'EB Play | Perfil'
      },
      {
        path: 'news-admin',
        component: NewsAdminComponent,
        title: 'EB Play | Gestão de notícias'
      },
      {
        path: 'news-list',
        component: NewsListComponent,
        title: 'EB Play | Notícias'
      },
      {
        path: 'news/:id',
        component: NewsDetailComponent,
        title: 'EB Play | Notícias'
      },
      {
        path: 'courses-admin',
        component: CoursesAdminComponent,
        title: 'EB Play | Gestão de cursos'
      },
      {
        path: 'courses-list',
        component: CoursesComponent,
        title: 'EB Play | Cursos'
      },
      {
        path: 'course/:id',
        component: CourseDetailComponent,
        title: 'EB Play | Cursos'
      },
      {
        path: 'classes-admin',
        component: ClassesAdminComponent,
        title: 'EB Play | Gestão de aulas'
      },
      {
        path: 'classes-list',
        component: ClassesListComponent,
        title: 'EB Play | Aulas'
      },
      {
        path: 'class/:id',
        component: ClassDetailComponent,
        title: 'EB Play | Aulas'
      },
      {
        path: 'files-admin',
        component: FilesAdminComponent,
        title: 'EB Play | Gestão de arquivos'
      },
      {
        path: 'files',
        component: FilesComponent,
        title: 'EB Play | Arquivos'
      },
      {
        path: 'questions-admin',
        component: QuestionsAdminComponent,
        title: 'EB Play | Gestão de perguntas'
      },
      {
        path: 'questions-list',
        component: QuestionsListComponent,
        title: 'EB Play | Comunidade'
      },
      {
        path: 'question/:id',
        component: QuestionComponent,
        title: 'EB Play | Pergunta'
      },
      {
        path: 'calendar',
        component: CalendarComponent,
        title: 'EB Play | Calendário'
      },
      {
        path: 'calendar-admin',
        component: CalendarAdminComponent,
        title: 'EB Play | Gestão de calendário'
      },
      {
        path: 'banners-admin',
        component: BannersAdminComponent,
        title: 'EB Play | Gestão de banners'
      },
      {
        path: 'categories-admin',
        component: CategoriesAdminComponent,
        title: 'EB Play | Gestão de Categorias'
      },
      {
        path: 'hashtags-admin',
        component: HashtagsAdminComponent,
        title: 'EB Play | Gestão de Hashtags'
      },
      {
        path: 'useful-links',
        component: UsefulLinksComponent,
        title: 'EB Play | Links Úteis'
      }
    ]
  }
]
