const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

console.log("Iniciando reconfiguração FINAL e PRECISA do banco de dados...");

const dbName = 'pacientes.db';
const db = new Database(dbName);
db.pragma('foreign_keys = OFF');

db.transaction(() => {
    // Drop em ordem reversa
    db.prepare('DROP TABLE IF EXISTS admin_users').run();
    db.prepare('DROP TABLE IF EXISTS pacientes').run();
    db.prepare('DROP TABLE IF EXISTS anamneses').run();
    db.prepare('DROP TABLE IF EXISTS anamneses_completas').run();
    db.prepare('DROP TABLE IF EXISTS documentos_pacientes').run();
    db.prepare('DROP TABLE IF EXISTS links_testes').run();
    db.prepare('DROP TABLE IF EXISTS financeiro').run();
    db.prepare('DROP TABLE IF EXISTS consultas').run();

    // admin_users - SCHEMA EXATO DO SERVER.JS
    db.prepare(`
        CREATE TABLE admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha_hash TEXT NOT NULL,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    db.prepare(`
        CREATE TABLE pacientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cpf TEXT,
            nome_mae TEXT,
            idade INTEGER,
            telefone TEXT,
            observacao TEXT,
            status TEXT DEFAULT 'ativo',
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    db.prepare(`
        CREATE TABLE anamneses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paciente_id INTEGER NOT NULL,
            queixa_principal TEXT,
            historico TEXT,
            data TEXT NOT NULL,
            FOREIGN KEY(paciente_id) REFERENCES pacientes(id)
        )
    `).run();

    db.prepare(`
        CREATE TABLE anamneses_completas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paciente_id INTEGER NOT NULL,
            dados_json TEXT,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(paciente_id) REFERENCES pacientes(id)
        )
    `).run();

    db.prepare(`
        CREATE TABLE documentos_pacientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paciente_id INTEGER NOT NULL,
            nome_arquivo TEXT NOT NULL,
            caminho TEXT NOT NULL,
            tipo TEXT,
            tamanho INTEGER,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(paciente_id) REFERENCES pacientes(id)
        )
    `).run();

    db.prepare(`
        CREATE TABLE links_testes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paciente_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            teste_tipo TEXT NOT NULL,
            usado INTEGER DEFAULT 0,
            expira_em DATETIME,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(paciente_id) REFERENCES pacientes(id)
        )
    `).run();

    // Inserir Usuário Padrão do server.js
    const defaultHash = bcrypt.hashSync('123456', 10);
    db.prepare('INSERT INTO admin_users (nome, email, senha_hash) VALUES (?, ?, ?)')
      .run('Dra. Karol Silva', 'karol@clinica.com', defaultHash);

})();

db.pragma('foreign_keys = ON');
console.log("Banco de dados resetado com SCHEMA CORRETO e usuário 'karol@clinica.com' / '123456'.");
db.close();
