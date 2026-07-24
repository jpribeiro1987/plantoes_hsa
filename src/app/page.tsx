"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Stethoscope } from "lucide-react";

export default function Home() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("doctor", JSON.stringify(data.doctor));
        router.push("/dashboard");
      } else {
        setError(data.error || "Erro de autenticação");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="glass-panel p-10 rounded-2xl w-full max-w-md z-10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-sky-500/20">
            <Activity size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight text-center">Hospital Santo Antônio</h1>
          <p className="text-slate-400 mt-2 text-sm">Controle de Plantão Médico</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Código de Acesso
            </label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl input-premium"
              placeholder="Digite seu código..."
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-950/30 p-3 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Acessar Sistema"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => router.push('/admin')}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Acesso Administrativo (Relatórios)
          </button>
        </div>
      </div>
    </div>
  );
}
