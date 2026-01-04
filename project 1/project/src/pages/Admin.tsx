import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Car, Booking } from '../types';
import { Plus, Edit, Trash2, Loader } from 'lucide-react';

export default function Admin() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'cars' | 'bookings'>('cars');
  const [showAddCar, setShowAddCar] = useState(false);
  const [newCar, setNewCar] = useState({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    vehicle_type: 'Sedan',
    fuel_type: 'Petrol',
    transmission: 'Manual',
    seating_capacity: 5,
    price_per_hour: 500,
    price_per_day: 3000,
    price_per_week: 18000,
    location_city: '',
    image_url: '',
  });

  useEffect(() => {
    // Check if user is admin (in a real app, you'd check auth metadata)
    if (!user) {
      navigate('/login');
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [carsRes, bookingsRes] = await Promise.all([
        supabase.from('cars').select('*'),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      ]);

      setCars(carsRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('cars').insert([newCar]);

      if (error) throw error;
      setNewCar({
        name: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        vehicle_type: 'Sedan',
        fuel_type: 'Petrol',
        transmission: 'Manual',
        seating_capacity: 5,
        price_per_hour: 500,
        price_per_day: 3000,
        price_per_week: 18000,
        location_city: '',
        image_url: '',
      });
      setShowAddCar(false);
      fetchData();
    } catch (err) {
      console.error('Error adding car:', err);
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await supabase.from('cars').delete().eq('id', id);
      fetchData();
    } catch (err) {
      console.error('Error deleting car:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader size={40} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">Admin Panel</h1>

      <div className="flex gap-4 mb-8 border-b border-slate-700">
        <button
          onClick={() => setTab('cars')}
          className={`px-6 py-2 font-semibold transition ${
            tab === 'cars' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Vehicles ({cars.length})
        </button>
        <button
          onClick={() => setTab('bookings')}
          className={`px-6 py-2 font-semibold transition ${
            tab === 'bookings' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Bookings ({bookings.length})
        </button>
      </div>

      {tab === 'cars' && (
        <div>
          <button
            onClick={() => setShowAddCar(!showAddCar)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition mb-6"
          >
            <Plus size={20} />
            Add Vehicle
          </button>

          {showAddCar && (
            <form onSubmit={handleAddCar} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Vehicle Name"
                  value={newCar.name}
                  onChange={(e) => setNewCar({ ...newCar, name: e.target.value })}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Brand"
                  value={newCar.brand}
                  onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Model"
                  value={newCar.model}
                  onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Year"
                  value={newCar.year}
                  onChange={(e) => setNewCar({ ...newCar, year: parseInt(e.target.value) })}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                />
                <select
                  value={newCar.vehicle_type}
                  onChange={(e) => setNewCar({ ...newCar, vehicle_type: e.target.value })}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                </select>
                <input
                  type="text"
                  placeholder="Location City"
                  value={newCar.location_city}
                  onChange={(e) => setNewCar({ ...newCar, location_city: e.target.value })}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Price per Hour"
                  value={newCar.price_per_hour}
                  onChange={(e) => setNewCar({ ...newCar, price_per_hour: parseFloat(e.target.value) })}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Price per Day"
                  value={newCar.price_per_day}
                  onChange={(e) => setNewCar({ ...newCar, price_per_day: parseFloat(e.target.value) })}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={newCar.image_url}
                  onChange={(e) => setNewCar({ ...newCar, image_url: e.target.value })}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500 md:col-span-2"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition"
                >
                  Add Vehicle
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCar(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 gap-4">
            {cars.map((car) => (
              <div key={car.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex justify-between items-center">
                <div className="flex gap-4 flex-1">
                  <img src={car.image_url} alt={car.name} className="w-20 h-20 object-cover rounded" />
                  <div>
                    <h3 className="text-white font-semibold">{car.name}</h3>
                    <p className="text-slate-400 text-sm">{car.brand} {car.model}</p>
                    <p className="text-blue-400 font-semibold">₹{car.price_per_day}/day</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteCar(car.id)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'bookings' && (
        <div className="grid grid-cols-1 gap-4">
          {bookings.length === 0 ? (
            <p className="text-slate-400">No bookings yet</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-semibold">Booking ID: {booking.id.slice(0, 8)}</p>
                    <p className="text-slate-400 text-sm">Status: {booking.status}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      booking.payment_status === 'paid'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {booking.payment_status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3 text-sm text-slate-300">
                  <div>
                    <p className="text-slate-400 text-xs">Amount</p>
                    <p className="text-blue-400 font-semibold">₹{booking.total_amount}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Dates</p>
                    <p>{new Date(booking.pickup_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Location</p>
                    <p>{booking.pickup_location}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
