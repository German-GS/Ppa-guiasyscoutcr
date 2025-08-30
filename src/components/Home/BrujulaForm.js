// src/components/Home/BrujulaForm.js

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";

// Las preguntas extraídas de tu documento
const preguntas = {
  autoconciencia: [
    "¿Qué tres palabras usaría para describirme hoy?",
    "¿Qué situaciones me hacen sentir más energía y cuáles me drenan?",
    "¿Qué cosas suelo evitar, aunque sé que debería enfrentarlas?",
    "¿Cómo reacciono normalmente cuando me equivoco o fracaso?",
  ],
  autovaloracion: [
    "¿De qué logro personal me siento más orgulloso/a hasta ahora?",
    "¿Qué habilidad mía disfrutan los demás aunque yo a veces no la note?",
    "¿Qué desafío he superado que demuestra que soy más fuerte de lo que pensaba?",
    "Si un buen amigo hablara de mí, ¿qué diría que es lo mejor que tengo?",
  ],
  autodireccion: [
    "¿Qué es importante para mí, aunque otros no lo entiendan?",
    "¿Qué me gustaría intentar o aprender en el próximo año?",
    "¿Qué pequeño hábito, si lo repito, me ayudaría a acercarme a la persona que quiero ser?",
    "¿Qué huella me gustaría dejar en las personas que me rodean?",
  ],
};

const SeccionBrujula = ({
  titulo,
  preguntas,
  respuestas,
  onRespuestaChange,
}) => (
  <div className="bg-fondo p-4 rounded-lg border border-borde space-y-4">
    <h2 className="text-lg font-bold text-principal mb-3 border-b border-borde pb-2">
      {titulo}
    </h2>
    {preguntas.map((pregunta, index) => (
      <div key={index}>
        <label className="block text-sm font-medium text-texto-principal mb-1">
          {pregunta}
        </label>
        <textarea
          rows="3"
          className="border-input w-full"
          value={respuestas[`pregunta${index + 1}`] || ""}
          onChange={(e) =>
            onRespuestaChange(`pregunta${index + 1}`, e.target.value)
          }
          placeholder="Tu reflexión aquí..."
        />
      </div>
    ))}
  </div>
);

export const BrujulaForm = forwardRef(({ initialData }, ref) => {
  const [respuestas, setRespuestas] = useState({
    autoconciencia: {},
    autovaloracion: {},
    autodireccion: {},
  });

  useEffect(() => {
    if (initialData) {
      setRespuestas(initialData);
    }
  }, [initialData]);

  const handleRespuestaChange = (seccion, preguntaId, valor) => {
    setRespuestas((prev) => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [preguntaId]: valor,
      },
    }));
  };

  useImperativeHandle(ref, () => ({
    getValues: () => respuestas,
    setValues: (nuevasRespuestas) => {
      setRespuestas(
        nuevasRespuestas || {
          autoconciencia: {},
          autovaloracion: {},
          autodireccion: {},
        }
      );
    },
  }));

  return (
    <div className="bg-superficie shadow-lg rounded-xl p-6 border border-borde">
      <p className="text-center text-texto-secundario mb-4">
        Este es tu espacio. Reflexiona sobre quién eres, lo que valoras y hacia
        dónde quieres ir. No hay respuestas correctas o incorrectas.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SeccionBrujula
          titulo="1. Autoconciencia (Conocerme)"
          preguntas={preguntas.autoconciencia}
          respuestas={respuestas.autoconciencia}
          onRespuestaChange={(preguntaId, valor) =>
            handleRespuestaChange("autoconciencia", preguntaId, valor)
          }
        />
        <SeccionBrujula
          titulo="2. Autovaloración (Reconocer mi valor)"
          preguntas={preguntas.autovaloracion}
          respuestas={respuestas.autovaloracion}
          onRespuestaChange={(preguntaId, valor) =>
            handleRespuestaChange("autovaloracion", preguntaId, valor)
          }
        />
        <SeccionBrujula
          titulo="3. Autodirección (Decidir mi camino)"
          preguntas={preguntas.autodireccion}
          respuestas={respuestas.autodireccion}
          onRespuestaChange={(preguntaId, valor) =>
            handleRespuestaChange("autodireccion", preguntaId, valor)
          }
        />
      </div>
    </div>
  );
});
