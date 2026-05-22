'use strict';

module.exports = (sequelize, DataTypes) => {
  const PromoCode = sequelize.define('PromoCode', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    discount_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: { min: 0, max: 100 },
    },
    valid_until: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_by_admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      comment: 'Only Admin role users should be able to create promo codes',
    },
  }, {
    tableName: 'promo_codes',
    timestamps: false,
  });

  return PromoCode;
};
