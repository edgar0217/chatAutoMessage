const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session");
const flash = require("connect-flash");
const { requireLogin } = require("./middlewares/auth");
const authRoutes = require("./routes/auth");

const sequelize = require("./config/database");
const operadorRoutes = require("./routes/operadores");
const asociacionRoutes = require("./routes/asociaciones");
const trackerRoutes = require("./routes/trackers");

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT; // (corregido)
const PORT_APP = process.env.PORT; // para tu log de consola

// Configuración de EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// Middleware para parsear JSON y URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesiones
app.use(
  session({
    secret: "unaSuperClaveSecretaQueNadieAdivine",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 40 * 60 * 1000, // 40 minutos en milisegundos
      sameSite: "lax",
    },
  })
);

// Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Rutas de autenticación (login/logout, no requieren sesión)
app.use(authRoutes);

// PROTEGER todas las demás rutas:
app.use("/operadores", requireLogin, operadorRoutes);
app.use("/asociaciones", requireLogin, asociacionRoutes);
app.use("/trackers", requireLogin, trackerRoutes);

// Ruta raíz protegida
app.get("/", requireLogin, (req, res) => {
  res.render("home");
});

// Sincronizar tablas y luego iniciar servidor
sequelize
  .sync({ force: false }) // cambiar a true si quieres recrear tablas (pierdes datos)
  .then(() => {
    console.log("Tablas sincronizadas");
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT_APP}`);
    });
  })
  .catch((error) => {
    console.error("Error sincronizando tablas:", error);
  });
