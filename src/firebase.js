import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp, query, where, Timestamp, onSnapshot, deleteDoc,doc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfxjxVOe6YGzzNjKx6ieYEPHN_EtwlMdw",
  authDomain: "ppa-guiasyscout.firebaseapp.com",
  databaseURL: "https://ppa-guiasyscout-default-rtdb.firebaseio.com",
  projectId: "ppa-guiasyscout",
  storageBucket: "ppa-guiasyscout.appspot.com",
  messagingSenderId: "729192149638",
  appId: "1:729192149638:web:733fe7f6948a26d7351707"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Obtener instancia auth de firebase
export const auth = getAuth(app);

//exporta analytics de firebase
export const analytics = getAnalytics(app);

// Obtener conexión a la base de datos
export const db = getFirestore(app);

// Se guarda los ppa en la base de datos
export const savePpa = (ppaData) => {
  console.log(auth.currentUser.uid)
  const userId = auth.currentUser.uid; // Obtener el UID del usuario actual
  console.log("usuario ", userId)
  const ppaDataWithTimestamp = {
    ...ppaData,
    createdBy: userId, // Cambiar "userId" a "createdBy"
    createdAt: serverTimestamp(),
    
  };
  console.log("CreatedBy ", ppaDataWithTimestamp)

  return addDoc(collection(db, 'PPA'), ppaDataWithTimestamp);
};


// Convierte un objeto Date a un objeto Timestamp de Firebase
export const toFirebaseTimestamp = (date) => {
  return Timestamp.fromDate(date);
};

//Obtener PPA
export const getPpa = async () => {
  const userId = auth.currentUser.uid; // Obtener el UID del usuario actual
  console.log("userId ", userId)
  const q = query(collection(db, "PPA"), where("createdBy", "==", userId));
  console.log("q ", q)
  const querySnapshot = await getDocs(q);
  const ppaData = [];
  querySnapshot.forEach((doc) => {
    ppaData.push({ ...doc.data(), id: doc.id });
  });
  console.log("Ppa data ",ppaData)
  return ppaData;
};

//Borrar PPA
export const deletePpa = (ppaId) => deleteDoc(doc(db, 'PPA',ppaId));

// Obtiene los PPa's en tiempo real de la base de datos 
export const onGetPpas = (callback) => {
  // Obtén el UID del usuario actual
  const currentUserUid = auth.currentUser.uid;
  // Crea la consulta para escuchar los documentos del usuario actual
  const q = query(collection(db, "PPA"), where("createdBy", "==", currentUserUid));
  // Escucha los cambios en los documentos del usuario actual
  const unsubscribe = onSnapshot(q, callback);

  return unsubscribe;
};
// Formatea la fecha en formato local
export const formatDate = (date) => {
  if (date instanceof Date) {
    return date.toLocaleDateString();
  }
  return "";
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