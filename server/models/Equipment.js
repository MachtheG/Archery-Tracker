const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

class Equipment extends Model {}

Equipment.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bowType: {
      type: DataTypes.ENUM('recurve', 'compound', 'barebow'),
      defaultValue: 'recurve',
    },
    drawWeight: DataTypes.STRING,
    braceHeight: DataTypes.STRING,
    tiller: DataTypes.STRING,
    arrowType: DataTypes.STRING,
    arrowSpine: DataTypes.STRING,
    arrowLength: DataTypes.STRING,
    sightSettings: DataTypes.STRING,
    notes: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: 'Equipment',
    timestamps: true,
  }
);

module.exports = Equipment;
