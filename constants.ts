
import { Service, Product, User, UserRole, Client, Booking, Sale, SalonConfig, Reseller } from './types';

export const APP_NAME = "Belo's Salon & Store";
export const SOCIAL_TIKTOK = "https://www.tiktok.com/@belos.salon.e.store?_t=ZM-90zF7dez8vc&_r=1";
export const SOCIAL_INSTAGRAM = "https://www.instagram.com/belos_salon.store?igsh=MWl3eTN3NHRnYnF3cA==";

export const DEFAULT_CONFIG: SalonConfig = {
  bookingWindowDays: 14,
  schedule: [
    { dayIndex: 0, name: 'Domingo', isOpen: false, openTime: '09:00', closeTime: '15:00' },
    { dayIndex: 1, name: 'Segunda-feira', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { dayIndex: 2, name: 'Terça-feira', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { dayIndex: 3, name: 'Quarta-feira', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { dayIndex: 4, name: 'Quinta-feira', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { dayIndex: 5, name: 'Sexta-feira', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { dayIndex: 6, name: 'Sábado', isOpen: true, openTime: '09:00', closeTime: '15:00' },
  ]
};

export const MOCK_SERVICES: Service[] = [
  {
    id: 'srv_01',
    name: 'Corte Feminino',
    category: 'Cabelo',
    price: 500,
    duration: 60,
    description: 'Corte profissional com lavagem e finalização',
    image: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: 'srv_02',
    name: 'Manicure Completa',
    category: 'Manicure',
    price: 300,
    duration: 45,
    description: 'Tratamento completo das unhas das mãos com esmaltação',
    image: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: 'srv_03',
    name: 'Pedicure Completa',
    category: 'Pedicure',
    price: 350,
    duration: 60,
    description: 'Tratamento completo dos pés com esmaltação',
    image: 'https://picsum.photos/400/300?random=3'
  },
  {
    id: 'srv_04',
    name: 'Spa Day',
    category: 'Spa',
    price: 2500,
    duration: 180,
    description: 'Massagem relaxante, limpeza de pele e hidratação',
    image: 'https://picsum.photos/400/300?random=4'
  },
  {
    id: 'srv_05',
    name: 'Design de Sobrancelhas',
    category: 'Estética',
    price: 200,
    duration: 30,
    description: 'Design com henna ou natural',
    image: 'https://picsum.photos/400/300?random=5'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'CLR001',
    name: 'Colar Dourado Elegance',
    category: 'Colares',
    price: 850,
    stock: 15,
    image: 'https://picsum.photos/300/300?random=10',
    description: 'Colar fino dourado com pingente delicado'
  },
  {
    id: 'CJ-BRI001',
    name: 'Brincos Argola Grande Dourada',
    category: 'Conjuntos de Brincos',
    price: 650,
    stock: 20,
    image: 'https://picsum.photos/300/300?random=11',
    description: 'Brincos argola grande em dourado brilhante'
  },
  {
    id: 'PLS001',
    name: 'Pulseira de Pérolas',
    category: 'Pulseiras',
    price: 1200,
    stock: 5,
    image: 'https://picsum.photos/300/300?random=12',
    description: 'Pulseira clássica com pérolas cultivadas'
  },
  {
    id: 'CLR002',
    name: 'Colar Gargantilha Black & Gold',
    category: 'Colares',
    price: 1200,
    stock: 8,
    image: 'https://picsum.photos/300/300?random=13',
    description: 'Gargantilha sofisticada em preto e dourado'
  },
  {
    id: 'BRI002',
    name: 'Brincos Gota Cristal',
    category: 'Brincos',
    price: 890,
    stock: 12,
    image: 'https://picsum.photos/300/300?random=14',
    description: 'Brincos em formato de gota com cristais'
  }
];

export const MOCK_CLIENTS: Client[] = [
  { id: 'cli_1', name: 'Ana Silva', phone: '841234567', email: 'ana@example.com', totalSpent: 5000, lastVisit: '2023-10-15' },
  { id: 'cli_2', name: 'Carlos Manjate', phone: '829876543', totalSpent: 1200, lastVisit: '2023-10-20' },
  { id: 'cli_3', name: 'Beatriz Costa', phone: '845554433', email: 'bia@example.com', totalSpent: 15000, lastVisit: '2023-10-25' },
];

export const MOCK_USERS: User[] = [
  { id: 'u_admin', name: 'Admin Owner', email: 'admin@belosalon.store', role: UserRole.ADMIN, password: '123' },
  { id: 'u_manager', name: 'Gestor Loja', email: 'gestor@belosalon.store', role: UserRole.MANAGER, password: '123' },
  { id: 'u_client', name: 'Cliente Teste', email: 'cliente@gmail.com', role: UserRole.CLIENT, password: '123' }
];

export const MOCK_BOOKINGS: Booking[] = [
  { id: 'bk_1', clientId: 'cli_1', clientName: 'Ana Silva', serviceId: 'srv_01', serviceName: 'Corte Feminino', date: '2023-10-28', time: '10:00', status: 'CONFIRMED' },
  { id: 'bk_2', clientId: 'cli_3', clientName: 'Beatriz Costa', serviceId: 'srv_04', serviceName: 'Spa Day', date: '2023-10-29', time: '14:00', status: 'PENDING' },
];

export const MOCK_SALES: Sale[] = [
  {
    id: 'sale_1',
    date: '2023-10-25',
    clientId: 'cli_1',
    processedBy: 'u_admin',
    items: [{ type: 'SERVICE', itemId: 'srv_01', name: 'Corte Feminino', price: 500, quantity: 1 }],
    subtotal: 500,
    discountPercentage: 0,
    discountAmount: 0,
    total: 500
  },
  {
    id: 'sale_2',
    date: '2023-10-26',
    clientId: 'cli_3',
    processedBy: 'u_manager',
    items: [{ type: 'PRODUCT', itemId: 'CLR001', name: 'Colar Dourado Elegance', price: 850, quantity: 2 }],
    subtotal: 1700,
    discountPercentage: 10,
    discountAmount: 170,
    total: 1530
  }
];

export const MOCK_RESELLERS: Reseller[] = [
  { id: 'res_1', name: 'Joana Machava', email: 'joana.resell@email.com', phone: '849998877', address: 'Matola, Bairro da Liberdade', date: '2023-11-01', notes: 'Interessada em colares' }
];