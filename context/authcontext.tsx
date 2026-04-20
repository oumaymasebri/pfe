import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

type User = {
  id: string;
  email: string;
  role: "admin" | "passenger";
} | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulation : ba3d tbadlha b real auth (firebase, supabase, etc.)
    setTimeout(() => {
      setIsLoading(false);
      // Pour tester : 9olili ida t7eb n7otlek exemple login automatique
    }, 1000);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simulation
    setIsLoading(true);
    // Ici t7ot real login logic mte3k
    setUser({
      id: "123",
      email,
      role: email.includes("admin") ? "admin" : "passenger", // juste pour test
    });
    setIsLoading(false);
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook eli nist3mlouh (hedha eli y7ebou useAuth)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
