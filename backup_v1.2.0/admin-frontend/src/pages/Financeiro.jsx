import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';

export default function Financeiro() {
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFinanceiro = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/financeiro', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransacoes(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceiro();
  }, []);

  const saldo = transacoes.reduce((acc, curr) => curr.tipo === 'entrada' ? acc + curr.valor : acc - curr.valor, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Financeiro</h1>
          <p className="text-slate-500 mt-1">Controle de receitas e despesas.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-xl shadow-sm hover:bg-teal-600 transition-colors font-medium">
          <Plus className="h-5 w-5" />
          Novo Lançamento
        </button>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
        <DollarSign className="absolute -right-8 -top-8 w-48 h-48 text-white opacity-5" />
        <p className="text-slate-300 font-medium mb-1 relative z-10">Saldo Atual em Caixa</p>
        <h2 className="text-4xl font-bold relative z-10">
          R$ {loading ? '...' : saldo.toFixed(2)}
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Histórico de Transações</h3>
        </div>
        <div className="p-0">
          {loading ? (
            <p className="p-8 text-center text-slate-400">Carregando...</p>
          ) : transacoes.length === 0 ? (
            <p className="p-8 text-center text-slate-400">Nenhuma transação registrada no momento.</p>
          ) : (
             <ul className="divide-y divide-slate-100">
               {transacoes.map(t => (
                 <li key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-4">
                     <div className={`p-2 rounded-full ${t.tipo === 'entrada' ? 'bg-teal-100 text-teal-600' : 'bg-rose-100 text-rose-600'}`}>
                       {t.tipo === 'entrada' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                     </div>
                     <div>
                       <p className="font-medium text-slate-800">{t.descricao}</p>
                       <p className="text-sm text-slate-500">{new Date(t.data).toLocaleDateString('pt-BR')}</p>
                     </div>
                   </div>
                   <div className={`font-semibold ${t.tipo === 'entrada' ? 'text-teal-600' : 'text-rose-600'}`}>
                     {t.tipo === 'entrada' ? '+' : '-'} R$ {t.valor.toFixed(2)}
                   </div>
                 </li>
               ))}
             </ul>
          )}
        </div>
      </div>
    </div>
  );
}
