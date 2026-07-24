"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PrintReportPage() {
  const searchParams = useSearchParams();
  const month = searchParams.get('month');
  const doctorId = searchParams.get('doctorId');
  
  const [shifts, setShifts] = useState<any[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!month) {
      setError("Mês não especificado.");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        let url = `/api/reports/monthly/json?month=${month}`;
        if (doctorId) {
          url += `&doctorId=${doctorId}`;
        }
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Erro ao carregar dados do relatório");
        }
        const data = await res.json();
        const loadedShifts = data.shifts || [];
        setShifts(loadedShifts);

        // Calculate totals
        const docTotals: Record<string, { hours: number; value: number }> = {};
        loadedShifts.forEach((s: any) => {
          const shiftVal = s.value || 0;
          if (!docTotals[s.doctor_name]) docTotals[s.doctor_name] = { hours: 0, value: 0 };
          
          if (s.end_time) {
            const start = new Date(s.start_time).getTime();
            const end = new Date(s.end_time).getTime();
            const diffHours = (end - start) / (1000 * 60 * 60);
            
            docTotals[s.doctor_name].hours += diffHours;
          }
          // The value is per shift (plantão), regardless if it's finished or not
          docTotals[s.doctor_name].value += shiftVal;
        });
        setTotals(docTotals as any);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [month]);

  useEffect(() => {
    if (!loading && !error) {
      // Delay printing slightly to ensure fonts/render are complete
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, error]);

  if (loading) {
    return <div className="p-10 font-sans text-gray-500">Gerando relatório...</div>;
  }

  if (error) {
    return <div className="p-10 font-sans text-red-600">Erro: {error}</div>;
  }

  return (
    <div className="bg-white min-h-screen font-sans text-black p-8 print:p-0">
      {/* CSS for print media specifically */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end border-b-2 border-gray-800 pb-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Relatório de Plantões</h1>
            <p className="text-gray-600">Competência: {month}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Impresso em {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <button 
          onClick={() => window.print()}
          className="no-print mb-8 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium shadow"
        >
          Imprimir Agora
        </button>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4 uppercase tracking-wider border-b border-gray-300 pb-2">Resumo por Médico</h2>
          {Object.keys(totals).length === 0 ? (
            <p className="text-gray-500 italic">Nenhum plantão finalizado neste período.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="py-2 px-3 font-semibold text-gray-700">Nome do Médico</th>
                  <th className="py-2 px-3 font-semibold text-gray-700 text-right">Total de Horas</th>
                  <th className="py-2 px-3 font-semibold text-gray-700 text-right">Valor Total (R$)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(totals)
                  .sort((a: any, b: any) => b[1].value - a[1].value) // Sort by value descending
                  .map(([doctor, data]: [string, any]) => (
                  <tr key={doctor} className="border-b border-gray-200">
                    <td className="py-2 px-3 text-gray-800 font-medium">{doctor}</td>
                    <td className="py-2 px-3 text-gray-800 text-right font-mono">{data.hours.toFixed(2)} h</td>
                    <td className="py-2 px-3 text-green-700 text-right font-bold font-mono">
                      R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 uppercase tracking-wider border-b border-gray-300 pb-2">Lista Detalhada de Plantões</h2>
          {shifts.length === 0 ? (
            <p className="text-gray-500 italic">Nenhum plantão registrado neste período.</p>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="py-2 px-2 font-semibold text-gray-700">Médico</th>
                  <th className="py-2 px-2 font-semibold text-gray-700">Local</th>
                  <th className="py-2 px-2 font-semibold text-gray-700">Entrada</th>
                  <th className="py-2 px-2 font-semibold text-gray-700">Saída</th>
                  <th className="py-2 px-2 font-semibold text-gray-700 text-right">Duração</th>
                  <th className="py-2 px-2 font-semibold text-gray-700 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift: any) => {
                  let duration = '-';
                  if (shift.end_time) {
                    const start = new Date(shift.start_time).getTime();
                    const end = new Date(shift.end_time).getTime();
                    duration = ((end - start) / (1000 * 60 * 60)).toFixed(2) + ' h';
                  }
                  
                  const shiftVal = shift.value || 0;

                  return (
                    <tr key={shift.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-2 text-gray-800">{shift.doctor_name}</td>
                      <td className="py-2 px-2 text-gray-600 text-xs font-semibold">{shift.shift_type === 'UTI' ? 'UTI' : 'PRONTO'}</td>
                      <td className="py-2 px-2 text-gray-600">{new Date(shift.start_time).toLocaleString('pt-BR')}</td>
                      <td className="py-2 px-2 text-gray-600">
                        {shift.end_time ? new Date(shift.end_time).toLocaleString('pt-BR') : <span className="italic text-amber-600">Em andamento</span>}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-gray-800">{duration}</td>
                      <td className="py-2 px-2 text-right font-mono text-green-700 font-medium">
                        R$ {shiftVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

      </div>
    </div>
  );
}
