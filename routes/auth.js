const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const router = express.Router();

// Mostrar formulario de login
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Procesar login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.userId = user.id;
    req.session.username = user.username; // Guardar el nombre de usuario en la sesión
    req.flash("success", "¡Inicio de sesión exitoso!");
    res.redirect("/"); // Redirigir al home
  } else {
    res.render("login", { error: "Usuario o contraseña incorrectos" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login"); // Redirigir al login al cerrar sesión
  });
});

// Mostrar formulario de cuenta (cambio de usuario y contraseña)
router.get("/cuenta", (req, res) => {
  if (!req.session.userId) return res.redirect("/login"); // Si no está logueado, redirigir al login
  res.render("cuenta", {
    username: req.session.username, // Pasar el nombre de usuario
    error: null,
    success: null,
  });
});

// Procesar cambio de usuario y contraseña
router.post("/cuenta", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login"); // Verificar si el usuario está logueado
  const { username, password } = req.body;
  try {
    const update = {};
    if (username) update.username = username; // Cambiar nombre de usuario
    if (password) update.password = await bcrypt.hash(password, 10); // Cambiar contraseña si es proporcionada

    await User.update(update, { where: { id: req.session.userId } });

    // Actualizar en la sesión
    if (username) req.session.username = username;

    res.render("cuenta", {
      username: username || req.session.username,
      error: null,
      success: "Datos actualizados correctamente",
    });
  } catch (error) {
    res.render("cuenta", {
      username: req.session.username,
      error: "No se pudo actualizar",
      success: null,
    });
  }
});

module.exports = router;
