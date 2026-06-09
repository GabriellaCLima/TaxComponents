import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_troque_em_producao';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

if (!process.env.JWT_SECRET) {
    console.warn('⚠️  AVISO: JWT_SECRET não definido no .env!');
}

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

const users = [];
const comparisons = [];

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPassword = (password) => {
    return typeof password === 'string' && password.length >= 6;
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'Acesso negado. Token não fornecido.',
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err) {
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

app.post('/register', async (req, res) => {
    try {
        const { name, email, password, profession } = req.body;

        if (!name || !email || !password || !profession) {
            return res.status(400).json({
                error: 'Todos os campos são obrigatórios.',
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                error: 'Formato de e-mail inválido.',
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                error: 'A senha deve ter no mínimo 6 caracteres.',
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const userExists = users.find((user) => user.email === normalizedEmail);
        if (userExists) {
            return res.status(409).json({
                error: 'Este e-mail já está cadastrado.',
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            id: randomUUID(),
            name: name.trim(),
            profession: profession.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);

        const token = jwt.sign(
            {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                profession: newUser.profession,
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(201).json({
            message: 'Usuário cadastrado com sucesso!',
            token,
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

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'E-mail e senha são obrigatórios.',
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = users.find((user) => user.email === normalizedEmail);
        if (!user) {
            return res.status(401).json({
                error: 'E-mail ou senha incorretos.',
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'E-mail ou senha incorretos.',
            });
        }

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
    const { id, name, email, profession } = req.user;
    return res.status(200).json({ id, name, email, profession });
});

app.post('/comparisons', authenticateToken, (req, res) => {
    try {
        const { taxData } = req.body;

        if (!taxData) {
            return res.status(400).json({
                error: 'Os dados do comparativo não foram enviados.',
            });
        }

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

app.get('/comparisons', authenticateToken, (req, res) => {
    try {
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
                error: 'Comparativo não encontrado ou sem permissão.',
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

app.listen(PORT, () => {
    
    console.log(`   Servidor rodando na porta ${PORT}     `);
    
});