'use strict';

module.exports = (sequelize, DataTypes) => {
  const FlightSegment = sequelize.define('FlightSegment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    flight_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'flights', key: 'id' },
    },
    origin_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      comment: 'IATA airport code e.g. OTP, LHR',
    },
    destination_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      comment: 'IATA airport code e.g. OTP, LHR',
    },
    departure_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    arrival_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    sequence_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Order of this leg in a multi-city itinerary',
    },
  }, {
    tableName: 'flight_segments',
    timestamps: false,
  });

  return FlightSegment;
};
