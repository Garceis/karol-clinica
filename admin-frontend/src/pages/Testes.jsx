import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Link, Copy, Check, Users, ExternalLink, Calendar } from 'lucide-react';

export default function Testes() {
  const [pacientes, setPacientes] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);

  const fetchPacientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/pacientes?status=ativo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPacientes(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const gerarLink = async () => {
    if (!selectedPaciente) return alert("Selecione um paciente");
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/testes/gerar-link', {
        paciente_id: selectedPaciente,
        teste_tipo: 'srs2'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const origin = window.location.origin;
      const fullUrl = `${origin}/#/responder/${response.data.token}`;
      setLinks([{ url: fullUrl, paciente: pacientes.find(p => p.id === parseInt(selectedPaciente))?.nome, data: new Date().toLocaleString() }, ...links]);
      setSelectedPaciente('');
    } catch (err) {
      alert("Erro ao gerar link");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Testes & Avaliações</h1>
          <p className="text-slate-500 mt-1">Gere links externos para pacientes preencherem as escalas de avaliação.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card de Geração */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Link className="h-5 w-5 text-teal-500" /> Novo Link SRS-2
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              A <b>Avaliação SRS-2</b> (Escala de Responsividade Social) será enviada ao paciente. Após o preenchimento, os resultados aparecerão automaticamente no prontuário.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selecionar Paciente</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select 
                    value={selectedPaciente}
                    onChange={(e) => setSelectedPaciente(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-2xl border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none appearance-none bg-slate-50/50"
                  >
                    <option value="">Selecione o paciente...</option>
                    {pacientes.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={gerarLink}
                disabled={loading || !selectedPaciente}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-2 ${
                  loading || !selectedPaciente 
                    ? 'bg-slate-100 text-slate-400' 
                    : 'bg-teal-500 text-white shadow-teal-500/20 hover:bg-teal-600 hover:-translate-y-0.5'
                }`}
              >
                {loading ? 'Gerando...' : 'Gerar Link de Avaliação'}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Links Recentes */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 px-2">
            <Calendar className="h-4 w-4 text-slate-400" /> Gerados Recentemente
          </h3>
          {links.length === 0 ? (
            <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
               <ExternalLink className="h-10 w-10 mx-auto mb-4 opacity-20" />
               <p>Nenhum link gerado nesta sessão.</p>
            </div>
          ) : (
            links.map((link, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:border-teal-200 transition-all">
                <div className="overflow-hidden">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2 leading-none">
                    {link.paciente}
                    <span className="text-[10px] bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full uppercase">SRS-2</span>
                  </h4>
                  <p className="text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-tighter truncate max-w-xs">{link.url}</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(link.url, idx)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                    copied === idx ? 'bg-teal-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200'
                  }`}
                >
                  {copied === idx ? <><Check className="h-4 w-4" /> Copiado!</> : <><Copy className="h-4 w-4" /> Copiar Link</>}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
