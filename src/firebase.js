import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
  Timestamp,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  orderBy
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDfxjxVOe6YGzzNjKx6ieYEPHN_EtwlMdw",
  authDomain: "ppa-guiasyscout.firebaseapp.com",
  databaseURL: "https://ppa-guiasyscout-default-rtdb.firebaseio.com",
  projectId: "ppa-guiasyscout",
  storageBucket: "ppa-guiasyscout.appspot.com",
  messagingSenderId: "729192149638",
  appId: "1:729192149638:web:733fe7f6948a26d7351707"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Normalización de datos antes de guardar/actualizar
const normalizePpaData = (ppaData) => {
  return {
    suenos: Array.isArray(ppaData.suenos) ? ppaData.suenos.filter(s => s) : [],
    retos: Array.isArray(ppaData.retos) ? ppaData.retos.filter(r => r) : [],
    fortalezas: Array.isArray(ppaData.fortalezas) ? ppaData.fortalezas.filter(f => f) : [],
    corporabilidad: Array.isArray(ppaData.corporabilidad) ? ppaData.corporabilidad.filter(c => c) : [],
    creatividad: Array.isArray(ppaData.creatividad) ? ppaData.creatividad.filter(c => c) : [],
    afectividad: Array.isArray(ppaData.afectividad) ? ppaData.afectividad.filter(a => a) : [],
    espiritualidad: Array.isArray(ppaData.espiritualidad) ? ppaData.espiritualidad.filter(e => e) : [],
    caracter: Array.isArray(ppaData.caracter) ? ppaData.caracter.filter(c => c) : [],
    sociabilidad: Array.isArray(ppaData.sociabilidad) ? ppaData.sociabilidad.filter(s => s) : [],
    actividad: Array.isArray(ppaData.actividad) ? ppaData.actividad : [],
    userId: auth.currentUser?.uid || '',
    createdAt: ppaData.createdAt || serverTimestamp(),
    modifiedAt: serverTimestamp()
  };
};

// Guardar un nuevo PPA
export const savePpa = async (ppaData) => {
  console.log("Datos que se van a guardar:", ppaData);

  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Usuario no autenticado");
    }

    const normalizedData = normalizePpaData(ppaData);
    const finalData = {
      ...normalizedData,
      userId: currentUser.uid,
      createdAt: serverTimestamp(),
      modifiedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'PPA'), finalData);
    return { id: docRef.id, ...finalData };
  } catch (error) {
    console.error("Error al guardar PPA:", error);
    throw error;
  }
};


// Actualizar un PPA existente
export const updatePpa = async (ppaId, ppaData) => {
  try {
    if (!ppaId) {
      throw new Error("ID de PPA no proporcionado");
    }

    const normalizedData = normalizePpaData(ppaData);
    await updateDoc(doc(db, 'PPA', ppaId), normalizedData);
    return { id: ppaId, ...normalizedData };
  } catch (error) {
    console.error("Error al actualizar PPA:", error);
    throw error;
  }
};

// Escuchar cambios en un solo documento PPA
export const onPpaUpdate = (ppaId, callback) => {
  const docRef = doc(db, 'PPA', ppaId);

  return onSnapshot(docRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const normalizedData = {
        id: docSnapshot.id,
        suenos: data.suenos || [],
        retos: data.retos || [],
        fortalezas: data.fortalezas || [],
        corporabilidad: data.corporabilidad || [],
        creatividad: data.creatividad || [],
        afectividad: data.afectividad || [],
        espiritualidad: data.espiritualidad || [],
        caracter: data.caracter || [],
        sociabilidad: data.sociabilidad || [],
        actividad: data.actividad || [],
        createdAt: data.createdAt,
        modifiedAt: data.modifiedAt,
        userId: data.userId
      };
      callback(normalizedData);
    }
  });
};

// Obtener todos los PPAs del usuario actual
export const getPpa = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Usuario no autenticado");

    const q = query(
      collection(db, "PPA"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        suenos: data.suenos || [],
        retos: data.retos || [],
        fortalezas: data.fortalezas || [],
        corporabilidad: data.corporabilidad || [],
        creatividad: data.creatividad || [],
        afectividad: data.afectividad || [],
        espiritualidad: data.espiritualidad || [],
        caracter: data.caracter || [],
        sociabilidad: data.sociabilidad || [],
        actividad: data.actividad || [],
        createdAt: data.createdAt?.toDate(),
        modifiedAt: data.modifiedAt?.toDate(),
        userId: data.userId
      };
    });
  } catch (error) {
    console.error("Error al obtener PPA:", error);
    throw error;
  }
};

// Escuchar en tiempo real todos los PPAs del usuario actual
export const onGetPpas = (uid, successCallback, errorCallback) => {
  try {
    // Asegúrate que el nombre de colección coincida exactamente con tu Firestore
    const q = query(
      collection(db, "PPA"), // o "ppas" según tu colección real
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, 
      (querySnapshot) => {
        const ppas = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          modifiedAt: doc.data().modifiedAt?.toDate()
        }));
        successCallback(ppas);
      },
      (error) => {
        console.error("Error en snapshot:", error);
        errorCallback?.(error);
      }
    );
  } catch (error) {
    console.error("Error al configurar query:", error);
    errorCallback?.(error);
    throw error;
  }
};

// Eliminar un PPA
export const deletePpa = async (ppaId) => {
  try {
    await deleteDoc(doc(db, 'PPA', ppaId));
  } catch (error) {
    console.error("Error al eliminar PPA:", error);
    throw error;
  }
};

export {
  app,
  auth,
  db,
  analytics
};





/* const firebaseConfig = {
  apiKey: "AIzaSyDfxjxVOe6YGzzNjKx6ieYEPHN_EtwlMdw",
  authDomain: "ppa-guiasyscout.firebaseapp.com",
  databaseURL: "https://ppa-guiasyscout-default-rtdb.firebaseio.com",
  projectId: "ppa-guiasyscout",
  storageBucket: "ppa-guiasyscout.appspot.com",
  messagingSenderId: "729192149638",
  appId: "1:729192149638:web:733fe7f6948a26d7351707"
}; */