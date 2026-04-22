# Calculadora Tributária NAF

Uma aplicação web para auxiliar profissionais de psicologia no cálculo de tributos, desenvolvida para o NAF (Núcleo de Apoio Fiscal) da Unichristus.

![NAF Logo](./Assets/NAF.jpg)

## Resumo de dependências necessárias:

```bash
npm install react-router-dom react-hook-form tailwindcss @tailwindcss/vite @mui/material zustand express mysql2 nodemailer jsonwebtoken dotenv body-parser
```

## 🚀 Funcionalidades

### Principais Recursos
- Cálculo de tributação para Pessoa Física (PF) e Pessoa Jurídica (PJ)
- Sistema de autenticação (login/registro)
- Modo claro/escuro
- Calculadoras interativas com resultados detalhados
- Explicações detalhadas sobre tributação
- Formulário de contato com localização

### Cálculos Disponíveis
- **Pessoa Física:**
  - Base de cálculo (Renda - Custos)
  - Alíquotas progressivas do IRPF
  - Deduções aplicáveis
  
- **Pessoa Jurídica:**
  - Simples Nacional (6% sobre receita)
  - Pró-labore (28% da renda ou salário mínimo)
  - INSS (11% sobre pró-labore)
  - IR sobre pró-labore

## 🛠️ Tecnologias

- **Frontend:**
  - React + Vite
  - Material-UI (MUI)
  - TailwindCSS
  - React Router Dom
  - React Hook Form
  - Zustand (gerenciamento de estado)

- **Backend:**
  - Node.js
  - Express
  - Body-Parser
  - NodeMailer
  - jsonwebtoken (JWT)
  - MySQL
  - dotenv
  
## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/JoaoVictor-Nunes/Calculadora-Tributaria-React.git
cd Calculadora-Tributaria-React
```

2. Instale as dependências:
```bash
npm install react-router-dom react-hook-form tailwindcss @tailwindcss/vite @mui/material zustand
```

3. Execute o projeto:
```bash
npm run dev
```

## 🏗️ Estrutura do Projeto

```
src/
├── Components/          # Componentes reutilizáveis
│   ├── Inputs/         # Componentes de entrada (Email, Password)
│   ├── Modals/         # Modais da aplicação
│   └── ...            
├── Pages/              # Páginas da aplicação
│   ├── Login/
│   ├── Register/
│   ├── Calculo         # Páginas de cálculo
|   └── ...
├── Layout/             # Layouts e templates
├── store/              # Gerenciamento de estado (Zustand)
├── Tema.jsx           # Configuração de tema (claro/escuro)
└── App.jsx            # Componente principal
```

## 🔧 Configuração

### Ambiente de Desenvolvimento
- Node.js (versão recomendada: >= 14.x)
- NPM

## Variáveis de Ambiente

### 1. Email: 
  ```javascript
  process.env.email
  ```

### 2. Password (senha):
  ```javascript
  process.env.password
  ```

### 3. Email NAF:
  ```javascript
  process.env.email_naf
  ```

### 4. Senha MySQL:
  ```javascript
  process.env.db_pass
  ```

## 🔐 Autenticação

O sistema inclui:
- Login de usuário
- Registro de novo usuário
- Recuperação de senha
- Persistência de sessão

## 🎨 Temas

Suporte a tema claro e escuro com:
- Alternância automática
- Persistência de preferência
- Cores personalizadas por tema

## 📊 Funcionalidades da Calculadora

### Pessoa Física
- Input de renda mensal
- Input de custos mensais
- Cálculo automático de:
  - Base de cálculo
  - Alíquota aplicável
  - Valor do imposto

### Pessoa Jurídica
- Cálculo de tributação para MEI/Simples Nacional
- Consideração de pró-labore
- Cálculo de INSS
- Demonstrativo detalhado


# Configuração do Backend

## Pré-requisitos

1. MySQL instalado e rodando
2. Banco de dados `auth_db` criado

## Instale as dependências

```bash
npm install express mysql2 nodemailer jsonwebtoken dotenv body-parser
```

## Configuração do Banco de Dados

1. Abra o MySQL e crie o banco de dados:
```sql
CREATE DATABASE auth_db -- ou o nome que vc quiser;
```

2. Configure as credenciais no arquivo `server.js`:
```javascript
const dbConfig = {
    host: 'localhost',
    user: 'root', 
    password: process.env.password
    database: 'auth_db' // ou o nome que vc escolheu
};
```

## Como Rodar

### Terminal 1 - Backend (Node.js)
```bash
npm start
```
O servidor estará rodando em `http://localhost:3000`

### Terminal 2 - Frontend (React/Vite)
```bash
npm run dev
```
O frontend estará rodando em `http://localhost:5173`

## Endpoints Disponíveis

### POST /register
Registra um novo usuário
```json
{
  "username": "Nome do Usuário",
  "profissao": "Psicólogo(a)",
  "email": "email@example.com",
  "password": "senha123"
}
```

### POST /login
Faz login do usuário
```json
{
  "email": "email@example.com",
  "password": "senha123"
}
```

### POST /api/contact
Manda um email para o usuário e o usuário recebe um email da naf confirmando que recebeu a mensagem.
```json
{
    "name": "joao",
    "email": "email@example.com",
    "subject": "Mensagem de teste",
    "message": "Lorem ipsum"
}
```

### POST /api/send-reset-link
Manda um email para recuperação de senha do usuário.
```json
{
    "email": "email@example.com"
}
```

### GET /protected
Rota protegida que requer autenticação (token JWT no header Authorization)

## Notas Importantes

- O token JWT é armazenado no localStorage do navegador
- O token expira em 1 hora
- O CORS está configurado para permitir requisições do frontend na porta 5173

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE.md) para mais detalhes.

## 📞 Contato

NAF Unichristus - naf01.dl@unichristus.edu.br

Instagram: [@naf.unichristus](https://instagram.com/naf.unichristus)

---

Desenvolvido para o NAF (Núcleo de Apoio Fiscal) da Unichristus © 2025
