import express from "express";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

// Inicializa as variáveis de ambiente do .env
dotenv.config();

const app = express();
const PORT = 3000;
const saltRounds = 10;

// Middlewares Globais
app.use(express.json()); // Substitui o body-parser
app.use(
  cors({
    origin: "http://localhost:5173", // Porta padrão do Vite
    credentials: true,
  })
);

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.email,
    pass: process.env.password,
  },
});

// Configuração do MySQL (Pool de conexões)
const dbConfig = {
  host: "localhost",
  user: "root",
  password: process.env.db_pass,
  database: "auth_db",
};

const pool = mysql.createPool(dbConfig);

// Inicializar banco de dados e tabela
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();

    // Cria a tabela de usuários caso não exista
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                profissao VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL, 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    connection.release();
    console.log("Tabela 'users' verificada/criada com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
  }
}

// Executa a verificação do banco ao iniciar o servidor
initializeDatabase();


// ==========================================
// ROTAS DA APLICAÇÃO
// ==========================================

// 1. ROTA DE CONTATO (Envio de Emails)
app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  // Template de email para o NAF
  const nafHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Novo Formulário de Contato</h2>
      <p><strong>Nome:</strong> ${name}</p>
      <p><strong>Email: </strong> ${email}</p>
      <p><strong>Assunto:</strong> ${subject}</p>
      <p><strong>Mensagem:</strong> ${message}</p>
    </div>
  `;

  // Template de email para o Usuário (Recibo)
  const userHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Confirmação de Contato</h2>
      <p>Olá, ${name}.</p>
      <p>Recebemos sua mensagem com sucesso. Obrigado por nos contatar!</p>
      <p><em>ATENÇÃO: NÃO RESPONDEMOS ESTE EMAIL. ELE SERVE APENAS COMO UM RECIBO AUTOMÁTICO.</em></p>
    </div>
  `;

  const nafMailOptions = {
    from: email,
    to: process.env.email_naf,
    subject: `[NAF] ${subject}`,
    html: nafHtml,
  };

  const userMailOptions = {
    from: process.env.email_naf,
    to: email,
    subject: "Confirmação de recebimento do formulário",
    html: userHtml,
  };

  // Envia para o NAF
  transporter.sendMail(nafMailOptions, (error, info) => {
    if (error) {
      console.error("Erro ao enviar email para NAF:", error);
      return res.status(500).json({ error: "Erro ao enviar email para o NAF." });
    }

    console.log("Email enviado para NAF: " + info.response);

    // Envia recibo para o usuário
    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.error("Erro ao enviar email para o usuário: ", error);
        return res.status(500).json({ error: "Erro ao enviar recibo para o usuário." });
      }
      
      console.log("Email enviado para o usuário: " + info.response);
      res.status(200).json({ success: true, message: "Ambos os emails foram enviados com sucesso!" });
    });
  });
});

// 2. ROTA DE LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Busca usuário pelo email
    const [users] = await pool.execute(
      "SELECT id, username, email, password FROM users WHERE email = ?", 
      [email] 
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Email ou senha inválidos!" });
    }

    const user = users[0];

    // Verifica integridade da senha no banco
    if (!user.password) {
      console.error("ERRO: Senha não encontrada no banco para o usuário:", user.email);
      return res.status(500).json({ message: "Erro interno no sistema de autenticação." });
    }

    // Compara a senha digitada com o hash salvo
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email ou senha inválidos!" });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Autenticação realizada!",
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro interno do servidor", error: error.message });
  }
});

// 3. ROTA DE REGISTRO
app.post("/register", async (req, res) => {
  try {
    const { username, profissao, email, password } = req.body;

    // Validação de entrada
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios!" });
    }

    // Verifica se email já está cadastrado
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Email já cadastrado!" });
    }

    // Gera o hash da senha
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insere no banco
    const [result] = await pool.execute(
      "INSERT INTO users (username, profissao, email, password) VALUES (?, ?, ?, ?)",
      [username, profissao, email, hashedPassword]
    );

    const userId = result.insertId;
    
    // Gera token JWT para o novo usuário já fazer login automático
    const token = jwt.sign(
      { id: userId, username: username, email: email, profissao: profissao },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      userId: userId,
      token: token,
      user: {
        id: userId,
        username: username,
        email: email,
        profissao: profissao
      }
    });

  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ message: "Erro interno do servidor", error: error.message });
  }
});

// 4. ROTA DE RECUPERAÇÃO DE SENHA
app.post("/api/send-reset-link", async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await pool.execute(
      "SELECT id, email, username FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Email não encontrado" });
    }

    const user = users[0];

    const passResetHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Recuperação de Senha</h2>
      <p>Olá, ${user.username}</p>
      <p>Foi solicitada a recuperação de senha para esta conta.</p>
      <p><strong>ISTO É APENAS UM TESTE DO NAF. A SENHA NÃO SERÁ REALMENTE ALTERADA.</strong></p>
    </div>`;

    const passResetOptions = {
      from: process.env.email,
      to: email,
      subject: "Recuperação de Senha",
      html: passResetHtml,
    };

    transporter.sendMail(passResetOptions, (error, info) => {
      if (error) {
        console.error("Erro ao enviar email de recuperação: ", error);
        return res.status(500).json({ error: "Erro ao enviar email de recuperação." });
      }
      console.log("Email de recuperação enviado: " + info.response);
      
      // A resposta para o front-end deve ficar dentro do callback de sucesso do email
      res.status(200).json({
        message: "Link de recuperação enviado com sucesso!",
        email: email,
        userId: user.id,
      });
    });

  } catch (error) {
    console.error("Erro ao enviar link de recuperação:", error);
    res.status(500).json({ message: "Erro interno do servidor", error: error.message });
  }
});

// ==========================================
// MIDDLEWARES DE AUTENTICAÇÃO
// ==========================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token não fornecido!" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido ou expirado!" });
    }
    req.user = user;
    next();
  });
};

// 5. ROTA PROTEGIDA (Exemplo)
app.get("/protected", authenticateToken, (req, res) => {
  res.status(200).json({
    message: "Acesso autorizado à rota protegida!",
    user: req.user,
  });
});

// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});