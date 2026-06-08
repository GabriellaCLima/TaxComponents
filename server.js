import express from "express";
import jwt from "jsonwebtoken";
import prisma from "./src/database/prismaClient.js";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
const PORT = 3000;
const saltRounds = 10;

const SECRET_KEY =
  process.env.JWT_SECRET || "847504968901ce55ef28d6a7fa24b568c6966734";

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
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

// ==========================================
// ROTAS PÚBLICAS
// ==========================================

// 1. ROTA DE CONTATO
app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  const nafHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Novo Formulário de Contato</h2>
      <p><strong>Nome:</strong> ${name}</p>
      <p><strong>Email: </strong> ${email}</p>
      <p><strong>Assunto:</strong> ${subject}</p>
      <p><strong>Mensagem:</strong> ${message}</p>
    </div>
  `;

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

  transporter.sendMail(nafMailOptions, (error, info) => {
    if (error) {
      console.error("Erro ao enviar email para NAF:", error);
      return res.status(500).json({
        error: "Erro ao enviar email para o NAF.",
      });
    }

    console.log("Email enviado para NAF: " + info.response);

    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.error("Erro ao enviar email para o usuário:", error);
        return res.status(500).json({
          error: "Erro ao enviar recibo para o usuário.",
        });
      }

      console.log("Email enviado para o usuário: " + info.response);

      res.status(200).json({
        success: true,
        message: "Ambos os emails foram enviados com sucesso!",
      });
    });
  });
});

// 2. ROTA DE LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Email ou senha inválidos!",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Email ou senha inválidos!",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        profissao: user.profissao,
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Autenticação realizada!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profissao: user.profissao,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);

    res.status(500).json({
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// 3. ROTA DE REGISTRO
app.post("/register", async (req, res) => {
  try {
    const { username, profissao, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Todos os campos são obrigatórios!",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email já cadastrado!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        username,
        profissao,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        profissao: user.profissao,
      },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      userId: user.id,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profissao: user.profissao,
      },
    });
  } catch (error) {
    console.error("Erro no registro:", error);

    res.status(500).json({
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// 4. ROTA DE RECUPERAÇÃO DE SENHA
app.post("/api/send-reset-link", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "Email não encontrado",
      });
    }

    const passResetHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Recuperação de Senha</h2>
        <p>Olá, ${user.username}</p>
        <p>Foi solicitada a recuperação de senha para esta conta.</p>
        <p><strong>ISTO É APENAS UM TESTE DO NAF. A SENHA NÃO SERÁ REALMENTE ALTERADA.</strong></p>
      </div>
    `;

    const passResetOptions = {
      from: process.env.email,
      to: email,
      subject: "Recuperação de Senha",
      html: passResetHtml,
    };

    transporter.sendMail(passResetOptions, (error, info) => {
      if (error) {
        console.error("Erro ao enviar email de recuperação:", error);

        return res.status(500).json({
          error: "Erro ao enviar email de recuperação.",
        });
      }

      console.log("Email de recuperação enviado: " + info.response);

      res.status(200).json({
        message: "Link de recuperação enviado com sucesso!",
        email,
        userId: user.id,
      });
    });
  } catch (error) {
    console.error("Erro ao enviar link de recuperação:", error);

    res.status(500).json({
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// ==========================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ==========================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({
      message: "Token não fornecido!",
    });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "Token inválido ou expirado!",
      });
    }

    req.user = user;
    next();
  });
};

// ==========================================
// ROTAS PROTEGIDAS
// ==========================================

// 5. ROTA PROTEGIDA DE TESTE
app.get("/protected", authenticateToken, (req, res) => {
  res.status(200).json({
    message: "Acesso autorizado à rota protegida!",
    user: req.user,
  });
});

// 6. ROTA PARA SALVAR COMPARATIVO
app.post("/comparisons", authenticateToken, async (req, res) => {
  try {
    const {
      profession,
      monthlyIncome,
      monthlyCosts,
      pfResult,
      pjResult,
      bestOption,
    } = req.body;

    const comparison = await prisma.comparison.create({
      data: {
        profession,
        monthlyIncome,
        monthlyCosts,
        pfResult,
        pjResult,
        bestOption,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      message: "Comparativo salvo com sucesso!",
      comparison,
    });
  } catch (error) {
    console.error("Erro ao salvar comparativo:", error);

    res.status(500).json({
      message: "Erro ao salvar comparativo",
      error: error.message,
    });
  }
});

// 7. ROTA PARA LISTAR COMPARATIVOS DO USUÁRIO
app.get("/comparisons", authenticateToken, async (req, res) => {
  try {
    const comparisons = await prisma.comparison.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(comparisons);
  } catch (error) {
    console.error("Erro ao buscar comparativos:", error);

    res.status(500).json({
      message: "Erro ao buscar comparativos",
      error: error.message,
    });
  }
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});