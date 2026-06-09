const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Chave secreta para assinar os tokens JWT
const JWT_SECRET = 'sua_chave_secreta_super_segura_da_christus';

// 1. Configurar o servidor Express e Middlewares Globais
app.use(cors());
app.use(express.json());

// 2. Arrays em memória para substituir a lógica antiga do MySQL
// (Os dados são limpos sempre que o servidor reinicia)
const users = [];
const comparisons = [];

// 7. Middleware de Autenticação do Token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Captura o token enviado no formato "Bearer <TOKEN>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido ou expirado.' });
        }
        // Salva os dados do usuário logado na requisição
        req.user = decodedUser;
        next();
    });
};

// ROTAS DE AUTENTICAÇÃO

// 3. Rota de cadastro de usuário: POST /register
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validação dos campos obrigatórios
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Todos os campos (nome, email, senha) são obrigatórios.' });
        }

        // Verifica se o e-mail já existe na nossa lista
        const userExists = users.find(user => user.email === email);
        if (userExists) {
            return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
        }

        // 5. Criptografar a senha usando bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Cria o novo usuário com a senha protegida
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword
        };

        users.push(newUser);
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });

    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao cadastrar o usuário.' });
    }
});

// 4. Rota de login: POST /login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        }

        // Procura o usuário cadastrado pelo e-mail
        const user = users.find(user => user.email === email);
        if (!user) {
            return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
        }

        // Valida se a senha enviada bate com a senha criptografada do banco
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
        }

        // 6. Gerar o Token JWT de autenticação (válido por 2 horas)
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        // Retorna o token de acesso e os dados públicos do usuário logado
        res.status(200).json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao realizar o login.' });
    }
});

// ROTAS DE COMPARATIVOS (PROTEGIDAS)

// 8. Rota para salvar comparativos: POST /comparisons
app.post('/comparisons', authenticateToken, (req, res) => {
    try {
        const { taxData } = req.body;

        if (!taxData) {
            return res.status(400).json({ error: 'Os dados do comparativo não foram enviados.' });
        }

        // Cria o objeto do comparativo atrelando ao id do usuário que veio do token
        const newComparison = {
            id: comparisons.length + 1,
            userId: req.user.id, 
            taxData,
            createdAt: new Date()
        };

        comparisons.push(newComparison);
        res.status(201).json({ message: 'Comparativo salvo com sucesso!', comparison: newComparison });

    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao salvar o comparativo.' });
    }
});

// 9. Rota para listar comparativos do usuário logado: GET /comparisons
app.get('/comparisons', authenticateToken, (req, res) => {
    try {
        // Filtra para retornar apenas os cenários que pertencem ao usuário autenticado
        const userComparisons = comparisons.filter(comp => comp.userId === req.user.id);
        res.status(200).json(userComparisons);
        
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao buscar os comparativos.' });
    }
});

// Inicialização do Servidor Express
app.listen(PORT, () => {
    
    console.log(`  Servidor rodando com sucesso na porta ${PORT} `);
    
});