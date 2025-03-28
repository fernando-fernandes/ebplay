import { inject, Injectable } from '@angular/core'
import { environment } from '../../environments/environment'
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http'
import { LOGIN_ENABLED, RESET_ENABLED, UPLOAD_ENABLED } from '../interceptor/interceptor'

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  http = inject(HttpClient)

  apiArquivos = `${environment.api}/Arquivos`
  apiAulas = `${environment.api}/Aulas`
  apiCategorias = `${environment.api}/Categorias`
  apiCursos = `${environment.api}/Cursos`
  apiHashtags = `${environment.api}/Hashtags`
  apiItensCalendario = `${environment.api}/ItensCalendario`
  apiNoticias = `${environment.api}/Noticias`
  apiPerguntas = `${environment.api}/Perguntas`
  apiRespostas = `${environment.api}/Respostas`
  apiUsuarios = `${environment.api}/Usuarios`
  apiVersao = `${environment.api}/versao`
  apiTermos = `${environment.api}/terms`
  apiBanners = `${environment.api}/Banners`
  apiBannerVisto = `${environment.api}/BannerVisto`

  headers = new HttpHeaders()

  // Arquivos
  getFiles(params?: any) {
    return this.http.get<any>(`${this.apiArquivos}/home`, { params })
  }

  addFile(body: any, file: File) {

    const formData: FormData = new FormData()
    formData.append('nome', body.nome)
    formData.append('categoriaId', body.categoriaId)
    formData.append('dataInicio', body.dataInicio)
    formData.append('dataFim', body.dataFim)
    formData.append('hashtags', JSON.stringify(body.hashtags)) // Se hashtags for uma lista
    formData.append('arquivo', file, file.name)

    return this.http.post<any>(this.apiArquivos, formData, { context: new HttpContext().set(UPLOAD_ENABLED, true) })
  }

  getFile(id: number) {
    return this.http.get(`${this.apiArquivos}/${id}`)
  }

  updateFile(id: number, body: any, file: File | null) {

    const formData: FormData = new FormData()
    formData.append('nome', body.nome)
    formData.append('categoriaId', body.categoriaId)
    formData.append('dataInicio', body.dataInicio)
    formData.append('dataFim', body.dataFim)
    formData.append('hashtags', JSON.stringify(body.hashtags)) // Se hashtags for uma lista

    if (file) formData.append('arquivo', file, file.name)

    return this.http.put(`${this.apiArquivos}/${id}`, formData, { context: new HttpContext().set(UPLOAD_ENABLED, true) })
  }

  deleteFile(id: number) {
    return this.http.delete(`${this.apiArquivos}/${id}`)
  }


  // Aulas
  getClasses(params?: any) {
    return this.http.get<any>(`${this.apiAulas}/home`, { params })
  }

  addClass(body: any) {
    return this.http.post<any>(this.apiAulas, body)
  }

  getClass(id: number) {
    return this.http.get<any>(`${this.apiAulas}/${id}`)
  }

  updateClass(id: number, body: any) {
    return this.http.put<any>(`${this.apiAulas}/${id}`, body)
  }

  deleteClass(id: number) {
    return this.http.delete<number>(`${this.apiAulas}/${id}`)
  }


  // Categorias
  getCategories(params?: any) {
    return this.http.get<any>(this.apiCategorias, { params })
  }

  addCategory(body: any) {
    return this.http.post<any>(this.apiCategorias, body)
  }

  getCategory(id: number) {
    return this.http.get<any>(`${this.apiCategorias}/${id}`)
  }

  updateCategory(id: number, body: any) {
    return this.http.put<any>(`${this.apiCategorias}/${id}`, body)
  }

  deleteCategory(id: number) {
    return this.http.delete<number>(`${this.apiCategorias}/${id}`)
  }

  //Cursos
  getCourses(params?: any) {
    return this.http.get<any>(this.apiCursos, { params })
  }

  getCoursesSSO() {
    return this.http.get<any>(`${this.apiCursos}/sso`)
  }


  addCourse(body: any) {
    return this.http.post<any>(this.apiCursos, body)
  }

  getCourse(id: number) {
    return this.http.get<any>(`${this.apiCursos}/${id}`)
  }

  updateCourse(id: number, body: any) {
    return this.http.put<any>(`${this.apiCursos}/${id}`, body)
  }

  deleteCourse(id: number) {
    return this.http.delete<number>(`${this.apiCursos}/${id}`)
  }


  // Hashtags
  getHashtags() {
    return this.http.get<any>(this.apiHashtags)
  }

  addHashtag(body: any) {
    return this.http.post<any>(this.apiHashtags, body)
  }

  getHashtag(id: number) {
    return this.http.get<any>(`${this.apiHashtags}/${id}`)
  }

  updateHashtag(id: number, body: any) {
    return this.http.put<any>(`${this.apiHashtags}/${id}`, body)
  }

  deleteHashtag(id: number) {
    return this.http.delete<number>(`${this.apiHashtags}/${id}`)
  }


  // ItensCalendario
  getCalendarItems(params?: any) {
    return this.http.get<any>(`${this.apiItensCalendario}/calendario`, { params })
  }

  getCalendarItem(id: number) {
    return this.http.get(`${this.apiItensCalendario}/${id}`)
  }

  addCalendarItem(body: any) {
    return this.http.post(this.apiItensCalendario, body)
  }

  updateCalendarItem(id: number, body: any) {
    return this.http.put(`${this.apiItensCalendario}/${id}`, body)
  }

  deleteCalendarItem(id: number) {
    return this.http.delete(`${this.apiItensCalendario}/${id}`)
  }


  // Notícias
  getAllNews(params?: any) {
    return this.http.get<any>(`${this.apiNoticias}/home`, {
      params
    })
  }

  getNewsById(id: number) {
    return this.http.get<any>(`${this.apiNoticias}/${id}`)
  }

  addNews(body: any) {
    return this.http.post<any>(this.apiNoticias, body)
  }

  updateNews(id: number, body: any) {
    return this.http.put<any>(`${this.apiNoticias}/${id}`, body)
  }

  deleteNews(id: number) {
    return this.http.delete<number>(`${this.apiNoticias}/${id}`)
  }


  // Perguntas
  getQuestions(params?: any) {
    return this.http.get<any>(`${this.apiPerguntas}/home`, { params })
  }

  addQuestion(body: any) {
    return this.http.post(this.apiPerguntas, body)
  }

  getQuestion(id: number) {
    return this.http.get(`${this.apiPerguntas}/${id}`)
  }

  updateQuestion(id: number, body: any) {
    return this.http.put(`${this.apiPerguntas}/${id}`, body)
  }

  deleteQuestion(id: number) {
    return this.http.delete(`${this.apiPerguntas}/${id}`)
  }

  bookQuestion(id?: number, body?: any) {
    return this.http.post<any>(`${this.apiPerguntas}/reserva?perguntaId=${id}`, body)
  }

  // Respostas
  getAnswersFromQuestionId(id: number) {
    return this.http.get(`${this.apiRespostas}/pergunta/${id}`)
  }

  addAnswer(body: any) {
    return this.http.post(this.apiRespostas, body)
  }

  getAnswer(id: number) {
    return this.http.get(`${this.apiRespostas}/${id}`)
  }

  updateAnswer(id: number, body: any) {
    return this.http.put(`${this.apiRespostas}/${id}`, body)
  }

  deleteAnswer(id: number) {
    return this.http.delete(`${this.apiRespostas}/${id}`)
  }


  // Login
  login(body: any) {
    return this.http.post(`${this.apiUsuarios}/login`, body, {
      context: new HttpContext().set(LOGIN_ENABLED, true),
    })
  }

  resendConfirmationEmail(body: any) {
    return this.http.post(`${this.apiUsuarios}/resendConfirmationEmail`, body)
  }

  forgotPassword(body: any) {
    return this.http.post(`${this.apiUsuarios}/forgotPassword`, body, {
      context: new HttpContext().set(LOGIN_ENABLED, true),
    })
  }

  resetPassword(body: any) {
    return this.http.post(`${this.apiUsuarios}/resetPassword`, body, {
      context: new HttpContext().set(RESET_ENABLED, true),
    })
  }

  confirmEmail(userId: string, token: string) {
    return this.http.get(`${this.apiUsuarios}/confirmEmail`, {
      params: {
        userId: userId,
        token: token
      }
    })
  }

  // Token
  refreshToken(refreshToken: any) {

    // const refresh: HttpHeaders = new HttpHeaders({
    //   refreshToken: refreshToken
    // })

    const refresh = new HttpHeaders()
      // .set('Content-Type', 'application/json')
      // .set('Access-Control-Allow-Credentials', 'true')
      // .set('Access-Control-Expose-Headers', '*')
      .set('refreshToken', refreshToken)

    // console.log('➡️ refreshToken: ', refresh)

    return this.http.post(`${this.apiUsuarios}/refresh`, null, { headers: refresh })
  }

  // Usuários
  registerUser(body: any) {

    const formData: FormData = new FormData()
    formData.append('nome', body.nome)
    formData.append('password', body.password)
    formData.append('apelido', body.apelido)
    formData.append('email', body.email)
    formData.append('dataVencimento', body.dataVencimento)
    formData.append('telefone', body.telefone)
    formData.append('status', body.status)
    formData.append('perfil', body.perfil) // Se hashtags for uma lista

    if (body.imagemPerfil instanceof File) {
      formData.append('imagemPerfil', body.imagemPerfil, body.imagemPerfil.name)
    }

    return this.http.post<any>(`${this.apiUsuarios}/register`, formData, { context: new HttpContext().set(UPLOAD_ENABLED, true) })
  }

  registerUserEduzz(body: any, params?: any) {
    return this.http.post(`${this.apiUsuarios}/register/eduzz`, body, { params })
  }

  getManageInfo() {
    return this.http.get(`${this.apiUsuarios}/manage/info`)
  }

  postManageInfo(body: any) {
    return this.http.post(`${this.apiUsuarios}/manage/info`, body)
  }


  postManageInfoWitchImage(body: any, imagemPreview: string | null) {

    const formData: FormData = new FormData()
    formData.append('id', body.id)
    formData.append('nome', body.nome)
    formData.append('apelido', body.apelido)
    formData.append('email', body.email)
    formData.append('telefone', body.telefone)
    formData.append('perfil', body.perfil) // Se hashtags for uma lista

    if (body.imagemPerfil instanceof File) {
      formData.append('imagemPerfil', body.imagemPerfil, body.imagemPerfil.name)
    }
    else if (imagemPreview) {
      formData.append('imagemPerfilURL', imagemPreview)
    }

    return this.http.post<any>(`${this.apiUsuarios}/manage/info`, formData, { context: new HttpContext().set(UPLOAD_ENABLED, true) })
  }


  getUsers(params?: any) {

    const token = JSON.parse(localStorage.getItem('token')!)?.accessToken

    return this.http.get<any>(`${this.apiUsuarios}/home`, { params })
  }

  getUser(id: string) {
    return this.http.get(`${this.apiUsuarios}/${id}`)
  }

  updateUser(id: string, body: any, imagemPreview: string | null) {


    const token = JSON.parse(localStorage.getItem('token')!)?.accessToken
    console.log('Dentro da service', body)
    //console.log('D', JSON.stringify(body.preferences))

    const formData: FormData = new FormData()
    formData.append('id', body.id)
    formData.append('nome', body.nome)
    formData.append('email', body.email)
    formData.append('dataVencimento', body.dataVencimento)
    formData.append('apelido', body.apelido)
    formData.append('perfil', body.perfil)
    formData.append('status', body.status)
    formData.append('telefone', body.telefone)
    formData.append('preferences', JSON.stringify(body.preferences));
    //for (const preference of body.preferences) {
    //  formData.append('preferences', preference)
    //}

    if (body.imagemPerfil instanceof File) {
      formData.append('imagemPerfil', body.imagemPerfil, body.imagemPerfil.name)
    }
    else if (imagemPreview) {
      formData.append('imagemPerfilURL', imagemPreview)
    }

    return this.http.put(`${this.apiUsuarios}/${id}`, formData, { context: new HttpContext().set(UPLOAD_ENABLED, true) })
  }

  deleteUser(id: string) {
    const token = JSON.parse(localStorage.getItem('token')!)?.accessToken
    return this.http.delete(`${this.apiUsuarios}/${id}`)
  }

  // Sistema
  getVersion() {
    return this.http.get(`${this.apiVersao}`)
  }

  checkTermsStatus() {
    return this.http.get<{ accepted: boolean; acceptedAt: string; termsVersion: string }>(`${this.apiTermos}/status`)
  }

  acceptTerms(termsVersion: string) {
    return this.http.post(`${this.apiTermos}/accept`, { termsVersion })
  }

  // Banners
  getBanners(params?: any) {
    console.log(params)
    return this.http.get<any>(`${this.apiBanners}`, { params })
  }

  getBannersDisplay(params?: any) {
    console.log(params)
    return this.http.get<any>(`${this.apiBanners}/display`, { params })
  }

  addBanner(body: any, file: File) {

    const formData: FormData = new FormData()
    formData.append('titulo', body.titulo)
    formData.append('localizacao', body.localizacao)
    formData.append('tipo', body.tipo)
    formData.append('linkExterno', body.linkExterno)
    formData.append('mostrarAposXSessoes', body.mostrarAposXSessoes)
    formData.append('mostrarAteXVezesPorUsuario', body.mostrarAteXVezesPorUsuario)
    formData.append('mostrarACadaXMinutos', body.mostrarACadaXMinutos)
    for (const dispositivo of body.dispositivos) {
      formData.append('dispositivos', dispositivo)
    }
    formData.append('dataInicio', body.dataInicio)
    formData.append('dataFim', body.dataFim)
    formData.append('ativo', body.ativo)
    // formData.append('hashtags', JSON.stringify(body.hashtags)) // Se hashtags for uma lista
    // formData.append('categoriaId', body.categoriaId)
    formData.append('arquivo', file, file.name)

    return this.http.post<any>(this.apiBanners, formData, { context: new HttpContext().set(UPLOAD_ENABLED, true) })
  }

  seeBanner(id: number) {
    return this.http.post<any>(`${this.apiBannerVisto}`, { bannerId: id })
  }

  getBanner(id: number) {
    return this.http.get<any>(`${this.apiBanners}/${id}`)
  }

  updateBanner(id: number, body: any, file: File | null) {

    const formData: FormData = new FormData()
    formData.append('titulo', body.titulo)
    formData.append('localizacao', body.localizacao)
    formData.append('tipo', body.tipo)
    formData.append('linkExterno', body.linkExterno)
    formData.append('mostrarAposXSessoes', body.mostrarAposXSessoes)
    formData.append('mostrarAteXVezesPorUsuario', body.mostrarAteXVezesPorUsuario)
    formData.append('mostrarACadaXMinutos', body.mostrarACadaXMinutos)
    for (const dispositivo of body.dispositivos) {
      formData.append('dispositivos', dispositivo)
    }
    formData.append('dataInicio', body.dataInicio)
    formData.append('dataFim', body.dataFim)
    formData.append('ativo', body.ativo)
    // formData.append('categoriaId', body.categoriaId)
    // formData.append('hashtags', JSON.stringify(body.hashtags)) // Se hashtags for uma lista

    if (file) formData.append('arquivo', file, file.name)

    return this.http.put<any>(`${this.apiBanners}/${id}`, formData, { context: new HttpContext().set(UPLOAD_ENABLED, true) })
  }

  deleteBanner(id: number) {
    return this.http.delete<number>(`${this.apiBanners}/${id}`)
  }

}
