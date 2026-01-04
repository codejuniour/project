import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Check, Shield, Headphones, Zap } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import type { SearchFilters } from '../types';

export default function Home() {
  const navigate = useNavigate();
  const setSearchFilters = useBookingStore((state) => state.setSearchFilters);

  const [formData, setFormData] = useState({
    location: '',
    pickupDate: '',
    dropoffDate: '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.location && formData.pickupDate && formData.dropoffDate) {
      const filters: SearchFilters = {
        location: formData.location,
        pickupDate: formData.pickupDate,
        dropoffDate: formData.dropoffDate,
      };
      setSearchFilters(filters);
      navigate('/vehicles');
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section
        className="relative min-h-[600px] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%), url("https://images.pexels.com/photos/3802509/pexels-photo-3802509.jpeg?auto=compress&cs=tinysrgb&w=1600")',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 pb-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              Drive Your Way
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8">
              Anytime. Anywhere. Premium self-drive car rentals.
            </p>
          </div>

          {/* Search Widget */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-xl p-8 max-w-4xl mx-auto shadow-2xl">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-blue-500" size={20} />
                    <input
                      type="text"
                      placeholder="Enter city or location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Pickup Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-blue-500" size={20} />
                    <input
                      type="date"
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Dropoff Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-blue-500" size={20} />
                    <input
                      type="date"
                      value={formData.dropoffDate}
                      onChange={(e) => setFormData({ ...formData, dropoffDate: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Zap size={20} />
                Search Vehicles
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Why Choose Zoom My Way?</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Check size={24} className="text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Zero Deposit*</h3>
            <p className="text-slate-400 text-sm">Book your dream car without any security deposit required.</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition">
            <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-4">
              <Shield size={24} className="text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Sanitized Cars</h3>
            <p className="text-slate-400 text-sm">All vehicles are thoroughly cleaned and sanitized before delivery.</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <Headphones size={24} className="text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">24/7 Support</h3>
            <p className="text-slate-400 text-sm">Round-the-clock roadside assistance and customer support.</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <ArrowRight size={24} className="text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Doorstep Delivery</h3>
            <p className="text-slate-400 text-sm">We deliver your vehicle right to your location at no extra cost.</p>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Featured Vehicles</h2>

        <div className="text-center">
          <p className="text-slate-400 mb-6">Explore our premium collection of self-drive vehicles</p>
          <button
            onClick={() => navigate('/vehicles')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Browse All Vehicles
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-900 to-cyan-900 py-16 mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Become a Host</h2>
          <p className="text-slate-300 mb-6">Earn passive income by listing your vehicle on Zoom My Way</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition">
            Start Earning Today
          </button>
        </div>
      </section>
    </div>
  );
}
