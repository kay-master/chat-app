import express from "express";
import compression from "compression";
import { createServer } from "http";
import { Server } from "socket.io";

import helmet from "helmet";
import routes from "./routes";
import cors from "cors";
import * as dotenv from "dotenv";

import socketController from "./controllers/socket.controller";

dotenv.config();

const app = express();

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

routes(app);

const httpServer = createServer(app);

const io = new Server(httpServer, {
	cors: { origin: "*" },
});

socketController(io);

export default httpServer;
