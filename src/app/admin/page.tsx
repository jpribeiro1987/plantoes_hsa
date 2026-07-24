"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Download, Calendar, ArrowLeft, Users, Clock, Edit2, Trash2, Plus, Printer, LogOut, Lock, Shield, DollarSign, Database } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (session === 'active') {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  if (isChecking) return null;

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return <AdminDashboard onLogout={() => {
    localStorage.removeItem('adminSession');
    setIsAuthenticated(false);
  }} />;
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        localStorage.setItem('adminSession', 'active');
        onLogin();
      } else {
        const data = await res.json();
        setError(data.error || "Acesso negado");
      }
    } catch (err) {
      setError("Erro ao conectar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <div className="glass-panel p-10 rounded-2xl w-full max-w-md z-10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-500/20">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Acesso Restrito</h1>
          <p className="text-slate-400 mt-2 text-sm">Painel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nome de Usuário</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl input-premium"
              placeholder="ex: admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl input-premium"
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            />
          </div>

          {error && <div className="text-red-400 text-sm text-center bg-red-950/30 p-3 rounded-lg border border-red-500/20">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25 active:scale-95 flex justify-center items-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Entrar"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'reports' | 'doctors' | 'shifts' | 'users' | 'settings'>('reports');

  return (
    <div className="min-h-screen bg-slate-900 p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Voltar
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Painel Administrativo</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.open('/api/admin/backup', '_blank')}
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/20"
            >
              <Database size={16} /> Backup do Sistema
            </button>
            <button onClick={onLogout} className="inline-flex items-center gap-2 text-slate-400 hover:text-rose-400 transition-colors bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl border border-white/5">
              Sair <LogOut size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <Calendar size={18} /> Relatórios Mensais
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'doctors' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <Users size={18} /> Gestão de Médicos
            </button>
            <button
              onClick={() => setActiveTab('shifts')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'shifts' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <Clock size={18} /> Ajustes de Plantão
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <Shield size={18} /> Gestão de Usuários
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <DollarSign size={18} /> Valores / Financeiro
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 glass-panel p-6 md:p-8 rounded-3xl min-h-[500px]">
            {activeTab === 'reports' && <ReportsTab />}
            {activeTab === 'doctors' && <DoctorsTab />}
            {activeTab === 'shifts' && <ShiftsTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsTab() {
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/reports/monthly?month=${month}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao exportar relatório');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medical_shifts_${month}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
          <Calendar className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Exportar Relatórios</h2>
          <p className="text-slate-400 text-sm">Gere CSV de plantões mensais</p>
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Selecione o Mês</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-4 py-3 rounded-xl input-premium"
            required
          />
        </div>
        {error && <div className="text-red-400 text-sm bg-red-950/30 p-3 rounded-lg border border-red-500/20">{error}</div>}
        <div className="flex gap-4">
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex-1 py-4 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all shadow-lg active:scale-95 flex justify-center items-center gap-2 border border-white/5"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Download size={18} /> Baixar CSV</>}
          </button>
          <button
            onClick={() => window.open(`/admin/print-report?month=${month}`, '_blank')}
            className="flex-1 py-4 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95 flex justify-center items-center gap-2"
          >
            <Printer size={18} /> Imprimir PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function DoctorsTab() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', code: '', allowed_unit: 'ALL' });
  const [error, setError] = useState('');

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/doctors');
      const data = await res.json();
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDoctors(); }, []);

  const toggleUnit = (unit: string) => {
    let current = (formData.allowed_unit || 'ALL').split(',').filter(u => u !== 'ALL' && u.trim() !== '');
    if (unit === 'ALL') {
      setFormData({...formData, allowed_unit: 'ALL'});
      return;
    }
    
    if (current.includes(unit)) {
      current = current.filter(u => u !== unit);
    } else {
      current.push(unit);
    }
    
    if (current.length === 0) current = ['ALL'];
    
    setFormData({...formData, allowed_unit: current.join(',')});
  };

  const isUnitSelected = (unit: string) => {
    if (formData.allowed_unit === 'ALL') return unit === 'ALL';
    return formData.allowed_unit.split(',').includes(unit);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const method = editingDoc?.id ? 'PUT' : 'POST';
    const body = editingDoc?.id ? { ...formData, id: editingDoc.id } : formData;

    try {
      const res = await fetch('/api/admin/doctors', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setEditingDoc(null);
        setFormData({ name: '', code: '', allowed_unit: 'ALL' });
        loadDoctors();
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao salvar médico');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir este médico e seus plantões?')) return;
    try {
      await fetch(`/api/admin/doctors?id=${id}`, { method: 'DELETE' });
      loadDoctors();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Médicos Cadastrados</h2>
          <p className="text-slate-400 text-sm">Gerencie os acessos ao sistema</p>
        </div>
        <button 
          onClick={() => { setEditingDoc({}); setFormData({ name: '', code: '', allowed_unit: 'ALL' }); setError(''); }}
          className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Novo Médico
        </button>
      </div>

      {editingDoc !== null && (
        <form onSubmit={handleSave} className="bg-slate-800/50 p-6 rounded-2xl mb-8 border border-white/5">
          <h3 className="text-white font-medium mb-4">{editingDoc.id ? 'Editar Médico' : 'Cadastrar Médico'}</h3>
          {error && <div className="text-red-400 text-sm mb-4">{error}</div>}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nome Completo</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded-lg input-premium text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Código de Acesso</label>
              <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-3 py-2 rounded-lg input-premium text-sm" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs text-slate-400 mb-2">Unidades Permitidas</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={isUnitSelected('ALL')} onChange={() => toggleUnit('ALL')} className="rounded border-white/10 bg-slate-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900" />
                Todas as Unidades
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={isUnitSelected('PRONTOCLINICA')} onChange={() => toggleUnit('PRONTOCLINICA')} className="rounded border-white/10 bg-slate-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900" />
                Prontoclínica
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={isUnitSelected('UTI_I')} onChange={() => toggleUnit('UTI_I')} className="rounded border-white/10 bg-slate-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900" />
                UTI I
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={isUnitSelected('UTI_II')} onChange={() => toggleUnit('UTI_II')} className="rounded border-white/10 bg-slate-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900" />
                UTI II
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Salvar</button>
            <button type="button" onClick={() => setEditingDoc(null)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
          </div>
        </form>
      )}

      {loading ? <div className="text-center text-slate-400 py-8">Carregando...</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="pb-3 px-2 font-medium">Nome</th>
                <th className="pb-3 px-2 font-medium">Código</th>
                <th className="pb-3 px-2 font-medium">Unidade</th>
                <th className="pb-3 px-2 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {doctors.map(doc => (
                <tr key={doc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2 text-white">{doc.name}</td>
                  <td className="py-3 px-2 text-slate-300 font-mono">{doc.code}</td>
                  <td className="py-3 px-2 text-slate-400 text-xs">
                    {(doc.allowed_unit || 'ALL') === 'ALL' ? 'Todas' : (doc.allowed_unit || '').split(',').map((u: string) => 
                      u === 'PRONTOCLINICA' ? 'Prontoclínica' : u === 'UTI_I' ? 'UTI I' : u === 'UTI_II' ? 'UTI II' : u
                    ).join(', ')}
                  </td>
                  <td className="py-3 px-2 flex justify-end gap-2">
                    <button onClick={() => { setEditingDoc(doc); setFormData({name: doc.name, code: doc.code, allowed_unit: doc.allowed_unit || 'ALL'}); setError(''); }} className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-all"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {doctors.length === 0 && <tr><td colSpan={4} className="text-center py-6 text-slate-500">Nenhum médico cadastrado.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ShiftsTab() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ doctor_id: '', start_time: '', end_time: '', reason: '', shift_type: 'PRONTOCLINICA' });
  const [error, setError] = useState("");

  const formatForInput = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [resShifts, resDocs] = await Promise.all([
        fetch('/api/admin/shifts'),
        fetch('/api/admin/doctors')
      ]);
      const dataShifts = await resShifts.json();
      const dataDocs = await resDocs.json();
      setShifts(dataShifts.shifts || []);
      setDoctors(dataDocs.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        id: editingId,
        doctor_id: formData.doctor_id,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
        reason: formData.reason,
        shift_type: formData.shift_type
      };
      const res = await fetch('/api/admin/shifts', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsFormOpen(false);
        setEditingId(null);
        loadData();
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao salvar plantão');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir este registro de plantão?')) return;
    try {
      await fetch(`/api/admin/shifts?id=${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({ doctor_id: doctors[0]?.id || '', start_time: '', end_time: '', reason: '', shift_type: 'PRONTOCLINICA' });
    setError("");
    setIsFormOpen(true);
  };

  const openEditForm = (shift: any) => {
    setEditingId(shift.id);
    setFormData({ 
      doctor_id: shift.doctor_id, 
      start_time: formatForInput(shift.start_time), 
      end_time: formatForInput(shift.end_time), 
      reason: shift.reason || '',
      shift_type: shift.shift_type || 'PRONTOCLINICA'
    });
    setError("");
    setIsFormOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Ajustes de Plantões</h2>
          <p className="text-slate-400 text-sm">Corrija horários ou lance plantões avulsos</p>
        </div>
        <button 
          onClick={openCreateForm}
          className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Novo Plantão
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-slate-800/50 p-6 rounded-2xl mb-8 border border-white/5">
          <h3 className="text-white font-medium mb-4">{editingId ? 'Editar Plantão' : 'Lançar Novo Plantão'}</h3>
          {error && <div className="text-red-400 text-sm mb-4">{error}</div>}
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {!editingId && (
              <div className="md:col-span-3">
                <label className="block text-xs text-slate-400 mb-1">Médico</label>
                <select 
                  required 
                  value={formData.doctor_id} 
                  onChange={e => setFormData({...formData, doctor_id: e.target.value})} 
                  className="w-full px-3 py-2 rounded-lg input-premium text-sm"
                >
                  <option value="">Selecione um médico...</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={editingId ? "md:col-span-1" : "md:col-span-1"}>
              <label className="block text-xs text-slate-400 mb-1">Tipo de Plantão</label>
              <select 
                required 
                value={formData.shift_type} 
                onChange={e => setFormData({...formData, shift_type: e.target.value})} 
                className="w-full px-3 py-2 rounded-lg input-premium text-sm"
              >
                <option value="PRONTOCLINICA">Prontoclínica</option>
                <option value="UTI">UTI</option>
              </select>
            </div>
            
            <div className={editingId ? "md:col-span-1" : "md:col-span-1"}>
              <label className="block text-xs text-slate-400 mb-1">Entrada</label>
              <input type="datetime-local" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full px-3 py-2 rounded-lg input-premium text-sm" />
            </div>
            
            <div className={editingId ? "md:col-span-1" : "md:col-span-1"}>
              <label className="block text-xs text-slate-400 mb-1">Saída (opcional)</label>
              <input type="datetime-local" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="w-full px-3 py-2 rounded-lg input-premium text-sm" />
            </div>

            <div className={editingId ? "md:col-span-1" : "md:col-span-1"}>
              <label className="block text-xs text-slate-400 mb-1">Justificativa da Alteração</label>
              <input type="text" required placeholder="Ex: Ajuste de ponto esquecido" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full px-3 py-2 rounded-lg input-premium text-sm" />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Salvar</button>
            <button type="button" onClick={() => setIsFormOpen(false)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
          </div>
        </form>
      )}

      {loading ? <div className="text-center text-slate-400 py-8">Carregando...</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="pb-3 px-2 font-medium">Médico</th>
                <th className="pb-3 px-2 font-medium">Entrada</th>
                <th className="pb-3 px-2 font-medium">Saída</th>
                <th className="pb-3 px-2 font-medium">Tipo</th>
                <th className="pb-3 px-2 font-medium">Justificativa</th>
                <th className="pb-3 px-2 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {shifts.map(shift => (
                <tr key={shift.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2 text-white">{shift.doctor_name}</td>
                  <td className="py-3 px-2 text-slate-300">{new Date(shift.start_time).toLocaleString('pt-BR')}</td>
                  <td className="py-3 px-2 text-slate-300">{shift.end_time ? new Date(shift.end_time).toLocaleString('pt-BR') : <span className="text-emerald-400 text-xs px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">Ativo</span>}</td>
                  <td className="py-3 px-2 text-sky-300 font-medium text-xs">{shift.shift_type === 'UTI' ? 'UTI' : 'Prontoclínica'}</td>
                  <td className="py-3 px-2 text-slate-400 italic text-xs max-w-[150px] truncate" title={shift.reason}>{shift.reason || '-'}</td>
                  <td className="py-3 px-2 flex justify-end gap-2">
                    <button onClick={() => openEditForm(shift)} className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-all"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(shift.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {shifts.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-slate-500">Nenhum plantão registrado.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


function UsersTab() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAdmins(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsFormOpen(false);
        setFormData({ username: "", password: "" });
        loadAdmins();
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao criar administrador");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
  };

  const toggleStatus = async (id: number, currentStatus: number) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: currentStatus === 1 ? 0 : 1 })
      });
      if (res.ok) {
        loadAdmins();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao alterar status");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Gestão de Usuários</h2>
          <p className="text-slate-400 text-sm">Gerencie quem tem acesso ao painel administrativo</p>
        </div>
        <button 
          onClick={() => { setIsFormOpen(true); setError(""); }}
          className="bg-rose-500 hover:bg-rose-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Novo Administrador
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-slate-800/50 p-6 rounded-2xl mb-8 border border-white/5">
          <h3 className="text-white font-medium mb-4">Cadastrar Novo Administrador</h3>
          {error && <div className="text-red-400 text-sm mb-4">{error}</div>}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nome de Usuário</label>
              <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-3 py-2 rounded-lg input-premium text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Senha Provisória</label>
              <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 rounded-lg input-premium text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Salvar</button>
            <button type="button" onClick={() => setIsFormOpen(false)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
          </div>
        </form>
      )}

      {loading ? <div className="text-center text-slate-400 py-8">Carregando...</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="pb-3 px-2 font-medium">Usuário</th>
                <th className="pb-3 px-2 font-medium">Status</th>
                <th className="pb-3 px-2 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {admins.map(admin => (
                <tr key={admin.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2 text-white">{admin.username}</td>
                  <td className="py-3 px-2">
                    {admin.is_active === 1 
                      ? <span className="text-emerald-400 text-xs px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">Ativo</span>
                      : <span className="text-red-400 text-xs px-2 py-1 bg-red-500/10 rounded-full border border-red-500/20">Inativo</span>
                    }
                  </td>
                  <td className="py-3 px-2 flex justify-end gap-2">
                    <button 
                      onClick={() => toggleStatus(admin.id, admin.is_active)} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${admin.is_active === 1 ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"}`}
                    >
                      {admin.is_active === 1 ? "Inativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({
    pronto_weekday: '',
    pronto_weekend: '',
    uti_i_weekday: '',
    uti_i_weekend: '',
    uti_ii_weekday: '',
    uti_ii_weekend: '',
    shift_duration: '12'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });

      if (!res.ok) throw new Error('Falha ao salvar configurações');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center text-slate-400 py-10">Carregando configurações...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
          <DollarSign className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Valores de Plantões</h2>
          <p className="text-slate-400 text-sm">Configure os honorários por tipo e período</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-800/40 border border-white/5 p-6 rounded-2xl space-y-4">
          <h3 className="font-semibold text-emerald-400 mb-2">Configurações Gerais</h3>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Duração Padrão do Plantão (Horas)</label>
            <div className="relative">
              <input 
                type="number" step="1" 
                value={settings.shift_duration || '12'}
                onChange={e => handleChange('shift_duration', e.target.value)}
                className="w-full px-4 py-3 rounded-xl input-premium"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">h</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Este valor é utilizado para calcular o valor proporcional da hora trabalhada. (Ex: Valor Total / Horas)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/40 border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="font-semibold text-sky-400 mb-2">Prontoclínica</h3>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Segunda a Sexta (até 19h)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                <input 
                  type="number" step="0.01" 
                  value={settings.pronto_weekday || ''}
                  onChange={e => handleChange('pronto_weekday', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl input-premium"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Finais de Semana e Sexta Noturno</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                <input 
                  type="number" step="0.01" 
                  value={settings.pronto_weekend || ''}
                  onChange={e => handleChange('pronto_weekend', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl input-premium"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="font-semibold text-rose-400 mb-2">UTI I</h3>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Segunda a Sexta (até 19h)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                <input 
                  type="number" step="0.01" 
                  value={settings.uti_i_weekday || ''}
                  onChange={e => handleChange('uti_i_weekday', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl input-premium"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Finais de Semana e Sexta Noturno</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                <input 
                  type="number" step="0.01" 
                  value={settings.uti_i_weekend || ''}
                  onChange={e => handleChange('uti_i_weekend', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl input-premium"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="font-semibold text-fuchsia-400 mb-2">UTI II</h3>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Segunda a Sexta (até 19h)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                <input 
                  type="number" step="0.01" 
                  value={settings.uti_ii_weekday || ''}
                  onChange={e => handleChange('uti_ii_weekday', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl input-premium"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Finais de Semana e Sexta Noturno</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                <input 
                  type="number" step="0.01" 
                  value={settings.uti_ii_weekend || ''}
                  onChange={e => handleChange('uti_ii_weekend', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl input-premium"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {error && <div className="text-red-400 text-sm bg-red-950/30 p-3 rounded-lg border border-red-500/20">{error}</div>}
        {success && <div className="text-emerald-400 text-sm bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/20">Configurações salvas com sucesso!</div>}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-amber-500/25 active:scale-95 flex justify-center items-center gap-2"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Salvar Valores"}
        </button>
      </form>
    </div>
  );
}
