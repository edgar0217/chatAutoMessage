const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Operador = require("./operador");

const Asociacion = sequelize.define(
  "Asociacion",
  {
    trackerLabel: { type: DataTypes.STRING, allowNull: false },
    operadorId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    freezeTableName: true, // Evita pluralizar la tabla
    tableName: "asociaciones", // Nombre exacto de la tabla en la BD (ajústalo si es distinto)
    timestamps: true,
  }
);

// Definimos la relación (foreign key)
Asociacion.belongsTo(Operador, { foreignKey: "operadorId" });

module.exports = Asociacion;
