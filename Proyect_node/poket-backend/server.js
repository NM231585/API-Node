import express from "express";
import cors from "cors";
import poketRoutes from "./src/routes/poket.routes.js";

const app = express();
const PORT = 3000;
const API_BASE = 'https://pokeapi.co/api/v2';

// Middlewares: CORS y JSON deben aplicarse antes de las rutas
app.use(cors());
app.use(express.json());

app.use('/api', poketRoutes);

// Nota: el servidor corre por HTTP en este ejemplo
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));