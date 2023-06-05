import React, { useState, useEffect } from "react";
import { getPpa, deletePpa, onGetPpas } from "../firebase";
import Swal from "sweetalert2";
import Modal from "react-modal";
import { setAppElement } from "react-modal";
import { Ppa } from "./Ppa.js";
import "./modal.css";

export function ListPpa() {
  const [ppaData, setPpaData] = useState([]);
  const [realtimePpaData, setRealtimePpaData] = useState([]);
  const [selectedPpa, setSelectedPpa] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    obtPpa(); // Obtén los PPA's iniciales

    const handleRealtimePpaUpdate = (querySnapshot) => {
      const updatedPpaData = [];
      querySnapshot.forEach((doc) => {
        updatedPpaData.push({ id: doc.id, ...doc.data() });
      });
      setRealtimePpaData(updatedPpaData);
    };

    const unsubscribe = onGetPpas(handleRealtimePpaUpdate);

    return () => {
      unsubscribe(); // Detén la suscripción cuando el componente se desmonte
    };
  }, []);

  // Obtiene los PPa's de la base de datos
  const obtPpa = async () => {
    try {
      const ppaData = await getPpa();
      setPpaData(ppaData);
    } catch (error) {
      console.log(error);
    }
  };

  const formatDate = (date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString();
    } else if (date?.toDate instanceof Function) {
      // Si es un objeto Timestamp, convertirlo a Date antes de formatear
      const timestampDate = date.toDate();
      return timestampDate.toLocaleDateString();
    }
    return "";
  };

  const eliminarPpa = async (id) => {
    try {
      await deletePpa(id);
      setPpaData((prevData) => prevData.filter((ppa) => ppa.id !== id));
      Swal.fire({
        icon: "success",
        title: "¡Eliminado!",
        text: "El PPA se ha eliminado correctamente.",
      });
    } catch (error) {
      console.error("Error al eliminar el PPA de la base de datos", error);
      Swal.fire({
        icon: "error",
        title: "Error al eliminar el PPA",
        text: "Ha ocurrido un error al eliminar el PPA. Por favor, intenta nuevamente.",
      });
    }
  };

  const openModal = (ppa) => {
    setSelectedPpa(ppa);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };
  Modal.setAppElement("#root"); // Reemplaza '#root' por el selector del elemento raíz de tu aplicación
  // ...

  return (
    <div>
      <h1 className="text-3xl mb-5 mt-5 p-2">Lista de PPA's realizados</h1>
      <table className="mx-auto w-full border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2 text-center text-xl">PPA</th>
            <th className="px-4 py-2 text-center text-xl">Fecha de Creación</th>
            <th className="px-4 py-2 text-center text-xl">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {realtimePpaData.map((ppa, index) => (
            <tr key={index}>
              <td className="px-4 py-2 text-center">{`PPA ${index + 1}`}</td>
              <td className="px-4 py-2 text-center">
                {formatDate(ppa.createdAt)}
              </td>
              <td className="px-4 py-2 text-center">
              <div className="flex items-center justify-center">
                {realtimePpaData.length > 0 && (
                  <button
                    onClick={() => openModal(ppa)}
                    className="text-white bg-scout hover:bg-scout-100 focus:outline-none font-medium rounded-lg text-sm px-4 py-2"
                  >
                    Ver
                  </button>
                )}
                {ppa.id && (
                  <button
                    onClick={() => eliminarPpa(ppa.id)}
                    className="text-white bg-rover1-100 hover:bg-rover-100 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 ml-2"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </td>
            
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="PPA Details"
        className="fixed inset-0 flex items-center justify-center"
      >
        {selectedPpa && (
          <div className="bg-white rounded-lg max-w-lg w-full mx-4 md:mx-auto p-2 text-gray-500">
            <Ppa selectedPpa={selectedPpa} closeModal={closeModal} />
          </div>
        )}
      </Modal>
    </div>
  );
}

/**
 * import React, { useState, useEffect } from "react";
import { getPpa, deletePpa, onGetPpas } from "../firebase";
import Swal from "sweetalert2";
import Modal from "react-modal";
import { setAppElement } from "react-modal";
import { Ppa } from "./Ppa.js";
import "./modal.css";

export function ListPpa() {
  const [ppaData, setPpaData] = useState([]);
  const [realtimePpaData, setRealtimePpaData] = useState([]);
  const [selectedPpa, setSelectedPpa] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    obtPpa(); // Obtén los PPA's iniciales

    const handleRealtimePpaUpdate = (querySnapshot) => {
      const updatedPpaData = [];
      querySnapshot.forEach((doc) => {
        updatedPpaData.push({ id: doc.id, ...doc.data() });
      });
      setRealtimePpaData(updatedPpaData);
    };

    const unsubscribe = onGetPpas(handleRealtimePpaUpdate);

    return () => {
      unsubscribe(); // Detén la suscripción cuando el componente se desmonte
    };
  }, []);

  // Obtiene los PPa's de la base de datos
  const obtPpa = async () => {
    try {
      const ppaData = await getPpa();
      setPpaData(ppaData);
    } catch (error) {
      console.log(error);
    }
  };

  const formatDate = (date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString();
    } else if (date?.toDate instanceof Function) {
      // Si es un objeto Timestamp, convertirlo a Date antes de formatear
      const timestampDate = date.toDate();
      return timestampDate.toLocaleDateString();
    }
    return "";
  };

  const eliminarPpa = async (id) => {
    try {
      await deletePpa(id);
      setPpaData((prevData) => prevData.filter((ppa) => ppa.id !== id));
      Swal.fire({
        icon: "success",
        title: "¡Eliminado!",
        text: "El PPA se ha eliminado correctamente.",
      });
    } catch (error) {
      console.error("Error al eliminar el PPA de la base de datos", error);
      Swal.fire({
        icon: "error",
        title: "Error al eliminar el PPA",
        text: "Ha ocurrido un error al eliminar el PPA. Por favor, intenta nuevamente.",
      });
    }
  };

  const openModal = (ppa) => {
    setSelectedPpa(ppa);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };
  Modal.setAppElement("#root"); // Reemplaza '#root' por el selector del elemento raíz de tu aplicación
  return (
    <div>
      <h1 className="text-3xl mb-5 mt-5 p-2">Lista de PPA's realizados</h1>
      <table className="mx-auto w-full border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2 text-center text-xl">PPA</th>
            <th className="px-4 py-2 text-center text-xl">Fecha de Creación</th>
            <th className="px-4 py-2 text-center text-xl">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {realtimePpaData.map((ppa, index) => (
            <tr key={index}>
              <td className="px-4 py-2 text-center">{`PPA ${index + 1}`}</td>
              <td className="px-4 py-2 text-center">
                {formatDate(ppa.createdAt)}
              </td>
              <td className="px-4 py-2 text-center">
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => openModal(ppa)}
                    className="text-white bg-scout hover:bg-scout-100 focus:outline-none font-medium rounded-lg text-sm px-4 py-2"
                  >
                    Ver
                  </button>
                  {ppa.id && (
                    <button
                      onClick={() => eliminarPpa(ppa.id)}
                      className="text-white bg-rover1-100 hover:bg-rover-100 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 ml-2"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="PPA Details"
        className="fixed inset-0 flex items-center justify-center"
      >
        {selectedPpa && (
          <div className="bg-white rounded-lg max-w-lg w-full mx-4 md:mx-auto p-2 text-gray-500">
            <Ppa selectedPpa={selectedPpa} closeModal={closeModal} />
          </div>
        )}
      </Modal>
    </div>
  );
}

 */
