import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Booking, Car } from '../types';
import { LogOut, Edit, Loader, AlertCircle, Check } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [carDetails, setCarDetails] = useState<{ [key: string]: Car }>({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    city: user?.city || '',
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);

      for (const booking of data || []) {
        if (!carDetails[booking.car_id]) {
          const { data: carData } = await supabase
            .from('cars')
            .select('*')
            .eq('id', booking.car_id)
            .maybeSingle();

          if (carData) {
            setCarDetails((prev) => ({ ...prev, [booking.car_id]: carData }));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', user?.id);

      if (error) throw error;
      setSuccess('Profile updated successfully');
      setEditMode(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled', payment_status: 'refunded' })
        .eq('id', bookingId);

      if (error) throw error;
      setSuccess('Booking cancelled successfully');
      fetchBookings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error cancelling booking:', err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AlertCircle className="text-red-500" size={40} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader size={40} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">My Dashboard</h1>
        <button
          onClick={async () => {
            await logout();
            navigate('/');
          }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6 flex gap-3">
          <Check className="text-green-500 flex-shrink-0" size={20} />
          <p className="text-green-300">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Profile</h2>

            {editMode ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 text-sm">Name</p>
                  <p className="text-white font-semibold">{user.full_name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Email</p>
                  <p className="text-white font-semibold">{user.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Phone</p>
                  <p className="text-white font-semibold">{user.phone_number || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">City</p>
                  <p className="text-white font-semibold">{user.city || 'Not provided'}</p>
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition mt-4"
                >
                  <Edit size={18} />
                  Edit Profile
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-700">
              <h3 className="text-white font-semibold mb-3">Document Verification</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${user.driving_license_verified ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                  <span className="text-slate-300">Driving License</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${user.id_proof_verified ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                  <span className="text-slate-300">ID Proof</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">My Bookings</h2>

            {bookings.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No bookings yet. Start exploring vehicles!</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const car = carDetails[booking.car_id];
                  return (
                    <div key={booking.id} className="border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-white font-semibold">{car?.name || 'Loading...'}</h3>
                          <p className="text-slate-400 text-sm">{booking.pickup_location}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            booking.status === 'confirmed'
                              ? 'bg-green-500/20 text-green-300'
                              : booking.status === 'cancelled'
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-slate-300 mb-4 pb-4 border-b border-slate-700">
                        <div>
                          <p className="text-slate-400 text-xs">Dates</p>
                          <p>
                            {new Date(booking.pickup_date).toLocaleDateString()} -{' '}
                            {new Date(booking.dropoff_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Total Amount</p>
                          <p className="text-blue-400 font-semibold">₹{booking.total_amount}</p>
                        </div>
                      </div>

                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition text-sm font-semibold"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
