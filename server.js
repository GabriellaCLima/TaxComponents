import express from "express";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import cors from "cors";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
const PORT = 3000;
const SECRET_KEY = "847504968901ce55ef28d6a7fa24b568c6966734";
app.use(bodyParser.json());
const saltRounds = 10;

// Configurar CORS para permitir requisições do frontend
app.use(
  cors({
    origin: "http://localhost:5173", // Porta padrão
    credentials: true,
  })
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.email,
    pass: process.env.password,
  },
});

app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  // Template de email para o NAF
  const nafHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Novo Formulário</h2>
      <p>
        <strong>Nome:</strong> ${name}
      </p>
      <p>
        <strong>Email: </strong> ${email}
      </p>
      <p>
        <strong>Assunto:</strong> ${subject}
      </p>
      <p>
        <strong>Mensagem:</strong> ${message}
      </p>
    </div>
    `;
  // email para o usuario
  const userHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Novo formulário</h2>
      <p>Olá, ${name}</p>
      <p>Recebemos seu email. Obrigado por nos contatar!</p>
      <h2>ATENÇÃO: NÃO RESPONDEMOS ESTE EMAIL. ELE SERVE APENAS PARA SER UM RECIBO AUTOMÁTICO.</h2>
    </div>
    `;
  const nafMailOptions = {
    from: email,
    to: process.env.email_naf,
    subject: `${subject}`,
    html: nafHtml,
  };

  const userMailOptions = {
    from: process.env.email_naf,
    to: email,
    subject: "Confirmação de recebimento do formulário",
    html: userHtml,
  };

  transporter.sendMail(nafMailOptions, (error, info) => {
    if (error) {
      console.error("Erro ao enviar email para NAF:", error);
      return res
        .status(500)
        .json({ error: "Error ao enviar email para a NAF." });
    }

    console.log("Email enviado para NAF: " + info.response);

    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.error("Error ao enviar email para o usuário: ", error);
        return res
          .status(500)
          .json({ error: "Error ao enviar email para o usuário. " });
      }
      console.log("Email enviado para o usuário: " + info.response);
      res
        .status(200)
        .json({ success: true, message: "Ambos email enviados com sucesso! " });
    });
  });
});

app.use(express.json());

// Configuração do MySQL
const dbConfig = {
  host: "localhost",
  user: "root",
  password: process.env.db_pass,
  database: "auth_db",
};

const pool = mysql.createPool(dbConfig);

// Inicializar banco de dados
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();

    // APENAS criar a tabela se não existir
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
    console.log("Tabela users verificada/criada com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar banco:", error);
  }
}

initializeDatabase();

// LOGIN DO USUARIO
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;


    // BUSCA APENAS POR EMAIL
    const [users] = await pool.execute(
      "SELECT id, username, email, password FROM users WHERE email = ?", 
      [email] 
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        message: "Email ou senha inválidos!" 
      });
    }

    const user = users[0];

    // debug para verificar o que está vindo do banco
    console.log('Usuário encontrado:', {
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
      passwordStored: user.password ? '***' + user.password.slice(-4) : 'N/A'
    });

    // Verifica se a senha foi armazenada corretamente
    if (!user.password) {
      console.error("ERRO: Senha não encontrada no banco para o usuário:", user.email);
      return res.status(500).json({ 
        message: "Erro interno no sistema de autenticação" 
      });
    }

    // COMPARA SENHA APÓS BUSCAR USUÁRIO
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "Email ou senha inválidos!" 
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
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
    res.status(500).json({ 
      message: "Erro interno do servidor",
      error: error.message 
    });
  }
});

// REGISTRO DO USUARIO
app.post("/register", async (req, res) => {
  try {
    const { username, profissao, email, password } = req.body;

    console.log("📥 REGISTRO - Dados recebidos:", req.body);

    // Validação de entrada
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: "Todos os campos são obrigatórios!" 
      });
    }

    // Verifica se email já existe
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        message: "Email já cadastrado!" 
      });
    }

    // Gera o hash da senha
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log("Inserindo no banco...");

    const [result] = await pool.execute(
      "INSERT INTO users (username, profissao, email, password) VALUES (?, ?, ?, ?)",
      [username, profissao, email, hashedPassword]
    );

    const userId = result.insertId;
    
    // gera token JWT para o novo usuário
    const token = jwt.sign(
      {
        id: userId,
        username: username,
        email: email,
        profissao: profissao
      },
      SECRET_KEY,
      { expiresIn: "24h" } // Token válido por 24 horas
    );

    // Busca o usuário recém-criado
    const [newUsers] = await pool.execute(
      "SELECT id, username, email, profissao FROM users WHERE id = ?",
      [userId]
    );

    const newUser = newUsers[0];

    console.log("Usuário registrado e token gerado para ID:", userId);

    // Retorna token E dados do usuário
    res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      userId: userId,
      token: token, // ← Token incluído na resposta
      user: {      // ← Dados do usuário incluídos
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        profissao: newUser.profissao
      }
    });

  } catch (error) {
    console.error("Erro detalhado no registro:", error.message);
    res.status(500).json({
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// RECUPERAÇÃO DE SENHA DO USUÁRIO
app.post("/api/send-reset-link", async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar se o email existe no banco de dados
    const [users] = await pool.execute(
      "SELECT id, email, username FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "Email não encontrado",
      });
    }

    const user = users[0];

    const passResetHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Recuperação de Senha</h2>
      <p>Olá, ${user.username}</p>
      <p>Sua senha foi solicitada para recuperação.</p>
      <h2>ISTO É APENAS UM TESTE, NÃO DEVE SER REALMENTE RECUPERADA.</h2>
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
        return res
          .status(500)
          .json({ error: "Erro ao enviar email de recuperação." });
      }
      console.log("Email de recuperação enviado: " + info.response);
    });
    // // Simular envio de email
    // console.log(`[RECUPERAÇÃO] Link de recuperação para: ${email}`);
    // console.log(`[RECUPERAÇÃO] Usuário: ${user.username}`);

    res.status(200).json({
      message: "Link de recuperação enviado com sucesso!",
      email: email,
      userId: user.id,
    });
  } catch (error) {
    console.error("Erro ao enviar link de recuperação:", error);
    res.status(500).json({
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token não fornecido!" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido!" });
    }
    req.user = user;
    next();
  });
};

app.get("/protected", authenticateToken, (req, res) => {
  res.status(200).json({
    message: "Acesso autorizado à rota protegida!",
    user: req.user,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
