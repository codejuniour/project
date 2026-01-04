import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Zap, Fuel, Users, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useBookingStore } from '../store/bookingStore';
import type { Car } from '../types';

export default function VehicleList() {
  const navigate = useNavigate();
  const searchFilters = useBookingStore((state) => state.searchFilters);
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating');
  const [filters, setFilters] = useState({
    vehicleType: '',
    fuelType: '',
    transmission: '',
    priceRange: [0, 500000],
  });

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [cars, filters, sortBy]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('is_available', true);

      if (error) throw error;
      setCars(data || []);
    } catch (err) {
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...cars];

    if (searchFilters?.location) {
      filtered = filtered.filter(
        (car) => car.location_city?.toLowerCase().includes(searchFilters.location.toLowerCase())
      );
    }

    if (filters.vehicleType) {
      filtered = filtered.filter((car) => car.vehicle_type === filters.vehicleType);
    }

    if (filters.fuelType) {
      filtered = filtered.filter((car) => car.fuel_type === filters.fuelType);
    }

    if (filters.transmission) {
      filtered = filtered.filter((car) => car.transmission === filters.transmission);
    }

    filtered = filtered.filter(
      (car) => car.price_per_day >= filters.priceRange[0] && car.price_per_day <= filters.priceRange[1]
    );

    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price_per_day - b.price_per_day);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price_per_day - a.price_per_day);
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => b.total_bookings - a.total_bookings);
    }

    setFilteredCars(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">Find Your Perfect Car</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Sidebar Filters */}
        <div className="md:col-span-1">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sticky top-24">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Filter size={20} />
              Filters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">Vehicle Type</label>
                <select
                  value={filters.vehicleType}
                  onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">Fuel Type</label>
                <select
                  value={filters.fuelType}
                  onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">Transmission</label>
                <select
                  value={filters.transmission}
                  onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">
                  Price Range: ₹{filters.priceRange[0]}-₹{filters.priceRange[1]}
                </label>
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="10000"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      priceRange: [filters.priceRange[0], parseInt(e.target.value)],
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="md:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-slate-300">Showing {filteredCars.length} vehicles</p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500 px-3 py-2"
            >
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {filteredCars.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No vehicles found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredCars.map((car) => (
                <div
                  key={car.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden hover:border-blue-500 transition cursor-pointer"
                  onClick={() => navigate(`/vehicles/${car.id}`)}
                >
                  <div className="md:flex">
                    <img
                      src={car.image_url}
                      alt={car.name}
                      className="w-full md:w-48 h-48 object-cover"
                    />
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{car.name}</h3>
                          <p className="text-slate-400 text-sm">{car.brand} {car.model}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-blue-500/20 px-3 py-1 rounded-full">
                          <Star size={16} className="text-blue-400" />
                          <span className="text-blue-300 font-semibold">{car.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 my-4">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Fuel size={18} />
                          <span className="text-sm">{car.fuel_type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Users size={18} />
                          <span className="text-sm">{car.seating_capacity} Seats</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Zap size={18} />
                          <span className="text-sm">{car.transmission}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                        <div className="text-right">
                          <p className="text-slate-400 text-sm">Starting from</p>
                          <p className="text-2xl font-bold text-blue-400">₹{car.price_per_day}/day</p>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
