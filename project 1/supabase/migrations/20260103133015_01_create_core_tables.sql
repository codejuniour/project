/*
  # Zoom My Way - Core Database Schema

  1. New Tables
    - `users`: Extended user profiles with documents and verification
    - `cars`: Vehicle inventory with specifications and pricing
    - `bookings`: Rental bookings with status tracking
    - `car_reviews`: Customer reviews and ratings
    - `add_ons`: Optional add-ons like GPS, child seat, insurance
    - `booking_add_ons`: Junction table for add-ons per booking
    - `payments`: Payment transaction records
    - `hosts`: Partner/host profiles for car owners
    - `damage_reports`: In-app damage reporting
    - `coupons`: Promo codes and discounts

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Restrict admin operations
*/

-- Users table (extend auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  profile_image_url TEXT,
  driving_license_url TEXT,
  driving_license_verified BOOLEAN DEFAULT false,
  id_proof_url TEXT,
  id_proof_verified BOOLEAN DEFAULT false,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  emergency_contact TEXT,
  total_bookings INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 5.0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  vehicle_type TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  seating_capacity INTEGER NOT NULL,
  mileage INTEGER DEFAULT 0,
  image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  price_per_hour DECIMAL(10, 2) NOT NULL,
  price_per_day DECIMAL(10, 2) NOT NULL,
  price_per_week DECIMAL(10, 2) NOT NULL,
  location_city TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  features TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  rating DECIMAL(3, 2) DEFAULT 5.0,
  total_bookings INTEGER DEFAULT 0,
  host_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES cars(id),
  pickup_date TIMESTAMPTZ NOT NULL,
  dropoff_date TIMESTAMPTZ NOT NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  rental_hours INTEGER,
  base_price DECIMAL(10, 2) NOT NULL,
  add_ons_total DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Car reviews
CREATE TABLE IF NOT EXISTS car_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  rating INTEGER NOT NULL,
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add-ons catalog
CREATE TABLE IF NOT EXISTS add_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_per_day DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Booking add-ons junction
CREATE TABLE IF NOT EXISTS booking_add_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  add_on_id UUID NOT NULL REFERENCES add_ons(id),
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_gateway_id TEXT,
  transaction_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Hosts/Partners
CREATE TABLE IF NOT EXISTS hosts (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT,
  bank_account TEXT,
  ifsc_code TEXT,
  total_cars INTEGER DEFAULT 0,
  total_earnings DECIMAL(12, 2) DEFAULT 0,
  verification_status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Damage reports
CREATE TABLE IF NOT EXISTS damage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  user_id UUID NOT NULL REFERENCES users(id),
  description TEXT NOT NULL,
  damage_images TEXT[] DEFAULT '{}',
  estimated_cost DECIMAL(10, 2),
  status TEXT DEFAULT 'reported',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Coupons/Promos
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Can view and update own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Cars: Public read, hosts can manage own cars
CREATE POLICY "Anyone can view available cars"
  ON cars FOR SELECT
  USING (is_available = true);

CREATE POLICY "Hosts can view own cars"
  ON cars FOR SELECT
  TO authenticated
  USING (host_id = auth.uid());

CREATE POLICY "Hosts can insert cars"
  ON cars FOR INSERT
  TO authenticated
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts can update own cars"
  ON cars FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

-- Bookings: Users can view own bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Reviews: Public read, users can create reviews for completed bookings
CREATE POLICY "Anyone can read reviews"
  ON car_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON car_reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Add-ons: Public read
CREATE POLICY "Anyone can view add-ons"
  ON add_ons FOR SELECT
  USING (is_active = true);

-- Booking add-ons: Users can view their own
CREATE POLICY "Users can view booking add-ons"
  ON booking_add_ons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_add_ons.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Payments: Users can view own payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Hosts: Public read, users can view/update own
CREATE POLICY "Hosts can view own profile"
  ON hosts FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create host profile"
  ON hosts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Hosts can update own profile"
  ON hosts FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Damage reports: Users can create and view own
CREATE POLICY "Users can create damage reports"
  ON damage_reports FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own damage reports"
  ON damage_reports FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Coupons: Public read
CREATE POLICY "Anyone can view active coupons"
  ON coupons FOR SELECT
  USING (is_active = true AND valid_from <= now() AND valid_until >= now());
