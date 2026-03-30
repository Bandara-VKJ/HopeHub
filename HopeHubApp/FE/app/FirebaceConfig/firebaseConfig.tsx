import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDzO5XS8aYZ7P5Ujo3Bq3RQCS3aAbrsNHI",
    authDomain: "hopehubapp-b6b6b.firebaseapp.com",
    databaseURL: "https://hopehubapp-b6b6b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "hopehubapp-b6b6b",
    storageBucket: "hopehubapp-b6b6b.firebasestorage.app",
    messagingSenderId: "95869499004",
    appId: "1:95869499004:web:b8571ac2c9db6290b6bbf9",
    measurementId: "G-LRGZZ5E7EZ"
  };

  //initialize firebase
  const app = initializeApp(firebaseConfig)

  // Export services to use in other files
  export const auth = getAuth(app);
  export const db = getFirestore(app)
  export const storage = getStorage(app)


