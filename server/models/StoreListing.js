const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

class StoreListing extends Model {}

StoreListing.init(
  {
    sellerId: {
      // null for official "Archery KE Store" seed listings
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sellerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sellerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sellerPhone: DataTypes.STRING,
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    priceKES: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    condition: {
      type: DataTypes.ENUM('new', 'like-new', 'used', 'well-used'),
      defaultValue: 'used',
    },
    category: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
    imageEmoji: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('active', 'reserved', 'sold'),
      defaultValue: 'active',
    },
    reservedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reservedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'StoreListing',
    timestamps: true,
  }
);

module.exports = StoreListing;
