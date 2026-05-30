'use strict';

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
});
require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL);
// Import models
const Role = require('./Role')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);
const Hotel = require('./Hotel')(sequelize, DataTypes);
const Flight = require('./Flight')(sequelize, DataTypes);
const FlightSegment = require('./FlightSegment')(sequelize, DataTypes);
const Booking = require('./Booking')(sequelize, DataTypes);
const BookingItem = require('./BookingItem')(sequelize, DataTypes);
const Traveler = require('./Traveler')(sequelize, DataTypes);
const Ticket = require('./Ticket')(sequelize, DataTypes);
const Review = require('./Review')(sequelize, DataTypes);
const PromoCode = require('./PromoCode')(sequelize, DataTypes);
const Package = require('./Package')(sequelize, DataTypes);

// ── Associations ──────────────────────────────────────────────

// Role → Users
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// User → Bookings
User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

// User → Reviews
User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

// User → PromoCodes (created_by_admin_id)
User.hasMany(PromoCode, {
  foreignKey: 'created_by_admin_id',
  as: 'CreatedPromoCodes',
});
PromoCode.belongsTo(User, { foreignKey: 'created_by_admin_id', as: 'Admin' });

// Hotel → Reviews
Hotel.hasMany(Review, { foreignKey: 'hotel_id' });
Review.belongsTo(Hotel, { foreignKey: 'hotel_id' });

// Flight → FlightSegments
Flight.hasMany(FlightSegment, { foreignKey: 'flight_id', as: 'segments' });
FlightSegment.belongsTo(Flight, { foreignKey: 'flight_id' });

// Booking → BookingItems
Booking.hasMany(BookingItem, { foreignKey: 'booking_id', as: 'items' });
BookingItem.belongsTo(Booking, { foreignKey: 'booking_id' });

// Booking → Travelers
Booking.hasMany(Traveler, { foreignKey: 'booking_id', as: 'travelers' });
Traveler.belongsTo(Booking, { foreignKey: 'booking_id' });

// Traveler → Tickets
Traveler.hasMany(Ticket, { foreignKey: 'traveler_id', as: 'tickets' });
Ticket.belongsTo(Traveler, { foreignKey: 'traveler_id' });

// Flight → Tickets
Flight.hasMany(Ticket, { foreignKey: 'flight_id' });
Ticket.belongsTo(Flight, { foreignKey: 'flight_id' });

// Flight → Packages
Flight.hasMany(Package, { foreignKey: 'flight_id' });
Package.belongsTo(Flight, { foreignKey: 'flight_id' });

// Hotel → Packages
Hotel.hasMany(Package, { foreignKey: 'hotel_id' });
Package.belongsTo(Hotel, { foreignKey: 'hotel_id' });

// PromoCode → Bookings
PromoCode.hasMany(Booking, { foreignKey: 'promo_code_id' });
Booking.belongsTo(PromoCode, { foreignKey: 'promo_code_id' });

module.exports = {
  sequelize,
  Sequelize,
  Role,
  User,
  Hotel,
  Flight,
  FlightSegment,
  Booking,
  BookingItem,
  Traveler,
  Ticket,
  Review,
  PromoCode,
  Package,
};
