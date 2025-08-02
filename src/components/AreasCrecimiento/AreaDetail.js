// src/components/BrujulaCrecimiento/AreaDetail.js
import React from "react";
import styles from "./AreasCremiento.module.css";
import { QuestionItem } from "./QuestionItems";

export function AreaDetail({ area, evaluacion, onEvaluacionChange }) {
  return (
    <div className={styles.detailContainer}>
      <h3 className={styles.detailTitle}>
        {area.icono} {area.titulo}
      </h3>
      <p className={styles.detailDescription}>{area.descripcion}</p>
      <hr className={styles.divider} />
      <h4 className={styles.questionsTitle}>Cuestionario de Reflexión:</h4>

      <div className={styles.questionsList}>
        {area.preguntas.map((pregunta, index) => {
          const questionId = `${area.id}_${index}`;
          return (
            <QuestionItem
              key={questionId}
              pregunta={pregunta}
              evaluacion={evaluacion[questionId]}
              onEvaluacionChange={(newValue) =>
                onEvaluacionChange(questionId, newValue)
              }
            />
          );
        })}
      </div>
    </div>
  );
}
