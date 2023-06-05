import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { Navbar } from "./Navbar";
import { ListPpa } from "./ListPpa";
import { InputForm } from "./InputForm";
import { savePpa, analytics } from "../firebase";
import { Agendar } from "./Agendar";
import Swal from "sweetalert2";

export function Home() {
  const { loading } = useAuth();
  const [ppaData, setPpaData] = useState([]);

  useEffect(() => {
    const handleRegisterButtonClick = () => {
      // Registra el evento de clic en el botón de registro
      analytics.logEvent("registro_ppa", { location: "formulario_ppa" });
      // Aquí puedes agregar el código para realizar el registro de usuario
    };

    const registerButton = document.getElementById("register-button");
    if (registerButton) {
      registerButton.addEventListener("click", handleRegisterButtonClick);
    }

    return () => {
      // Limpiar el listener al desmontar el componente
      if (registerButton) {
        registerButton.removeEventListener("click", handleRegisterButtonClick);
      }
    };
  }, []);

  const handleSavePpa = async () => {
    try {
      await savePpa(ppaData);
      Swal.fire({
        icon: "success",
        title: "¡Siempre Listos!",
        text: "Los datos del PPA se han guardado correctamente.",
      });
    } catch (error) {
      console.error(
        "Error al guardar los datos del PPA en la base de datos",
        error
      );
      Swal.fire({
        icon: "error",
        title: "Error al guardar su PPA",
        text: "Ha ocurrido un error al guardar los datos del PPA. Por favor, intenta nuevamente.",
      });
    }
  };

  const handleInputChange = (key, data) => {
    setPpaData((prevState) => ({
      ...prevState,
      [key]: data,
    }));
  };

  if (loading) return <h1>Loading</h1>;
  return (
    <div className="bg-white text-gray-400 w-full lg:mb-0 mb-4">
      <Navbar />
      <div className="max-w-screen-lg mx-auto">
        <h1 className="text-3xl mb-5 mt-5 p-2">PPA</h1>
        <hr />

        <form
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 mx=2 p-2"
          id="ppa-form"
          onSubmit={(event) => {
            event.preventDefault();
            try {
              handleSavePpa();
            } catch (error) {
              console.log(error);
            }
          }}
        >
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Sueños
            </label>
            <InputForm
              onSavePpa={(data) => handleInputChange("suenos", data)}
            />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Retos
            </label>
            <InputForm onSavePpa={(data) => handleInputChange("retos", data)} />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Mis Fortalezas
            </label>
            <InputForm
              onSavePpa={(data) => handleInputChange("fortalezas", data)}
            />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Corporabilidad
            </label>
            <InputForm
              onSavePpa={(data) => handleInputChange("corporabilidad", data)}
            />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Creatividad
            </label>
            <InputForm
              onSavePpa={(data) => handleInputChange("creatividad", data)}
            />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Afectividad
            </label>
            <InputForm
              onSavePpa={(data) => handleInputChange("afectividad", data)}
            />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Espiritualidad
            </label>
            <InputForm
              onSavePpa={(data) => handleInputChange("espiritualidad", data)}
            />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Caracter
            </label>
            <InputForm
              onSavePpa={(data) => handleInputChange("caracter", data)}
            />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Sociabilidad
            </label>
            <InputForm
              onSavePpa={(data) => handleInputChange("sociabilidad", data)}
            />
          </div>

          <div className="col-span-full">
            <div>
              <h1 className="text-3xl mb-5 mt-5 p-2">Mi PPA</h1>
              <hr />
              <Agendar
                onSavePpa={(data) => handleInputChange("actividad", data)}
              />
            </div>
            <button
              id="register-button"
              type="submit"
              className="max-w-200 text-white bg-secundaryColor hover:bg-scout focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-scout dark:hover:bg-scout dark:focus:ring-blue-800 mb-3 mt-6"
            >
              Registrar PPA
            </button>
          </div>
        </form>
        <div>
          <hr className="mt-20" />
          <ListPpa ppaData={Object.values(ppaData)} />
        </div>
      </div>
      <div></div>
    </div>
  );
}

