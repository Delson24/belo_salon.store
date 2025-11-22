
import { MOCK_SERVICES, MOCK_PRODUCTS, MOCK_CLIENTS, MOCK_BOOKINGS, MOCK_SALES, MOCK_USERS, DEFAULT_CONFIG, MOCK_RESELLERS } from '../constants';
import { Booking, Client, Product, Sale, SalonConfig, Service, User, UserRole, Reseller } from '../types';

// This simulates Supabase interactions. 
// In a real app, replace these promises with supabase.from('table').select('*') etc.

let currentConfig = { ...DEFAULT_CONFIG };
let resellers = [...MOCK_RESELLERS];
let users = [...MOCK_USERS];

export const getServices = async (): Promise<Service[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_SERVICES), 500));
};

export const getProducts = async (): Promise<Product[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_PRODUCTS), 500));
};

export const getClients = async (): Promise<Client[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_CLIENTS), 500));
};

export const getBookings = async (): Promise<Booking[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_BOOKINGS), 500));
};

export const getSales = async (): Promise<Sale[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_SALES), 500));
};

export const getUsers = async (): Promise<User[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(users), 500));
};

export const getSalonConfig = async (): Promise<SalonConfig> => {
  return new Promise((resolve) => setTimeout(() => resolve(currentConfig), 300));
};

export const updateSalonConfig = async (newConfig: SalonConfig): Promise<SalonConfig> => {
  currentConfig = newConfig;
  return new Promise((resolve) => setTimeout(() => resolve(currentConfig), 500));
};

export const createBooking = async (booking: Partial<Booking>): Promise<boolean> => {
  console.log("Booking created in backend:", booking);
  return new Promise((resolve) => setTimeout(() => resolve(true), 800));
};

export const createSale = async (sale: Sale): Promise<boolean> => {
  console.log("Sale recorded in backend:", sale);
  return new Promise((resolve) => setTimeout(() => resolve(true), 800));
};

export const createClient = async (client: Partial<Client>): Promise<Client> => {
    const newClient = {
        ...client,
        id: `cli_${Math.random().toString(36).substr(2, 9)}`,
        totalSpent: 0,
        role: UserRole.CLIENT,
        password: '123' // Default password for new clients in mock
    } as Client & User;
    console.log("Client created:", newClient);
    return new Promise((resolve) => setTimeout(()=> resolve(newClient), 500));
}

export const createManager = async (managerData: {name: string, email: string, password?: string}): Promise<User> => {
    const newUser: User = {
        id: `u_mgr_${Date.now()}`,
        name: managerData.name,
        email: managerData.email,
        role: UserRole.MANAGER,
        password: managerData.password || '123'
    };
    // Push to mock db
    users.push(newUser);
    console.log("Manager created:", newUser);
    return new Promise((resolve) => setTimeout(() => resolve(newUser), 500));
};

export const updateUser = async (user: User): Promise<User> => {
  users = users.map(u => u.id === user.id ? user : u);
  return new Promise((resolve) => setTimeout(() => resolve(user), 500));
};

export const deleteUser = async (id: string): Promise<boolean> => {
  users = users.filter(u => u.id !== id);
  return new Promise((resolve) => setTimeout(() => resolve(true), 500));
};

// --- New Management Functions ---

export const createService = async (service: Service): Promise<Service> => {
  console.log("Service created:", service);
  // In a real app, database assigns ID, here we accept the frontend generated ID or generate one
  return new Promise((resolve) => setTimeout(() => resolve(service), 500));
};

export const updateService = async (service: Service): Promise<Service> => {
  console.log("Service updated:", service);
  return new Promise((resolve) => setTimeout(() => resolve(service), 500));
};

export const createProduct = async (product: Product): Promise<Product> => {
  console.log("Product created:", product);
  return new Promise((resolve) => setTimeout(() => resolve(product), 500));
};

export const updateProduct = async (product: Product): Promise<Product> => {
  console.log("Product updated:", product);
  return new Promise((resolve) => setTimeout(() => resolve(product), 500));
};

// --- Reseller Functions ---

export const getResellers = async (): Promise<Reseller[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(resellers), 500));
};

export const createReseller = async (data: Omit<Reseller, 'id' | 'date'>): Promise<Reseller> => {
    const newReseller: Reseller = {
        id: `res_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        ...data
    };
    resellers.push(newReseller);
    console.log("Reseller registered:", newReseller);
    return new Promise((resolve) => setTimeout(() => resolve(newReseller), 800));
};

export const deleteReseller = async (id: string): Promise<boolean> => {
    resellers = resellers.filter(r => r.id !== id);
    return new Promise((resolve) => setTimeout(() => resolve(true), 500));
};