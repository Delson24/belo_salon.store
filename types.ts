
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER', // Cannot see financials
  CLIENT = 'CLIENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  password?: string; // Added for mock auth
}

export interface Service {
  id: string;
  name: string;
  category: 'Cabelo' | 'Manicure' | 'Pedicure' | 'Estética' | 'Spa';
  price: number; // In Metical (MT)
  duration: number; // Minutes
  image: string;
  description: string;
}

export interface Product {
  id: string; // SKU like CLR001
  name: string;
  category: 'Colares' | 'Brincos' | 'Pulseiras' | 'Anéis' | 'Conjuntos Completos' | 'Conjuntos de Brincos';
  price: number;
  stock: number;
  image: string;
  description?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalSpent: number;
  lastVisit?: string;
  notes?: string;
}

export interface Reseller {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  date: string;
}

export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  date: string; // ISO Date
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface Sale {
  id: string;
  date: string;
  clientId?: string; // Optional if walk-in without registration
  items: Array<{
    type: 'SERVICE' | 'PRODUCT';
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  total: number;
  processedBy: string; // User ID
}

export interface DashboardStats {
  dailyRevenue: number;
  monthlyRevenue: number;
  monthlyRevenueGrowth: number; // Percentage vs last month
  newClients: number;
  totalBookings: number;
  occupancyRate: number;
}

export interface WorkDay {
  dayIndex: number; // 0 = Sunday, 1 = Monday...
  name: string;
  isOpen: boolean;
  openTime: string; // "09:00"
  closeTime: string; // "18:00"
}

export interface SalonConfig {
  schedule: WorkDay[];
  bookingWindowDays: number; // e.g., 14 days
}