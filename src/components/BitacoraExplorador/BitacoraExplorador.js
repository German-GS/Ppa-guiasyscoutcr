// en: src/components/BitacoraExplorador/BitacoraExplorador.js

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { areasCaminantes } from "./data";
import styles from "./BitacoraExplorador.module.css";
import { Shield, Sword, Compass, HelpCircle, BookCheck } from "lucide-react";
import { InformeDesafioModal } from "./InformeDesafioModal";

const OpcionBoton = ({ etiqueta, valor, seleccion, onSelect, color }) => (
  <button
    onClick={() => onSelect(valor)}
    className={`${styles.opcionBoton} ${
      seleccion === valor ? styles[color] : styles.inactivo
    }`}
  >
    {etiqueta}
  </button>
);

const DesafioCard = ({ desafio, recomendado, onRegistrar }) => (
  <div
    className={`${styles.desafioCard} ${recomendado ? styles.recomendado : ""}`}
  >
    <div>
      <h4
        className={`${styles.desafioNivel} ${
          styles[desafio.nivel.toLowerCase()]
        }`}
      >
        {desafio.nivel === "Bronce" && (
          <Shield size={16} className="inline-block mr-2" />
        )}
        {desafio.nivel === "Plata" && (
          <Sword size={16} className="inline-block mr-2" />
        )}
        {desafio.nivel === "Oro" && (
          <Compass size={16} className="inline-block mr-2" />
        )}
        {desafio.nivel}
      </h4>
      <h5 className={styles.desafioTitulo}>{desafio.titulo}</h5>
      <p className={styles.desafioDescripcion}>{desafio.descripcion}</p>
    </div>
    <div className="mt-4">
      {recomendado && (
        <div className={styles.recomendadoBadge}>Recomendado para ti</div>
      )}
      <button
        onClick={() => onRegistrar(desafio)}
        className={styles.btnRegistrar}
      >
        <BookCheck size={14} className="mr-2" />
        Registrar Avance
      </button>
    </div>
  </div>
);

