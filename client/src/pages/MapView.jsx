import { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Map } from 'lucide-react';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API;

export default function MapView() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unauthenticated, setUnauthenticated] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/bookings/my');

        if (res.status === 401 || res.status === 403) {
          setUnauthenticated(true);
          setLoading(false);
          return;
        }
        
        if (!res.ok) throw new Error('Failed to fetch bookings');
        const bookings = await res.json();

        // --- Hotels ---
        const hotelItems = bookings.flatMap((b) =>
          b.items.filter((i) => i.item_type === 'Hotel' && i.hotel)
        );
        const uniqueHotels = [
          ...new Map(
            hotelItems.map((i) => [i.hotel.location, i.hotel])
          ).values(),
        ];

        const hotelPins = await Promise.all(
          uniqueHotels.map(async (hotel) => {
            try {
              const r = await fetch(
                `/cities/match?name=${encodeURIComponent(hotel.location)}`
              );
              if (!r.ok) return null;
              const city = await r.json();
              return {
                type: 'hotel',
                hotel,
                lat: parseFloat(city.lat),
                lon: parseFloat(city.lon),
              };
            } catch {
              return null;
            }
          })
        );

        // --- Flights ---
        const flightItems = bookings.flatMap((b) =>
          b.items.filter(
            (i) => i.item_type === 'Flight' && i.flight?.segments?.length > 0
          )
        );

        const flightRoutes = await Promise.all(
          flightItems.map(async (item) => {
            const seg = item.flight.segments[0];
            try {
              const [fromRes, toRes] = await Promise.all([
                fetch(
                  `/airports/search?q=${encodeURIComponent(seg.origin_code)}`
                ).then((r) => r.json()),
                fetch(
                  `/airports/search?q=${encodeURIComponent(seg.destination_code)}`
                ).then((r) => r.json()),
              ]);
              const from = fromRes[0];
              const to = toRes[0];
              if (!from || !to) return null;
              return {
                type: 'flight',
                airline: item.flight.airline_code,
                from: {
                  code: seg.origin_code,
                  lat: parseFloat(from.lat),
                  lon: parseFloat(from.lon),
                },
                to: {
                  code: seg.destination_code,
                  lat: parseFloat(to.lat),
                  lon: parseFloat(to.lon),
                },
              };
            } catch {
              return null;
            }
          })
        );

        const validHotels = hotelPins.filter(Boolean);
        const validFlights = flightRoutes.filter(Boolean);

        // Center map on first pin
        const firstPoint =
          validHotels[0] ??
          (validFlights[0]
            ? { lat: validFlights[0].from.lat, lon: validFlights[0].from.lon }
            : null);

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: firstPoint ? [firstPoint.lon, firstPoint.lat] : [20, 45],
          zoom: firstPoint ? 4 : 2,
        });

        map.current.on('load', () => {
          // Hotel pins
          validHotels.forEach(({ hotel, lat, lon }) => {
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="font-family:sans-serif;color:#000">
                <strong>${hotel.name}</strong><br/>
                ${hotel.location}<br/>
                ${hotel.currency} ${hotel.base_price}/night
              </div>
            `);
            new mapboxgl.Marker({ color: '#3b82f6' })
              .setLngLat([lon, lat])
              .setPopup(popup)
              .addTo(map.current);
          });

          // Flight routes
          validFlights.forEach(({ airline, from, to }, i) => {
            const routeId = `route-${i}`;

            // Curved line using a GeoJSON arc
            map.current.addSource(routeId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: getArc([from.lon, from.lat], [to.lon, to.lat]),
                },
              },
            });

            map.current.addLayer({
              id: routeId,
              type: 'line',
              source: routeId,
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: {
                'line-color': '#f59e0b',
                'line-width': 2,
                'line-dasharray': [2, 2],
              },
            });

            // Origin pin
            const fromPopup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="font-family:sans-serif;color:#000">
                <strong>${from.code}</strong> (Origin)<br/>${airline}
              </div>
            `);
            new mapboxgl.Marker({ color: '#f59e0b' })
              .setLngLat([from.lon, from.lat])
              .setPopup(fromPopup)
              .addTo(map.current);

            // Destination pin
            const toPopup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="font-family:sans-serif;color:#000">
                <strong>${to.code}</strong> (Destination)<br/>${airline}
              </div>
            `);
            new mapboxgl.Marker({ color: '#ef4444' })
              .setLngLat([to.lon, to.lat])
              .setPopup(toPopup)
              .addTo(map.current);
          });

          setLoading(false);
        });
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    init();
    return () => map.current?.remove();
  }, []);

  if (unauthenticated) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Your travel map</h1>
        <div className="flex flex-col items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700 text-center"
            style={{ height: '580px' }}>
          <Map className="w-12 h-12 text-slate-500 mb-4" strokeWidth={1.5} />
          <p className="text-slate-300 text-lg font-medium">Sign in to see your travel map</p>
          <p className="text-slate-500 text-sm mt-1">Your hotels and flights will appear here once you're logged in.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Your travel map</h1>
      <div className="flex items-center gap-4 mb-6">
        <span className="flex items-center gap-1 text-slate-400 text-sm">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />{' '}
          Hotels
        </span>
        <span className="flex items-center gap-1 text-slate-400 text-sm">
          <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />{' '}
          Flight origin
        </span>
        <span className="flex items-center gap-1 text-slate-400 text-sm">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />{' '}
          Flight destination
        </span>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}
      {loading && <p className="text-slate-400 mb-4">Loading map...</p>}

      <div
        ref={mapContainer}
        className="rounded-xl overflow-hidden"
        style={{ height: '580px', width: '100%' }}
      />
    </div>
  );
}

function getArc(from, to, numPoints = 100) {
  const coords = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lon = from[0] + (to[0] - from[0]) * t;
    const lat = from[1] + (to[1] - from[1]) * t;
    coords.push([lon, lat]);
  }

  return coords;
}
