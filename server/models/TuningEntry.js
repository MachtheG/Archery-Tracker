const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

class TuningEntry extends Model {}

TuningEntry.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    equipmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    change: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    impact: DataTypes.STRING,
    notes: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: 'TuningEntry',
    timestamps: true,
  }
);

module.exports = TuningEntry;
