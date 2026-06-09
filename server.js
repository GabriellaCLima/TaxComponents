import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import 'dotenv/config'; // ✅ Adicionar apenas isso

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET; // Lê do .env
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

// Aviso apenas se realmente não tiver JWT_SECRET
if (!process.env.JWT_SECRET) {
    console.warn('  AVISO: JWT_SECRET não definido no .env!');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURAÇÕES DE SEGURANÇA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// JWT_SECRET via variável de ambiente com fallback de desenvolvimento
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_troque_em_producao';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

if (!process.env.JWT_SECRET) {
    console.warn('⚠️  AVISO: JWT_SECRET não definido no ambiente. Use um .env em produção!');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  1. MIDDLEWARES GLOBAIS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. ARMAZENAMENTO EM MEMÓRIA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Arrays em memória (substituem o MySQL por enquanto)
// Para persistência real, conecte um banco de dados futuramente
const users = [];
const comparisons = [];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FUNÇÕES AUXILIARES DE VALIDAÇÃO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Valida formato de email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Valida força mínima da senha
const isValidPassword = (password) => {
    return typeof password === 'string' && password.length >= 6;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. MIDDLEWARE DE AUTENTICAÇÃO JWT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <TOKEN>

    if (!token) {
        return res.status(401).json({
            error: 'Acesso negado. Token não fornecido.',
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err) {
            // ✅ Mensagens distintas para token expirado vs inválido
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    error: 'Sessão expirada. Faça login novamente.',
                });
            }
            return res.status(403).json({
                error: 'Token inválido.',
            });
        }

        req.user = decodedUser;
        next();
    });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROTAS DE AUTENTICAÇÃO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 3. POST /register — Cadastro de usuário
app.post('/register', async (req, res) => {
    try {
        const { name, email, password, profession } = req.body;

        // Validação de campos obrigatórios
        if (!name || !email || !password || !profession) {
            return res.status(400).json({
                error: 'Todos os campos (nome, profissão, e-mail, senha) são obrigatórios.',
            });
        }

        // Validação de formato de email
        if (!isValidEmail(email)) {
            return res.status(400).json({
                error: 'Formato de e-mail inválido.',
            });
        }

        // Validação de força da senha
        if (!isValidPassword(password)) {
            return res.status(400).json({
                error: 'A senha deve ter no mínimo 6 caracteres.',
            });
        }

        // Normaliza o email para minúsculas antes de verificar duplicata
        const normalizedEmail = email.toLowerCase().trim();

        const userExists = users.find((user) => user.email === normalizedEmail);
        if (userExists) {
            return res.status(409).json({
                error: 'Este e-mail já está cadastrado.',
            });
        }

        // 5. Criptografa a senha com bcrypt (salt 10)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ID único gerado com crypto.randomUUID() — sem risco de colisão
        const newUser = {
            id: randomUUID(),
            name: name.trim(),
            profession: profession.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);

        // Nunca retorna a senha, nem o hash
        return res.status(201).json({
            message: 'Usuário cadastrado com sucesso!',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                profession: newUser.profession,
            },
        });

    } catch (error) {
        console.error('Erro no /register:', error);
        return res.status(500).json({
            error: 'Erro interno ao cadastrar o usuário.',
        });
    }
});

// 4. POST /login — Login do usuário
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validação de campos
        if (!email || !password) {
            return res.status(400).json({
                error: 'E-mail e senha são obrigatórios.',
            });
        }

        // Normaliza o email para comparação
        const normalizedEmail = email.toLowerCase().trim();

        const user = users.find((user) => user.email === normalizedEmail);

        // Mesma mensagem para email e senha inválidos (evita enumeração de usuários)
        if (!user) {
            return res.status(401).json({
                error: 'E-mail ou senha incorretos.',
            });
        }

        // 5. ✅ Compara senha com hash armazenado
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'E-mail ou senha incorretos.',
            });
        }

        // 6. Gera o Token JWT com dados públicos do usuário
        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                profession: user.profession,
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            message: 'Login realizado com sucesso!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profession: user.profession,
            },
        });

    } catch (error) {
        console.error('Erro no /login:', error);
        return res.status(500).json({
            error: 'Erro interno ao realizar o login.',
        });
    }
});

app.get('/me', authenticateToken, (req, res) => {
    // Os dados já estão no token decodificado
    const { id, name, email, profession } = req.user;
    return res.status(200).json({ id, name, email, profession });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROTAS DE COMPARATIVOS (PROTEGIDAS POR JWT)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 8. POST /comparisons — Salvar comparativo
app.post('/comparisons', authenticateToken, (req, res) => {
    try {
        const { taxData } = req.body;

        if (!taxData) {
            return res.status(400).json({
                error: 'Os dados do comparativo (taxData) não foram enviados.',
            });
        }

        // ✅ ID único com randomUUID
        const newComparison = {
            id: randomUUID(),
            userId: req.user.id,
            taxData,
            createdAt: new Date().toISOString(),
        };

        comparisons.push(newComparison);

        return res.status(201).json({
            message: 'Comparativo salvo com sucesso!',
            comparison: newComparison,
        });

    } catch (error) {
        console.error('Erro no POST /comparisons:', error);
        return res.status(500).json({
            error: 'Erro interno ao salvar o comparativo.',
        });
    }
});

// 9. GET /comparisons — Listar comparativos do usuário logado
app.get('/comparisons', authenticateToken, (req, res) => {
    try {
        // ✅ Filtra apenas os comparativos do usuário autenticado
        const userComparisons = comparisons.filter(
            (comp) => comp.userId === req.user.id
        );

        return res.status(200).json({
            count: userComparisons.length,
            comparisons: userComparisons,
        });

    } catch (error) {
        console.error('Erro no GET /comparisons:', error);
        return res.status(500).json({
            error: 'Erro interno ao buscar os comparativos.',
        });
    }
});

app.delete('/comparisons/:id', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;

        const index = comparisons.findIndex(
            (comp) => comp.id === id && comp.userId === req.user.id
        );

        if (index === -1) {
            return res.status(404).json({
                error: 'Comparativo não encontrado ou sem permissão para deletar.',
            });
        }

        comparisons.splice(index, 1);

        return res.status(200).json({
            message: 'Comparativo deletado com sucesso!',
        });

    } catch (error) {
        console.error('Erro no DELETE /comparisons/:id:', error);
        return res.status(500).json({
            error: 'Erro interno ao deletar o comparativo.',
        });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 INICIALIZAÇÃO DO SERVIDOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.listen(PORT, () => {
    
    console.log(` Servidor rodando na porta ${PORT}     `);

});