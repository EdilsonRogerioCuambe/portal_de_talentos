# 🎯 Portal de Talentos

> Sistema completo para gerenciamento de candidatos e seleção de talentos em desenvolvimento web.

## 📋 Sobre o Projeto

O Portal de Talentos é uma aplicação web full-stack desenvolvida para empresas que desejam implementar um banco de talentos de programadores. O sistema permite que candidatos se cadastrem com suas informações profissionais e que gestores visualizem, busquem e selecionem candidatos para entrevistas.

## 🚀 Tecnologias Utilizadas

### Backend
- **AdonisJS V5** - Framework Node.js robusto e elegante
- **MySQL** - Banco de dados relacional
- **JWT** - Autenticação segura
- **ViaCEP API** - Preenchimento automático de endereços

### Frontend
- **React** - Biblioteca JavaScript para interfaces
- **React Router** - Roteamento do lado do cliente
- **Axios** - Cliente HTTP para requisições
- **Tailwind CSS** - Estilização moderna e responsiva
- **React Hook Form** - Gerenciamento de formulários
- **Yup** - Validação de formulários
- **Lucide React** - Ícones SVG para React

## ✨ Funcionalidades

### Para Candidatos
- ✅ Cadastro completo com dados pessoais e profissionais
- ✅ Preenchimento automático de endereço via CEP
- ✅ Cadastro de múltiplas formações acadêmicas
- ✅ Seleção de habilidades técnicas pré-definidas
- ✅ Confirmação por email com link para definir senha
- ✅ Dashboard pessoal para visualizar dados
- ✅ Notificações de seleção para entrevistas

### Para Gestores
- ✅ Área restrita com autenticação
- ✅ Listagem completa de candidatos
- ✅ Busca por nome e habilidades
- ✅ Visualização detalhada de perfis
- ✅ Seleção de candidatos para entrevistas
- ✅ Envio automático de emails de convocação

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (19)
- MySQL (v8.0 ou superior)
- NPM ou Yarn

### Instalação

#### 1. Clone o repositório
```bash
git clone https://github.com/EdilsonRogerioCuambe/portal_de_talentos
cd portal-talentos
```

#### 2. Configuração do Backend
```bash
cd backend
npm install

# Copie e configure o arquivo de ambiente
cp .env.example .env
# Edite o .env com suas configurações (veja seção Variáveis de Ambiente)

# Execute as migrations
npm run migration:run

# Execute os seeds (dados iniciais)
npm run seed

# Inicie o servidor
npm run dev
```

#### 3. Configuração do Frontend
```bash
cd frontend
npm install

# Copie e configure o arquivo de ambiente
cp .env.example .env
# Configure a URL da API (veja seção Variáveis de Ambiente)

# Inicie a aplicação
npm start
```

## ⚙️ Variáveis de Ambiente

### Backend (.env)
Configure o arquivo `.env` no diretório backend com as seguintes variáveis:

```env
# Server Configuration
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=_cDV3YN9CEoYn97ZRT87VNjn7vAB2umN
DRIVE_DISK=local

# Database Configuration
DB_CONNECTION=mysql
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DB_NAME=portal_talentos

# JWT Configuration
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d
LOG_LEVEL=debug

# Email Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD="mcwf bdhc fcff vyxp"
MAIL_ENCRYPTION=tls
MAIL_SECURE=false
MAIL_IGNORE_TLS=false
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME="Portal de Talentos"

# URLs
VIACEP_BASE_URL=https://viacep.com.br/ws
FRONTEND_URL=http://localhost:3000

# Session Configuration
SESSION_DRIVER=cookie
SESSION_COOKIE_NAME=adonis-session

# CORS Configuration
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000

# Security
HASH_DRIVER=scrypt
```

### Frontend (.env)
Configure o arquivo `.env` no diretório frontend:

```env
REACT_APP_API_URL=http://localhost:3333
```

### 📝 Observações Importantes sobre as Variáveis

#### Configuração de Email
- O `MAIL_PASSWORD` já está configurado com uma senha de app do Gmail
- Para usar seu próprio email, você precisa gerar uma **Senha de App** nas configurações de segurança da sua conta Google
- Não use sua senha normal do Gmail no `MAIL_PASSWORD`
- Ative a autenticação de 2 fatores antes de gerar a senha de app

#### Segurança
- **Nunca commite** arquivos `.env` no repositório para produção
- Gere uma nova `APP_KEY` para produção usando: `node ace generate:key`
- Use um `JWT_SECRET` forte e único para produção
- Para produção, altere as credenciais de banco de dados e email

#### Banco de Dados
- Certifique-se de que o MySQL está rodando na porta 3306
- Crie o banco de dados `portal_talentos` antes de executar as migrations
- Para produção, use credenciais de banco mais seguras

## 🌐 Acessos

### Desenvolvimento Local
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3333

### Usuários de Teste
Após executar os seeds, você terá os seguintes usuários:

**Gestor:**
- Email: gestor@empresa.com
- Senha: 123456

**Candidato de Teste:**
- Email: candidato@teste.com
- Senha: 123456

## 📖 Documentação da API

### Endpoints Principais

#### Autenticação
```
POST /auth/register        # Registro de usuário
POST /auth/login          # Login de usuário
POST /auth/test-email     # Teste de envio de email
```

#### Usuários Autenticados
```
GET  /me                  # Dados do usuário logado
POST /logout              # Logout
GET  /profile             # Perfil do usuário
PUT  /manager-profile     # Atualizar perfil do gestor
PUT  /candidate-profile   # Atualizar perfil do candidato
DELETE /profile           # Deletar conta
```

#### Gestores (Área Restrita)
```
GET  /candidates                        # Listar candidatos
GET  /candidates/:id                    # Visualizar candidato específico
POST /candidates/:id/schedule-interview # Agendar entrevista
PUT  /candidates/:id/reschedule-interview # Reagendar entrevista
GET  /interviews                        # Listar entrevistas agendadas
```

#### Utilitários (Públicos)
```
GET /skills        # Listar habilidades disponíveis
GET /cep/:cep      # Buscar endereço por CEP
```

### Autenticação
- Todas as rotas protegidas requerem token JWT no header: `Authorization: Bearer {token}`
- Rotas de gestor requerem role `manager`

## 🗄️ Estrutura do Banco de Dados

### Principais Tabelas

- **users** - Usuários do sistema (candidatos e gestores)
- **candidates** - Dados completos dos candidatos
- **educations** - Formações acadêmicas dos candidatos
- **skills** - Habilidades técnicas disponíveis
- **candidate_skills** - Relacionamento entre candidatos e habilidades

## 🧪 Executando Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 🔒 Segurança Implementada

- ✅ Autenticação JWT com refresh tokens
- ✅ Hashing de senhas com bcrypt
- ✅ Validação de dados no backend
- ✅ Sanitização de inputs
- ✅ CORS configurado
- ✅ Rate limiting nos endpoints
- ✅ Middleware de autenticação e autorização

## 🎨 Melhorias Futuras

- [ ] Sistema de notificações em tempo real
- [ ] Upload de currículo em PDF
- [ ] Dashboard com gráficos e estatísticas
- [ ] Sistema de avaliação de candidatos
- [ ] Integração com calendário para entrevistas
- [ ] API de integração com LinkedIn
- [ ] Sistema de templates de email personalizáveis
- [ ] Relatórios avançados em PDF

## 👥 Autores

- **Desenvolvedor** - *Trabalho inicial* - [EdilsonRogerioCuambe](https://github.com/EdilsonRogerioCuambe)