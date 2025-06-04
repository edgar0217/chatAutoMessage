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
    res.redirect("/");
  } else {
    res.render("login", { error: "Usuario o contraseña incorrectos" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
