import React, { useState, useEffect } from 'react';
import { Service, User, SalonConfig } from '../types';
import { getServices, createBooking, getSalonConfig } from '../services/api';
import { Calendar, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { DEFAULT_CONFIG } from '../constants';

interface BookingSystemProps {
  currentUser: User | null;
  onSuccess?: () => void;
}

const BookingSystem: React.FC<BookingSystemProps> = ({ currentUser, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<SalonConfig>(DEFAULT_CONFIG);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Error Modal State
  const [errorModal, setErrorModal] = useState<{show: boolean, message: string}>({ show: false, message: '' });

  useEffect(() => {
    getServices().then(setServices);
    getSalonConfig().then(setConfig);
  }, []);

  // Calculate Min and Max Dates
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const maxDateObj = new Date();
  maxDateObj.setDate(today.getDate() + config.bookingWindowDays);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value;
    const dateObj = new Date(dateVal);
    const dayIndex = dateObj.getDay(); // 0 = Sunday

    const dayConfig = config.schedule.find(d => d.dayIndex === dayIndex);

    if (dayConfig && !dayConfig.isOpen) {
      // Reset date and show error
      setSelectedDate('');
      setErrorModal({ show: true, message: `O salão está fechado aos ${dayConfig.name}s. Por favor, escolha outro dia.` });
    } else {
      setSelectedDate(dateVal);
      setSelectedTime(''); // Reset time when date changes
    }
  };

  // Generate available time slots based on config and current time
  const generateTimeSlots = () => {
    if (!selectedDate) return [];

    const dateObj = new Date(selectedDate);
    const dayIndex = dateObj.getDay();
    const dayConfig = config.schedule.find(d => d.dayIndex === dayIndex);

    if (!dayConfig || !dayConfig.isOpen) return [];

    const slots = [];
    const [startHour, startMinute] = dayConfig.openTime.split(':').map(Number);
    const [endHour, endMinute] = dayConfig.closeTime.split(':').map(Number);

    // Current time for "past time" check
    const now = new Date();
    const isToday = selectedDate === now.toISOString().split('T')[0];
    const currentHour = now.getHours();

    for (let h = startHour; h < endHour; h++) {
      // If today, skip past hours
      if (isToday && h <= currentHour) continue;

      // Format hour (e.g., 09:00)
      const timeString = `${h.toString().padStart(2, '0')}:00`;
      slots.push(timeString);
    }
    
    return slots;
  };

  const availableTimes = generateTimeSlots();

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime || !customerName || !customerPhone) return;

    setLoading(true);
    
    try {
      await createBooking({
        clientId: currentUser?.id || 'guest',
        clientName: customerName,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        date: selectedDate,
        time: selectedTime,
        status: 'PENDING'
      });

      // Simulate SMS/Whatsapp trigger
      console.log(`Sending WhatsApp confirmation to ${customerPhone}...`);
      
      setSuccess(true);
      if (onSuccess) setTimeout(onSuccess, 3000);
    } catch (error) {
      console.error("Booking failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-green-50 rounded-lg border border-green-200 text-center">
        <CheckCircle size={64} className="text-green-500 mb-4" />
        <h3 className="text-2xl font-bold text-green-800 mb-2">Agendamento Confirmado!</h3>
        <p className="text-green-700 mb-4">Recebemos o seu pedido. Uma confirmação foi enviada para o seu WhatsApp/SMS.</p>
        <button onClick={() => { setSuccess(false); setStep(1); }} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Novo Agendamento
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden relative">
      
      {/* Closed Day Popup Modal */}
      {errorModal.show && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm text-center animate-bounce-in">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <X size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Data Indisponível</h3>
            <p className="text-gray-600 mb-6">{errorModal.message}</p>
            <button 
              onClick={() => setErrorModal({ show: false, message: '' })}
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 w-full font-bold"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      <div className="bg-black p-6 text-white">
        <h2 className="text-2xl font-serif font-bold">Agendar Serviço</h2>
        <p className="text-gray-400">Passo {step} de 3</p>
      </div>

      <div className="p-6">
        {step === 1 && (
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
              <span className="bg-yellow-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Escolha o Serviço
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {services.map(service => (
                <div 
                  key={service.id} 
                  onClick={() => setSelectedService(service)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all flex gap-4 ${selectedService?.id === service.id ? 'border-yellow-500 bg-yellow-50 ring-1 ring-yellow-500' : 'hover:border-gray-400 border-gray-200'}`}
                >
                  <img src={service.image} alt={service.name} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <h4 className="font-bold text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-500">{service.duration} min</p>
                    <p className="text-yellow-600 font-bold mt-1">{service.price} MT</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                disabled={!selectedService}
                onClick={() => setStep(2)}
                className="bg-black text-white px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
              <span className="bg-yellow-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              Data e Hora
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="date" 
                    min={minDate}
                    max={maxDate}
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Agendamento disponível até {new Date(maxDate).toLocaleDateString('pt-MZ')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                <div className="relative">
                   <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <select 
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    disabled={!selectedDate}
                    className="pl-10 w-full p-2 border border-gray-300 rounded focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">{selectedDate ? 'Selecione...' : 'Escolha uma data primeiro'}</option>
                    {availableTimes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                {selectedDate && availableTimes.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Sem horários disponíveis para hoje.</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(1)} className="text-gray-600 hover:text-black">Voltar</button>
              <button 
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(3)}
                className="bg-black text-white px-6 py-2 rounded disabled:opacity-50 hover:bg-gray-800"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleBooking}>
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
              <span className="bg-yellow-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              Confirmar Dados
            </h3>
            
            {/* Summary Box */}
            <div className="bg-neutral-50 p-6 rounded-lg mb-6 border-l-4 border-yellow-500 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-4 text-lg border-b border-gray-200 pb-2">Resumo do Agendamento</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 uppercase text-xs tracking-wider font-bold">Serviço</span>
                  <span className="font-bold text-gray-900 text-lg mt-1">{selectedService?.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 uppercase text-xs tracking-wider font-bold">Valor</span>
                  <span className="font-bold text-yellow-600 text-lg mt-1">{selectedService?.price} MT</span>
                </div>
                <div className="flex flex-col sm:col-span-2">
                  <span className="text-gray-500 uppercase text-xs tracking-wider font-bold">Data & Hora</span>
                  <span className="font-bold text-gray-900 text-lg mt-1 capitalize">{selectedDate} às {selectedTime}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Seu Nome</label>
                <input 
                  type="text" 
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 transition-all"
                  placeholder="Ex: Maria Santos"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Telefone (WhatsApp)</label>
                <input 
                  type="tel" 
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 transition-all"
                  placeholder="Ex: 84 123 4567"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <button type="button" onClick={() => setStep(2)} className="text-gray-600 hover:text-black font-medium">Voltar</button>
              <button 
                type="submit"
                disabled={loading || !customerName || !customerPhone}
                className="bg-black text-yellow-500 font-bold px-8 py-3 rounded shadow-lg hover:bg-gray-900 disabled:opacity-50 flex items-center gap-2 transition-transform active:scale-95"
              >
                {loading ? 'Processando...' : 'Confirmar Agendamento'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingSystem;