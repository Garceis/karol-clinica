import React, { useState, useRef, useEffect } from 'react';
import { X, Save, User, Home, Heart, Activity, Users, Info, Plus, Trash2, Clipboard, BookOpen, Clock, Zap } from 'lucide-react';

const SECTIONS = [
  { id: 'identificacao', label: 'Identificação', icon: User },
  { id: 'familia', label: 'Família', icon: Home },
  { id: 'motivo', label: 'Motivo / HDA', icon: Info },
  { id: 'gestacao', label: 'Gestação', icon: Heart },
  { id: 'parto', label: 'Parto', icon: Zap },
  { id: 'marcos', label: 'Marcos de Desenv.', icon: Activity },
  { id: 'sono', label: 'Sono / Rotina', icon: Clock },
  { id: 'medico', label: 'Histórico Médico', icon: Zap },
  { id: 'social', label: 'Social / Escolar', icon: Users },
  { id: 'obs', label: 'Finalização', icon: BookOpen },
];

const Field = ({ label, section, field, type = "text", options = null, span = "1", formData, handleChange }) => (
  <div className={`space-y-1 ${span === 'full' ? 'col-span-full' : span === '2' ? 'md:col-span-2' : ''}`}>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>
    {options ? (
      <div className="flex flex-wrap gap-2 py-1">
        {options.map(opt => (
          <label key={opt} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${formData[section]?.[field] === opt ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <input type="radio" className="hidden" name={`${section}-${field}`} value={opt} checked={formData[section]?.[field] === opt} onChange={e => handleChange(section, field, e.target.value)} />
            {opt}
          </label>
        ))}
      </div>
    ) : type === "textarea" ? (
      <textarea className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm min-h-[100px]" value={formData[section]?.[field] || ''} onChange={e => handleChange(section, field, e.target.value)} />
    ) : (
      <input type={type} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm" value={formData[section]?.[field] || ''} onChange={e => handleChange(section, field, e.target.value)} />
    )}
  </div>
);

export default function AnamneseForm({ onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState(initialData?.anamnese_completa || {
    identificacao: { nome: initialData?.nome || '', nascimento: initialData?.data_nascimento || '', idade: initialData?.idade || '', sexo: '', escolaridade: '', escola_tipo: '', acompanhante: '', parentesco: '', valor_sessao: initialData?.valor_sessao || '' },
    familia: { pai_nome: '', pai_idade: '', pai_escolaridade: '', pai_tel: '', mae_nome: '', mae_idade: '', mae_escolaridade: '', mae_tel: '', mora_com: '', irmaos: '', hierarquia: '', endereco: '' },
    motivo: { texto: '' },
    gestacao: { desejada: '', parentesco_pais: '', parentesco_qual: '', gestacoes_anteriores: '', prenatal: '', problemas: '', sangramento: '', sangramento_freq: '', sangramento_estagio: '', enjoo: '', enjoo_freq: '', enjoo_estagio: '', vomito: '', vomito_freq: '', vomito_estagio: '', febre: '', febre_freq: '', febre_estagio: '', aborto: '', aborto_freq: '', aborto_estagio: '', mexer: '', mexer_freq: '', mexer_estagio: '', mexer_mes: '', cirurgia: '', cirurgia_detalhe: '', raiox: '', sangue: '', queda: '', medicamentos: '', med_qual: '', drogas: '', drogas_qual: '', anemia: '', diabetes: '', hipertensao: '', dst: '', rubeola: '', outras: '' },
    parto: { tempo: '', periodo: '', tipo: '', tipo_pq: '', complicaçoes: '', peso: '', altura: '', choro: '', choro_tempo: '', roxo: '', roxo_tempo: '', cordao: '', oxigenio: '', aparelhos: '', ictericia: '', hospital: '', hospital_pq: '', hospital_tempo: '', apgar: '', aceitacao_leite: '', tempo_amamentacao: '', comportamento_bebe: '', frequencia_choro: '' },
    marcos: { cabeca: '', sentou: '', engatinhou: '', andou: '', sorriu: '', escadas: '', alimentacao: '', vestiu: '', palavras: '', frases: '', fala_correta: '', trocou_letras: '', trocou_quais: '', falou_errado: '', falou_como: '', fala_errado_ainda: '', gaguejou: '', gaguejou_quando: '', atende_nome: '', compreende_objetos: '', banheiro: '', chupeta: '', chupeta_ate: '', dedo: '', dedo_ate: '', unhas: '', unhas_ate: '', orelha: '', labios: '', tiques: '', tiques_quais: '', lateralidade: '' },
    sono: { dorme_bem: '', exagerado_pouco: '', dificuldade_inicio: '', acorda_noite: '', fala_grita: '', sonambulo: '', range_dentes: '', pesadelos: '', xixi_cama: '', xixi_ate: '', quarto_separado: '', cama_pais: '' },
    sexualidade: { curiosidade: '', manifestacao: '' },
    medico: { meningite: '', sarampo: '', rubeola_med: '', caxumba: '', pneumonia: '', outras_med: '', infeccao_ouvido: '', problemas_auditivos: '', prob_aud_qual: '', problemas_visuais: '', prob_vis_qual: '', alergias: '', trauma_cranio: '', trauma_outro: '', trauma_outro_qual: '', perda_consciencia: '', perda_consciencia_como: '', dor_cabeca: '', dor_tipo: '', dor_inicio_especifico: '', dor_periodo: '', vomitos_dor: '', humor_dor: '', luz_dor: '', som_dor: '', visual_dor: '', crises: '', crises_inicio: '', crises_freq: '', crises_fator: '', crises_aura: '', crisis_alucinacoes_vis: '', crisis_alucinacoes_aud: '', crisis_alucinacoes_olf: '', crisis_contraçoes: '', crisis_parada: '', crisis_ferimentos: '', crisis_irritabilidade: '', crisis_outras: '', pos_memoria: '', pos_sonolencia: '', pos_torpeza: '', pos_outros: '', cardiaco: '', hipertensao_med: '', digestivo: '', apetite: '', diarreia: '', ulcera: '', vomitos_med: '', dst_med: '', menstrual: '', diabetes_med: '', hipoglicemia: '', hipertireoidismo: '', hipotireoidismo: '', outros_dist: '', trat_neuro: '', trat_neuro_tel: '', trat_neuro_parecer: '', trat_psiqui: '', trat_psiqui_tel: '', trat_psiqui_parecer: '' },
    doencas_familiares: { hipertensao: '', renal: '', resp: '', diabetes: '', psiqui: '', suicidio: '', neuro: '', alcool: '', drogas: '', aprendizagem: '', aprendizagem_detalhe: '' },
    social: { rel_pai: '', rel_mae: '', rel_irmaos: '', rel_outros: '', pais_juntos: '', rel_pais: '', agressao: '', convivio: '', evita_contato: '', evita_oposto: '', evita_mesmo: '', boa_interacao: '', evita_grupos: '', agressivo: '', submisso: '', ativ_atencao: '', escolaridade_atual: '', gosta_escola: '', pais_estudam: '', leitura: '', aritmetica: '', ortografia: '', outros_prob: '', personalidade: '' },
    final: { obs_finais: '', mencionado_nao_perg: '', responsavel: '', data: new Date().toISOString().split('T')[0] }
  });

  const sectionRefs = useRef({});

  // Calcular idade automaticamente ao mudar data de nascimento
  useEffect(() => {
    if (formData.identificacao.nascimento) {
      const birthDate = new Date(formData.identificacao.nascimento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age >= 0 && age.toString() !== formData.identificacao.idade) {
        setFormData(prev => ({
          ...prev,
          identificacao: { ...prev.identificacao, idade: age.toString() }
        }));
      }
    }
  }, [formData.identificacao.nascimento]);

  const scrollToSection = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...initialData,
      nome: formData.identificacao.nome,
      idade: formData.identificacao.idade,
      data_nascimento: formData.identificacao.nascimento,
      valor_sessao: formData.identificacao.valor_sessao,
      anamnese_completa: formData
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-100 w-full max-w-7xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[95vh]">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-slate-900 p-6 flex flex-col border-r border-slate-800">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-2xl bg-teal-500 flex items-center justify-center text-white">
              <Clipboard className="h-6 w-6" />
            </div>
            <h2 className="text-white font-black text-lg">Anamnese</h2>
          </div>
          
          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all text-sm font-bold group text-left"
              >
                <s.icon className="h-4 w-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="truncate">{s.label}</span>
              </button>
            ))}
          </nav>

          <button onClick={onClose} className="mt-6 flex items-center gap-3 px-4 py-4 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all text-sm font-bold">
            <X className="h-4 w-4" /> Cancelar
          </button>
        </div>

        {/* Form Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          <header className="p-6 sm:p-8 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Ficha Clínica Detalhada</h1>
              <p className="text-slate-500 text-sm font-medium">Preencha todos os marcos evolutivos e histórico familiar.</p>
            </div>
            <button onClick={handleSubmit} className="hidden sm:flex items-center gap-2 px-8 py-3 bg-teal-500 text-white rounded-2xl shadow-xl shadow-teal-500/20 hover:bg-teal-600 transition-all font-black text-base active:scale-95">
              <Save className="h-5 w-5" /> Salvar Ficha
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-16 scroll-smooth">
            
            {/* IDENTIFICAÇÃO */}
            <section ref={el => sectionRefs.current.identificacao = el} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Identificação</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Field label="Nome Completo" section="identificacao" field="nome" span="2" formData={formData} handleChange={handleChange} />
                <Field label="Data Nascimento" section="identificacao" field="nascimento" type="date" formData={formData} handleChange={handleChange} />
                <Field label="Idade" section="identificacao" field="idade" type="number" formData={formData} handleChange={handleChange} />
                <Field label="Sexo" section="identificacao" field="sexo" options={['M', 'F']} formData={formData} handleChange={handleChange} />
                <Field label="Escolaridade" section="identificacao" field="escolaridade" formData={formData} handleChange={handleChange} />
                <Field label="Rede de Ensino" section="identificacao" field="escola_tipo" options={['Pública', 'Particular']} formData={formData} handleChange={handleChange} />
                <Field label="Acompanhante" section="identificacao" field="acompanhante" formData={formData} handleChange={handleChange} />
                <Field label="Parentesco" section="identificacao" field="parentesco" formData={formData} handleChange={handleChange} />
                <Field label="Valor da Sessão (R$)" section="identificacao" field="valor_sessao" type="number" formData={formData} handleChange={handleChange} />
              </div>
            </section>

            {/* FAMÍLIA */}
            <section ref={el => sectionRefs.current.familia = el} className="space-y-8">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Dados Familiares</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Field label="Pai (Nome)" section="familia" field="pai_nome" span="2" formData={formData} handleChange={handleChange} />
                <Field label="Idade Pai" section="familia" field="pai_idade" type="number" formData={formData} handleChange={handleChange} />
                <Field label="Escolaridade Pai" section="familia" field="pai_escolaridade" formData={formData} handleChange={handleChange} />
                <Field label="Mãe (Nome)" section="familia" field="mae_nome" span="2" formData={formData} handleChange={handleChange} />
                <Field label="Idade Mãe" section="familia" field="mae_idade" type="number" formData={formData} handleChange={handleChange} />
                <Field label="Escolaridade Mãe" section="familia" field="mae_escolaridade" formData={formData} handleChange={handleChange} />
                <Field label="Mora com quem?" section="familia" field="mora_com" formData={formData} handleChange={handleChange} />
                <Field label="Qtd Irmãos" section="familia" field="irmaos" formData={formData} handleChange={handleChange} />
                <Field label="Hierarquia" section="familia" field="hierarquia" formData={formData} handleChange={handleChange} />
                <Field label="Endereço Completo" section="familia" field="endereco" span="full" formData={formData} handleChange={handleChange} />
              </div>
            </section>

            {/* MOTIVO */}
            <section ref={el => sectionRefs.current.motivo = el} className="space-y-8">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Motivo & História</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <Field label="Relato da Queixa Principal / História da Doença Atual" section="motivo" field="texto" type="textarea" formData={formData} handleChange={handleChange} />
            </section>

            {/* GESTAÇÃO */}
            <section ref={el => sectionRefs.current.gestacao = el} className="space-y-8">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">História Gestacional</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Field label="Desejada?" section="gestacao" field="desejada" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Parentesco entre os pais?" section="gestacao" field="parentesco_pais" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Se sim, qual?" section="gestacao" field="parentesco_qual" formData={formData} handleChange={handleChange} />
                <Field label="Fez Pré-natal?" section="gestacao" field="prenatal" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Gestações anteriores?" section="gestacao" field="gestacoes_anteriores" formData={formData} handleChange={handleChange} />
                <Field label="Problemas na Gravidez?" section="gestacao" field="problemas" formData={formData} handleChange={handleChange} />
                <Field label="Sangramento?" section="gestacao" field="sangramento" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Estágio/Freq. Sangramento" section="gestacao" field="sangramento_freq" formData={formData} handleChange={handleChange} />
                <Field label="Enjoos?" section="gestacao" field="enjoo" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Vômitos?" section="gestacao" field="vomito" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Febre?" section="gestacao" field="febre" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Tentativa Aborto?" section="gestacao" field="aborto" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Quando começou a mexer?" section="gestacao" field="mexer_mes" formData={formData} handleChange={handleChange} />
                <Field label="Medicamentos utilizados" section="gestacao" field="med_qual" span="2" formData={formData} handleChange={handleChange} />
                <Field label="Drogas/Fumo/Álcool?" section="gestacao" field="drogas" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Qual?" section="gestacao" field="drogas_qual" formData={formData} handleChange={handleChange} />
              </div>
            </section>

            {/* PARTO */}
            <section ref={el => sectionRefs.current.parto = el} className="space-y-8">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Parto & Nascimento</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Field label="Parto foi:" section="parto" field="tipo" options={['Normal', 'Cesariana', 'Fórceps']} formData={formData} handleChange={handleChange} />
                <Field label="Tempo de gestação" section="parto" field="tempo" formData={formData} handleChange={handleChange} />
                <Field label="Peso ao Nascer" section="parto" field="peso" formData={formData} handleChange={handleChange} />
                <Field label="Altura" section="parto" field="altura" formData={formData} handleChange={handleChange} />
                <Field label="Nascer: Chorou?" section="parto" field="choro" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Nascer: Ficou Roxo?" section="parto" field="roxo" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Nascer: Icterícia?" section="parto" field="ictericia" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Precisou de Oxigênio?" section="parto" field="oxigenio" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Teve Incuvadora?" section="parto" field="aparelhos" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Apgar (Cartão)" section="parto" field="apgar" formData={formData} handleChange={handleChange} />
                <Field label="Comportamento Bebê" section="parto" field="comportamento_bebe" span="2" formData={formData} handleChange={handleChange} />
              </div>
            </section>

            {/* MARCOS DO DESENVOLVIMENTO */}
            <section ref={el => sectionRefs.current.marcos = el} className="space-y-8">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Marcos do Desenvolvimento</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                <Field label="Firmou a cabeça" section="marcos" field="cabeca" formData={formData} handleChange={handleChange} />
                <Field label="Sentou sozinho" section="marcos" field="sentou" formData={formData} handleChange={handleChange} />
                <Field label="Engatinhou" section="marcos" field="engatinhou" formData={formData} handleChange={handleChange} />
                <Field label="Andou sozinho" section="marcos" field="andou" formData={formData} handleChange={handleChange} />
                <Field label="Sorriu pela primeira vez" section="marcos" field="sorriu" formData={formData} handleChange={handleChange} />
                <Field label="Alimentou-se sozinho" section="marcos" field="alimentacao" formData={formData} handleChange={handleChange} />
                <Field label="Primeiras Palavras" section="marcos" field="palavras" formData={formData} handleChange={handleChange} />
                <Field label="Primeiras Frases" section="marcos" field="frases" formData={formData} handleChange={handleChange} />
                <Field label="Fala correta agora?" section="marcos" field="fala_correta" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Trocou letras?" section="marcos" field="trocou_letras" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Quais trocas?" section="marcos" field="trocou_quais" formData={formData} handleChange={handleChange} />
                <Field label="Usou Chupeta?" section="marcos" field="chupeta" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Chupou o Dedo?" section="marcos" field="dedo" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Rói Unhas?" section="marcos" field="unhas" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Tiques?" section="marcos" field="tiques" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Lateralidade" section="marcos" field="lateralidade" options={['Destro', 'Canhoto']} formData={formData} handleChange={handleChange} />
              </div>
            </section>

             {/* SONO & ROTINA */}
             <section ref={el => sectionRefs.current.sono = el} className="space-y-8">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Sono & Rotina</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Field label="Dorme bem?" section="sono" field="dorme_bem" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Falar ou Gritar?" section="sono" field="fala_grita" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Sonâmbulo?" section="sono" field="sonambulo" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Range dentes (Bruxismo)?" section="sono" field="range_dentes" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Enurese Noturna?" section="sono" field="xixi_cama" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Até que idade?" section="sono" field="xixi_ate" formData={formData} handleChange={handleChange} />
                <Field label="Quarto separado?" section="sono" field="quarto_separado" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
              </div>
            </section>

            {/* MÉDICO */}
            <section ref={el => sectionRefs.current.medico = el} className="space-y-8">
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Histórico Médico & Neuro</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Field label="Meningite?" section="medico" field="meningite" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                  <Field label="Pneumonia?" section="medico" field="pneumonia" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                  <Field label="Otite Frequente?" section="medico" field="infeccao_ouvido" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                  <Field label="Trauma Craniano?" section="medico" field="trauma_cranio" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                  <Field label="Crises Convulsivas?" section="medico" field="crises" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                  <Field label="Diabetes?" section="medico" field="diabetes_med" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                  <Field label="Alergias?" section="medico" field="alergias" formData={formData} handleChange={handleChange} />
                  <Field label="Frequência Dor de Cabeça" section="medico" field="dor_periodo" formData={formData} handleChange={handleChange} />
                  <Field label="Trat. Neurológico?" section="medico" field="trat_neuro" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                  <Field label="Parecer Neuro" section="medico" field="trat_neuro_parecer" span="3" formData={formData} handleChange={handleChange} />
                </div>
            </section>

            {/* SOCIAL / ESCOLAR */}
            <section ref={el => sectionRefs.current.social = el} className="space-y-8 pb-20">
               <div className="flex items-center gap-4 text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Ambiente Social & Escolar</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Field label="Relacionamento Pais" section="social" field="rel_pais" formData={formData} handleChange={handleChange} />
                <Field label="Interação com Grupos" section="social" field="boa_interacao" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Agressividade?" section="social" field="agressivo" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Gosta da Escola?" section="social" field="gosta_escola" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Dificuldade Leitura?" section="social" field="leitura" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Dificuldade Aritmética?" section="social" field="aritmetica" options={['Sim', 'Não']} formData={formData} handleChange={handleChange} />
                <Field label="Traços de Personalidade" section="social" field="personalidade" span="full" type="textarea" formData={formData} handleChange={handleChange} />
              </div>
            </section>

            {/* FINALIZAÇÃO */}
            <section ref={el => sectionRefs.current.obs = el} className="space-y-8 pb-20">
               <div className="flex items-center gap-4 text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Finalização</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <Field label="Observações Finais" section="final" field="obs_finais" type="textarea" formData={formData} handleChange={handleChange} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Responsável pelo Preenchimento" section="final" field="responsavel" formData={formData} handleChange={handleChange} />
                <Field label="Data do Preenchimento" section="final" field="data" type="date" formData={formData} handleChange={handleChange} />
              </div>
            </section>

          </div>

          <footer className="p-6 bg-white border-t border-slate-200 flex justify-end gap-4">
             <button onClick={onClose} className="px-8 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200">Cancelar</button>
             <button onClick={handleSubmit} className="px-12 py-3 bg-teal-500 text-white rounded-2xl shadow-xl shadow-teal-500/20 hover:bg-teal-600 transition-all font-black text-lg active:scale-95">
               Salvar Anamnese Completa
             </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
