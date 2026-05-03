// app/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/app/FirebaceConfig/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/FirebaceConfig/firebaseConfig";
import { User } from "firebase/auth";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'user' | 'counselor' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        const docRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setRole(snap.data().role);
        }
      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);