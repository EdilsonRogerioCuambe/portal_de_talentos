# Portal de Talentos - Backend

Este é o backend do Portal de Talentos, uma API RESTful desenvolvida com AdonisJS para gerenciamento de candidatos e seleção de talentos.

## 🚀 Tecnologias Utilizadas

- AdonisJS 5
- TypeScript
- MySQL
- JWT para autenticação
- Nodemailer para envio de emails
- ViaCEP API para endereços

## 📋 Pré-requisitos

- Node.js (versão 19)
- MySQL 8.0 ou superior
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório e navegue até a pasta do backend:

```bash
cd backend
```

2. Instale as dependências:

```bash
npm install
```

3. Configure o arquivo `.env` com suas credenciais:

```env
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=sua_chave_aqui
DRIVE_DISK=local

# Configurações do Banco de Dados
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_DATABASE=portal_talentos

# Configurações de Email
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu_email@gmail.com
MAIL_PASSWORD=sua_senha_app
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=seu_email@gmail.com
MAIL_FROM_NAME="Portal de Talentos"
```

4. Execute as migrações do banco de dados:

```bash
node ace migration:run
```

5. (Opcional) Execute os seeds para popular o banco com dados iniciais:

```bash
node ace db:seed
```

## 🚀 Executando o Projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

A API estará disponível em `http://localhost:3333`

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo de desenvolvimento
- `npm run build` - Compila o projeto para produção
- `npm start` - Inicia o servidor em modo de produção
- `npm test` - Executa os testes

## 🎨 Estrutura do Projeto

```
app/
  ├── Controllers/    # Controladores da aplicação
  ├── Models/        # Modelos do banco de dados
  ├── Middleware/    # Middlewares personalizados
  ├── Validators/    # Validadores de dados
  ├── Services/      # Serviços da aplicação
  └── Exceptions/    # Tratamento de exceções

config/              # Configurações da aplicação
database/
  ├── migrations/    # Migrações do banco de dados
  └── seeders/      # Seeds para popular o banco
```

## 🔐 Endpoints da API

### Autenticação

```
POST /api/auth/login
POST /api/auth/logout
```

### Candidatos

```
GET    /api/candidates
POST   /api/candidates
GET    /api/candidates/:id
PUT    /api/candidates/:id
DELETE /api/candidates/:id
```

### Usuários

```
POST /api/users
GET  /api/users/:id
PUT  /api/users/:id
```

### Utilitários

```
GET /api/cep/:cep
```

## 📦 Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

## 🔒 Segurança

- Autenticação JWT
- Validação de dados
- Sanitização de inputs
- CORS configurado
- Rate limiting
- Proteção contra SQL Injection

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.
