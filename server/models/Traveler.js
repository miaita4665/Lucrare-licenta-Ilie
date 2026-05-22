'use strict';

module.exports = (sequelize, DataTypes) => {
  const Traveler = sequelize.define('Traveler', {
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
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    document_number: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Passport or national ID number for the e-ticket',
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  }, {
    tableName: 'travelers',
    timestamps: false,
  });

  return Traveler;
};
