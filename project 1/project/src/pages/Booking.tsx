import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import type { Car, AddOn } from '../types';
import { AlertCircle, Check, Loader, ShoppingCart } from 'lucide-react';

export default function Booking() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { searchFilters, selectedCar } = useBookingStore();
  const [car, setCar] = useState<Car | null>(selectedCar);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingCreated, setBookingCreated] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!car && carId) {
      fetchCar();
    }
    fetchAddOns();
  }, [user, carId]);

  const fetchCar = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .maybeSingle();

      if (error) throw error;
      setCar(data);
    } catch (err) {
      setError('Failed to load vehicle details');
    }
  };

  const fetchAddOns = async () => {
    try {
      const { data, error } = await supabase
        .from('add_ons')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setAddOns(data || []);
    } catch (err) {
      console.error('Error fetching add-ons:', err);
    }
  };


  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car || !searchFilters) return;

    setLoading(true);
    setError('');

    try {
      const startDate = new Date(searchFilters.pickupDate);
      const endDate = new Date(searchFilters.dropoffDate);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

      let baseTotalPrice = car.price_per_day * days;
      let addOnsTotal = 0;

      selectedAddOns.forEach((addOnId) => {
        const addOn = addOns.find((a) => a.id === addOnId);
        if (addOn) {
          addOnsTotal += addOn.price_per_day * days;
        }
      });

      const taxAmount = (baseTotalPrice + addOnsTotal) * 0.18;
      const totalAmount = baseTotalPrice + addOnsTotal + taxAmount;

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user?.id,
          car_id: car.id,
          pickup_date: searchFilters.pickupDate,
          dropoff_date: searchFilters.dropoffDate,
          pickup_location: searchFilters.location,
          dropoff_location: searchFilters.location,
          status: 'pending',
          rental_hours: days * 24,
          base_price: baseTotalPrice,
          add_ons_total: addOnsTotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          payment_status: 'pending',
        })
        .select()
        .maybeSingle();

      if (bookingError) throw bookingError;

      if (bookingData) {
        for (const addOnId of selectedAddOns) {
          const addOn = addOns.find((a) => a.id === addOnId);
          if (addOn) {
            await supabase.from('booking_add_ons').insert({
              booking_id: bookingData.id,
              add_on_id: addOnId,
              price: addOn.price_per_day * days,
            });
          }
        }
      }

      setBookingCreated(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !car || !searchFilters) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AlertCircle className="text-red-500" size={40} />
      </div>
    );
  }

  if (bookingCreated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-slate-800 p-8 rounded-lg">
          <Check className="mx-auto mb-4 text-green-500" size={48} />
          <h1 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-slate-300 mb-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const startDate = new Date(searchFilters.pickupDate);
  const endDate = new Date(searchFilters.dropoffDate);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
  const baseTotalPrice = car.price_per_day * days;
  let addOnsTotal = 0;

  selectedAddOns.forEach((addOnId) => {
    const addOn = addOns.find((a) => a.id === addOnId);
    if (addOn) {
      addOnsTotal += addOn.price_per_day * days;
    }
  });

  const taxAmount = (baseTotalPrice + addOnsTotal) * 0.18;
  const totalAmount = baseTotalPrice + addOnsTotal + taxAmount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">Complete Your Booking</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleBooking} className="space-y-6">
            {/* Booking Details */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Booking Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Pickup Date</p>
                  <p className="text-white font-semibold">{startDate.toDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Dropoff Date</p>
                  <p className="text-white font-semibold">{endDate.toDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Location</p>
                  <p className="text-white font-semibold">{searchFilters.location}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Duration</p>
                  <p className="text-white font-semibold">{days} day(s)</p>
                </div>
              </div>
            </div>

            {/* Vehicle Summary */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Vehicle</h2>
              <div className="flex gap-4">
                <img src={car.image_url} alt={car.name} className="w-24 h-24 object-cover rounded" />
                <div>
                  <h3 className="text-white font-semibold">{car.name}</h3>
                  <p className="text-slate-400 text-sm">{car.brand} {car.model}</p>
                  <p className="text-blue-400 font-semibold mt-2">₹{car.price_per_day}/day</p>
                </div>
              </div>
            </div>

            {/* Add-ons */}
            {addOns.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Optional Add-ons</h2>
                <div className="space-y-3">
                  {addOns.map((addOn) => (
                    <div key={addOn.id} className="flex items-center gap-3 p-3 border border-slate-700 rounded">
                      <input
                        type="checkbox"
                        id={addOn.id}
                        checked={selectedAddOns.includes(addOn.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAddOns([...selectedAddOns, addOn.id]);
                          } else {
                            setSelectedAddOns(selectedAddOns.filter((id) => id !== addOn.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <label htmlFor={addOn.id} className="text-white font-semibold cursor-pointer">
                          {addOn.name}
                        </label>
                        <p className="text-slate-400 text-sm">{addOn.description}</p>
                      </div>
                      <p className="text-blue-400 font-semibold">₹{addOn.price_per_day}/day</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader size={20} className="animate-spin" />}
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>
        </div>

        {/* Price Summary */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sticky top-24">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingCart size={24} />
              Price Summary
            </h2>

            <div className="space-y-3 text-sm text-slate-300 mb-4 pb-4 border-b border-slate-700">
              <div className="flex justify-between">
                <span>Vehicle ({days} days)</span>
                <span className="text-white font-semibold">₹{baseTotalPrice}</span>
              </div>
              {selectedAddOns.length > 0 && (
                <div className="flex justify-between">
                  <span>Add-ons ({days} days)</span>
                  <span className="text-white font-semibold">₹{addOnsTotal}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (18%)</span>
                <span className="text-white font-semibold">₹{taxAmount.toFixed(0)}</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold text-white">
              <span>Total Amount</span>
              <span className="text-blue-400">₹{totalAmount.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
