const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

class Session extends Model {}

Session.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sessionType: {
      type: DataTypes.ENUM('practice', 'competition', 'training'),
      defaultValue: 'practice',
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    locationRange: DataTypes.STRING,
    locationCity: DataTypes.STRING,
    ends: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    totals: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    environmental: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    equipment: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    status: {
      type: DataTypes.ENUM('in_progress', 'completed', 'verified'),
      defaultValue: 'in_progress',
    },
    isSynced: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    clientId: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: 'Session',
    timestamps: true,
  }
);

module.exports = Session;
