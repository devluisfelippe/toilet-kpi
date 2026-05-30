"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "toilet_kpi_visited";
const DURATION = 42;

const MESSAGES = [
  "Aquecendo o assento…",
  "Calibrando o sensor de urgência…",
  "Carregando o catálogo de missões absurdas…",
  "Sincronizando com o trono central…",
  "Calculando a trajetória balística…",
  "Instalando o bidê virtual…",
  "Consultando o oráculo do papel…",
  "Preparando a cerimônia de iniciação…",
  "Verificando o estoque de coragem…",
  "Aguardando o sinal do universo…",
];

function isFirstRun(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(STORAGE_KEY);
}

export function FirstRunLoader({ children }: { children: React.ReactNode }) {
  const [remaining, setRemaining] = useState<number | null>(() =>
    isFirstRun() ? DURATION : null,
  );
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (remaining === null) return;

    const tick = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(tick);
          localStorage.setItem(STORAGE_KEY, "1");
          return 0;
        }
        return prev - 1;
      });
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 1000);

    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (remaining === null || remaining === 0) return <>{children}</>;

  const progress = ((DURATION - remaining) / DURATION) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background px-6 text-center">
      <span className="text-6xl">🧻</span>

      <div className="flex flex-col items-center gap-2">
        <p className="text-4xl font-bold tabular-nums">{remaining}s</p>
        <p className="text-sm text-muted-foreground">{MESSAGES[msgIndex]}</p>
      </div>

      <div className="w-full max-w-xs overflow-hidden rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Carregando, espere para se limpar!
      </p>
    </div>
  );
}
