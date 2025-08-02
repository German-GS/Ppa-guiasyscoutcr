// src/components/BrujulaCrecimiento/QuestionItem.js
import React, { useState } from "react";
import styles from "./AreasCremiento.module.css";

export function QuestionItem({ pregunta, evaluacion, onEvaluacionChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAnswer = (answer) => {
    // Si la respuesta es "Sí", borramos cualquier acción que hubiera.
    const actionText = answer === "si" ? "" : evaluacion.action;
    onEvaluacionChange({ answer, action: actionText });
  };

  const handleActionChange = (e) => {
    onEvaluacionChange({ ...evaluacion, action: e.target.value });
  };

  return (
    <div className={styles.questionContainer}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={styles.questionButton}
      >
        <span>{pregunta}</span>
        <span
          className={`${styles.chevron} ${isExpanded ? styles.expanded : ""}`}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className={styles.evaluationArea}>
          <div className={styles.answerButtons}>
            <button
              onClick={() => handleAnswer("si")}
              className={`${styles.answerBtn} ${styles.btnSi} ${
                evaluacion.answer === "si" ? styles.active : ""
              }`}
            >
              Sí
            </button>
            <button
              onClick={() => handleAnswer("no")}
              className={`${styles.answerBtn} ${styles.btnNo} ${
                evaluacion.answer === "no" ? styles.active : ""
              }`}
            >
              No
            </button>
          </div>

          {evaluacion.answer === "no" && (
            <div className={styles.actionInputArea}>
              <label className={styles.actionLabel}>
                ¿Qué harás para mejorar en este aspecto?
              </label>
              <textarea
                value={evaluacion.action}
                onChange={handleActionChange}
                className={styles.actionTextarea}
                placeholder="Ej: Dedicaré 30 minutos a la semana para..."
                rows="3"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
