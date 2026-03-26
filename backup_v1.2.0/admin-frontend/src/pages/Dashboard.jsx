import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalPacientes: 0, receitaMensal: 0, totalConsultas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [pacientesRes, financeiroRes] = await Promise.all([
          axios.get('http://localhost:3000/api/pacientes', { headers }),
          axios.get('http://localhost:3000/api/financeiro', { headers })
        ]);

        const pacientes = pacientesRes.data.filter(p => p.status === 'ativo');
        
        const currentMonth = new Date().getMonth();
        const receita = financeiroRes.data
          .filter(f => f.tipo === 'entrada' && new Date(f.data).getMonth() === currentMonth)
          .reduce((acc, curr) => acc + curr.valor, 0);

        setStats({
          totalPacientes: pacientes.length,
          receitaMensal: receita,
          totalConsultas: 0 // Mock for now
        });
      } catch (err) {
        console.error("Erro ao buscar estatísticas", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Pacientes Ativos', value: stats.totalPacientes, icon: Users, color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { title: 'Receita no Mês', value: `R$ ${stats.receitaMensal.toFixed(2)}`, icon: DollarSign, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { title: 'Consultas Agendadas', value: stats.totalConsultas, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Taxa de Retenção', value: '98%', icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-500/10' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Visão Geral</h1>
        <p className="text-slate-500 mt-1">Acompanhe os resultados da clínica em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className={`h-14 w-14 rounded-full flex items-center justify-center ${card.bg}`}>
              <card.icon className={`h-7 w-7 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {loading ? <span className="animate-pulse bg-slate-200 h-8 w-16 rounded block"></span> : card.value}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
