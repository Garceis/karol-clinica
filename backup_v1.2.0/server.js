const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const JWT_SECRET = 'chave_secreta_karol_neuro_2026_antigravity';
const db = new Database('pacientes.db');
const port = 3000;

// Logging para arquivo
const logStream = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
function log(msg) {
    const timestamp = new Date().toISOString();
    const fullMsg = `[${timestamp}] ${msg}\n`;
    console.log(fullMsg);
    logStream.write(fullMsg);
}
log("Iniciando servidor...");

// Logger Global
app.use((req, res, next) => {
    log(`${req.method} ${req.url}`);
    next();
});

// Configuração de Armazenamento de Arquivos (Multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Nome limpo: data-nome-original
        const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage: storage });

// Configuração de Middleware
app.use(cors());
app.use(express.json());

// Servir os arquivos estáticos do React (Frontend Moderno)
const frontendPath = path.join(__dirname, 'admin-frontend', 'dist');
app.use(express.static(frontendPath));

// Servir os uploads separadamente
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração do Banco de Dados com Novas Tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pacientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf TEXT,
    nome_mae TEXT,
    idade INTEGER,
    telefone TEXT,
    observacao TEXT,
    status TEXT DEFAULT 'ativo',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS financeiro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    valor REAL NOT NULL,
    tipo TEXT NOT NULL,
    data TEXT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS anamneses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL,
    queixa_principal TEXT,
    historico TEXT,
    data TEXT NOT NULL,
    FOREIGN KEY(paciente_id) REFERENCES pacientes(id)
  );

  CREATE TABLE IF NOT EXISTS consultas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL,
    data_hora TEXT NOT NULL,
    status TEXT DEFAULT 'agendada',
    FOREIGN KEY(paciente_id) REFERENCES pacientes(id)
  );

  CREATE TABLE IF NOT EXISTS anamneses_completas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL,
    dados_json TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(paciente_id) REFERENCES pacientes(id)
  );

  CREATE TABLE IF NOT EXISTS links_testes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    teste_tipo TEXT NOT NULL,
    usado INTEGER DEFAULT 0,
    expira_em DATETIME,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(paciente_id) REFERENCES pacientes(id)
  );

  CREATE TABLE IF NOT EXISTS documentos_pacientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL,
    nome_arquivo TEXT NOT NULL,
    caminho TEXT NOT NULL,
    tipo TEXT,
    tamanho INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(paciente_id) REFERENCES pacientes(id)
  );
