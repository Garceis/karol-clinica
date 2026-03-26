const Database = require('better-sqlite3');
const db = new Database('pacientes.db');

const nomes = [
  "Alice Santos", "Bernardo Oliveira", "Clara Mendes", "Davi Lucca", "Eduarda Costa",
  "Felipe Neves", "Giovanna Silva", "Henrique Rocha", "Isabella Lima", "João Pedro",
  "Karla Souza", "Leonardo Ferreira", "Manuela Gomes", "Nicolas Santos", "Olivia Ramos",
  "Pietro Almeida", "Quiteria Jesus", "Rafael Viana", "Sophia Castro"
];

const cpfs = Array.from({length: 19}, (_, i) => `123.456.789-${String(i+10).padStart(2, '0')}`);
const datasNascimento = [
  "2015-03-10", "2018-03-25", "2012-05-12", "2020-01-05", "2014-03-15",
  "2017-08-20", "2019-11-30", "2010-03-02", "2021-02-14", "2013-09-22",
  "2016-12-10", "2011-04-18", "2022-03-28", "2015-06-07", "2019-07-19",
  "2014-10-05", "2012-11-11", "2018-02-28", "2020-03-05"
];

const anamneseTemplate = {
  identificacao: { sexo: 'M', escolaridade: 'Fundamental', escola_tipo: 'Particular', acompanhante: 'Mãe', parentesco: 'Mãe' },
  familia: { pai_nome: 'Pai Exemplo', mae_nome: 'Mãe Exemplo', mora_com: 'Pais' },
  motivo: { texto: 'Dificuldades na regulação emocional e foco atencional.' },
  gestacao: { desejada: 'Sim', prenatal: 'Sim', problemas: 'Nenhum' },
  parto: { tipo: 'Normal', choro: 'Imediato' },
  desenvolvimento: { engatinhou: '8 meses', andou: '12 meses', falou: '14 meses' },
  sono: { qualidade: 'Boa', pesadelos: 'Não' }
};

const insertPaciente = db.prepare(`
  INSERT INTO pacientes (nome, cpf, nome_mae, idade, telefone, observacao, status, data_nascimento, valor_sessao)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertAnamneseCompleta = db.prepare(`
  INSERT INTO anamneses_completas (paciente_id, dados_json)
  VALUES (?, ?)
`);

const insertSessao = db.prepare(`
  INSERT INTO anamneses (paciente_id, queixa_principal, historico, data)
  VALUES (?, ?, ?, ?)
`);

const insertFinanceiro = db.prepare(`
  INSERT INTO financeiro (paciente_id, descricao, valor, tipo, data)
  VALUES (?, ?, ?, ?, ?)
`);

db.transaction(() => {
  for (let i = 0; i < 19; i++) {
    const idade = 2026 - parseInt(datasNascimento[i].split('-')[0]);
    const valorSessao = (i % 2 === 0) ? 250 : 200;
    
    const info = insertPaciente.run(
      nomes[i], 
      cpfs[i], 
      "Maria " + nomes[i].split(' ')[1], 
      idade, 
      "(11) 9" + Math.floor(Math.random() * 90000000 + 10000000), 
      "Paciente portador de TDAH em acompanhamento.", 
      'ativo', 
      datasNascimento[i],
      valorSessao
    );
    
    const pacienteId = info.lastInsertRowid;
    
    // Anamnese Completa
    const anamneseCustom = JSON.parse(JSON.stringify(anamneseTemplate));
    anamneseCustom.identificacao.nome = nomes[i];
    anamneseCustom.identificacao.nascimento = datasNascimento[i];
    anamneseCustom.identificacao.valor_sessao = valorSessao;
    insertAnamneseCompleta.run(pacienteId, JSON.stringify(anamneseCustom));
    
    // Algumas Sessões
    const datas = ["2026-03-01", "2026-03-08", "2026-03-15", "2026-03-22"];
    datas.forEach(d => {
       insertSessao.run(pacienteId, "Sessão de Acompanhamento", "Evolução positiva nos marcos motores e interação social.", d);
       insertFinanceiro.run(pacienteId, `Sessão: ${nomes[i]}`, valorSessao, 'entrada', d);
    });
  }
})();

console.log("19 pacientes inseridos com sucesso!");
process.exit(0);
