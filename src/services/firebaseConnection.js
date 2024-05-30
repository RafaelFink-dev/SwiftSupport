import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBPdHaDcelA_k-Fy3a897HwDvnXXAaGqEY",
    authDomain: "sys-chamados-e682e.firebaseapp.com",
    projectId: "sys-chamados-e682e",
    storageBucket: "sys-chamados-e682e.appspot.com",
    messagingSenderId: "678567950815",
    appId: "1:678567950815:web:fa53bb358b5c0f25acec6a"
  };
  
  const firebaseApp = initializeApp(firebaseConfig);

  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);

  export {auth, db, storage};