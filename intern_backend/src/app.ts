// E:\intern_backend\src\app.ts
import express from "express";
import cors from "cors";
import testRoutes from "./routes/test/test";
import token from "./routes/token/token";
import upload from "./routes/upload/upload";
import fetchfile from "./routes/fetchfile/fetchfile";
import isCred from "./routes/isCredGiven/isCregGive";
import fetchbucket from "./routes/fetchbucket/fetchbucket";
import session from "express-session";
import { keycloak, memoryStore } from "../middleware/keyclock";
import keycheck from "./routes/apikeycheck/apikeycheck";
const app = express();
app.use(
  session({
    secret: "some-secret",
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);
app.use(keycloak.middleware());
app.use(cors());
app.use(express.json());

app.use("/api/keys", keycheck);
app.use("/api/fetchbucket", fetchbucket);
app.use("/api/isCred", isCred);
app.use("/api/fetchfile", fetchfile);
app.use("/api/upload", upload);
app.use("/api/verifyGoogleToken", token);
app.use("/api/test", testRoutes);

export default app;
