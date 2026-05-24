'use strict';

const { Role } = require('./models');

const seedRoles = async () => {
  const roles = [
    {
      role_name: 'Guest',
      description: 'Unauthenticated user with read-only access.',
    },
    {
      role_name: 'Registered User',
      description: 'Authenticated user who can book and review.',
    },
    {
      role_name: 'Support Agent',
      description: 'Can moderate reviews and manage bookings.',
    },
    {
      role_name: 'Admin',
      description: 'Full access including promo codes and user management.',
    },
  ];

  for (const role of roles) {
    await Role.findOrCreate({
      where: { role_name: role.role_name },
      defaults: role,
    });
  }

  console.log('Roles seeded successfully.');
};

module.exports = seedRoles;
