import React, { useContext } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Users, Activity, LogOut, FileText, DollarSign, LayoutDashboard, BarChart3 } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { to: '/dashboard', label: 'Início', icon: LayoutDashboard, exact: true },
    { to: '/dashboard/pacientes', label: 'Pacientes', icon: Users },
    { to: '/dashboard/financeiro', label: 'Financeiro', icon: DollarSign },
    { to: '/dashboard/relatorios', label: 'Relatórios', icon: BarChart3 },
    { to: '/dashboard/testes', label: 'Testes & Avaliações', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-xl z-10 hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
          <Activity className="text-teal-400 mr-3 h-8 w-8" />
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Painel Admin</h1>
            <p className="text-xs text-teal-500 font-medium">Neuropsicologia</p>
          </div>
        </div>
        
        <div className="flex-1 py-8 px-4 flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Menu Principal</p>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-teal-500/10 text-teal-400 font-medium' 
                    : 'hover:bg-slate-800/50 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner">
              <span className="text-teal-400 font-bold">{user?.nome?.charAt(0) || 'D'}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.nome || 'Dra. Karol'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-medium"
          >
            <LogOut className="h-4 w-4" />
            Sair do Sistema
          </button>
          
          <div className="mt-6 pt-4 border-t border-slate-800/50 flex flex-col items-center">
            <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest italic">Versão 1.3.0</span>
            <span className="text-[8px] text-slate-700 font-bold mt-1">Modernização Clínica 2026</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b flex items-center px-6 md:px-8 shadow-sm justify-between sticky top-0 z-20">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-800">Bem-vindo(a) de volta!</h2>
          <div className="hidden sm:flex items-center gap-4">
            <span className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
