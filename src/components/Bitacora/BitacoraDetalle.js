// en: src/components/Bitacora/BitacoraDetalle.js (Versión Final Corregida)

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db, saveInformeDesafio } from "../../firebase";
import { useAuth } from "../../context/authContext"; // <-- CORRECCIÓN: 'useAuth' importado
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faTimes } from "@fortawesome/free-solid-svg-icons";
import { areasCaminantes } from "../BitacoraExplorador/data";
import { InformeDesafioModal } from "../BitacoraExplorador/InformeDesafioModal";
import { Shield, Sword, Compass, HelpCircle, BookCheck } from "lucide-react";
import styles from "../BitacoraExplorador/BitacoraExplorador.module.css";

// --- Sub-componentes para mantener el código limpio ---

const SeccionBrujula = ({ titulo, respuestas }) => (
  <div className="bg-fondo p-4 rounded-lg border border-borde h-full">
    <h3 className="text-lg font-bold mb-2 text-principal">{titulo}</h3>
    {respuestas &&
    Object.values(respuestas).length > 0 &&
    Object.values(respuestas).some((r) => r) ? (
      <ul className="space-y-2 text-texto-principal text-sm list-disc list-inside">
        {Object.values(respuestas).map((respuesta, i) => (
          <li key={i}>
            {respuesta || (
              <span className="italic text-texto-secundario">
                Sin respuesta
              </span>
            )}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-texto-secundario italic">No hay reflexiones aquí.</p>
    )}
  </div>
);

// ▼▼▼ CORRECCIÓN: 'ResumenBitacora' definido ▼▼▼
const ResumenBitacora = ({ evaluacion }) => {
  const estilos = {
    siempre: "bg-green-100 text-green-800",
    aveces: "bg-yellow-100 text-yellow-800",
    necesito: "bg-red-100 text-red-800",
    null: "bg-gray-100 text-gray-800",
  };
  const etiquetas = {
    siempre: "Siempre Listo",
    aveces: "A Veces",
    necesito: "Necesito Prepararme",
    null: "Pendiente",
  };

  return (
    <div className="bg-fondo p-4 rounded-lg border border-borde">
      <h3 className="text-lg font-bold mb-3 text-principal">
        Resumen del Explorador
      </h3>
      <div className="space-y-4">
        {areasCaminantes.map((area) => (
          <div key={area.id}>
            <h4 className="font-semibold text-texto-principal text-sm mb-2">
              {area.titulo.split(" - ")[0]}
            </h4>
            <div className="flex flex-wrap gap-2">
              {area.afirmaciones.map((afirmacion, index) => {
                const respuesta =
                  evaluacion?.[area.id]?.afirmaciones?.[`afirmacion${index}`] ||
                  null;
                return (
                  <span
                    key={index}
                    title={afirmacion}
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${estilos[respuesta]}`}
                  >
                    {etiquetas[respuesta]}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DesafioCard = ({ desafio, onRegistrar }) => (
  <div className={styles.desafioCard}>
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
      <button
        onClick={() => onRegistrar(desafio)}
        className={styles.btnRegistrar}
      >
        <BookCheck size={14} className="mr-2" />
        Registrar Informe
      </button>
    </div>
  </div>
);

// --- Componente Principal ---

// ▼▼▼ CORRECCIÓN: 'onSaveInforme' recibido como prop ▼▼▼
export function BitacoraDetalle({ selectedPpa, closeModal, onSaveInforme }) {
  const { user } = useAuth();
  const [ultimaEntrada, setUltimaEntrada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalDesafio, setModalDesafio] = useState(null);
  const [entradaId, setEntradaId] = useState(null);

  useEffect(() => {
    const fetchUltimaEntrada = async () => {
      if (!selectedPpa) return;
      setLoading(true);
      try {
        const entradasRef = collection(db, "PPA", selectedPpa.id, "entradas");
        const q = query(entradasRef, orderBy("fecha", "desc"), limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setUltimaEntrada(doc.data());
          setEntradaId(doc.id);
        }
      } catch (error) {
        console.error("Error cargando la última entrada:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUltimaEntrada();
  }, [selectedPpa]);

  const handleSaveInforme = async (informeData) => {
    try {
      await onSaveInforme({
        ...informeData,
        bitacoraId: selectedPpa.id,
        entradaId,
      });
    } catch (error) {
      console.error("Error al intentar guardar informe:", error);
      Swal.fire("Error", "No se pudo invocar la función de guardado.", "error");
    }
  };

  const formatDateTime = (date) => {
    if (!date?.toDate) return "No especificada";
    return date.toDate().toLocaleString();
  };

  if (loading || !ultimaEntrada) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center">
        {loading ? (
          <p>Cargando reflexión...</p>
        ) : (
          <p>No se encontraron reflexiones.</p>
        )}
        <button onClick={closeModal} className="mt-4 btn-secondary">
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="bg-principal text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">{selectedPpa.titulo}</h2>
            <p className="text-sm opacity-80">
              Última reflexión: {formatDateTime(ultimaEntrada.fecha)}
            </p>
          </div>
          <button onClick={closeModal} className="text-white hover:opacity-75">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto space-y-6">
          {/* ▼▼▼ CORRECCIÓN EN ESTAS 3 LÍNEAS ▼▼▼ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SeccionBrujula
              titulo="Autoconciencia"
              respuestas={ultimaEntrada.autoconciencia}
            />
            <SeccionBrujula
              titulo="Autovaloración"
              respuestas={ultimaEntrada.autovaloracion}
            />
            <SeccionBrujula
              titulo="Autodirección"
              respuestas={ultimaEntrada.autodireccion}
            />
          </div>
          <ResumenBitacora evaluacion={ultimaEntrada.bitacoraExplorador} />

          <div className="bg-fondo p-4 rounded-lg border border-borde">
            <h3 className="text-lg font-bold mb-3 text-principal">
              Bitácora del Explorador Completa
            </h3>
            {areasCaminantes.map((area) => {
              const preguntasArea =
                ultimaEntrada.bitacoraExplorador?.[area.id]?.preguntas;
              // ▼▼▼ NUEVA LÓGICA: Comprobamos si hay respuestas escritas en esta área ▼▼▼
              const hayRespuestas =
                preguntasArea &&
                Object.values(preguntasArea).some(
                  (resp) => resp && resp.trim() !== ""
                );

              if (!hayRespuestas) {
                return null; // Si no hay respuestas, no mostramos nada para esta área
              }

              return (
                <div key={area.id} className="mb-6 last:mb-0">
                  <h4 className="font-bold text-lg text-principal mb-2">
                    {area.titulo}
                  </h4>

                  <div className="space-y-2 mb-4">
                    {area.preguntas.map((pregunta, index) => (
                      <div
                        key={index}
                        className="text-sm p-3 bg-white rounded-md border"
                      >
                        <p className="font-semibold text-texto-secundario flex items-center gap-2">
                          <HelpCircle size={16} />
                          {pregunta.tipo}
                        </p>
                        <p className="mt-1">
                          {preguntasArea?.[`pregunta${index}`] || (
                            <span className="italic">Sin respuesta.</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>

                  <h5 className="font-bold text-md text-principal mt-4 mb-2">
                    Desafíos de la Etapa
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DesafioCard
                      desafio={area.desafios.siempre}
                      onRegistrar={setModalDesafio}
                    />
                    <DesafioCard
                      desafio={area.desafios.aveces}
                      onRegistrar={setModalDesafio}
                    />
                    <DesafioCard
                      desafio={area.desafios.necesito}
                      onRegistrar={setModalDesafio}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        <footer className="flex justify-between items-center p-6 border-t bg-white sticky bottom-0 rounded-b-2xl">
          <button
            onClick={() => window.print()}
            className="btn-secondary flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPrint} /> Imprimir
          </button>
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600"
          >
            Cerrar
          </button>
        </footer>
      </div>

      <InformeDesafioModal
        isOpen={!!modalDesafio}
        onClose={() => setModalDesafio(null)}
        desafio={modalDesafio}
        onSave={(data) => handleSaveInforme(data)}
      />
    </>
  );
}