const AreaContenido = ({
  area,
  evaluacion,
  onAfirmacionChange,
  onPreguntaChange,
  onRegistrarDesafio,
}) => {
  const getRecomendacion = () => {
    if (!evaluacion?.afirmaciones) return "siempre";
    const conteo = Object.values(evaluacion.afirmaciones).reduce(
      (acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      },
      { siempre: 0, aveces: 0, necesito: 0 }
    );

    if (conteo.necesito > 0) return "necesito";
    if (conteo.aveces >= 2) return "aveces";
    return "siempre";
  };

  return (
    <div className={styles.areaContenido}>
      <div className={styles.historiaContainer}>
        <h3 className={styles.subtitulo}>{area.historia.titulo}</h3>
        {area.historia.parrafos.map((p, i) => (
          <p key={i} className="text-sm mb-2">
            {p}
          </p>
        ))}
      </div>

      <h3 className={styles.subtitulo}>Revisa tu Brújula</h3>
      <div className="space-y-3 mb-8">
        {area.afirmaciones.map((afirmacion, index) => (
          <div key={index} className={styles.afirmacionItem}>
            <p className="text-sm text-texto-principal flex-1">{afirmacion}</p>
            <div className="flex gap-2 flex-shrink-0">
              <OpcionBoton
                etiqueta="Siempre Listo"
                valor="siempre"
                color="siempre"
                seleccion={evaluacion.afirmaciones?.[`afirmacion${index}`]}
                onSelect={(valor) => onAfirmacionChange(index, valor)}
              />
              <OpcionBoton
                etiqueta="A Veces"
                valor="aveces"
                color="aveces"
                seleccion={evaluacion.afirmaciones?.[`afirmacion${index}`]}
                onSelect={(valor) => onAfirmacionChange(index, valor)}
              />
              <OpcionBoton
                etiqueta="Necesito Prepararme"
                valor="necesito"
                color="necesito"
                seleccion={evaluacion.afirmaciones?.[`afirmacion${index}`]}
                onSelect={(valor) => onAfirmacionChange(index, valor)}
              />
            </div>
          </div>
        ))}
      </div>

      <h3 className={styles.subtitulo}>Preguntas para Trazar tu Mapa</h3>
      <div className="space-y-4 mb-8">
        {area.preguntas.map((pregunta, index) => (
          <div key={index} className={styles.preguntaItem}>
            <p className="font-bold text-principal text-sm flex items-center gap-2">
              <HelpCircle size={16} />
              {pregunta.tipo}
            </p>
            <p className="text-sm mt-1">{pregunta.texto}</p>
            <textarea
              rows="3"
              className="border-input w-full mt-2"
              placeholder="Tu reflexión aquí..."
              value={evaluacion.preguntas?.[`pregunta${index}`] || ""}
              onChange={(e) => onPreguntaChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>

      <h3 className={styles.subtitulo}>Tu Próximo Desafío</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DesafioCard
          desafio={area.desafios.siempre}
          recomendado={getRecomendacion() === "siempre"}
          onRegistrar={onRegistrarDesafio}
        />
        <DesafioCard
          desafio={area.desafios.aveces}
          recomendado={getRecomendacion() === "aveces"}
          onRegistrar={onRegistrarDesafio}
        />
        <DesafioCard
          desafio={area.desafios.necesito}
          recomendado={getRecomendacion() === "necesito"}
          onRegistrar={onRegistrarDesafio}
        />
      </div>
    </div>
  );
};

export const BitacoraExplorador = forwardRef(
  ({ initialData, onSaveInforme }, ref) => {
    const [activeArea, setActiveArea] = useState(areasCaminantes[0]);
    const [evaluacion, setEvaluacion] = useState({});
    const [modalDesafio, setModalDesafio] = useState(null);

    useEffect(() => {
      const estadoInicial = {};
      areasCaminantes.forEach((area) => {
        estadoInicial[area.id] = { afirmaciones: {}, preguntas: {} };
        area.afirmaciones.forEach((_, index) => {
          estadoInicial[area.id].afirmaciones[`afirmacion${index}`] =
            initialData?.[area.id]?.afirmaciones?.[`afirmacion${index}`] ||
            null;
        });
        area.preguntas.forEach((_, index) => {
          estadoInicial[area.id].preguntas[`pregunta${index}`] =
            initialData?.[area.id]?.preguntas?.[`pregunta${index}`] || "";
        });
      });
      setEvaluacion(estadoInicial);
    }, [initialData]);

    const handleAfirmacionChange = (areaId, afirmacionIndex, valor) => {
      setEvaluacion((prev) => ({
        ...prev,
        [areaId]: {
          ...prev[areaId],
          afirmaciones: {
            ...prev[areaId]?.afirmaciones,
            [`afirmacion${afirmacionIndex}`]: valor,
          },
        },
      }));
    };

    const handlePreguntaChange = (areaId, preguntaIndex, valor) => {
      setEvaluacion((prev) => ({
        ...prev,
        [areaId]: {
          ...prev[areaId],
          preguntas: {
            ...prev[areaId]?.preguntas,
            [`pregunta${preguntaIndex}`]: valor,
          },
        },
      }));
    };

    useImperativeHandle(ref, () => ({
      getValues: () => evaluacion,
      reset: () => {
        const estadoVacio = {};
        areasCaminantes.forEach((area) => {
          estadoVacio[area.id] = { afirmaciones: {}, preguntas: {} };
          area.afirmaciones.forEach((_, index) => {
            estadoVacio[area.id].afirmaciones[`afirmacion${index}`] = null;
          });
          area.preguntas.forEach((_, index) => {
            estadoVacio[area.id].preguntas[`pregunta${index}`] = "";
          });
        });
        setEvaluacion(estadoVacio);
      },
    }));

    return (
      <>
        <div className={styles.container}>
          <h2 className={styles.mainTitle}>La Bitácora del Explorador</h2>
          <p className={styles.mainDescription}>
            Usa estas historias y preguntas para navegar por tus áreas de
            crecimiento. Este es tu mapa personal, y está vivo, como tú.
          </p>
          <div className={styles.contentWrapper}>
            <nav className={styles.sidebar}>
              {areasCaminantes.map((area) => (
                <button
                  key={area.id}
                  className={`${styles.navButton} ${
                    activeArea.id === area.id ? styles.active : ""
                  }`}
                  onClick={() => setActiveArea(area)}
                >
                  {area.titulo.split(" - ")[0]}
                </button>
              ))}
            </nav>
            <main className={styles.mainContent}>
              <AreaContenido
                area={activeArea}
                evaluacion={evaluacion[activeArea.id] || {}}
                onAfirmacionChange={(afirmacionIndex, valor) =>
                  handleAfirmacionChange(activeArea.id, afirmacionIndex, valor)
                }
                onPreguntaChange={(preguntaIndex, valor) =>
                  handlePreguntaChange(activeArea.id, preguntaIndex, valor)
                }
                onRegistrarDesafio={setModalDesafio}
              />
            </main>
          </div>
        </div>

        <InformeDesafioModal
          isOpen={!!modalDesafio}
          onClose={() => setModalDesafio(null)}
          desafio={modalDesafio}
          onSave={onSaveInforme}
        />
      </>
    );
  }
);
