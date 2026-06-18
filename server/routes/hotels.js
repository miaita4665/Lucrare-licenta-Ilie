const express = require('express');
const router = express.Router();

const hotelNames = [
  'Grand Hotel',
  'Ibis',
  'Hilton',
  'Marriott',
  'Novotel',
  'Radisson',
  'Sheraton',
  'Holiday Inn',
  'Hyatt',
  'Crowne Plaza',
];
const cities = [
  'Bucharest',
  'London',
  'Paris',
  'Rome',
  'Berlin',
  'Madrid',
  'Amsterdam',
  'Vienna',
  'Athens',
  'Dublin',
];

const attributePool = [
  'quiet',
  'city_center',
  'budget',
  'luxury',
  'family_friendly',
  'beachfront',
  'business',
  'pet_friendly',
  'spa',
  'rooftop_bar',
];
const attributeLabels = {
  quiet: 'Quiet',
  city_center: 'City center',
  budget: 'Budget',
  luxury: 'Luxury',
  family_friendly: 'Family friendly',
  beachfront: 'Beachfront',
  business: 'Business',
  pet_friendly: 'Pet friendly',
  spa: 'Spa',
  rooftop_bar: 'Rooftop bar',
};
const randomAttributes = () => {
  const shuffled = attributePool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 2); // 2-4 attributes per hotel
};

const mockHotelCache = {};

router.get('/search', (req, res) => {
  const { location } = req.query;


  const cacheKey = location || 'anywhere';

  if (mockHotelCache[cacheKey]) {
    return res.json(mockHotelCache[cacheKey]);
  }

  const hotels = Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
    name: `${hotelNames[Math.floor(Math.random() * hotelNames.length)]} ${location || cities[Math.floor(Math.random() * cities.length)]}`,
    location: location || cities[Math.floor(Math.random() * cities.length)],
    stars: Math.floor(Math.random() * 5) + 1,
    description: 'A great place to stay',
    base_price: Math.floor(Math.random() * 500) + 50,
    currency: 'EUR',
    attributes: randomAttributes(),
  }));

  mockHotelCache[cacheKey] = hotels;
  res.json(hotels);
});

router.get('/attribute-labels', (req, res) => {
  res.json(attributeLabels);
});

module.exports = router;
