const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Operador = sequelize.define(
  "Operador",
  {
    nombre: { type: DataTypes.STRING, allowNull: false },
    telefono: { type: DataTypes.STRING, allowNull: false },
  },
  {
    freezeTableName: true, // Evita pluralizar la tabla
    tableName: "operadores", // Nombre exacto de la tabla en la BD (ajústalo si es distinto)
    timestamps: true, // Para createdAt y updatedAt
  }
);

module.exports = Operador;
