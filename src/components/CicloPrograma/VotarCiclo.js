// src/components/CicloPrograma/VotarCiclo.js
import React, { useMemo, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/authContext";
import { PreviewVotacionModal } from "./PreviewVotacionModal";
import Swal from "sweetalert2";

export function VotarCiclo({
  ciclo,
  comunidadNombre = "",
  miembrosNombres = [],
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  console.log("[VotarCiclo] 1. Componente renderizado. Props recibidas:", { ciclo, user });

  const habilitado = useMemo(() => {
    if (!ciclo?.votacion) return false;
    const ahora = new Date();
    const cierra = ciclo.votacion.cierraEn?.toDate?.() || new Date(0);
    const resultado = ciclo.estado === "en_votacion" && ahora <= cierra;
    console.log(`[VotarCiclo] 2. Verificando si la votación está habilitada: ${resultado}`);
    return resultado;
  }, [ciclo]);

  const onVotar = async (valor) => {
    console.log(`[VotarCiclo] 4. Función onVotar EJECUTADA con el valor: ${valor}`);

    if (!user?.uid || !ciclo?.id) {
      console.error("[VotarCiclo] ERROR: Falta el user.uid o el ciclo.id.", { user, ciclo });
      Swal.fire("Error Crítico", "No se pudo identificar al usuario o al ciclo de programa.", "error");
      return;
    }

    setSending(true);
    try {
      const rutaDelVoto = `ciclos/${ciclo.id}/votos/${user.uid}`;
      console.log(`[VotarCiclo] 5. Preparando para escribir en la ruta: ${rutaDelVoto}`);
      
      const dataDelVoto = { 
        valor, 
        createdAt: serverTimestamp(),
        votante: { uid: user.uid, email: user.email } // Añadimos más info para depurar
      };
      console.log("[VotarCiclo] 6. Datos que se van a guardar:", dataDelVoto);

      await setDoc(
        doc(db, "ciclos", ciclo.id, "votos", user.uid),
        dataDelVoto,
        { merge: true }
      );

      console.log("%c[VotarCiclo] 7. ¡ÉXITO! Escritura en Firestore COMPLETADA.", "color: green; font-weight: bold;");
      setOpen(false);

    } catch (error) {
      console.error("%c[VotarCiclo] 8. ¡ERROR! La escritura en Firestore falló y fue capturada por el CATCH.", "color: red; font-weight: bold;", error);
      Swal.fire(
        "Error al Guardar",
        `No se pudo registrar tu voto. El servidor devolvió un error: ${error.message}`,
        "error"
      );
    } finally {
      console.log("[VotarCiclo] 9. Bloque FINALLY ejecutado.");
      setSending(false);
    }
  };

  if (!habilitado) {
    console.log("[VotarCiclo] Renderizando: NADA (votación no habilitada).");
    return null;
  }
  
  console.log("[VotarCiclo] Renderizando: Botón para votar.");
  return (
    <>
      <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
        <span className="font-semibold text-yellow-800">
          Votación abierta hasta:{" "}
          {ciclo.votacion.cierraEn?.toDate?.()?.toLocaleTimeString?.() || "—"}
        </span>
        <button className="btn-primary ml-auto" onClick={() => {
            console.log("[VotarCiclo] 3. Botón 'Votar' presionado, abriendo modal.");
            setOpen(true);
        }}>
          Votar
        </button>
      </div>

      <PreviewVotacionModal
        isOpen={open}
        onClose={() => setOpen(false)}
        modo="votar"
        onVotar={onVotar}
        isSubmitting={sending}
        resumen={ciclo}
        comunidadInfo={{
          nombre: comunidadNombre,
          miembros: miembrosNombres,
        }}
      />
    </>
  );
}