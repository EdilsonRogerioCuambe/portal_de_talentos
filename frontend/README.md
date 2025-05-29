# Portal de Talentos - Frontend

Este é o frontend do Portal de Talentos, uma aplicação React moderna para gerenciamento de candidatos e seleção de talentos.

## 🚀 Tecnologias Utilizadas

- React 19
- TypeScript
- React Router DOM
- Axios
- Formik + Yup
- TailwindCSS
- Lucide React (ícones)

## 📋 Pré-requisitos

- Node.js (versão 19)
- npm ou yarn
- Backend do Portal de Talentos rodando (http://localhost:3333)

## 🔧 Instalação

1. Clone o repositório e navegue até a pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
REACT_APP_API_URL=http://localhost:3333
```

## 🚀 Executando o Projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## 📦 Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila o projeto para produção
- `npm test` - Executa os testes
- `npm run eject` - Ejecta a configuração do Create React App

## 🎨 Estrutura do Projeto

```
src/
  ├── components/     # Componentes reutilizáveis
  ├── pages/         # Páginas da aplicação
  ├── services/      # Serviços e APIs
  ├── contexts/      # Contextos do React
  ├── hooks/         # Custom hooks
  ├── types/         # Definições de tipos TypeScript
  ├── utils/         # Funções utilitárias
  └── assets/        # Recursos estáticos
```

## 🔐 Funcionalidades

- Autenticação de usuários
- Cadastro de candidatos
- Visualização de perfis
- Busca e filtros
- Dashboard administrativo
- Gerenciamento de candidatos

## 🧪 Testes

Para executar os testes:

```bash
npm test
```

## 📦 Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Os arquivos de build serão gerados na pasta `build/`

## 🔧 Configuração do TailwindCSS

O projeto utiliza TailwindCSS para estilização. A configuração pode ser encontrada em `tailwind.config.js`

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.