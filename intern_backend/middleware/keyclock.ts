// backend/middleware/keycloak.ts
import Keycloak from "keycloak-connect";
import session from "express-session";

const memoryStore = new session.MemoryStore();

const keycloak = new Keycloak(
  { store: memoryStore },
  {
    realm: "internrealm",
    "auth-server-url": "http://keycloak:8080",
    resource: "nextjs-client",
    "ssl-required": "external",

    "confidential-port": 0,
  }
);

export { keycloak, memoryStore };
