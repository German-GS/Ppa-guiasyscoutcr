// src/components/CicloPrograma/VotarCiclo.js
import React, { useMemo, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/authContext";
import { PreviewVotacionModal } from "./PreviewVotacionModal";

export function VotarCiclo({
  ciclo,
  comunidadNombre = "",
  miembrosNombres = [],
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const habilitado = useMemo(() => {
    if (!ciclo?.votacion) return false;
    const ahora = new Date();
    const cierra = ciclo.votacion.cierraEn?.toDate?.() || new Date(0);
    return ciclo.estado === "en_votacion" && ahora <= cierra;
  }, [ciclo]);

  const onVotar = async (valor) => {
    if (!user?.uid || !ciclo?.id) return;
    try {
      setSending(true);
      await setDoc(
        doc(db, "ciclos", ciclo.id, "votos", user.uid),
        { valor, createdAt: serverTimestamp() },
        { merge: true }
      );
      setOpen(false);
    } finally {
      setSending(false);
    }
  };

  if (!habilitado) return null;

  return (
    <>
      <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
        <span className="font-semibold text-yellow-800">
          Votación abierta hasta:{" "}
          {ciclo.votacion.cierraEn?.toDate?.()?.toLocaleTimeString?.() || "—"}
        </span>
        <button className="btn-primary ml-auto" onClick={() => setOpen(true)}>
          Votar
        </button>
      </div>

      <PreviewVotacionModal
        isOpen={open}
        onClose={() => setOpen(false)}
        modo="votar"
        onVotar={onVotar}
        isSubmitting={sending}
        comunidadInfo={{
          nombre: comunidadNombre,
          miembros: miembrosNombres,
        }}
      />
    </>
  );
}
