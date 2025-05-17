// E:\intern_deploy\intern\component\provider\keycloakprovider.tsx

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import keycloak from "../../keycloak/client/client";

interface AuthContextType {
  token: string | null;
  authenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  authenticated: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const initializeKeycloak = async () => {
      try {
        console.log("Keycloak config", {
          url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080",
          realm: "internrealm",
          clientId: "nextjs-client",
        });

        const auth = await keycloak.init({ onLoad: "login-required" });
        if (auth) {
          setToken(keycloak.token!);
          setAuthenticated(true);
          localStorage.setItem("kc-token", keycloak.token!);
        } else {
          console.warn("Keycloak authentication failed or was cancelled.");
        }
      } catch (error) {
        console.error("Error initializing Keycloak:", error);
      }
    };

    initializeKeycloak();
  }, []);

  return (
    <AuthContext.Provider value={{ token, authenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
