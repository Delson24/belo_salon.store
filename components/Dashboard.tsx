
import React, { useState, useEffect } from 'react';
import { User, UserRole, Sale, Client, Booking, Service, Product, SalonConfig, Reseller } from '../types';
import { 
  getBookings, getClients, getSales, getServices, getProducts, getUsers, getSalonConfig, getResellers,
  createSale, createService, updateService, createProduct, updateProduct, createManager, updateSalonConfig, deleteReseller,
  updateUser, deleteUser
} from '../services/api';
import { APP_NAME, DEFAULT_CONFIG } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Calendar, DollarSign, ShoppingBag, PlusCircle, Search, Download, TrendingUp, Package, Scissors, Edit, X, Upload, UserCog, Settings, Save, Eye, Phone, Mail, MapPin, Clock, Briefcase, Trash2, AlertTriangle, CheckCircle, Filter, Tag } from 'lucide-react';

interface DashboardProps {
  user: User;
  onConfigUpdate?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onConfigUpdate }) => {
  const [view, setView] = useState<'overview' | 'bookings' | 'clients' | 'sales' | 'products' | 'services' | 'team' | 'settings' | 'resellers'>('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [salonConfig, setSalonConfig] = useState<SalonConfig>(DEFAULT_CONFIG);
  
  // Client Filter State
  const [clientFilter, setClientFilter] = useState<'ALL' | 'SALON' | 'STORE'>('ALL');
  
  // Booking Search State
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');

  // Modals
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  
  // Client Details Modal State
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null);

  // Editing State
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Image Preview State
  const [serviceImagePreview, setServiceImagePreview] = useState<string>('');
  const [productImagePreview, setProductImagePreview] = useState<string>('');

  // Settings Loading State
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [b, c, s, sv, p, u, cfg, r] = await Promise.all([
        getBookings(),
        getClients(),
        getSales(),
        getServices(),
        getProducts(),
        getUsers(),
        getSalonConfig(),
        getResellers()
      ]);
      setBookings(b);
      setClients(c);
      setSales(s);
      setServices(sv);
      setProducts(p);
      setUsers(u);
      setSalonConfig(cfg);
      setResellers(r);
    };
    fetchData();
  }, []);

  // Calculated Stats
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalClients = clients.length;
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;

  // Charts Data
  const revenueData = [
    { name: 'Semana 1', total: 15000 },
    { name: 'Semana 2', total: 22000 },
    { name: 'Semana 3', total: 18000 },
    { name: 'Semana 4', total: 25000 },
  ];

  const serviceDistributionData = [
    { name: 'Cabelo', value: 40 },
    { name: 'Manicure', value: 30 },
    { name: 'Spa', value: 10 },
    { name: 'Loja', value: 20 },
  ];
  const COLORS = ['#eab308', '#000000', '#525252', '#d4d4d4'];

  // Client Filter Logic
  const getFilteredClients = () => {
    return clients.filter(client => {
      const hasBookings = bookings.some(b => b.clientId === client.id);
      const clientSales = sales.filter(s => s.clientId === client.id);
      const hasServiceSales = clientSales.some(s => s.items.some(i => i.type === 'SERVICE'));
      const hasProductSales = clientSales.some(s => s.items.some(i => i.type === 'PRODUCT'));

      const isSalonClient = hasBookings || hasServiceSales;
      const isStoreClient = hasProductSales;

      if (clientFilter === 'SALON') return isSalonClient;
      if (clientFilter === 'STORE') return isStoreClient;
      return true;
    });
  };

  // Helper to check client type for badges
  const getClientBadges = (clientId: string) => {
      const hasBookings = bookings.some(b => b.clientId === clientId);
      const clientSales = sales.filter(s => s.clientId === clientId);
      const hasServiceSales = clientSales.some(s => s.items.some(i => i.type === 'SERVICE'));
      const hasProductSales = clientSales.some(s => s.items.some(i => i.type === 'PRODUCT'));

      return {
          isSalon: hasBookings || hasServiceSales,
          isStore: hasProductSales
      };
  };

  const handleExportReport = () => {
    const totalSales = sales.length;
    const today = new Date().toLocaleDateString('pt-MZ');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório Financeiro - ${APP_NAME}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@400;700&display=swap');
          body { font-family: 'Lato', sans-serif; color: #333; padding: 40px; max-width: 1000px; mx-auto; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eab308; padding-bottom: 20px; }
          .logo { font-size: 32px; font-weight: bold; font-family: 'Playfair Display', serif; color: #000; }
          .subtitle { color: #ca8a04; text-transform: uppercase; font-size: 14px; letter-spacing: 3px; margin-top: 5px; font-weight: bold; }
          .meta { margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; background: #f9fafb; padding: 25px; border-radius: 8px; border: 1px solid #eee; }
          .meta-item { display: flex; flex-direction: column; }
          .label { font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 4px; }
          .value { font-size: 20px; font-weight: bold; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
          th { background-color: #000; color: #eab308; text-align: left; padding: 12px 15px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; font-size: 11px; }
          td { border-bottom: 1px solid #e5e7eb; padding: 12px 15px; color: #374151; vertical-align: top; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .footer { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 60px; border-top: 1px solid #eee; padding-top: 20px; }
          .tag-service { background: #eef2ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
          .tag-product { background: #fefce8; color: #854d0e; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">${APP_NAME}</div>
          <div class="subtitle">Relatório Oficial de Vendas</div>
        </div>

        <div class="meta">
          <div class="meta-item">
            <span class="label">Data de Emissão</span>
            <span class="value">${today}</span>
          </div>
          <div class="meta-item">
            <span class="label">Total de Transações</span>
            <span class="value">${totalSales}</span>
          </div>
          <div class="meta-item">
            <span class="label">Receita Total Acumulada</span>
            <span class="value" style="color: #15803d;">${totalRevenue.toLocaleString()} MT</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID Venda</th>
              <th>Data</th>
              <th>Cliente</th>
              <th>Detalhes dos Itens</th>
              <th>Atendente</th>
              <th style="text-align: right;">Total (MT)</th>
            </tr>
          </thead>
          <tbody>
            ${sales.map(s => `
              <tr>
                <td style="font-family: monospace;">#${s.id.split('_')[1] || s.id}</td>
                <td>${s.date}</td>
                <td><strong>${s.clientId || 'Não Identificado'}</strong></td>
                <td>
                  ${s.items.map(i => `
                    <div style="margin-bottom: 4px;">
                      <span class="${i.type === 'SERVICE' ? 'tag-service' : 'tag-product'}">${i.type === 'SERVICE' ? 'S' : 'P'}</span>
                      ${i.quantity}x ${i.name}
                    </div>
                  `).join('')}
                </td>
                <td>${s.processedBy}</td>
                <td style="text-align: right; font-weight: bold; font-size: 14px;">${s.total.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Este documento foi gerado automaticamente pelo sistema de gestão ${APP_NAME}.<br/>
          © ${new Date().getFullYear()} Belo's Salon & Store. Todos os direitos reservados.
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  // Helper to convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // --- Service Management Logic ---
  const handleOpenServiceModal = (service?: Service) => {
    setEditingService(service || null);
    setServiceImagePreview(service?.image || '');
    setShowServiceModal(true);
  };

  const handleServiceImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        setServiceImagePreview(base64);
      } catch (error) {
        console.error("Error converting file", error);
      }
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const serviceData: Service = {
      id: editingService ? editingService.id : `SRV-${Date.now()}`, // Auto ID
      name: formData.get('name') as string,
      category: formData.get('category') as any,
      price: Number(formData.get('price')),
      duration: Number(formData.get('duration')),
      description: formData.get('description') as string,
      image: serviceImagePreview || 'https://picsum.photos/400/300',
    };

    if (editingService) {
      await updateService(serviceData);
      setServices(services.map(s => s.id === serviceData.id ? serviceData : s));
    } else {
      await createService(serviceData);
      setServices([...services, serviceData]);
    }
    setShowServiceModal(false);
  };

  // --- Product Management Logic ---
  const handleOpenProductModal = (product?: Product) => {
    setEditingProduct(product || null);
    setProductImagePreview(product?.image || '');
    setShowProductModal(true);
  };

  const handleProductImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        setProductImagePreview(base64);
      } catch (error) {
        console.error("Error converting file", error);
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const productData: Product = {
      id: editingProduct ? editingProduct.id : `PROD-${Math.floor(1000 + Math.random() * 9000)}`, // Auto ID (e.g., PROD-4521)
      name: formData.get('name') as string,
      category: formData.get('category') as any,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      description: formData.get('description') as string,
      image: productImagePreview || 'https://picsum.photos/300/300',
    };

    if (editingProduct) {
      await updateProduct(productData);
      setProducts(products.map(p => p.id === productData.id ? productData : p));
    } else {
      await createProduct(productData);
      setProducts([...products, productData]);
    }
    setShowProductModal(false);
  };
  
  // --- User/Team Management Logic ---
  const handleSaveManager = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const managerData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string
    };
    
    const newManager = await createManager(managerData);
    setUsers([...users, newManager]);
    setShowManagerModal(false);
  };

  const handleOpenEditUserModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setShowEditUserModal(true);
  };

  const handleSaveEditedUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(e.target as HTMLFormElement);
    
    const updatedUser: User = {
      ...editingUser,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as UserRole,
      password: formData.get('password') as string || editingUser.password
    };

    await updateUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setShowEditUserModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = async (id: string) => {
    if (id === user.id) {
      alert("Você não pode remover sua própria conta.");
      return;
    }
    if (window.confirm('Tem certeza que deseja remover este membro da equipe?')) {
        await deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
    }
  };


  // --- Reseller Logic ---
  const handleDeleteReseller = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este revendedor?')) {
        await deleteReseller(id);
        setResellers(resellers.filter(r => r.id !== id));
        if (selectedReseller?.id === id) setSelectedReseller(null);
    }
  };

  // --- Settings / Config Logic ---
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    await updateSalonConfig(salonConfig);
    if (onConfigUpdate) onConfigUpdate();
    setSavingSettings(false);
    alert('Configurações salvas com sucesso!');
  };

  const toggleDayOpen = (dayIndex: number) => {
    const newSchedule = [...salonConfig.schedule];
    newSchedule[dayIndex].isOpen = !newSchedule[dayIndex].isOpen;
    setSalonConfig({ ...salonConfig, schedule: newSchedule });
  };

  const updateDayTime = (dayIndex: number, field: 'openTime' | 'closeTime', value: string) => {
    const newSchedule = [...salonConfig.schedule];
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], [field]: value };
    setSalonConfig({ ...salonConfig, schedule: newSchedule });
  };


  // --- SUB-COMPONENTS (MODALS) ---

  const ClientDetailsModal = () => {
    if (!selectedClient) return null;

    const clientBookings = bookings.filter(b => b.clientId === selectedClient.id);
    const clientSales = sales.filter(s => s.clientId === selectedClient.id);

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-center bg-black text-white flex-shrink-0">
            <div>
              <h3 className="text-xl font-bold">{selectedClient.name}</h3>
              <p className="text-gray-400 text-sm">ID: {selectedClient.id}</p>
            </div>
            <button onClick={() => setSelectedClient(null)}><X size={20} /></button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto flex-1">
            
            {/* Top Info Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
              <h4 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider border-b pb-2">Informações de Contato & Resumo</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="flex items-start gap-3">
                   <div className="w-10 h-10 rounded bg-yellow-100 flex items-center justify-center text-yellow-700"><Phone size={20}/></div>
                   <div>
                     <p className="text-xs text-gray-500 uppercase font-bold">Telefone</p>
                     <p className="text-gray-900 font-medium">{selectedClient.phone}</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-3">
                   <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-blue-700"><Mail size={20}/></div>
                   <div>
                     <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                     <p className="text-gray-900 font-medium">{selectedClient.email || 'N/A'}</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-3">
                   <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center text-green-700"><DollarSign size={20}/></div>
                   <div>
                     <p className="text-xs text-gray-500 uppercase font-bold">Total Gasto</p>
                     <p className="text-green-700 font-bold text-lg">{selectedClient.totalSpent.toLocaleString()} MT</p>
                   </div>
                 </div>
              </div>
              {selectedClient.lastVisit && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-600">
                   <Clock size={16} /> Última visita em: <span className="font-bold">{selectedClient.lastVisit}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Bookings History */}
               <div>
                 <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <Calendar className="text-yellow-600" size={20}/> Histórico de Agendamentos
                 </h4>
                 <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                   {clientBookings.length === 0 ? (
                     <p className="p-4 text-gray-500 text-center text-sm">Nenhum agendamento encontrado.</p>
                   ) : (
                     <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                             <th className="px-4 py-2">Data</th>
                             <th className="px-4 py-2">Serviço</th>
                             <th className="px-4 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {clientBookings.map(b => (
                             <tr key={b.id} className="text-gray-900">
                                <td className="px-4 py-2">{b.date} <br/><span className="text-gray-500 text-xs">{b.time}</span></td>
                                <td className="px-4 py-2">{b.serviceName}</td>
                                <td className="px-4 py-2">
                                   <span className={`text-xs font-bold px-2 py-1 rounded ${b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                     {b.status}
                                   </span>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                   )}
                 </div>
               </div>

               {/* Sales History */}
               <div>
                 <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <ShoppingBag className="text-blue-600" size={20}/> Histórico de Compras
                 </h4>
                 <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                   {clientSales.length === 0 ? (
                     <p className="p-4 text-gray-500 text-center text-sm">Nenhuma compra registrada.</p>
                   ) : (
                     <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                             <th className="px-4 py-2">Data</th>
                             <th className="px-4 py-2">Itens</th>
                             <th className="px-4 py-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {clientSales.map(s => (
                             <tr key={s.id} className="text-gray-900">
                                <td className="px-4 py-2 font-mono text-xs">{s.date}</td>
                                <td className="px-4 py-2">
                                  {s.items.map((i, idx) => (
                                    <div key={idx} className="text-xs mb-1">
                                      <span className="font-bold">{i.quantity}x</span> {i.name}
                                    </div>
                                  ))}
                                </td>
                                <td className="px-4 py-2 text-right font-bold text-green-700">
                                   {s.total.toLocaleString()} MT
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                   )}
                 </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const ResellerDetailsModal = () => {
      if (!selectedReseller) return null;

      return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center bg-black text-white">
                    <h3 className="text-xl font-bold">Detalhes do Revendedor</h3>
                    <button onClick={() => setSelectedReseller(null)}><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold text-2xl">
                            {selectedReseller.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-lg text-gray-900">{selectedReseller.name}</h4>
                            <p className="text-gray-500 text-sm">Registrado em: {selectedReseller.date}</p>
                        </div>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                            <Mail className="text-gray-400 w-5 h-5 mt-0.5" />
                            <div>
                                <span className="block font-bold text-gray-700">Email</span>
                                <span className="text-gray-900">{selectedReseller.email}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="text-gray-400 w-5 h-5 mt-0.5" />
                            <div>
                                <span className="block font-bold text-gray-700">Telefone</span>
                                <span className="text-gray-900">{selectedReseller.phone}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="text-gray-400 w-5 h-5 mt-0.5" />
                            <div>
                                <span className="block font-bold text-gray-700">Endereço</span>
                                <span className="text-gray-900">{selectedReseller.address}</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded border border-gray-100 mt-4">
                            <span className="block font-bold text-gray-700 mb-1">Observações / Interesses:</span>
                            <p className="text-gray-600 italic">{selectedReseller.notes || 'Nenhuma observação.'}</p>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button 
                            onClick={() => handleDeleteReseller(selectedReseller.id)}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-red-100 border border-red-100"
                        >
                            <Trash2 size={16} /> Remover Revendedor
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  };

  const NewSaleModal = () => {
    const [saleType, setSaleType] = useState<'CLIENT' | 'RESELLER'>('CLIENT');
    const [selectedItemType, setSelectedItemType] = useState<'SERVICE' | 'PRODUCT'>('SERVICE');
    const [selectedItemId, setSelectedItemId] = useState('');
    const [cart, setCart] = useState<any[]>([]);
    const [clientName, setClientName] = useState('');
    const [resellerId, setResellerId] = useState('');
    
    const addItem = () => {
      const source = selectedItemType === 'SERVICE' ? services : products;
      const item = source.find(i => i.id === selectedItemId);
      if (item) {
        setCart([...cart, { ...item, type: selectedItemType, qty: 1 }]);
      }
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const [discountType, setDiscountType] = useState<'NONE' | '5' | '10' | '20' | '25' | 'CUSTOM'>('NONE');
    const [customDiscount, setCustomDiscount] = useState(0);
    
    // Logic for Reseller Discount
    useEffect(() => {
      if (saleType === 'RESELLER') {
        if (subtotal >= 2500) {
          setDiscountType('25');
        } else {
          // If subtotal drops below 2500 for reseller, reset unless Custom is selected
          if (discountType !== 'CUSTOM') {
            setDiscountType('NONE');
          }
        }
      } else {
        // Basic logic for normal clients (suggestion)
         if (subtotal > 1000 && discountType === 'NONE') {
           // Could suggest a discount, but keeping it manual for now unless reseller
         }
      }
    }, [subtotal, saleType]);
    
    let discountAmount = 0;
    if (discountType === '5') discountAmount = subtotal * 0.05;
    if (discountType === '10') discountAmount = subtotal * 0.10;
    if (discountType === '20') discountAmount = subtotal * 0.20;
    if (discountType === '25') discountAmount = subtotal * 0.25;
    if (discountType === 'CUSTOM') discountAmount = customDiscount;

    const total = subtotal - discountAmount;
    
    const isResellerUnderLimit = saleType === 'RESELLER' && subtotal < 2500;
    const canSubmit = saleType === 'RESELLER' 
      ? (!isResellerUnderLimit || discountType === 'CUSTOM') && resellerId !== ''
      : true;

    const handleConfirmSale = async () => {
      const finalClientId = saleType === 'RESELLER' 
         ? (resellers.find(r => r.id === resellerId)?.name || 'Revendedor') + ' (Revenda)' 
         : clientName;

      const newSale: Sale = {
        id: `sale_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        items: cart.map(i => ({
          type: i.type,
          itemId: i.id,
          name: i.name,
          price: i.price,
          quantity: i.qty
        })),
        subtotal,
        discountPercentage: 0,
        discountAmount,
        total,
        processedBy: user.id,
        clientId: finalClientId
      };
      await createSale(newSale);
      setSales([newSale, ...sales]);
      setShowNewSaleModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b flex justify-between items-center bg-black text-white">
            <h3 className="text-xl font-bold">Novo Pagamento / Venda</h3>
            <button onClick={() => setShowNewSaleModal(false)}><X size={20} /></button>
          </div>
          <div className="p-6">
            
            {/* Type Toggle */}
            <div className="flex bg-gray-100 p-1 rounded mb-6">
               <button 
                 onClick={() => setSaleType('CLIENT')}
                 className={`flex-1 py-2 rounded font-bold text-sm ${saleType === 'CLIENT' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
               >
                 Cliente Final
               </button>
               <button 
                 onClick={() => setSaleType('RESELLER')}
                 className={`flex-1 py-2 rounded font-bold text-sm ${saleType === 'RESELLER' ? 'bg-yellow-500 shadow text-black' : 'text-gray-500'}`}
               >
                 Revendedor
               </button>
            </div>

            {/* Item Selection */}
            <div className="flex gap-2 mb-4">
              <select 
                className="border p-2 rounded w-1/3 text-gray-900"
                value={selectedItemType}
                onChange={(e) => { setSelectedItemType(e.target.value as any); setSelectedItemId(''); }}
              >
                <option value="SERVICE">Serviço</option>
                <option value="PRODUCT">Produto (Loja)</option>
              </select>
              <select 
                className="border p-2 rounded w-2/3 text-gray-900"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
              >
                <option value="">Selecione o Item...</option>
                {(selectedItemType === 'SERVICE' ? services : products).map(i => (
                  <option key={i.id} value={i.id}>{i.name} - {i.price} MT</option>
                ))}
              </select>
              <button onClick={addItem} className="bg-yellow-500 text-black font-bold px-4 rounded hover:bg-yellow-400">+</button>
            </div>

            <div className="border rounded p-4 min-h-[100px] mb-4 bg-gray-50">
              {cart.length === 0 ? <p className="text-gray-400 text-center">Carrinho vazio</p> : (
                <ul className="space-y-2 text-gray-900">
                  {cart.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-sm">
                      <span>{item.name} ({item.type === 'PRODUCT' ? item.id : 'Serviço'})</span>
                      <span className="font-mono">{item.price} MT</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mb-4">
              <div className="flex justify-between font-bold text-lg mb-2 text-gray-900">
                <span>Subtotal:</span>
                <span>{subtotal} MT</span>
              </div>
              
              {/* Discount Section */}
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                   <p className="text-gray-700 text-sm font-bold mb-2">Aplicar Desconto:</p>
                   <div className="flex gap-2 flex-wrap">
                     {['NONE', '5', '10', '20', '25', 'CUSTOM'].map(d => (
                       <button
                        key={d}
                        onClick={() => setDiscountType(d as any)}
                        disabled={saleType === 'RESELLER' && d !== '25' && d !== 'CUSTOM' && d !== 'NONE'}
                        className={`px-3 py-1 text-xs rounded border transition-colors ${
                           discountType === d 
                           ? 'bg-black text-yellow-500 border-black' 
                           : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'
                        } ${saleType === 'RESELLER' && d !== '25' && d !== 'CUSTOM' && d !== 'NONE' ? 'opacity-30 cursor-not-allowed' : ''}`}
                       >
                         {d === 'NONE' ? 'Sem Desconto' : d === 'CUSTOM' ? 'Personalizado' : `${d}%`}
                       </button>
                     ))}
                   </div>
                   {discountType === 'CUSTOM' && (
                     <input 
                      type="number" 
                      placeholder="Valor do desconto" 
                      className="mt-2 border p-2 w-full rounded text-gray-900"
                      value={customDiscount}
                      onChange={(e) => setCustomDiscount(Number(e.target.value))}
                     />
                   )}
                   
                   {/* Reseller Specific Messages */}
                   {saleType === 'RESELLER' && (
                     <div className="mt-3 text-xs">
                       {isResellerUnderLimit && discountType !== 'CUSTOM' ? (
                         <div className="flex items-center gap-2 text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                            <AlertTriangle size={16} />
                            <span>Mínimo para revenda: 2500 MT. Compra bloqueada.</span>
                         </div>
                       ) : subtotal >= 2500 ? (
                         <div className="text-green-700 font-bold flex items-center gap-1">
                           <CheckCircle size={14} /> Desconto de revendedor (25%) aplicado!
                         </div>
                       ) : null}
                     </div>
                   )}
              </div>
            </div>

            <div className="flex justify-between items-center text-2xl font-bold border-t pt-4 text-gray-900">
              <span>Total Final:</span>
              <span>{total.toFixed(2)} MT</span>
            </div>
            
            <div className="mt-4">
              {saleType === 'CLIENT' ? (
                <div>
                   <label className="block text-sm mb-1 text-gray-700">Nome do Cliente (Opcional)</label>
                   <input 
                    type="text" 
                    className="w-full border p-2 rounded text-gray-900" 
                    value={clientName} 
                    onChange={(e) => setClientName(e.target.value)}
                   />
                </div>
              ) : (
                <div>
                  <label className="block text-sm mb-1 text-gray-700 font-bold">Selecionar Revendedor *</label>
                  <select 
                    className="w-full border p-2 rounded text-gray-900"
                    value={resellerId}
                    onChange={(e) => setResellerId(e.target.value)}
                  >
                    <option value="">-- Selecione --</option>
                    {resellers.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.phone})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button 
              onClick={handleConfirmSale}
              disabled={!canSubmit}
              className="w-full bg-black text-yellow-500 font-bold py-3 rounded mt-6 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResellerUnderLimit && discountType !== 'CUSTOM' 
                 ? 'Mínimo de 2500 MT não atingido' 
                 : 'CONFIRMAR PAGAMENTO'
              }
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ServiceModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="p-6 border-b flex justify-between items-center bg-black text-white">
          <h3 className="text-xl font-bold">{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h3>
          <button onClick={() => setShowServiceModal(false)}><X size={20} /></button>
        </div>
        <form onSubmit={handleSaveService} className="p-6 space-y-4">
          {editingService && (
            <div>
              <label className="block text-xs font-bold text-gray-500">ID (Automático)</label>
              <input type="text" value={editingService.id} disabled className="w-full p-2 bg-gray-100 border rounded text-gray-500" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-900">Nome do Serviço</label>
            <input name="name" defaultValue={editingService?.name} required className="w-full p-2 border rounded text-gray-900" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Categoria</label>
              <select name="category" defaultValue={editingService?.category || 'Cabelo'} className="w-full p-2 border rounded text-gray-900">
                <option value="Cabelo">Cabelo</option>
                <option value="Manicure">Manicure</option>
                <option value="Pedicure">Pedicure</option>
                <option value="Estética">Estética</option>
                <option value="Spa">Spa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Preço (MT)</label>
              <input name="price" type="number" defaultValue={editingService?.price} required className="w-full p-2 border rounded text-gray-900" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Duração (minutos)</label>
            <input name="duration" type="number" defaultValue={editingService?.duration} required className="w-full p-2 border rounded text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Descrição</label>
            <textarea name="description" defaultValue={editingService?.description} className="w-full p-2 border rounded text-gray-900" rows={3} />
          </div>
          
          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Imagem do Serviço</label>
            <div className="flex items-center gap-4">
               <div className="relative w-24 h-24 bg-gray-100 border rounded overflow-hidden flex-shrink-0">
                  {serviceImagePreview ? (
                    <img src={serviceImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400"><Upload size={20} /></div>
                  )}
               </div>
               <div className="flex-1">
                 <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleServiceImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100" 
                  />
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG até 2MB</p>
               </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowServiceModal(false)} className="px-4 py-2 border rounded text-gray-600">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-black text-yellow-500 font-bold rounded">Salvar Serviço</button>
          </div>
        </form>
      </div>
    </div>
  );

  const ProductModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="p-6 border-b flex justify-between items-center bg-black text-white">
          <h3 className="text-xl font-bold">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
          <button onClick={() => setShowProductModal(false)}><X size={20} /></button>
        </div>
        <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
           {editingProduct && (
            <div>
              <label className="block text-xs font-bold text-gray-500">SKU / ID (Automático)</label>
              <input type="text" value={editingProduct.id} disabled className="w-full p-2 bg-gray-100 border rounded text-gray-500" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-900">Nome do Produto</label>
            <input name="name" defaultValue={editingProduct?.name} required className="w-full p-2 border rounded text-gray-900" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-900">Categoria</label>
              <select name="category" defaultValue={editingProduct?.category || 'Colares'} className="w-full p-2 border rounded text-gray-900">
                <option value="Colares">Colares</option>
                <option value="Brincos">Brincos</option>
                <option value="Pulseiras">Pulseiras</option>
                <option value="Anéis">Anéis</option>
                <option value="Conjuntos Completos">Conjuntos Completos</option>
                <option value="Conjuntos de Brincos">Conjuntos de Brincos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Preço (MT)</label>
              <input name="price" type="number" defaultValue={editingProduct?.price} required className="w-full p-2 border rounded text-gray-900" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Quantidade em Estoque</label>
            <input name="stock" type="number" defaultValue={editingProduct?.stock} required className="w-full p-2 border rounded text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Descrição</label>
            <textarea name="description" defaultValue={editingProduct?.description} className="w-full p-2 border rounded text-gray-900" rows={3} />
          </div>

           {/* Image Upload Section */}
           <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Imagem do Produto</label>
            <div className="flex items-center gap-4">
               <div className="relative w-24 h-24 bg-gray-100 border rounded overflow-hidden flex-shrink-0">
                  {productImagePreview ? (
                    <img src={productImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400"><Upload size={20} /></div>
                  )}
               </div>
               <div className="flex-1">
                 <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleProductImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100" 
                  />
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG até 2MB</p>
               </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 border rounded text-gray-600">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-black text-yellow-500 font-bold rounded">Salvar Produto</button>
          </div>
        </form>
      </div>
    </div>
  );
  
  const ManagerModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-sm">
        <div className="p-6 border-b flex justify-between items-center bg-black text-white">
          <h3 className="text-xl font-bold">Novo Gestor</h3>
          <button onClick={() => setShowManagerModal(false)}><X size={20} /></button>
        </div>
        <form onSubmit={handleSaveManager} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Nome do Gestor</label>
            <input name="name" type="text" required className="w-full p-2 border rounded text-gray-900" placeholder="Nome Completo" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Email</label>
            <input name="email" type="email" required className="w-full p-2 border rounded text-gray-900" placeholder="gestor@exemplo.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Senha de Acesso</label>
            <input name="password" type="password" required className="w-full p-2 border rounded text-gray-900" placeholder="******" />
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full px-4 py-2 bg-black text-yellow-500 font-bold rounded hover:bg-gray-900">
                Adicionar à Equipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const EditUserModal = () => {
    if (!editingUser) return null;
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-sm">
          <div className="p-6 border-b flex justify-between items-center bg-black text-white">
            <h3 className="text-xl font-bold">Editar Usuário</h3>
            <button onClick={() => { setShowEditUserModal(false); setEditingUser(null); }}><X size={20} /></button>
          </div>
          <form onSubmit={handleSaveEditedUser} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Nome</label>
              <input name="name" type="text" defaultValue={editingUser.name} required className="w-full p-2 border rounded text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Email</label>
              <input name="email" type="email" defaultValue={editingUser.email} required className="w-full p-2 border rounded text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Função</label>
              <select name="role" defaultValue={editingUser.role} className="w-full p-2 border rounded text-gray-900">
                <option value={UserRole.ADMIN}>ADMIN</option>
                <option value={UserRole.MANAGER}>MANAGER</option>
                <option value={UserRole.CLIENT}>CLIENT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Nova Senha (Opcional)</label>
              <input name="password" type="password" className="w-full p-2 border rounded text-gray-900" placeholder="Deixe em branco para manter" />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <button type="button" onClick={() => { setShowEditUserModal(false); setEditingUser(null); }} className="px-4 py-2 border rounded text-gray-600">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-black text-yellow-500 font-bold rounded hover:bg-gray-900">
                  Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex-shrink-0 hidden md:block">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-serif font-bold text-yellow-500">Admin Panel</h2>
          <p className="text-xs text-gray-400 mt-1">Bem-vindo, {user.name}</p>
        </div>
        <nav className="mt-6">
          {[
            { id: 'overview', icon: TrendingUp, label: 'Visão Geral' },
            { id: 'bookings', icon: Calendar, label: 'Agendamentos' },
            { id: 'clients', icon: Users, label: 'Clientes' },
            { id: 'products', icon: Package, label: 'Gestão Loja' },
            { id: 'services', icon: Scissors, label: 'Gestão Serviços' },
            // Only show sales and team to Admin
            ...(user.role === UserRole.ADMIN ? [
                { id: 'sales', icon: DollarSign, label: 'Faturamento' },
                { id: 'resellers', icon: Briefcase, label: 'Revendedores' },
                { id: 'team', icon: UserCog, label: 'Gestão de Equipe' },
                { id: 'settings', icon: Settings, label: 'Configurações' }
            ] : [])
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-900 transition-colors ${view === item.id ? 'bg-yellow-600 text-white' : 'text-gray-400'}`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 capitalize">
            {view === 'overview' ? 'Dashboard' : 
             view === 'products' ? 'Gestão de Estoque' :
             view === 'services' ? 'Gestão de Serviços' : 
             view === 'team' ? 'Gestão de Equipe' : 
             view === 'settings' ? 'Configurações' : 
             view === 'resellers' ? 'Revendedores' : view}
          </h1>
          <div className="flex gap-2">
            {/* Contextual Buttons */}
            {view === 'products' && (
               <button onClick={() => handleOpenProductModal()} className="bg-black text-white px-4 py-2 rounded shadow flex items-center gap-2 font-bold hover:bg-gray-800">
                <PlusCircle size={18} /> Novo Produto
              </button>
            )}
            {view === 'services' && (
               <button onClick={() => handleOpenServiceModal()} className="bg-black text-white px-4 py-2 rounded shadow flex items-center gap-2 font-bold hover:bg-gray-800">
                <PlusCircle size={18} /> Novo Serviço
              </button>
            )}
            {view === 'team' && user.role === UserRole.ADMIN && (
               <button onClick={() => setShowManagerModal(true)} className="bg-black text-white px-4 py-2 rounded shadow flex items-center gap-2 font-bold hover:bg-gray-800">
                <PlusCircle size={18} /> Novo Gestor
              </button>
            )}

            <button onClick={() => setShowNewSaleModal(true)} className="bg-yellow-500 text-black px-4 py-2 rounded shadow flex items-center gap-2 font-bold hover:bg-yellow-400">
              <DollarSign size={18} />
              Venda / Caixa
            </button>
            
            {user.role === UserRole.ADMIN && view !== 'settings' && view !== 'resellers' && (
               <button onClick={handleExportReport} className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded shadow hover:bg-gray-50 flex items-center gap-2">
                <Download size={18} /> Exportar Relatório
               </button>
            )}
          </div>
        </div>

        {/* Overview View */}
        {view === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {user.role === UserRole.ADMIN && (
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm">Faturamento Mensal</p>
                      <h3 className="text-2xl font-bold mt-1 text-gray-900">{totalRevenue.toLocaleString()} MT</h3>
                    </div>
                    <DollarSign className="text-yellow-500" />
                  </div>
                  <span className="text-green-500 text-xs font-bold mt-2 inline-block">+12% vs mês anterior</span>
                </div>
              )}
              
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">Total Clientes</p>
                    <h3 className="text-2xl font-bold mt-1 text-gray-900">{totalClients}</h3>
                  </div>
                  <Users className="text-blue-500" />
                </div>
              </div>

               <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">Agendamentos Hoje</p>
                    <h3 className="text-2xl font-bold mt-1 text-gray-900">{bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length}</h3>
                  </div>
                  <Calendar className="text-purple-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">Serviços Concluídos</p>
                    <h3 className="text-2xl font-bold mt-1 text-gray-900">{completedBookings}</h3>
                  </div>
                  <ShoppingBag className="text-orange-500" />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart (Admin Only) */}
              {user.role === UserRole.ADMIN && (
                <div className="bg-white p-6 rounded-lg shadow col-span-2">
                  <h3 className="font-bold text-gray-700 mb-4">Faturamento Semanal</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" fill="#eab308" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className={`${user.role === UserRole.ADMIN ? 'col-span-1' : 'col-span-3'} bg-white p-6 rounded-lg shadow`}>
                <h3 className="font-bold text-gray-700 mb-4">Serviços Populares</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {serviceDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Últimos Agendamentos</h3>
                <button onClick={() => setView('bookings')} className="text-sm text-blue-600 hover:underline">Ver Todos</button>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Cliente</th>
                    <th className="px-6 py-3">Serviço</th>
                    <th className="px-6 py-3">Data/Hora</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map(b => (
                    <tr key={b.id} className="border-b hover:bg-gray-50 text-gray-900">
                      <td className="px-6 py-4 font-medium">{b.clientName}</td>
                      <td className="px-6 py-4">{b.serviceName}</td>
                      <td className="px-6 py-4">{b.date} - {b.time}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          b.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Bookings Full Table View */}
        {view === 'bookings' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-gray-800">Todos os Agendamentos</h3>
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar cliente ou serviço..."
                        value={bookingSearchQuery}
                        onChange={(e) => setBookingSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-black focus:border-black"
                    />
                </div>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Cliente</th>
                    <th className="px-6 py-3">Serviço</th>
                    <th className="px-6 py-3">Data/Hora</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-900">
                  {bookings
                    .filter(b => 
                        b.clientName.toLowerCase().includes(bookingSearchQuery.toLowerCase()) || 
                        b.serviceName.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
                        b.id.toLowerCase().includes(bookingSearchQuery.toLowerCase())
                    )
                    .map(b => (
                    <tr key={b.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{b.id}</td>
                      <td className="px-6 py-4 font-medium">{b.clientName}</td>
                      <td className="px-6 py-4">{b.serviceName}</td>
                      <td className="px-6 py-4">{b.date} - {b.time}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          b.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bookings.filter(b => b.clientName.toLowerCase().includes(bookingSearchQuery.toLowerCase()) || b.serviceName.toLowerCase().includes(bookingSearchQuery.toLowerCase())).length === 0 && (
                     <tr><td colSpan={5} className="p-6 text-center text-gray-500">Nenhum agendamento encontrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
        )}

        {/* Clients Full Table View */}
        {view === 'clients' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-gray-800">Lista de Clientes</h3>
                
                {/* Client Filters */}
                <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                   <button 
                     onClick={() => setClientFilter('ALL')}
                     className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${clientFilter === 'ALL' ? 'bg-white text-black shadow' : 'text-gray-500 hover:text-gray-700'}`}
                   >
                     Todos
                   </button>
                   <button 
                     onClick={() => setClientFilter('SALON')}
                     className={`px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1 ${clientFilter === 'SALON' ? 'bg-white text-black shadow' : 'text-gray-500 hover:text-gray-700'}`}
                   >
                     <Scissors size={12} /> Salão
                   </button>
                   <button 
                     onClick={() => setClientFilter('STORE')}
                     className={`px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1 ${clientFilter === 'STORE' ? 'bg-white text-black shadow' : 'text-gray-500 hover:text-gray-700'}`}
                   >
                     <ShoppingBag size={12} /> Loja
                   </button>
                </div>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Telefone</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Tipo</th>
                    <th className="px-6 py-3">Total Gasto</th>
                    <th className="px-6 py-3">Última Visita</th>
                    <th className="px-6 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-gray-900">
                  {getFilteredClients().length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Nenhum cliente encontrado para este filtro.</td>
                    </tr>
                  ) : (
                    getFilteredClients().map(c => {
                      const badges = getClientBadges(c.id);
                      return (
                        <tr key={c.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-bold">{c.name}</td>
                          <td className="px-6 py-4">{c.phone}</td>
                          <td className="px-6 py-4 text-gray-600">{c.email || '-'}</td>
                          <td className="px-6 py-4">
                             <div className="flex gap-1 flex-wrap">
                               {badges.isSalon && <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-purple-100">Salão</span>}
                               {badges.isStore && <span className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-orange-100">Loja</span>}
                             </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-green-700">{c.totalSpent.toLocaleString()} MT</td>
                          <td className="px-6 py-4 text-gray-500">{c.lastVisit || 'N/A'}</td>
                          <td className="px-6 py-4">
                             <button onClick={() => setSelectedClient(c)} className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 text-xs border border-blue-200 px-2 py-1 rounded bg-blue-50">
                                <Eye size={14} /> Ver Detalhes
                             </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
        )}

        {/* Resellers Full Table View */}
        {view === 'resellers' && user.role === UserRole.ADMIN && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="font-bold text-gray-800">Lista de Revendedores</h3>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Telefone</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Desde</th>
                    <th className="px-6 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-gray-900">
                  {resellers.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum revendedor cadastrado ainda.</td>
                    </tr>
                  ) : (
                    resellers.map(r => (
                        <tr key={r.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold">{r.name}</td>
                        <td className="px-6 py-4">{r.phone}</td>
                        <td className="px-6 py-4 text-gray-600">{r.email}</td>
                        <td className="px-6 py-4 text-gray-500">{r.date}</td>
                        <td className="px-6 py-4 flex gap-2">
                            <button onClick={() => setSelectedReseller(r)} className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 text-xs border border-blue-200 px-2 py-1 rounded bg-blue-50">
                                <Eye size={14} /> Detalhes
                            </button>
                            <button onClick={() => handleDeleteReseller(r.id)} className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1 text-xs border border-red-200 px-2 py-1 rounded bg-red-50">
                                <Trash2 size={14} /> Remover
                            </button>
                        </td>
                        </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        )}

        {/* Services Table View */}
        {view === 'services' && (
           <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Todos os Serviços</h3>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                   <tr>
                     <th className="px-6 py-3">ID</th>
                     <th className="px-6 py-3">Nome</th>
                     <th className="px-6 py-3">Categoria</th>
                     <th className="px-6 py-3">Preço</th>
                     <th className="px-6 py-3">Duração</th>
                     <th className="px-6 py-3">Ações</th>
                   </tr>
                </thead>
                <tbody className="text-gray-900">
                   {services.map(s => (
                     <tr key={s.id} className="border-b hover:bg-gray-50">
                       <td className="px-6 py-4 font-mono text-xs text-gray-500">{s.id}</td>
                       <td className="px-6 py-4 font-medium">{s.name}</td>
                       <td className="px-6 py-4 text-gray-600">{s.category}</td>
                       <td className="px-6 py-4 font-bold">{s.price} MT</td>
                       <td className="px-6 py-4">{s.duration} min</td>
                       <td className="px-6 py-4">
                         <button onClick={() => handleOpenServiceModal(s)} className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
                           <Edit size={16} /> Editar
                         </button>
                       </td>
                     </tr>
                   ))}
                </tbody>
              </table>
           </div>
        )}

        {/* Products Table View */}
        {view === 'products' && (
           <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Estoque da Loja</h3>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                   <tr>
                     <th className="px-6 py-3">SKU</th>
                     <th className="px-6 py-3">Nome</th>
                     <th className="px-6 py-3">Categoria</th>
                     <th className="px-6 py-3">Preço</th>
                     <th className="px-6 py-3">Estoque</th>
                     <th className="px-6 py-3">Ações</th>
                   </tr>
                </thead>
                <tbody className="text-gray-900">
                   {products.map(p => (
                     <tr key={p.id} className="border-b hover:bg-gray-50">
                       <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.id}</td>
                       <td className="px-6 py-4 font-medium">{p.name}</td>
                       <td className="px-6 py-4 text-gray-600">{p.category}</td>
                       <td className="px-6 py-4 font-bold">{p.price} MT</td>
                       <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock < 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {p.stock} un.
                          </span>
                       </td>
                       <td className="px-6 py-4">
                         <button onClick={() => handleOpenProductModal(p)} className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
                           <Edit size={16} /> Editar
                         </button>
                       </td>
                     </tr>
                   ))}
                </tbody>
              </table>
           </div>
        )}
        
        {/* Team Management View (Admin Only) */}
        {view === 'team' && user.role === UserRole.ADMIN && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Membros da Equipe e Usuários</h3>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Função</th>
                    <th className="px-6 py-3">Acesso</th>
                    <th className="px-6 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-gray-900">
                  {users.map(u => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{u.id}</td>
                      <td className="px-6 py-4 font-bold">{u.name}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          u.role === UserRole.ADMIN ? 'bg-black text-yellow-500' :
                          u.role === UserRole.MANAGER ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                       <td className="px-6 py-4 text-xs text-gray-500">
                         {u.role === UserRole.ADMIN && 'Total'}
                         {u.role === UserRole.MANAGER && 'Dashboard (S/ Financeiro)'}
                         {u.role === UserRole.CLIENT && 'Agendamento'}
                       </td>
                       <td className="px-6 py-4 flex gap-2">
                        <button onClick={() => handleOpenEditUserModal(u)} className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1" title="Editar">
                           <Edit size={16} />
                        </button>
                        {u.id !== user.id && (
                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1" title="Remover">
                                <Trash2 size={16} />
                            </button>
                        )}
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}
        
        {/* Sales Full Table View (Admin only) */}
        {view === 'sales' && user.role === UserRole.ADMIN && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="font-bold text-gray-800">Histórico de Vendas</h3>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">ID Venda</th>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Cliente</th>
                    <th className="px-6 py-3">Itens</th>
                    <th className="px-6 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="text-gray-900">
                  {sales.map(s => (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{s.id}</td>
                      <td className="px-6 py-4">{s.date}</td>
                      <td className="px-6 py-4">{s.clientId || 'Não Registrado'}</td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                         {s.items.map(i => i.name).join(', ')}
                      </td>
                      <td className="px-6 py-4 font-bold text-green-700">{s.total.toLocaleString()} MT</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}

        {/* Settings View (Admin Only) */}
        {view === 'settings' && user.role === UserRole.ADMIN && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Configurações de Funcionamento</h3>
                  <p className="text-sm text-gray-500">Defina os dias e horários de abertura do salão.</p>
                </div>
                <button 
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="bg-black text-yellow-500 px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50"
                >
                  <Save size={18} /> {savingSettings ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-bold text-left">
                    <tr>
                      <th className="px-4 py-3">Dia da Semana</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3">Abertura</th>
                      <th className="px-4 py-3">Fechamento</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-900">
                    {salonConfig.schedule.map((day, index) => (
                      <tr key={day.dayIndex} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-4 font-medium">{day.name}</td>
                        <td className="px-4 py-4 text-center">
                          <button 
                            onClick={() => toggleDayOpen(index)}
                            className={`px-3 py-1 rounded-full text-xs font-bold w-24 ${day.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {day.isOpen ? 'ABERTO' : 'FECHADO'}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            type="time" 
                            value={day.openTime} 
                            disabled={!day.isOpen}
                            onChange={(e) => updateDayTime(index, 'openTime', e.target.value)}
                            className="border rounded p-1 text-gray-900 disabled:opacity-30"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            type="time" 
                            value={day.closeTime} 
                            disabled={!day.isOpen}
                            onChange={(e) => updateDayTime(index, 'closeTime', e.target.value)}
                            className="border rounded p-1 text-gray-900 disabled:opacity-30"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-bold text-yellow-800 mb-2">Regras de Agendamento</h4>
                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-700">Janela de Agendamento (Dias):</label>
                  <input 
                    type="number" 
                    value={salonConfig.bookingWindowDays}
                    onChange={(e) => setSalonConfig({...salonConfig, bookingWindowDays: parseInt(e.target.value)})}
                    className="border p-2 rounded w-20 text-gray-900"
                  />
                  <span className="text-xs text-gray-500">Ex: 14 (Clientes só podem agendar até 2 semanas adiante)</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Render Modals */}
      {showNewSaleModal && <NewSaleModal />}
      {showServiceModal && <ServiceModal />}
      {showProductModal && <ProductModal />}
      {showManagerModal && <ManagerModal />}
      {showEditUserModal && <EditUserModal />}
      {selectedClient && <ClientDetailsModal />}
      {selectedReseller && <ResellerDetailsModal />}
    </div>
  );
};

export default Dashboard;
