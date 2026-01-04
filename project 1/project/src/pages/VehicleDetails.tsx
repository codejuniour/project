import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Fuel, Users, Zap, MapPin, Calendar, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import type { Car, Review } from '../types';

export default function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setSelectedCar } = useBookingStore();
  const [car, setCar] = useState<Car | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetchCarDetails();
    fetchReviews();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setCar(data);
    } catch (err) {
      console.error('Error fetching car:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('car_reviews')
        .select('*')
        .eq('car_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleBooking = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (car) {
      setSelectedCar(car);
      navigate(`/booking/${car.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader size={40} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p className="text-slate-300">Vehicle not found</p>
        </div>
      </div>
    );
  }

  const images = [car.image_url, ...(car.gallery_urls || [])];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Gallery */}
        <div className="lg:col-span-2">
          <div className="relative bg-slate-800 rounded-lg overflow-hidden mb-4">
            <img
              src={images[activeImageIndex]}
              alt={car.name}
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 hover:opacity-100 transition">
              <button
                onClick={() => setActiveImageIndex((i) => (i - 1 + images.length) % images.length)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
              >
                ←
              </button>
              <button
                onClick={() => setActiveImageIndex((i) => (i + 1) % images.length)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Gallery ${i}`}
                className={`h-20 w-full object-cover rounded cursor-pointer transition ${
                  activeImageIndex === i ? 'border-2 border-blue-500' : 'border border-slate-700'
                }`}
                onClick={() => setActiveImageIndex(i)}
              />
            ))}
          </div>

          {/* Specifications */}
          <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Vehicle Type</p>
                <p className="text-white font-semibold">{car.vehicle_type}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Fuel Type</p>
                <p className="text-white font-semibold">{car.fuel_type}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Transmission</p>
                <p className="text-white font-semibold">{car.transmission}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Seating</p>
                <p className="text-white font-semibold">{car.seating_capacity} Seats</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Year</p>
                <p className="text-white font-semibold">{car.year}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Mileage</p>
                <p className="text-white font-semibold">{car.mileage} km</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Location</p>
                <p className="text-white font-semibold flex items-center gap-1">
                  <MapPin size={16} /> {car.location_city}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Rating</p>
                <p className="text-white font-semibold flex items-center gap-1">
                  <Star size={16} className="text-yellow-400" /> {car.rating}
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          {car.features && car.features.length > 0 && (
            <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Features</h2>
              <div className="grid grid-cols-2 gap-3">
                {car.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Customer Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-slate-400">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-slate-700 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
                          />
                        ))}
                      </div>
                      <span className="text-slate-400 text-sm">5 stars</span>
                    </div>
                    <p className="text-slate-300">{review.review_text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Card */}
        <div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sticky top-24">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">{car.name}</h1>
              <p className="text-slate-400">{car.brand} {car.model} ({car.year})</p>
            </div>

            <div className="space-y-4 mb-6 border-b border-slate-700 pb-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-slate-400 text-sm">Hourly Rate</p>
                  <p className="text-2xl font-bold text-blue-400">₹{car.price_per_hour}</p>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-slate-400 text-sm">Daily Rate</p>
                  <p className="text-2xl font-bold text-blue-400">₹{car.price_per_day}</p>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-slate-400 text-sm">Weekly Rate</p>
                  <p className="text-2xl font-bold text-blue-400">₹{car.price_per_week}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Fuel size={18} className="text-blue-400" />
                <span>{car.fuel_type}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue-400" />
                <span>{car.seating_capacity} Passengers</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-blue-400" />
                <span>{car.transmission} Transmission</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-blue-400" />
                <span>Available Now</span>
              </div>
            </div>

            <button
              onClick={handleBooking}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition mb-3"
            >
              Book Now
            </button>

            <p className="text-xs text-slate-400 text-center">Secure payment • 24/7 support • Free cancellation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
