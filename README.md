# Portal EBPlay

Este projeto foi desenvolvido com **Angular 18** e segue os padrões de desenvolvimento utilizando **PrimeNG** para componentes de UI e **FontAwesome** para ícones.

## Requisitos

- **Node.js v22.13.1**
- **Angular CLI v18.2.1**

## Instalação

### Passo 1: Instalar Node.js

Baixe e instale a versão 22.13.1 do Node.js a partir do [site oficial](https://nodejs.org/).

### Passo 2: Instalar Angular CLI

Após instalar o Node.js, abra o terminal e execute o comando abaixo para instalar o Angular CLI globalmente:

```bash
npm install -g @angular/cli@18.2.1
```

### Passo 3: Clonar o repositório e instalar as dependências

```bash
git clone https://github.com/seu-repositorio.git
cd seu-repositorio
npm install
```

## Desenvolvimento

### Servidor de Desenvolvimento

Execute o seguinte comando para iniciar o servidor local:

```bash
ng serve --configuration=development
```

Acesse [http://localhost:4200/](http://localhost:4200/) no navegador. O aplicativo será atualizado automaticamente conforme as alterações nos arquivos fonte.

### Gerar um novo componente

Utilize o seguinte comando para criar um novo componente:

```bash
ng generate component nome-do-componente
```

Outras opções disponíveis:

```bash
ng generate directive|pipe|service|class|guard|interface|enum|module
```

## Build (Compilação)

Para gerar a versão otimizada para produção, execute:

```bash
ng build --configuration=development
```

Os arquivos gerados estarão na pasta `dist/browser/`.

## Testes

### Testes Unitários

```bash
ng test
```

Os testes são executados via Karma.

### Testes de ponta a ponta (E2E)

```bash
ng e2e
```

Para usar este comando, um pacote adicional para testes E2E deve ser instalado previamente.

## Padrões de Layout

### Componentes UI - PrimeNG

Utilizamos PrimeNG para os componentes do projeto. Documentação: [PrimeNG](https://www.primefaces.org/primeng/)

### Ícones

Utilizamos FontAwesome para os ícones do sistema. Documentação: [FontAwesome](https://fontawesome.com/)

## Padrão de Gestão de Branch

1. Crie uma branch de feature a partir da `main`:

    ```bash
    git checkout -b feature/xpto
    ```

2. Faça um Pull Request (PR) para a branch `dev` onde os testes são realizados.
3. Após os testes, faça um Pull Request (PR) da `dev` para a branch `main`.
4. Após aprovação, publica automaticamente em produção.

Caso precise rodar o pipeline manualmente, acesse: [Azure DevOps Pipeline](#).

## Deploy

O deploy é realizado através do Azure Static Web Apps. O pipeline de CI/CD no Azure DevOps é responsável pelo processo de automação.

## Estrutura de Diretórios

```
src/
│-- app/
│   │-- components/  # Componentes reutilizáveis
│   │-- pages/       # Páginas do sistema
│   │-- services/    # Serviços de API e autenticação
│   └── app.module.ts
│-- assets/          # Imagens e arquivos estáticos
│-- environments/    # Configurações para ambientes de dev/prod
│-- main.ts
│-- index.html
│-- styles.scss
```

## Contato e Suporte

Caso tenha dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
