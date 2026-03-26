const Database = require('better-sqlite3');
const fs = require('fs');

const dbFile = 'pacientes.db';

const db = new Database(dbFile);

// Limpa as tabelas se elas já existirem
db.exec(`
  DROP TABLE IF EXISTS anamneses;
  DROP TABLE IF EXISTS consultas;
  DROP TABLE IF EXISTS pacientes;
  DROP TABLE IF EXISTS financeiro;

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
  
  -- Resto das tabelas (re-criando-as conforme o original)
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
`);

console.log('Tabelas recriadas com sucesso.');

// Inserir 10 pacientes teste
const pacientesTeste = [
    ['Ana Silva', '123.456.789-01', 'Maria Silva', 30, '(11) 98765-4321', 'Paciente teste 1 - Hiperatividade', 'ativo'],
    ['Bruno Oliveira', '234.567.890-12', 'Josefa Oliveira', 25, '(21) 97654-3210', 'Paciente teste 2 - Déficit de atenção', 'ativo'],
    ['Carla Santos', '345.678.901-23', 'Luciana Santos', 40, '(31) 96543-2109', 'Paciente teste 3 - Reabilitação cognitiva', 'inativo'],
    ['Diego Costa', '456.789.012-34', 'Fernanda Costa', 18, '(41) 95432-1098', 'Paciente teste 4 - Avaliação neuropsicológica', 'ativo'],
    ['Elena Rocha', '567.890.123-45', 'Sandra Rocha', 50, '(51) 94321-0987', 'Paciente teste 5 - Memória', 'ativo'],
    ['Fabio Junior', '678.901.234-56', 'Marcia Junior', 35, '(61) 93210-9876', 'Paciente teste 6 - Ansiedade', 'ativo'],
    ['Gisele Alves', '789.012.345-67', 'Vania Alves', 42, '(71) 92109-8765', 'Paciente teste 7 - Stress pós-traumático', 'inativo'],
    ['Hugo Souza', '890.123.456-78', 'Regina Souza', 28, '(81) 91098-7654', 'Paciente teste 8 - Acompanhamento escolar', 'ativo'],
    ['Igor Guimarães', '901.234.567-89', 'Claudia Guimarães', 33, '(91) 90987-6543', 'Paciente teste 9 - Orientação familiar', 'ativo'],
    ['Julia Paes', '012.345.678-90', 'Beatriz Paes', 22, '(11) 89876-5432', 'Paciente teste 10 - Desenvolvimento infantil', 'ativo']
];

const insert = db.prepare('INSERT INTO pacientes (nome, cpf, nome_mae, idade, telefone, observacao, status) VALUES (?, ?, ?, ?, ?, ?, ?)');

for (const p of pacientesTeste) {
    insert.run(p[0], p[1], p[2], p[3], p[4], p[5], p[6]);
}

console.log('10 pacientes de teste inseridos com sucesso!');
db.close();