`);

// Garantir usuário admin padrão
const adminCount = db.prepare('SELECT count(*) as count FROM admin_users').get().count;
if (adminCount === 0) {
    const defaultHash = bcrypt.hashSync('123456', 10);
    db.prepare('INSERT INTO admin_users (nome, email, senha_hash) VALUES (?, ?, ?)').run('Dra. Karol Silva', 'karol@clinica.com', defaultHash);
}

// Middleware de autenticação
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ success: false, message: "Nenhum token fornecido." });
    
    const token = authHeader.split(' ')[1]; // formato: Bearer <token>
    if (!token) return res.status(403).json({ success: false, message: "Token malformado." });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ success: false, message: "Token inválido ou expirado." });
        req.userId = decoded.id;
        next();
    });
};

/* ================= ROTAS DE AUTENTICAÇÃO ================= */
app.post('/api/auth/login', (req, res) => {
    const { email, senha } = req.body;
    try {
        const user = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email);
        if (!user) return res.status(401).json({ success: false, message: "Credenciais inválidas." });
        
        const validPassword = bcrypt.compareSync(senha, user.senha_hash);
        if (!validPassword) return res.status(401).json({ success: false, message: "Credenciais inválidas." });

        const token = jwt.sign({ id: user.id, email: user.email, nome: user.nome }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ success: true, token, user: { id: user.id, nome: user.nome, email: user.email }});
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ================= ROTAS FINANCEIRO ================= */
app.get('/api/financeiro', verificarToken, (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM financeiro ORDER BY data DESC').all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/financeiro', verificarToken, (req, res) => {
    const { descricao, valor, tipo, data } = req.body;
    try {
        const info = db.prepare('INSERT INTO financeiro (descricao, valor, tipo, data) VALUES (?, ?, ?, ?)')
            .run(descricao, valor, tipo, data);
        res.json({ id: info.lastInsertRowid, success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/api/financeiro/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    try {
        const info = db.prepare('DELETE FROM financeiro WHERE id = ?').run(id);
        if (info.changes > 0) res.json({ success: true });
        else res.status(404).json({ success: false, message: "Registro não encontrado." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ================= ROTAS DOCUMENTOS ================= */
app.post('/api/documentos/upload', verificarToken, upload.single('arquivo'), (req, res) => {
    const { paciente_id } = req.body;
    const file = req.file;

    if (!file || !paciente_id) {
        return res.status(400).json({ success: false, message: "Arquivo ou ID do paciente ausente." });
    }

    try {
        // Normaliza o caminho para usar / mesmo no Windows
        const normalizedPath = file.path.replace(/\\/g, '/');
        
        const info = db.prepare('INSERT INTO documentos_pacientes (paciente_id, nome_arquivo, caminho, tipo, tamanho) VALUES (?, ?, ?, ?, ?)')
            .run(paciente_id, file.originalname, normalizedPath, file.mimetype, file.size);
        
        res.json({ success: true, id: info.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/documentos/:paciente_id', verificarToken, (req, res) => {
    const { paciente_id } = req.params;
    const docs = db.prepare('SELECT * FROM documentos_pacientes WHERE paciente_id = ? ORDER BY criado_em DESC').all(paciente_id);
    res.json(docs);
});

app.delete('/api/documentos/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    try {
        const doc = db.prepare('SELECT * FROM documentos_pacientes WHERE id = ?').get(id);
        if (doc) {
            if (fs.existsSync(doc.caminho)) fs.unlinkSync(doc.caminho);
            db.prepare('DELETE FROM documentos_pacientes WHERE id = ?').run(id);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ================= ROTAS LINKS TESTES ================= */
app.post('/api/testes/gerar-link', verificarToken, (req, res) => {
    const { paciente_id, teste_tipo } = req.body;
    if (!paciente_id) return res.status(400).json({ success: false, message: "ID do paciente é obrigatório." });
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    try {
        db.prepare('INSERT INTO links_testes (paciente_id, token, teste_tipo) VALUES (?, ?, ?)')
          .run(paciente_id, token, teste_tipo || 'srs2');
        res.json({ success: true, token });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/testes/validar/:token', (req, res) => {
    const { token } = req.params;
    const link = db.prepare('SELECT l.*, p.nome as paciente_nome FROM links_testes l JOIN pacientes p ON l.paciente_id = p.id WHERE l.token = ? AND l.usado = 0').get(token);
    if (link) res.json({ success: true, link });
    else res.status(404).json({ success: false, message: "Link inválido ou já utilizado." });
});

app.post('/api/testes/submeter', (req, res) => {
    const { token, paciente_id, dados_json } = req.body;
    const transaction = db.transaction(() => {
        db.prepare('INSERT INTO anamneses (paciente_id, queixa_principal, historico, data) VALUES (?, ?, ?, ?)')
          .run(paciente_id, 'Avaliação Externa SRS-2', JSON.stringify(dados_json), new Date().toISOString().split('T')[0]);
        db.prepare('UPDATE links_testes SET usado = 1 WHERE token = ?').run(token);
    });
    try {
        transaction();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ================= ROTAS PACIENTES ================= */
app.get('/api/pacientes', verificarToken, (req, res) => {
    const { search, status } = req.query;
    try {
        let query = 'SELECT * FROM pacientes WHERE 1=1';
        const params = [];
        if (search) {
            const cleanSearch = search.replace(/\D/g, '');
            query += ' AND (nome LIKE ? OR nome_mae LIKE ? OR cpf LIKE ?';
            params.push(`%${search}%`, `%${search}%`, `${search}%`);
            if (cleanSearch) {
                query += ' OR cpf LIKE ?';
                params.push(`${cleanSearch}%`);
            }
            query += ')';
        }
        if (status && status !== 'todos') {
            query += ' AND status = ?';
            params.push(status);
        }
        query += ' ORDER BY nome ASC';
        const rows = db.prepare(query).all(...params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/pacientes/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    log(`GET /api/pacientes/${id}`);
    try {
        const p = db.prepare('SELECT * FROM pacientes WHERE id = ?').get(id);
        if (!p) {
            log(`ERRO: Paciente ${id} não encontrado`);
            return res.status(404).json({ success: false, message: "Paciente não encontrado." });
        }
        
        // Buscar anamnese completa se houver
        const anamnese = db.prepare('SELECT dados_json FROM anamneses_completas WHERE paciente_id = ?').get(id);
        if (anamnese) {
            p.anamnese_completa = JSON.parse(anamnese.dados_json);
        }
        
        res.json(p);
    } catch (err) {
        log(`ERRO CRÍTICO GET /api/pacientes/${id}: ${err.message}`);
        res.status(500).json({ success: false, message: err.message });
    }
});


app.post('/api/pacientes', verificarToken, (req, res) => {
    const { nome, cpf, nome_mae, idade, telefone, observacao, status, anamnese_completa } = req.body;
    const transaction = db.transaction(() => {
        const info = db.prepare('INSERT INTO pacientes (nome, cpf, nome_mae, idade, telefone, observacao, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .run(nome, cpf, nome_mae, idade, telefone, observacao, status || 'ativo');
        const pacienteId = info.lastInsertRowid;
        if (anamnese_completa) {
            db.prepare('INSERT INTO anamneses_completas (paciente_id, dados_json) VALUES (?, ?)')
                .run(pacienteId, JSON.stringify(anamnese_completa));
        }
        return pacienteId;
    });
    try {
        const id = transaction();
        res.json({ id, success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/pacientes/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const { nome, cpf, nome_mae, idade, telefone, observacao, status, anamnese_completa } = req.body;
    
    const transaction = db.transaction(() => {
        db.prepare('UPDATE pacientes SET nome = ?, cpf = ?, nome_mae = ?, idade = ?, telefone = ?, observacao = ?, status = ? WHERE id = ?')
            .run(nome, cpf, nome_mae, idade, telefone, observacao, status || 'ativo', id);
            
        if (anamnese_completa) {
            // Check if exists to determine insert or update
            const exists = db.prepare('SELECT 1 FROM anamneses_completas WHERE paciente_id = ?').get(id);
            if (exists) {
                db.prepare('UPDATE anamneses_completas SET dados_json = ? WHERE paciente_id = ?')
                    .run(JSON.stringify(anamnese_completa), id);
            } else {
                db.prepare('INSERT INTO anamneses_completas (paciente_id, dados_json) VALUES (?, ?)')
                    .run(id, JSON.stringify(anamnese_completa));
            }
        }
    });

    try {
        transaction();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.patch('/api/pacientes/:id/status', verificarToken, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    console.log(`PATCH /api/pacientes/${id}/status - Novo Status: ${status}`);
    try {
        const result = db.prepare('UPDATE pacientes SET status = ? WHERE id = ?').run(status, id);
        console.log(`Resultado do UPDATE: ${result.changes} linhas alteradas`);
        res.json({ success: true });
    } catch (err) {
        console.error("Erro no PATCH status:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/api/pacientes/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    try {
        db.prepare('UPDATE pacientes SET status = "inativo" WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ================= ROTAS ANAMNESE ================= */
app.get('/api/anamneses/:paciente_id', verificarToken, (req, res) => {
    const { paciente_id } = req.params;
    try {
        const rows = db.prepare('SELECT * FROM anamneses WHERE paciente_id = ? ORDER BY data DESC').all(paciente_id);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/anamneses', verificarToken, (req, res) => {
    const { paciente_id, queixa_principal, historico, data } = req.body;
    try {
        const info = db.prepare('INSERT INTO anamneses (paciente_id, queixa_principal, historico, data) VALUES (?, ?, ?, ?)')
            .run(paciente_id, queixa_principal, historico, data);
        res.json({ id: info.lastInsertRowid, success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Rota catch-all para o React (SPA)
// IMPORTANTE: Esta rota DEVE ficar por último, depois de todas as rotas da API
app.use((req, res, next) => {
    // Se a rota começar com /api ou /uploads, e chegou aqui, é porque não foi encontrada
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
        return res.status(404).json({ error: 'Endpoint não encontrado' });
    }
    // Para todas as outras rotas, serve o index.html do React
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Servindo frontend de: ${frontendPath}`);
});
