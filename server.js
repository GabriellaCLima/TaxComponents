import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_troque_em_producao';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

if (!process.env.JWT_SECRET) {
    console.warn('  AVISO: JWT_SECRET não definido no .env!');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  CONEXÃO COM POSTGRESQL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
                name      VARCHAR(100) NOT NULL,
                profession VARCHAR(100) NOT NULL,
                email     VARCHAR(100) UNIQUE NOT NULL,
                password  VARCHAR(255) NOT NULL,
                created_at TIMESTAMP   DEFAULT NOW()
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS comparisons (
                id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                tax_data   JSONB   NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        console.log(' PostgreSQL conectado e tabelas criadas!');
    } catch (error) {
        console.error(' Erro ao conectar ao banco:', error.message);
        process.exit(1);
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(cors({
    origin: true, //  aceita qualquer localhost — resolve porta dinâmica
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VALIDAÇÕES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPassword = (password) => {
    return typeof password === 'string' && password.length >= 6;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE JWT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /register
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

        //  Verifica email duplicado no PostgreSQL
        const { rows: existing } = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [normalizedEmail]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                error: 'Este e-mail já está cadastrado.',
            });
        }

        // Criptografa a senha com bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insere no PostgreSQL
        const { rows } = await pool.query(
            `INSERT INTO users (name, profession, email, password)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, profession, email, created_at`,
            [name.trim(), profession.trim(), normalizedEmail, hashedPassword]
        );

        const newUser = rows[0];

        // Gera token JWT após cadastro
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /login
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'E-mail e senha são obrigatórios.',
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Busca usuário no PostgreSQL
        const { rows } = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [normalizedEmail]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                error: 'E-mail ou senha incorretos.',
            });
        }

        const user = rows[0];

        // Compara senha com hash salvo no banco
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'E-mail ou senha incorretos.',
            });
        }

        // Gera token JWT após login
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /me
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/me', authenticateToken, (req, res) => {
    const { id, name, email, profession } = req.user;
    return res.status(200).json({ id, name, email, profession });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /comparisons
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/comparisons', authenticateToken, async (req, res) => {
    try {
        const { taxData } = req.body;

        if (!taxData) {
            return res.status(400).json({
                error: 'Os dados do comparativo não foram enviados.',
            });
        }

        //  Salva no PostgreSQL como JSONB vinculado ao usuário logado
        const { rows } = await pool.query(
            `INSERT INTO comparisons (user_id, tax_data)
             VALUES ($1, $2)
             RETURNING *`,
            [req.user.id, JSON.stringify(taxData)]
        );

        return res.status(201).json({
            message: 'Comparativo salvo com sucesso!',
            comparison: rows[0],
        });

    } catch (error) {
        console.error('Erro no POST /comparisons:', error);
        return res.status(500).json({
            error: 'Erro interno ao salvar o comparativo.',
        });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /comparisons
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/comparisons', authenticateToken, async (req, res) => {
    try {
        //  Retorna apenas os comparativos do usuário logado
        const { rows } = await pool.query(
            `SELECT * FROM comparisons
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        return res.status(200).json({
            count: rows.length,
            comparisons: rows,
        });

    } catch (error) {
        console.error('Erro no GET /comparisons:', error);
        return res.status(500).json({
            error: 'Erro interno ao buscar os comparativos.',
        });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELETE /comparisons/:id
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.delete('/comparisons/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        //  Deleta verificando se pertence ao usuário logado
        const { rowCount } = await pool.query(
            'DELETE FROM comparisons WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (rowCount === 0) {
            return res.status(404).json({
                error: 'Comparativo não encontrado ou sem permissão.',
            });
        }

        return res.status(200).json({
            message: 'Comparativo deletado com sucesso!',
        });

    } catch (error) {
        console.error('Erro no DELETE /comparisons:', error);
        return res.status(500).json({
            error: 'Erro interno ao deletar o comparativo.',
        });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  INICIALIZAÇÃO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const startServer = async () => {
    await initDB();
    app.listen(PORT, () => {
   
        console.log(`   Servidor rodando na porta ${PORT}     `);
        console.log(`   PostgreSQL conectado               `);
  
    });
};

startServer();