require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const {sequelize} = require('./models');
const seedRoles = require('./seedRoles');
const flightsRouter = require("./routes/flights")

const PORT = process.env.PORT || 5000;

const app = express();

//  Middlewares 
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use("/flights", flightsRouter)
app.use("/hotels", require("./routes/hotels"))
app.use("/bookings", require("./routes/bookings"))
app.use("/cities", require("./routes/cities"))
app.use("/airports", require("./routes/airports"))

//  Routes 
app.use('/api/auth', require('./routes/authRoutes'));

const startApp = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('All database tables synced successfully.');
      await seedRoles();
    }

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start the server:', error);
    process.exit(1);
  }
};

startApp();
