import express from "express";
import cors from "cors";
import healthRoute from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import passport from "./config/passport.js";
import session from "express-session";
import authRoute from "./modules/auth/auth.route.js"

const app = express();

app.use(cors());
app.use(express.json());

app.use(
    session({
        secret: "sessionsecret",
        resave: false,
        saveUninitialized: false,
    }) 
)
app.use(passport.initialize());

app.use("/api/v1", healthRoute);
app.use("/api/v1/auth", authRoute);

app.use(errorHandler)

export default app;