/**
 * import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { Navbar } from "./Navbar";
import { ListPpa } from "./ListPpa";
import { InputForm } from "./InputForm";
import { savePpa, analytics } from "../firebase";
import Swal from "sweetalert2";

export function Home() {
  const { loading } = useAuth();
  const [ppaData, setPpaData] = useState({});
  const registerButtonRef = useRef(null);

  useEffect(() => {
    const handleRegisterButtonClick = () => {
      // Registra el evento de clic en el botón de registro
      analytics.logEvent("registro_ppa", { location: "formulario_ppa" });
      // Aquí puedes agregar el código para realizar el registro de usuario
    };
  
    const registerButton = document.getElementById("register-button");
    if (registerButton) {
      registerButton.addEventListener("click", handleRegisterButtonClick);
    }
  
    return () => {
      // Limpiar el listener al desmontar el componente
      if (registerButton) {
        registerButton.removeEventListener("click", handleRegisterButtonClick);
      }
    };
  }, []);

  const handleSavePpa = async () => {
    try {
      await savePpa(ppaData);
      Swal.fire({
        icon: "success",
        title: "¡Siempre Listos!",
        text: "Los datos del PPA se han guardado correctamente.",
      });
    } catch (error) {
      console.error(
        "Error al guardar los datos del PPA en la base de datos",
        error
      );
      Swal.fire({
        icon: "error",
        title: "Error al guardar su PPA",
        text: "Ha ocurrido un error al guardar los datos del PPA. Por favor, intenta nuevamente.",
      });
    }
  };

  const handleInputChange = (field, data) => {
    setPpaData((prevState) => ({
      ...prevState,
      [field]: data,
    }));
  };

  if (loading) return <h1>Loading</h1>;
  return (
    <div className="bg-white text-gray-400 w-full lg:mb-0 mb-4">
      <Navbar />
      <div className="max-w-screen-lg mx-auto">
        <h1 className="text-3xl mb-5 mt-5 p-2">PPA</h1>
        <hr />

        <form
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 mx=2 p-2"
          id="ppa-form"
          onSubmit={(event) => {
            event.preventDefault();
            try {
              handleSavePpa();
            } catch (error) {
              console.log(error);
            }
          }}
        >
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Sueños
            </label>
            <InputForm
              onSavePpa={(data) => handleInputChange("suenos", data)}
            />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Retos
            </label>
            <InputForm onSavePpa={(data) => handleInputChange("retos", data)} />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Mis Fortalezas
            </label>
            <InputForm
              onSavePpa={(data) => handleInputChange("fortalezas", data)}
            />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Corporabilidad
            </label>
            <InputForm
              onSavePpa={(data) => handleInputChange("corporabilidad", data)}
            />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Creatividad
            </label>
            <InputForm
              onSavePpa={(data) => handleInputChange("creatividad", data)}
            />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Afectividad
            </label>
            <InputForm
              onSavePpa={(data) => handleInputChange("afectividad", data)}
            />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Espiritualidad
            </label>
            <InputForm
              onSavePpa={(data) => handleInputChange("espiritualidad", data)}
            />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Caracter
            </label>
            <InputForm
              onSavePpa={(data) => handleInputChange("caracter", data)}
            />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-400 mb-6">
              Sociabilidad
            </label>
            <InputForm
              onSavePpa={(data) => handleInputChange("sociabilidad", data)}
            />
          </div>

          <div className="col-span-full">
            <button
              id="register-button"
              type="submit"
              className="max-w-200 text-white bg-secundaryColor hover:bg-scout focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-scout dark:hover:bg-scout dark:focus:ring-blue-800 mb-3"
            >
              Registrar PPA
            </button>
          </div>
        </form>
        <div>
          <hr className="mt-20" />
          <ListPpa ppaData={ppaData} />
        </div>
      </div>
      <div></div>
    </div>
  );
}

 */
