'use strict';

module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // null = guest checkout
      references: { model: 'users', key: 'id' },
    },
    guest_email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
      comment: 'Used when user_id is null (guest checkout)',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Pending',
      validate: {
      isIn: [['Pending', 'Confirmed', 'Cancelled', 'Completed']],
        },
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'EUR',
      comment: 'Supports RON, EUR, USD',
    },
    fare_class: {
    type: DataTypes.STRING,
   allowNull: false,
    defaultValue: 'Economy',
   validate: {
    isIn: [['Economy', 'Business', 'First']],
      },
    },
    promo_code_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'promo_codes', key: 'id' },
    },
  }, {
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    validate: {
      // Either user_id or guest_email must be present
      mustHaveOwner() {
        if (!this.user_id && !this.guest_email) {
          throw new Error('A booking must have either a user_id or a guest_email.');
        }
      },
    },
  });

  return Booking;
};
