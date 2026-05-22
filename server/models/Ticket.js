'use strict';

module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    traveler_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'travelers', key: 'id' },
    },
    flight_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'flights', key: 'id' },
    },
    ticket_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    seat_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fare_class: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Economy',
      validate: {
        isIn: [['Economy', 'Business', 'First']],
      },
    },
    issued_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'tickets',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['ticket_number'] }
    ]
  });

  return Ticket;
};