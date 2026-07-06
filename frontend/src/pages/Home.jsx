import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import routeService from '../services/routeService';
import {
  Search,
  MapPin,
  Calendar,
  Compass,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  Users,
  Award
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  // Search parameters state
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);

  // Route options dynamically fetched
  const [origins, setOrigins] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [routesList, setRoutesList] = useState([]);

  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        const response = await routeService.getRoutes({ limit: 100 });
        if (response.success && response.data?.routes) {
          const routes = response.data.routes;
          setRoutesList(routes);
          
          // Get unique origins and destinations
          const uniqueOrigins = [...new Set(routes.map(r => r.origin))].sort();
          const uniqueDestinations = [...new Set(routes.map(r => r.destination))].sort();
          
          setOrigins(uniqueOrigins);
          setDestinations(uniqueDestinations);
        } else {
          // Fallbacks for local testing
          const defaultCities = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Matara', 'Kurunegala', 'Anuradhapura'];
          setOrigins(defaultCities);
          setDestinations(defaultCities);
        }
      } catch (err) {
        const defaultCities = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Matara', 'Kurunegala', 'Anuradhapura'];
        setOrigins(defaultCities);
        setDestinations(defaultCities);
      }
    };
    fetchRouteData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!origin || !destination) {
      return;
    }
    navigate(`/search-bus?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelDate=${travelDate}`);
  };

  const handlePopularRouteClick = (from, to) => {
    navigate(`/search-bus?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelDate=${travelDate}`);
  };

  // Popular routes mock list for quick Sri Lanka shortcuts
  const popularRoutes = [
    { from: 'Colombo', to: 'Kandy', type: 'EXPRESS', duration: '3h 30m', fare: 20.00 },
    { from: 'Colombo', to: 'Galle', type: 'HIGHWAY', duration: '2h 15m', fare: 15.00 },
    { from: 'Colombo', to: 'Matara', type: 'HIGHWAY', duration: '3h 00m', fare: 18.00 },
    { from: 'Colombo', to: 'Jaffna', type: 'EXPRESS', duration: '7h 45m', fare: 35.00 }
  ];

  return (
    <div className="space-y-16 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome & Search Widget */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-850 p-6 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-400">
              <Award className="h-3.5 w-3.5" /> Sri Lanka's Premier Bus Booking Experience
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-100">
              Book Bus Seats <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">Online Instantly</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
              Magiya-inspired luxury travel solutions. Explore schedules, select preferred seat coordinates, and receive digital boarding passes securely.
            </p>
            
            {/* Quick trust metrics */}
            <div className="flex items-center gap-6 pt-4 border-t border-slate-850 max-w-md">
              <div>
                <p className="text-xl font-bold font-mono text-slate-200">50+</p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Active Routes</p>
              </div>
              <div className="border-l border-slate-800 h-8" />
              <div>
                <p className="text-xl font-bold font-mono text-slate-200">20+</p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Luxury Fleet</p>
              </div>
              <div className="border-l border-slate-800 h-8" />
              <div>
                <p className="text-xl font-bold font-mono text-slate-200">24/7</p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Shift Support</p>
              </div>
            </div>
          </div>

          {/* Search Widget */}
          <div className="lg:col-span-5 w-full bg-slate-950 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-emerald-400" /> Plan Your Trip
            </h3>
            
            <form onSubmit={handleSearch} className="space-y-4 text-xs">
              {/* Departure Station */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> From
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl py-3 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  required
                >
                  <option value="">Select departure city</option>
                  {origins.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Arrival Station */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> To
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl py-3 px-3 focus:outline-none focus:border-emerald-500 text-slate-200"
                  required
                >
                  <option value="">Select destination city</option>
                  {destinations.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Travel Date */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Date of Journey
                </label>
                <input
                  type="date"
                  value={travelDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setTravelDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.target.showPicker();
                    } catch (err) {
                      console.warn('showPicker not supported:', err);
                    }
                  }}
                  onFocus={(e) => {
                    try {
                      e.target.showPicker();
                    } catch (err) {
                      console.warn('showPicker not supported:', err);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl py-3 px-3 focus:outline-none focus:border-emerald-500 text-slate-200 cursor-pointer"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 mt-6"
              >
                <Search className="h-4 w-4" /> Search Departures
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Sri Lankan Routes Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Popular Routes</h2>
          <p className="text-xs text-slate-450 mt-1">Select from our most popular transit routes across the island.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularRoutes.map((route, index) => (
            <div
              key={index}
              onClick={() => handlePopularRouteClick(route.from, route.to)}
              className="bg-slate-900 border border-slate-850 hover:border-emerald-500/30 rounded-2xl p-5 cursor-pointer hover:translate-y-[-2px] transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-md">
                  {route.type}
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">${route.fare.toFixed(2)}</span>
              </div>
              <div className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                {route.from} ➔ {route.to}
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-4">
                <span>Duration: {route.duration}</span>
                <span className="flex items-center text-emerald-500 font-semibold group-hover:gap-1 transition-all">
                  Book <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Premium UX Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-850 pt-12">
        <div className="bg-slate-900/40 border border-slate-850/60 rounded-2xl p-6 space-y-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 w-fit rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">Interactive Seat Selection</h3>
          <p className="text-slate-450 text-xs leading-relaxed">
            Select exact window or aisle seats dynamically on our graphical seating layout map before confirming coordinates.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-850/60 rounded-2xl p-6 space-y-4">
          <div className="p-3 bg-teal-500/10 text-teal-400 w-fit rounded-xl">
            <CreditCard className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">Secure Digital Checkout</h3>
          <p className="text-slate-455 text-xs leading-relaxed">
            Fast, secure digital payment processing. Receive immediate booking confirmation and seat assignment tickets.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-850/60 rounded-2xl p-6 space-y-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 w-fit rounded-xl">
            <QrCode className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">QR Digital Boarding Passes</h3>
          <p className="text-slate-455 text-xs leading-relaxed">
            Frictionless ticket check-in. Store your digital boarding pass code on your phone or print invoice logs instantly.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
