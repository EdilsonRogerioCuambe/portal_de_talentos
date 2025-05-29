# 🎯 Portal de Talentos

> Sistema completo para gerenciamento de candidatos e seleção de talentos em desenvolvimento web.

## 📋 Sobre o Projeto

O Portal de Talentos é uma aplicação web full-stack desenvolvida para empresas que desejam implementar um banco de talentos de programadores. O sistema permite que candidatos se cadastrem com suas informações profissionais e que gestores visualizem, busquem e selecionem candidatos para entrevistas.

## 🚀 Tecnologias Utilizadas

### Backend
- **AdonisJS V5** - Framework Node.js robusto e elegante
- **MySQL** - Banco de dados relacional
- **JWT** - Autenticação segura
- **Nodemailer** - Sistema de envio de emails
- **ViaCEP API** - Preenchimento automático de endereços

### Frontend
- **React** - Biblioteca JavaScript para interfaces
- **React Router** - Roteamento do lado do cliente
- **Axios** - Cliente HTTP para requisições
- **CSS Modules** - Estilização modular

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
- Node.js (v16 ou superior)
- MySQL (v8.0 ou superior)
- NPM ou Yarn

### Opção 1: Instalação Manual

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
# Edite o .env com suas configurações

# Execute as migrations
npm run migration:run

# Execute os seeds (dados iniciais)
npm run seed

# Inicie o servidor
npm run dev
```

#### 3. Configuração do Frontend
```bash
cd ../frontend
npm install

# Copie e configure o arquivo de ambiente
cp .env.example .env
# Configure a URL da API

# Inicie a aplicação
npm start
```

### Opção 2: Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/portal-talentos.git
cd portal-talentos

# Configure os arquivos .env em backend e frontend

# Suba todos os serviços
docker-compose up -d

# Execute as migrations
docker-compose exec backend npm run migration:run

# Execute os seeds
docker-compose exec backend npm run seed
```

## 🌐 Acessos

### Desenvolvimento Local
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3333
- **phpMyAdmin**: http://localhost:8080 (usuário: root, senha: root)

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
POST /api/auth/login       # Login de usuário
POST /api/auth/logout      # Logout
POST /api/auth/refresh     # Renovar token
```

#### Candidatos
```
GET    /api/candidates        # Listar candidatos (gestores)
POST   /api/candidates        # Cadastrar candidato
GET    /api/candidates/:id    # Visualizar candidato
PUT    /api/candidates/:id    # Atualizar candidato
POST   /api/candidates/select # Selecionar para entrevista
```

#### Usuários
```
POST /api/users/register      # Registro de usuário
POST /api/users/set-password  # Definir senha
GET  /api/users/profile       # Perfil do usuário
```

#### Utilitários
```
GET /api/cep/:cep            # Buscar endereço por CEP
GET /api/skills              # Listar habilidades disponíveis
```

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

## 📦 Deploy

### Produção
1. Configure as variáveis de ambiente para produção
2. Execute o build do frontend: `npm run build`
3. Configure o servidor web (Nginx/Apache)
4. Configure o banco de dados MySQL
5. Execute as migrations em produção

### Sugestões de Hosting
- **Backend**: Heroku, DigitalOcean, AWS
- **Frontend**: Vercel, Netlify, AWS S3
- **Banco**: AWS RDS, PlanetScale

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

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Desenvolvedor** - *Trabalho inicial* - [SeuPerfil](https://github.com/seu-usuario)

## 🙏 Agradecimentos
- Equipe AdonisJS pela excelente documentação
- Comunidade React pelas melhores práticas
- ViaCEP pela API gratuita de CEP
