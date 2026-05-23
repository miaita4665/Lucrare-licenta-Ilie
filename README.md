
```
Lucrare-licenta-Ilie
├─ client
│  ├─ .env
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ App.jsx
│  │  ├─ components
│  │  ├─ context
│  │  │  └─ AuthContext.jsx
│  │  ├─ index.css
│  │  ├─ layouts
│  │  │  ├─ AdminLayout.jsx
│  │  │  ├─ AuthLayout.jsx
│  │  │  └─ MainLayout.jsx
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ admin
│  │  │  │  ├─ AdminBookings.jsx
│  │  │  │  ├─ AdminOverview.jsx
│  │  │  │  ├─ AdminPromoCodes.jsx
│  │  │  │  ├─ AdminReviews.jsx
│  │  │  │  └─ AdminUsers.jsx
│  │  │  ├─ auth
│  │  │  │  ├─ Login.jsx
│  │  │  │  └─ Register.jsx
│  │  │  ├─ booking
│  │  │  │  ├─ Booking.jsx
│  │  │  │  ├─ Checkout.jsx
│  │  │  │  └─ Confirmation.jsx
│  │  │  ├─ Dashboard.jsx
│  │  │  ├─ FlightDetail.jsx
│  │  │  ├─ Flights.jsx
│  │  │  ├─ HotelDetail.jsx
│  │  │  ├─ Hotels.jsx
│  │  │  ├─ Landing.jsx
│  │  │  ├─ MapView.jsx
│  │  │  ├─ Profile.jsx
│  │  │  └─ {auth,admin,booking}
│  │  ├─ routes
│  │  │  ├─ AdminRoute.jsx
│  │  │  └─ ProtectedRoute.jsx
│  │  └─ services
│  │     └─ api.js
│  └─ vite.config.js
├─ docker-compose.yml
└─ server
   ├─ .env
   ├─ config
   │  ├─ db.js
   │  └─ passport.js
   ├─ controllers
   │  └─ authController.js
   ├─ index.js
   ├─ middleware
   │  └─ authMiddleware.js
   ├─ models
   │  ├─ Booking.js
   │  ├─ BookingItem.js
   │  ├─ Flight.js
   │  ├─ FlightSegment.js
   │  ├─ Hotel.js
   │  ├─ index.js
   │  ├─ Package.js
   │  ├─ PromoCode.js
   │  ├─ Review.js
   │  ├─ Role.js
   │  ├─ Ticket.js
   │  ├─ Traveler.js
   │  └─ User.js
   ├─ package-lock.json
   ├─ package.json
   ├─ README.md
   ├─ routes
   │  ├─ authRoutes.js
   │  ├─ bookings.js
   │  ├─ flights.js
   │  └─ hotels.js
   └─ seedRoles.js

```