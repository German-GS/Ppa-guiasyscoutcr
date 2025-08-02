// src/components/BrujulaCrecimiento/BrujulaCrecimiento.js

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "./AreasCremiento.module.css";
import { areasDeCrecimiento } from "./data";
import { AreaDetail } from "./AreaDetail";
import { db } from "../../firebase";
import { useAuth } from "../../context/authContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Swal from "sweetalert2";

const initializeEvaluacion = () => {
  const initialState = {};
  areasDeCrecimiento.forEach((area) => {
    area.preguntas.forEach((pregunta, index) => {
      const questionId = `${area.id}_${index}`;
      initialState[questionId] = { answer: null, action: "" };
    });
  });
  return initialState;
};

export const BrujulaCrecimiento = forwardRef((props, ref) => {
  const { user } = useAuth();
  const [activeArea, setActiveArea] = useState(areasDeCrecimiento[0]);
  const [evaluacion, setEvaluacion] = useState(initializeEvaluacion);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Carga la evaluación guardada del perfil del usuario al iniciar
  useEffect(() => {
    const loadEvaluation = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().brujulaState) {
          setEvaluacion(userSnap.data().brujulaState);
        }
      } catch (error) {
        console.error("Error cargando la evaluación:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEvaluation();
  }, [user]);

  const handleEvaluacionChange = (questionId, newValue) => {
    setEvaluacion((prev) => ({
      ...prev,
      [questionId]: newValue,
    }));
  };

  useImperativeHandle(ref, () => ({
    getValues: () => {
      const ppaObjectives = {};
      areasDeCrecimiento.forEach((area) => {
        ppaObjectives[area.id] = [];
      });
      for (const questionId in evaluacion) {
        const { answer, action } = evaluacion[questionId];
        if (answer === "no" && action.trim() !== "") {
          const areaId = questionId.split("_")[0];
          ppaObjectives[areaId].push(action.trim());
        }
      }
      return ppaObjectives;
    },
    reset: () => {
      setEvaluacion(initializeEvaluacion());
    },
  }));

  const handleSaveEvaluation = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        brujulaState: evaluacion,
      });
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Autoevaluación guardada",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error("Error guardando evaluación:", error);
      Swal.fire("Error", "No se pudo guardar tu autoevaluación.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.brujulaContainer}>
        <p className="text-center text-gray-500">Cargando tu Brújula...</p>
      </div>
    );
  }

  return (
    <div className={styles.brujulaContainer}>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-2">
        <h2 className={styles.mainTitle}>Areas de Crecimiento</h2>
        <button
          onClick={handleSaveEvaluation}
          className="btn-secondary"
          disabled={isSaving}
          style={{ width: "auto", padding: "0.5rem 1rem" }}
        >
          {isSaving ? "Guardando..." : "Guardar Autoevaluación"}
        </button>
      </div>

      <p className={styles.mainDescription}>
        Haz clic en cada pregunta para reflexionar. Si respondes "No", anota una
        acción concreta. Estas acciones se convertirán en los objetivos de tu
        PPA.
      </p>
      <div className={styles.contentWrapper}>
        <nav className={styles.sidebar}>
          {areasDeCrecimiento.map((area) => (
            <button
              type="button"
              key={area.id}
              className={`${styles.navButton} ${
                activeArea.id === area.id ? styles.active : ""
              }`}
              onClick={() => setActiveArea(area)}
            >
              {area.icono} {area.titulo}
            </button>
          ))}
        </nav>
        <main className={styles.mainContent}>
          <AreaDetail
            area={activeArea}
            evaluacion={evaluacion}
            onEvaluacionChange={handleEvaluacionChange}
          />
        </main>
      </div>
    </div>
  );
});
