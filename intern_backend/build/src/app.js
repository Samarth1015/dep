"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// E:\intern_backend\src\app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const test_1 = __importDefault(require("./routes/test/test"));
const token_1 = __importDefault(require("./routes/token/token"));
const upload_1 = __importDefault(require("./routes/upload/upload"));
const fetchfile_1 = __importDefault(require("./routes/fetchfile/fetchfile"));
const isCregGive_1 = __importDefault(require("./routes/isCredGiven/isCregGive"));
const fetchbucket_1 = __importDefault(require("./routes/fetchbucket/fetchbucket"));
const express_session_1 = __importDefault(require("express-session"));
const keyclock_1 = require("../middleware/keyclock");
const apikeycheck_1 = __importDefault(require("./routes/apikeycheck/apikeycheck"));
const app = (0, express_1.default)();
app.use((0, express_session_1.default)({
    secret: "some-secret",
    resave: false,
    saveUninitialized: true,
    store: keyclock_1.memoryStore,
}));
app.use(keyclock_1.keycloak.middleware());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/keys", apikeycheck_1.default);
app.use("/api/fetchbucket", fetchbucket_1.default);
app.use("/api/isCred", isCregGive_1.default);
app.use("/api/fetchfile", fetchfile_1.default);
app.use("/api/upload", upload_1.default);
app.use("/api/verifyGoogleToken", token_1.default);
app.use("/api/test", test_1.default);
exports.default = app;
