const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

class CompetitionResult extends Model {}

CompetitionResult.init(
  {
    postedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    eventName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    archerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    club: DataTypes.STRING,
    category: DataTypes.STRING,
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    round: DataTypes.STRING,
    notes: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: 'CompetitionResult',
    timestamps: true,
  }
);

module.exports = CompetitionResult;
