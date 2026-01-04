import { create } from 'zustand';
import type { SearchFilters, Car, AddOn } from '../types';

interface BookingState {
  searchFilters: SearchFilters | null;
  selectedCar: Car | null;
  selectedAddOns: AddOn[];
  setSearchFilters: (filters: SearchFilters) => void;
  setSelectedCar: (car: Car | null) => void;
  addAddOn: (addOn: AddOn) => void;
  removeAddOn: (addOnId: string) => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  searchFilters: null,
  selectedCar: null,
  selectedAddOns: [],

  setSearchFilters: (filters) => set({ searchFilters: filters }),
  setSelectedCar: (car) => set({ selectedCar: car }),

  addAddOn: (addOn) =>
    set((state) => ({
      selectedAddOns: [...state.selectedAddOns, addOn],
    })),

  removeAddOn: (addOnId) =>
    set((state) => ({
      selectedAddOns: state.selectedAddOns.filter((a) => a.id !== addOnId),
    })),

  clearBooking: () =>
    set({
      searchFilters: null,
      selectedCar: null,
      selectedAddOns: [],
    }),
}));
