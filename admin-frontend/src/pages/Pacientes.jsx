import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, ClipboardList, Check, XSquare, Info, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnamneseForm from '../components/AnamneseForm';

export default function Pacientes() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ativo');
  const [showModal, setShowModal] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState(null);
  const [confirmingStatus, setConfirmingStatus] = useState(null); // { id, status }

  const fetchPacientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/pacientes?search=${search}&status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPacientes(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, [search, statusFilter]);

  const handleSalvar = async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (editingPaciente) {
        await axios.put(`/api/pacientes/${editingPaciente.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/pacientes', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      setEditingPaciente(null);
      fetchPacientes();
      alert(editingPaciente ? "Paciente atualizado!" : "Paciente cadastrado com sucesso!");
    } catch (err) {
      alert("Erro ao salvar paciente");
    }
  };

  const alternarStatus = async (id, statusAtual) => {
    const novoStatus = statusAtual === 'ativo' ? 'inativo' : 'ativo';
    setConfirmingStatus({ id, status: novoStatus });
  };

  const confirmarNovoStatus = async () => {
    if (!confirmingStatus) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/pacientes/${confirmingStatus.id}/status`, { status: confirmingStatus.status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfirmingStatus(null);
      fetchPacientes();
    } catch (err) {
      alert("Erro ao alterar status");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Pacientes</h1>
          <p className="text-slate-500 mt-1">Gerencie prontuários e anamneses dos pacientes.</p>
        </div>
        <button 
          onClick={() => { setEditingPaciente(null); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-2xl shadow-xl shadow-teal-500/20 hover:bg-teal-600 hover:-translate-y-0.5 transition-all font-bold"
        >
          <Plus className="h-5 w-5" />
          Novo Paciente / Anamnese
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome, CPF ou mãe..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-inner"
            />
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-inner">
            <button 
              onClick={() => setStatusFilter('ativo')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === 'ativo' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Ativos
            </button>
            <button 
              onClick={() => setStatusFilter('inativo')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === 'inativo' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Inativos
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[11px] tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Paciente / Contato</th>
                <th className="px-8 py-5">Identificação</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="4" className="px-8 py-12 text-center text-slate-400 animate-pulse">Carregando pacientes...</td></tr>
              ) : pacientes.length === 0 ? (
                <tr><td colSpan="4" className="px-8 py-12 text-center text-slate-400">Nenhum paciente encontrado.</td></tr>
              ) : (
                pacientes.map((p) => (
                  <tr key={p.id} className="hover:bg-teal-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 border-l-4 border-transparent group-hover:border-teal-500 pl-2 transition-all">{p.nome}</span>
                        <span className="text-xs text-slate-400 mt-0.5 pl-3">{p.telefone || '-'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-600">CPF: {p.cpf || '-'}</span>
                        <span className="text-[10px] text-slate-400 uppercase">Mãe: {p.nome_mae || '-'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${p.status === 'ativo' ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-700'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/dashboard/pacientes/${p.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-100 transition-colors font-bold text-xs"
                        >
                          <ClipboardList className="h-3.5 w-3.5" /> Prontuário
                        </button>
                        <button 
                          onClick={async () => { 
                            try {
                              const token = localStorage.getItem('token');
                              const res = await axios.get(`/api/pacientes/${p.id}`, { 
                                headers: { Authorization: `Bearer ${token}` } 
                              });
                              setEditingPaciente(res.data); 
                              setShowModal(true); 
                            } catch (err) {
                              alert("Erro de conexão com o BD ao carregar para edição.");
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors" title="Editar Dados">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => alternarStatus(p.id, p.status)} className={`p-2 rounded-xl transition-colors ${p.status === 'ativo' ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-50' : 'text-teal-600 hover:bg-teal-50'}`} title={p.status === 'ativo' ? 'Inativar' : 'Ativar'}>
                          {p.status === 'ativo' ? <XSquare className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmação de Status */}
      {confirmingStatus && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className={`h-16 w-16 rounded-3xl flex items-center justify-center mb-6 ${confirmingStatus.status === 'ativo' ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'}`}>
              <Info className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Confirmar Alteração</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Deseja realmente {confirmingStatus.status === 'ativo' ? 'ATIVAR' : 'INATIVAR'} este paciente no sistema?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmingStatus(null)}
                className="flex-1 py-3 px-6 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarNovoStatus}
                className={`flex-1 py-3 px-6 text-white rounded-2xl font-black shadow-lg transition-all active:scale-95 ${confirmingStatus.status === 'ativo' ? 'bg-teal-500 shadow-teal-500/20 hover:bg-teal-600' : 'bg-rose-500 shadow-rose-500/20 hover:bg-rose-600'}`}
              >
                Sim, {confirmingStatus.status === 'ativo' ? 'Ativar' : 'Inativar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <AnamneseForm 
          onClose={() => { setShowModal(false); setEditingPaciente(null); }}
          onSave={handleSalvar}
          initialData={editingPaciente}
        />
      )}
    </div>
  );
}
