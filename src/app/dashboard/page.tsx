"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, LogOut, CheckCircle2, PlayCircle, StopCircle, FileText } from "lucide-react";
import { format, differenceInHours, differenceInMinutes } from "date-fns";

export default function Dashboard() {
  const [doctor, setDoctor] = useState<{ id: number; name: string, allowed_unit?: string } | null>(null);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [shiftType, setShiftType] = useState('PRONTOCLINICA');
  const [reportMonth, setReportMonth] = useState(format(new Date(), 'yyyy-MM'));
  const router = useRouter();

  useEffect(() => {
    const docData = localStorage.getItem("doctor");
    if (!docData) {
      router.push("/");
      return;
    }
    const doc = JSON.parse(docData);
    setDoctor(doc);
    if (doc.allowed_unit && doc.allowed_unit !== 'ALL') {
      const units = doc.allowed_unit.split(',');
      if (units.length > 0) {
        setShiftType(units[0]);
      }
    }
    fetchShift(doc.id);

    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, [router]);

  const fetchShift = async (doctorId: number) => {
    try {
      const res = await fetch(`/api/shift?doctorId=${doctorId}`);
      const data = await res.json();
      setActiveShift(data.shift);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShiftAction = async (action: 'start' | 'end') => {
    if (!doctor) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: doctor.id, action, shift_type: action === 'start' ? shiftType : undefined }),
      });
      if (res.ok) {
        await fetchShift(doctor.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintReport = () => {
    if (!doctor || !reportMonth) return;
    window.open(`/admin/print-report?month=${reportMonth}&doctorId=${doctor.id}`, '_blank');
  };

  const logout = () => {
    localStorage.removeItem("doctor");
    router.push("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const shiftDuration = activeShift ? differenceInMinutes(currentTime, new Date(activeShift.start_time)) : 0;
  const hours = Math.floor(shiftDuration / 60);
  const minutes = shiftDuration % 60;

  return (
    <div className="min-h-screen bg-slate-900 p-6 md:p-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-4xl mx-auto z-10 relative">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 bg-slate-800/50 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center border border-sky-500/30">
              <span className="text-sky-400 font-bold text-xl">{doctor?.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Olá, {doctor?.name}</h2>
              <p className="text-slate-400 text-sm flex items-center gap-1">
                <Clock size={14} /> {format(currentTime, "dd/MM/yyyy HH:mm")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input 
              type="month" 
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="bg-slate-800 border border-white/10 text-white px-3 py-2 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
            />
            <button 
              onClick={handlePrintReport}
              className="flex items-center gap-2 text-indigo-400 hover:text-white transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-xl border border-indigo-500/20"
            >
              <FileText size={18} /> Gerar PDF
            </button>
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl border border-white/5"
            >
              <LogOut size={18} /> Sair
            </button>
          </div>
        </header>

        <main className="grid md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center text-center min-h-[400px]">
            <div className="mb-8">
              {activeShift ? (
                <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500/20 rounded-full border border-emerald-500/30 mb-4 animate-pulse">
                  <PlayCircle size={40} className="text-emerald-400" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-800 rounded-full border border-white/5 mb-4">
                  <CheckCircle2 size={40} className="text-slate-500" />
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-white mb-2">
                {activeShift ? 'Plantão em Andamento' : 'Plantão Finalizado / Não Iniciado'}
              </h3>
              
              {activeShift && (
                <p className="text-slate-400">
                  Duração atual: <span className="text-white font-mono">{hours}h {minutes}m</span>
                </p>
              )}
            </div>

            {activeShift ? (
              <button
                onClick={() => handleShiftAction('end')}
                disabled={actionLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-medium rounded-2xl transition-all shadow-lg shadow-red-500/25 active:scale-95 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <StopCircle size={20} /> <span>Encerrar Plantão</span>
                  </>
                )}
              </button>
            ) : (
              <div className="w-full">
                <div className="mb-6 grid grid-cols-3 gap-3">
                  {(!doctor?.allowed_unit || doctor?.allowed_unit === 'ALL' || doctor?.allowed_unit.split(',').includes('PRONTOCLINICA')) && (
                    <button 
                      onClick={() => setShiftType('PRONTOCLINICA')}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${shiftType === 'PRONTOCLINICA' ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-white/5 bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      <span className="font-semibold text-sm">Prontoclínica</span>
                    </button>
                  )}
                  {(!doctor?.allowed_unit || doctor?.allowed_unit === 'ALL' || doctor?.allowed_unit.split(',').includes('UTI_I')) && (
                    <button 
                      onClick={() => setShiftType('UTI_I')}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${shiftType === 'UTI_I' ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-white/5 bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      <span className="font-semibold text-sm">UTI I</span>
                    </button>
                  )}
                  {(!doctor?.allowed_unit || doctor?.allowed_unit === 'ALL' || doctor?.allowed_unit.split(',').includes('UTI_II')) && (
                    <button 
                      onClick={() => setShiftType('UTI_II')}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${shiftType === 'UTI_II' ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-white/5 bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      <span className="font-semibold text-sm">UTI II</span>
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleShiftAction('start')}
                  disabled={actionLoading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium rounded-2xl transition-all shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <PlayCircle size={20} /> <span>Iniciar Plantão</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-slate-800/40 border border-white/5 p-6 rounded-3xl">
              <h4 className="text-lg font-semibold text-white mb-4">Resumo do Plantão Atual</h4>
              {activeShift ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-slate-400">Início</span>
                    <span className="text-white font-medium">{format(new Date(activeShift.start_time), "HH:mm")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Status</span>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/20">Ativo</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Nenhum plantão ativo no momento.
                </div>
              )}
            </div>

            <div className="bg-slate-800/40 border border-white/5 p-6 rounded-3xl flex-1">
              <h4 className="text-lg font-semibold text-white mb-4">Instruções</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-sky-500">•</span>
                  Clique em "Iniciar Plantão" no momento exato em que assumir suas atividades.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500">•</span>
                  Não esqueça de "Encerrar Plantão" ao finalizar seu turno para garantir o registro correto das horas.
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
