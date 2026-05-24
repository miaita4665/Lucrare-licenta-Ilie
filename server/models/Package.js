'use strict';

module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define(
    'Package',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'e.g. "Weekend in Rome"',
      },
      flight_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'flights', key: 'id' },
      },
      hotel_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'hotels', key: 'id' },
      },
      discount_applied: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'packages',
      timestamps: false,
    }
  );

  return Package;
};
