'use strict';

module.exports = (sequelize, DataTypes) => {
  const Flight = sequelize.define('Flight', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    airline_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    total_base_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    is_multi_city: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'flights',
    timestamps: false,
  });

  return Flight;
};
