import React, { useState, useEffect } from "react";
import { onGetPpas, deletePpa } from "../firebase";
import Swal from "sweetalert2";
import Modal from "react-modal";
import { Ppa } from "./Ppa";
import { formatDateTime } from "../utils/dateUtils";
import { useAuth } from "../context/authContext"; // ✅ Importar el usuario autenticado

export function ListPpa({ onEditPpa }) {
  const { user } = useAuth(); // ✅ Obtener UID del usuario
  const [realtimePpaData, setRealtimePpaData] = useState([]);
  const [selectedPpa, setSelectedPpa] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedPpa(null);
  };

  const handleEditPpa = (ppa) => {
    closeModal();
    onEditPpa(ppa);
  };

  const eliminarPpa = async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
      });

      if (result.isConfirmed) {
        await deletePpa(id);
        Swal.fire('¡Eliminado!', 'Tu PPA ha sido eliminado.', 'success');
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      Swal.fire('Error', 'Ocurrió un problema al eliminar el PPA', 'error');
    }
  };

  const openModal = (ppa) => {
    setSelectedPpa(ppa);
    setModalIsOpen(true);
  };

  useEffect(() => {
    if (!user?.uid) {
      console.log("Usuario no autenticado");
      return;
    }
  
    console.log(`Buscando PPAs para usuario: ${user.uid}`);
    setLoading(true);
  
    const unsubscribe = onGetPpas(user.uid, (ppas) => {
      console.log("PPAs recibidos:", ppas);
      
      if (!ppas || ppas.length === 0) {
        console.log("No se encontraron PPAs para este usuario");
      }
  
      const sortedData = ppas.sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA;
      });
  
      setRealtimePpaData(sortedData);
      setLoading(false);
    }, (error) => {
      console.error("Error en listener:", error);
      setLoading(false);
    });
  
    return () => {
      console.log("Limpiando suscripción");
      unsubscribe?.();
    };
  }, [user?.uid]);
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-scout"></div>
      </div>
    );
  }

  return (
    <div className="px-4">
      <h1 className="text-3xl mb-5 mt-5 p-2 text-center">Lista de PPA's realizados</h1>

      {realtimePpaData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay PPAs registrados aún</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-lg font-semibold text-gray-700">#</th>
                <th className="px-4 py-3 text-left text-lg font-semibold text-gray-700">Fecha y Hora de Creación</th>
                <th className="px-4 py-3 text-left text-lg font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {realtimePpaData.map((ppa, index) => (
                <tr key={ppa.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDateTime(ppa.createdAt)}
                    {ppa.modifiedAt && (
                      <div className="text-xs text-gray-500">
                        Modificado: {formatDateTime(ppa.modifiedAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openModal(ppa)}
                        className="btn-scout-red text-white px-4 py-2 rounded-lg hover:bg-[#FFA400] transition-colors"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => eliminarPpa(ppa.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Detalles del PPA"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        {selectedPpa && (
          <Ppa
            selectedPpa={selectedPpa}
            closeModal={closeModal}
            onEdit={handleEditPpa}
          />
        )}
      </Modal>
    </div>
  );
}
