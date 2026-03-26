import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, History, FileText, Upload, Trash2, Eye, Calendar, User, MessageCircle, BookOpen, Plus, X, ChevronRight, Maximize2, Save } from 'lucide-react';

export default function Prontuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('historico');
  const [novaSessao, setNovaSessao] = useState({ queixa_principal: '', historico: '', data: new Date().toISOString().split('T')[0] });
  const [confirmingDelete, setConfirmingDelete] = useState(null); // docId
  const [selectedSession, setSelectedSession] = useState(null); // session object
  const [viewingFile, setViewingFile] = useState(null); // doc object
  const [declaracoes, setDeclaracoes] = useState([]);
  const [showDocModal, setShowDocModal] = useState(false);
  const [novaDoc, setNovaDoc] = useState({ tipo: 'Declaração de Comparecimento', conteudo: '', data: new Date().toISOString().split('T')[0] });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [pRes, hRes, dRes, decRes] = await Promise.all([
        axios.get(`/api/pacientes/${id}`, { headers }),
        axios.get(`/api/anamneses/${id}`, { headers }),
        axios.get(`/api/documentos/${id}`, { headers }),
        axios.get(`/api/declaracoes/${id}`, { headers })
      ]);

      setPaciente(pRes.data);
      setHistorico(Array.isArray(hRes.data) ? hRes.data : []);
      setDocumentos(Array.isArray(dRes.data) ? dRes.data : []);
      setDeclaracoes(Array.isArray(decRes.data) ? decRes.data : []);
    } catch (err) {
      console.error("Erro ao carregar prontuário:", err);
      alert(`Erro de conexão com o BD: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSalvarSessao = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/anamneses', { ...novaSessao, paciente_id: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNovaSessao({ queixa_principal: '', historico: '', data: new Date().toISOString().split('T')[0] });
      await fetchData();
      setActiveTab('historico'); // Volta para histórico após salvar
    } catch (err) {
      alert("Erro ao salvar sessão");
    }
  };

  const deletarDocumento = async () => {
    if (!confirmingDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/documentos/${confirmingDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfirmingDelete(null);
      fetchData();
    } catch (err) {
      alert("Erro ao excluir documento");
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('paciente_id', id);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/documentos/upload', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      fetchData();
    } catch (err) {
      alert("Erro no upload do arquivo");
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleSalvarDeclaracao = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/declaracoes', { ...novaDoc, paciente_id: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowDocModal(false);
      fetchData();
    } catch (err) {
      alert("Erro ao salvar documento");
    }
  };

  const gerarTemplate = (tipo) => {
    const hoje = new Date().toLocaleDateString('pt-BR');
    let texto = "";
    if (tipo === 'Declaração de Comparecimento') {
      texto = `Declaro para os devidos fins que o(a) paciente ${paciente.nome}, portador(a) do CPF ${paciente.cpf || '___________'}, compareceu a atendimento clínico nesta data (${hoje}).\n\nAtenciosamente,\nDra. Karol Silva`;
    } else if (tipo === 'Atestado') {
      texto = `Atesto para fins de justificativa que o(a) paciente ${paciente.nome} esteve em consulta neuropsicológica no dia ${hoje}, necessitando de repouso/afastamento de _______ horas/dias.\n\nAssinatura: ________________`;
    }
    setNovaDoc({ ...novaDoc, tipo, conteudo: texto });
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Sincronizando prontuário...</div>;
  if (!paciente) return <div className="p-8 text-center text-rose-500 font-bold">Paciente não localizado.</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate('/dashboard/pacientes')} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-all font-bold group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Voltar para Pacientes
        </button>
      </div>

      {/* Header do Paciente */}
      <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-teal-500/40">
            {paciente.nome.charAt(0)}
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white tracking-tight">{paciente.nome}</h1>
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-teal-400 font-bold text-sm bg-teal-500/10 px-3 py-1 rounded-lg">ID: #{paciente.id}</span>
              <span className="text-slate-400 font-bold text-sm">CPF: {paciente.cpf || '-'}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-700"></span>
              <span className="text-slate-400 font-bold text-sm">Mãe: {paciente.nome_mae || '-'}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2 relative z-10">
           <span className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border-2 ${paciente.status === 'ativo' ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
             {paciente.status}
           </span>
           <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Desde: {new Date(paciente.criado_em).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
            <div className="space-y-4">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <User className="h-4 w-4" /> Perfil Detalhado
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Idade Atual</label>
                  <p className="text-slate-800 font-black text-lg">{paciente.idade || '-'} <span className="text-slate-400 font-bold text-xs">anos</span></p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Contato Principal</label>
                  <p className="text-slate-800 font-bold">{paciente.telefone || '-'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4" onDragOver={onDragOver} onDrop={onDrop}>
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Upload className="h-4 w-4" /> Documentos Anexos
              </h3>
              <div 
                onDragOver={onDragOver} 
                onDrop={onDrop}
                className="border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center hover:bg-teal-50 hover:border-teal-300 transition-all duration-300 cursor-pointer"
                onClick={() => document.getElementById(`file-input-${id}`).click()}
              >
                <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform">
                  <Upload className="h-5 w-5 text-slate-500" />
                </div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-tight">Arraste arquivos aqui ou<br/><span className="text-teal-600">clique para selecionar</span></p>
                <input 
                  type="file" 
                  id={`file-input-${id}`}
                  className="hidden" 
                  onChange={(e) => handleUpload(e.target.files[0])} 
                />
              </div>
              
              <div className="space-y-2 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                {documentos.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100 hover:border-teal-200 shadow-sm transition-all group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-8 w-8 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-sky-500" />
                      </div>
                      <span className="text-xs font-bold text-slate-600 truncate">{doc.nome_arquivo}</span>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => setViewingFile(doc)} className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg" title="Visualizar"><Eye className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setConfirmingDelete(doc.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg" title="Excluir"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Areas */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 p-2 rounded-[2rem] shadow-2xl border border-slate-800 flex flex-col gap-2">
            {/* Grupo 1: Psicológico */}
            <div className="flex gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-1 flex items-center">Prontuário Psicológico</span>
              {[
                { id: 'historico', label: 'Evolução', icon: History, activeColor: 'bg-teal-500' },
                { id: 'anamnese', label: 'Ficha Clínica', icon: BookOpen, activeColor: 'bg-teal-500' },
                { id: 'nova', label: 'Registrar Sessão', icon: Plus, activeColor: 'bg-teal-600' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === tab.id ? `${tab.activeColor} text-white shadow-lg` : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                </button>
              ))}
            </div>
            
            <div className="h-px bg-slate-800 my-1 mx-4" />

            {/* Grupo 2: Documental */}
            <div className="flex gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-1 flex items-center">Prontuário Documental</span>
              {[
                { id: 'frequencia', label: 'Frequência', icon: Calendar, activeColor: 'bg-sky-500' },
                { id: 'arquivos', label: 'Arquivos', icon: Upload, activeColor: 'bg-sky-500' },
                { id: 'docs_emitidos', label: 'Declarações', icon: FileText, activeColor: 'bg-sky-600' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === tab.id ? `${tab.activeColor} text-white shadow-lg` : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'historico' && (
            <div className="space-y-4">
              {historico.length === 0 ? (
                <div className="bg-white p-20 text-center rounded-[3rem] border border-slate-100">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-slate-200" />
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Inicie a primeira sessão deste paciente</p>
                </div>
              ) : (
                historico.map(h => (
                  <div key={h.id} 
                    onClick={() => setSelectedSession(h)}
                    className="bg-white group p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-teal-500/30 hover:shadow-xl transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                        <MessageCircle className="h-6 w-6" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-black text-slate-800 text-lg group-hover:text-teal-600 transition-colors truncate max-w-md">{h.queixa_principal}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
                            {h.data ? new Date(h.data + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-300">|</span>
                          <p className="text-xs text-slate-400 font-medium line-clamp-1">{h.historico?.substring(0, 80) || ''}...</p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'anamnese' && (
            <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-12 h-[750px] overflow-y-auto custom-scrollbar">
              {paciente.anamnese_completa ? (
                Object.entries(paciente.anamnese_completa).map(([secKey, secVal]) => (
                  secVal && typeof secVal === 'object' && Object.keys(secVal).some(k => secVal[k]) && (
                    <div key={secKey} className="space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                        <h4 className="text-slate-800 font-black uppercase text-sm tracking-widest">{secKey.replace(/_/g, ' ')}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {Object.entries(secVal).map(([field, val]) => (
                          val && field !== 'texto' && field !== 'obs_finais' && (
                            <div key={field} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/50 hover:bg-white hover:shadow-md transition-all">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-1">{field.replace(/_/g, ' ')}</label>
                              <span className="text-xs text-slate-700 font-bold whitespace-pre-wrap break-words">
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )
                ))
              ) : (
                <div className="text-center py-20 text-slate-400">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="font-black uppercase text-xs tracking-widest">Nenhum dado clínico registrado no sistema.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'nova' && (
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-full animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Plus className="h-5 w-5 text-teal-500" /> Nova Sessão de Atendimento
                  </h3>
               </div>
               <form onSubmit={handleSalvarSessao} className="space-y-6 flex-1 flex flex-col">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Data da Sessão</label>
                      <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none" value={novaSessao.data} onChange={e => setNovaSessao({...novaSessao, data: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Assunto / Queixa Principal</label>
                      <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Ex: Acompanhamento Semanal" value={novaSessao.queixa_principal} onChange={e => setNovaSessao({...novaSessao, queixa_principal: e.target.value})} required />
                    </div>
                  </div>
                  <div className="space-y-1 flex-1 flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Evolução / Histórico da Sessão</label>
                    <textarea className="w-full flex-1 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-medium leading-relaxed text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none min-h-[300px]" placeholder="Descreva os detalhes do atendimento aqui..." value={novaSessao.historico} onChange={e => setNovaSessao({...novaSessao, historico: e.target.value})} required />
                  </div>
                  <button type="submit" className="w-full py-5 bg-teal-500 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-teal-500/20 hover:bg-teal-600 transition-all flex items-center justify-center gap-2 active:scale-95">
                    <Save className="h-6 w-6" /> Finalizar e Salvar Sessão
                  </button>
               </form>
            </div>
          )}

          {activeTab === 'frequencia' && (
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-slate-800">Ficha de Presença</h3>
                  <button onClick={() => window.print()} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center gap-2">
                    <Save className="h-3.5 w-3.5" /> Imprimir Ficha
                  </button>
               </div>
               <div className="overflow-hidden rounded-2xl border border-slate-100">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Procedimento / Queixa</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Assinatura</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-bold">
                      {historico.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-20 text-slate-300">Nenhuma sessão registrada.</td></tr>
                      ) : (
                        historico.map(h => (
                          <tr key={h.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-6 py-5 text-slate-800">{h.data ? new Date(h.data + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</td>
                            <td className="px-6 py-5 text-slate-600">{h.queixa_principal}</td>
                            <td className="px-6 py-5 align-middle"><span className="text-[10px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded-md uppercase">Realizada</span></td>
                            <td className="px-6 py-5 text-right"><div className="h-px w-24 bg-slate-200 ml-auto mt-4" /></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeTab === 'arquivos' && (
             <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="text-xl font-black text-slate-800">Prontuário Documental (Anexos)</h3>
                </div>
                <div onDragOver={onDragOver} onDrop={onDrop} className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center hover:bg-sky-50 hover:border-sky-200 transition-all group relative overflow-hidden">
                   <Upload className="h-16 w-16 mx-auto mb-4 text-slate-200 group-hover:text-sky-400 transition-colors" />
                   <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Arraste documentos para anexar ao prontuário</p>
                   <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e.target.files[0])} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documentos.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all group">
                       <div className="flex items-center gap-4">
                         <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-sky-500">
                           <FileText className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-700 truncate max-w-[150px]">{doc.nome_arquivo}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(doc.criado_em).toLocaleDateString()}</p>
                         </div>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => setViewingFile(doc)} className="p-2 text-sky-600 hover:bg-white rounded-lg transition-all"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => setConfirmingDelete(doc.id)} className="p-2 text-rose-500 hover:bg-white rounded-lg transition-all"><Trash2 className="h-4 w-4" /></button>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {activeTab === 'docs_emitidos' && (
             <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-slate-800">Documentos Emitidos</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Atestados e Declarações</p>
                  </div>
                  <button onClick={() => { setNovaDoc({ tipo: 'Declaração de Comparecimento', conteudo: '', data: new Date().toISOString().split('T')[0] }); setShowDocModal(true); }} className="px-8 py-3 bg-sky-500 text-white rounded-2xl font-black shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95 flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Novo Documento
                  </button>
                </div>

                <div className="space-y-4">
                  {declaracoes.length === 0 ? (
                    <div className="text-center py-20 text-slate-300 border-2 border-dashed border-slate-50 rounded-[2.5rem]">
                       <FileText className="h-12 w-12 mx-auto mb-4 opacity-10" />
                       <p className="text-xs font-black uppercase tracking-widest">Nenhum documento emitido</p>
                    </div>
                  ) : (
                    declaracoes.map(dec => (
                      <div key={dec.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-white text-rose-500 rounded-2xl shadow-sm flex items-center justify-center">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-800">{dec.tipo}</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase">{new Date(dec.data + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <button onClick={() => {
                           const win = window.open('', '_blank');
                           win.document.write(`<pre style="font-family: Arial, sans-serif; padding: 50px; line-height: 1.6;">${dec.conteudo}</pre>`);
                           win.document.close();
                           win.print();
                        }} className="px-6 py-2 bg-white text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-800 hover:text-white transition-all shadow-sm">
                          Visualizar / Imprimir
                        </button>
                      </div>
                    ))
                  )}
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Modal Visualizador de Sessão */}
      {selectedSession && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4" onClick={() => setSelectedSession(null)}>
          <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">{selectedSession.queixa_principal}</h3>
                  <p className="text-xs font-black text-teal-600 uppercase tracking-widest">{new Date(selectedSession.data + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSession(null)} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"><X className="h-6 w-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-6">
               <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{selectedSession.historico}</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualizador de Arquivo */}
      {viewingFile && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg z-[80] flex items-center justify-center p-4 md:p-10" onClick={() => setViewingFile(null)}>
           <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <FileText className="h-6 w-6 text-sky-400" />
                    <span className="font-black text-sm uppercase tracking-widest">{viewingFile.nome_arquivo}</span>
                 </div>
                 <div className="flex gap-4">
                   <a href={`/${viewingFile.caminho}`} download className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all" title="Baixar"><Upload className="h-5 w-5 rotate-180" /></a>
                   <button onClick={() => setViewingFile(null)} className="p-2.5 bg-rose-500 hover:bg-rose-600 rounded-xl transition-all"><X className="h-5 w-5" /></button>
                 </div>
              </div>
              <div className="flex-1 bg-slate-100 overflow-hidden flex items-center justify-center p-4">
                 {viewingFile.nome_arquivo.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                   <img src={`/${viewingFile.caminho}`} alt={viewingFile.nome_arquivo} className="max-w-full max-h-full object-contain rounded-xl shadow-lg" />
                 ) : viewingFile.nome_arquivo.toLowerCase().endsWith('.pdf') ? (
                   <iframe src={`/${viewingFile.caminho}`} className="w-full h-full rounded-xl border-none" title="PDF Viewer"></iframe>
                 ) : (
                   <div className="text-center space-y-4">
                      <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                        <FileText className="h-10 w-10 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-bold tracking-tight">Este formato de arquivo não pode ser visualizado diretamente.</p>
                      <a href={`/${viewingFile.caminho}`} download className="inline-block px-8 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-xl">Baixar Arquivo</a>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Modal Nova Declaração */}
      {showDocModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Emitir Documento</h3>
                <button onClick={() => setShowDocModal(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-all"><X className="h-6 w-6" /></button>
             </div>
             <form onSubmit={handleSalvarDeclaracao} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Documento</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500" value={novaDoc.tipo} onChange={e => gerarTemplate(e.target.value)}>
                      <option value="Declaração de Comparecimento">Declaração de Comparecimento</option>
                      <option value="Atestado">Atestado</option>
                      <option value="Declaração Genérica">Declaração Genérica</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data do Documento</label>
                    <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700" value={novaDoc.data} onChange={e => setNovaDoc({...novaDoc, data: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conteúdo do Documento</label>
                  <textarea className="w-full p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] h-96 font-medium leading-relaxed text-slate-700" value={novaDoc.conteudo} onChange={e => setNovaDoc({...novaDoc, conteudo: e.target.value})} placeholder="Escreva o conteúdo do documento..." required />
                </div>
                <button type="submit" className="w-full py-5 bg-sky-500 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-sky-500/20 hover:bg-sky-600 transition-all">Salvar e Registrar</button>
             </form>
          </div>
        </div>
      )}

      {/* Modal Deletar */}
      {confirmingDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[90] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="h-20 w-20 rounded-[2.5rem] bg-rose-50 text-rose-600 flex items-center justify-center mb-8 mx-auto">
              <Trash2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 text-center">Excluir Arquivo?</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-10 text-center font-medium">
              Você está prestes a remover permanentemente este documento do histórico médico. Confirmar?
            </p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmingDelete(null)} className="flex-1 py-4 px-6 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all">Cancelar</button>
              <button onClick={deletarDocumento} className="flex-1 py-4 px-6 bg-rose-500 text-white rounded-2xl font-black shadow-xl shadow-rose-500/20 hover:bg-rose-600 active:scale-95 transition-all">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
