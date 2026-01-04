export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  profile_image_url?: string;
  driving_license_verified: boolean;
  id_proof_verified: boolean;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  average_rating: number;
  total_bookings: number;
}

export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  vehicle_type: string;
  fuel_type: string;
  transmission: string;
  seating_capacity: number;
  mileage: number;
  image_url: string;
  gallery_urls: string[];
  price_per_hour: number;
  price_per_day: number;
  price_per_week: number;
  location_city: string;
  location_lat?: number;
  location_lng?: number;
  features: string[];
  is_available: boolean;
  rating: number;
  total_bookings: number;
  host_id?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  car_id: string;
  pickup_date: string;
  dropoff_date: string;
  pickup_location: string;
  dropoff_location: string;
  status: string;
  rental_hours?: number;
  base_price: number;
  add_ons_total: number;
  tax_amount: number;
  total_amount: number;
  payment_status: string;
  payment_method?: string;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  image_url?: string;
}

export interface Review {
  id: string;
  car_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses?: number;
}

export interface SearchFilters {
  location: string;
  pickupDate: string;
  dropoffDate: string;
  vehicleType?: string;
  fuelType?: string;
  transmission?: string;
  priceRange?: [number, number];
}
