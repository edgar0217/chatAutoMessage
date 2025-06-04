const bcrypt = require("bcrypt");
const sequelize = require("./config/database.js"); // Ajusta la ruta si es diferente
const User = require("./models/user"); // Ajusta la ruta si es diferente

async function createUser(username, plainPassword) {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log("Conexión establecida con la base de datos.");

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Crear usuario
    const newUser = await User.create({
      username: username,
      password: hashedPassword,
    });

    console.log("Usuario creado:", newUser.toJSON());
  } catch (error) {
    console.error("Error al crear el usuario:", error);
  } finally {
    await sequelize.close();
  }
}

// Cambia estos valores según necesites
createUser("admin", "123");
