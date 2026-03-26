import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Users, Calendar, DollarSign, Download, Printer, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function Relatorios() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    pacientes: [],
    financeiro: [],
    anamneses: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [pRes, fRes] = await Promise.all([
          axios.get('/api/pacientes', { headers }),
          axios.get('/api/financeiro', { headers })
        ]);
        setData({
          pacientes: pRes.data,
          financeiro: fRes.data,
          anamneses: [] // We'll assume attendance is derived from financeiro/pacientes for now or fetch if needed
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalAtivos = data.pacientes.filter(p => p.status === 'ativo').length;
  const totalInativos = data.pacientes.filter(p => p.status === 'inativo').length;
  const totalReceita = data.financeiro.filter(f => f.tipo === 'entrada').reduce((acc, curr) => acc + curr.valor, 0);

  if (loading) return <div className="p-8 text-center animate-pulse font-black text-slate-400">Gerando análises clínicas...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Centro de Relatórios</h1>
          <p className="text-slate-500 font-medium">Análise de produtividade, frequência e finanças.</p>
        </div>
        <button onClick={() => window.print()} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl">
          <Printer className="h-5 w-5" /> Exportar Relatório Geral
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
           <div className="h-12 w-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600">
             <Users className="h-6 w-6" />
           </div>
           <div>
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Base de Pacientes</h3>
             <p className="text-3xl font-black text-slate-800 mt-1">{totalAtivos} <span className="text-xs text-teal-500">ativos</span></p>
             <p className="text-xs text-slate-400 font-bold mt-1">{totalInativos} registros inativos</p>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
           <div className="h-12 w-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-600">
             <TrendingUp className="h-6 w-6" />
           </div>
           <div>
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Receita Acumulada</h3>
             <p className="text-3xl font-black text-slate-800 mt-1">R$ {totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
             <p className="text-xs text-sky-500 font-bold mt-1">Total histórico processado</p>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
           <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
             <CheckCircle2 className="h-6 w-6" />
           </div>
           <div>
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Sessões Realizadas</h3>
             <p className="text-3xl font-black text-slate-800 mt-1">{data.financeiro.filter(f => f.descricao.includes('Sessão')).length}</p>
             <p className="text-xs text-rose-500 font-bold mt-1">Total de atendimentos registrados</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-500" /> Detalhamento de Frequência por Paciente
          </h3>
        </div>
        <div className="p-4 overflow-x-auto">
           <table className="w-full text-left">
             <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest">
               <tr>
                 <th className="px-6 py-4">Paciente</th>
                 <th className="px-6 py-4 text-center">Total Sessões</th>
                 <th className="px-6 py-4 text-center">Status</th>
                 <th className="px-6 py-4 text-right">Última Atividade</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {data.pacientes.map(p => {
                 const sessoes = data.financeiro.filter(f => f.paciente_id === p.id && f.descricao.includes('Sessão')).length;
                 return (
                   <tr key={p.id} className="hover:bg-slate-50/50 transition-all font-bold group">
                     <td className="px-6 py-4">
                       <span className="text-slate-800 group-hover:text-teal-600">{p.nome}</span>
                     </td>
                     <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-600">{sessoes}</span>
                     </td>
                     <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase ${p.status === 'ativo' ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-700'}`}>{p.status}</span>
                     </td>
                     <td className="px-6 py-4 text-right text-slate-400 font-medium">{p.criado_em ? new Date(p.criado_em).toLocaleDateString() : '-'}</td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
