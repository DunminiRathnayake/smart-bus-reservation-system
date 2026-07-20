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
  Award,
  Clock,
  ArrowRight
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

  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="space-y-10 text-slate-100 animate-fade-in">
      {/* Top Banner Alert - dismissable */}
      {showAlert && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-[#18181C]/95 backdrop-blur border border-[#26262B] px-4 py-3 rounded-2xl flex items-center justify-between gap-4 relative overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xs font-black text-slate-200 uppercase tracking-wider">Experience SmartGo Events</span>
                <span className="hidden sm:inline text-slate-650">|</span>
                <span className="text-[11px] text-slate-400">Book event tickets instantly and reach your destination with SmartGo.</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => navigate('/search-bus')}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase rounded-full shadow transition-all active:scale-95"
              >
                Try It Now
              </button>
              <button
                onClick={() => setShowAlert(false)}
                className="p-1 text-slate-550 hover:text-slate-350 transition-colors"
                title="Dismiss notice"
              >
                <span className="text-base font-bold">×</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section Container (Transparent background since image is globally fixed) */}
      <section className="relative min-h-[440px] flex flex-col justify-center items-center px-4 py-16 sm:py-20 text-center">
        <div className="relative z-10 max-w-5xl mx-auto space-y-8 w-full">
          {/* Main Hero Header */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-wider leading-none text-white drop-shadow-lg font-sans">
              BOOK BUS TICKETS ONLINE <br />
              IN SRI LANKA
            </h1>
            <p className="text-slate-250 text-xs sm:text-sm lg:text-base max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              The Simplest Way to Reserve Your Bus Tickets Online, Real-Time Seats, Secure Payments, Hassle-Free Travel
            </p>
          </div>

          {/* Search Pill Form Box */}
          <div className="w-full max-w-5xl mx-auto border border-white/10 bg-black/45 backdrop-blur-md p-4 sm:p-5 rounded-3xl sm:rounded-full shadow-2xl">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-3 w-full">
              {/* Origin station */}
              <div className="w-full md:flex-1">
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-[#18181C]/90 hover:bg-[#1C1C22]/90 border border-slate-800 focus:border-emerald-500 rounded-2xl sm:rounded-full py-3.5 px-5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer appearance-none"
                  required
                >
                  <option value="">From</option>
                  {origins.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Destination station */}
              <div className="w-full md:flex-1">
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-[#18181C]/90 hover:bg-[#1C1C22]/90 border border-slate-800 focus:border-emerald-500 rounded-2xl sm:rounded-full py-3.5 px-5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer appearance-none"
                  required
                >
                  <option value="">To</option>
                  {destinations.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Date Input */}
              <div className="w-full md:w-56">
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
                  className="w-full bg-[#18181C]/90 border border-slate-800 focus:border-emerald-500 rounded-2xl sm:rounded-full py-3.5 px-5 text-xs text-slate-355 focus:outline-none transition-all cursor-pointer"
                  required
                />
              </div>

              {/* Search button */}
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl sm:rounded-full flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all transform active:scale-95 shrink-0"
              >
                <Search className="h-4 w-4" /> Search
              </button>
            </form>
          </div>

          {/* Subtext info */}
          <p className="text-[10px] text-slate-350 font-semibold tracking-wide drop-shadow-sm">
            Convenient payments with all major cards and methods.
          </p>
        </div>
      </section>

      {/* Main Content wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 w-full relative z-10">
        {/* Popular Sri Lankan Routes Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-100 uppercase tracking-wider">Popular Routes</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Select from our most popular transit routes across the island.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularRoutes.map((route, index) => (
              <div
                key={index}
                onClick={() => handlePopularRouteClick(route.from, route.to)}
                className="bg-[#18181C]/90 backdrop-blur-sm border border-[#26262B] hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 rounded-3xl p-5 cursor-pointer hover:-translate-y-1 transition-all duration-300 group shadow-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 border rounded-xl tracking-wide uppercase ${
                    route.type === 'HIGHWAY' 
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                      : 'text-sky-400 bg-sky-500/10 border-sky-500/20'
                  }`}>
                    {route.type}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-550 block leading-none font-semibold uppercase tracking-wider mb-0.5">Fare</span>
                    <span className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">${route.fare.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-1 my-4">
                  <div className="text-[10px] text-slate-550 uppercase tracking-widest font-semibold">Route</div>
                  <div className="flex items-center gap-2 text-base font-black text-slate-100 group-hover:text-emerald-300 transition-colors">
                    <span>{route.from}</span>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0" />
                    <span>{route.to}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 border-t border-[#26262B] pt-4 mt-2">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-3.5 w-3.5" /> {route.duration}
                  </span>
                  <span className="flex items-center gap-0.5 text-emerald-400 group-hover:text-emerald-300 font-bold tracking-wide uppercase text-[10px]">
                    Reserve <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Premium UX Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-850 pt-12">
          <div className="bg-[#18181C]/80 backdrop-blur-sm border border-slate-850/40 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 w-fit rounded-2xl">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">Interactive Seat Selection</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Select exact window or aisle seats dynamically on our graphical seating layout map before confirming coordinates.
            </p>
          </div>

          <div className="bg-[#18181C]/80 backdrop-blur-sm border border-slate-855 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="p-3 bg-teal-500/10 text-teal-400 w-fit rounded-2xl">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">Secure Digital Checkout</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Fast, secure digital payment processing. Receive immediate booking confirmation and seat assignment tickets.
            </p>
          </div>

          <div className="bg-[#18181C]/80 backdrop-blur-sm border border-slate-855 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 w-fit rounded-2xl">
              <QrCode className="h-6 w-6" />
            </div>
            <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">QR Digital Boarding Passes</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Frictionless ticket check-in. Store your digital boarding pass code on your phone or print invoice logs instantly.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
