import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalPacientes: 0, receitaMensal: 0, totalConsultas: 0 });
  const [aniversariantes, setAniversariantes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [pacientesRes, financeiroRes, niverRes] = await Promise.all([
          axios.get('/api/pacientes', { headers }),
          axios.get('/api/financeiro', { headers }),
          axios.get('/api/dashboard/aniversariantes', { headers })
        ]);

        const pacientes = Array.isArray(pacientesRes.data) ? pacientesRes.data.filter(p => p.status === 'ativo') : [];
        setAniversariantes(Array.isArray(niverRes.data) ? niverRes.data : []);
        
        const currentMonth = new Date().getMonth();
        const receita = Array.isArray(financeiroRes.data) 
          ? financeiroRes.data
              .filter(f => f.tipo === 'entrada' && new Date(f.data).getMonth() === currentMonth)
              .reduce((acc, curr) => acc + curr.valor, 0)
          : 0;

        setStats({
          totalPacientes: pacientes.length,
          receitaMensal: receita,
          totalConsultas: 0 
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estatísticas */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${card.bg}`}>
                <card.icon className={`h-7 w-7 ${card.color}`} />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5">
                  {loading ? <span className="animate-pulse bg-slate-100 h-8 w-16 rounded block"></span> : card.value}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Aniversariantes */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
           <h3 className="text-white font-black text-lg mb-6 flex items-center gap-2">
             <Calendar className="h-5 w-5 text-teal-400" /> Aniversariantes do Dia
           </h3>
           <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
             {aniversariantes.length === 0 ? (
               <p className="text-slate-500 text-sm font-bold italic">Nenhum aniversariante encontrado para o dia de hoje.</p>
             ) : (
               aniversariantes.map(p => (
                 <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
                        {p.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{p.nome}</p>
                        <p className="text-[10px] text-teal-400 font-bold uppercase tracking-tighter">Dia {new Date(p.data_nascimento + 'T00:00:00').getDate()}</p>
                      </div>
                   </div>
                   <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
                 </div>
               ))
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
