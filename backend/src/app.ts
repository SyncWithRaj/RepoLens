import express from "express";
import cors from "cors";
import healthRoute from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import passport from "./config/passport.js";
// import session from "express-session";
import authRoute from "./routes/auth.route.js"
import repoRoutes from "./routes/repo.route.js";
import cookieParser from "cookie-parser";
import queryRoutes from "./routes/query.route.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // your frontend
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// app.use(
//     session({
//         secret: "sessionsecret",
//         resave: false,
//         saveUninitialized: false,
//     }) 
// )x
app.use(passport.initialize());

app.use("/api/v1", healthRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/repos", repoRoutes)
app.use("/api/v1/query", queryRoutes);

app.use(errorHandler)

export default app;