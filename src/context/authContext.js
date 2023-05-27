import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup, 
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase.js";

export const authContext = createContext();

export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) throw new Error("There is not provider");

  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true)

  const signup = async (email, password) => {
    
    //Hace el registro del usuario usando la funcion de firebase por email y devuelve una promesa
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email, password) => {
    // Hace login del usuario ya registrado
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => signOut(auth);

  const loginWithGoogle = () => {
    const googleProvider = new GoogleAuthProvider()
    return signInWithPopup(auth, googleProvider)


  }

  const resetPassword =(email)=>{
    return sendPasswordResetEmail(auth, email)

  }
  useEffect(() => {
    const unsuscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false)
      console.log(currentUser)
    });

    return () => unsuscribe()
  }, []);

  return (
    <authContext.Provider value={{ signup, login, user, logout, loading, loginWithGoogle, resetPassword }}>
      {children}
    </authContext.Provider>
  );
}
