'use strict';

module.exports = (sequelize, DataTypes) => {
  const BookingItem = sequelize.define(
    'BookingItem',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'bookings', key: 'id' },
      },
      item_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [['Flight', 'Hotel']],
        },
        comment: 'Discriminator — tells you which table reference_id points to',
      },
      reference_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to flights.id or hotels.id depending on item_type',
      },
    },
    {
      tableName: 'booking_items',
      timestamps: false,
    }
  );

  return BookingItem;
};
