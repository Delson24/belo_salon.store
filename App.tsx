
import React, { useState, useEffect } from 'react';
import { APP_NAME, MOCK_USERS, MOCK_SERVICES, SOCIAL_TIKTOK, SOCIAL_INSTAGRAM, DEFAULT_CONFIG } from './constants';
import { User, UserRole, SalonConfig } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BookingSystem from './components/BookingSystem';
import Store from './components/Store';
import { createClient, getSalonConfig, createReseller } from './services/api';
import { Mail, Star, MapPin, Phone, Clock, Award, Users, CheckCircle, Camera, Instagram, UserPlus, LogIn, Share2, X, Briefcase, MessageSquare, Smartphone } from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  
  // Config State
  const [salonConfig, setSalonConfig] = useState<SalonConfig>(DEFAULT_CONFIG);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Auth State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginError, setLoginError] = useState('');
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Welcome Popup State
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  // Reseller Modal State
  const [showResellerModal, setShowResellerModal] = useState(false);
  const [resellerForm, setResellerForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' });
  
  // Reseller Verification State
  const [isVerifyingReseller, setIsVerifyingReseller] = useState(false);
  const [resellerVerificationCode, setResellerVerificationCode] = useState('');
  const [inputResellerCode, setInputResellerCode] = useState('');
  const [resellerSuccess, setResellerSuccess] = useState(false);

  // Load Data
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem('welcomeShown')) {
        setShowWelcomePopup(true);
        sessionStorage.setItem('welcomeShown', 'true');
      }
    }, 1500);
    
    getSalonConfig().then(setSalonConfig);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock auth logic
    // Find user with matching email AND password
    let foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      setUser(foundUser);
      setShowLoginModal(false);
      setLoginError('');
      if (foundUser.role === UserRole.ADMIN || foundUser.role === UserRole.MANAGER) {
        setCurrentPage('dashboard');
      }
    } else {
      setLoginError('Credenciais inválidas. Verifique email e senha.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (regPassword !== regConfirmPassword) {
      setLoginError('As senhas não coincidem.');
      return;
    }

    try {
      // Create new client structure
      const newClient = {
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword
      };

      // Call API to save client (Simulated)
      const createdClient = await createClient(newClient);

      // Automatically log the user in
      const newUserUser: User = {
        id: createdClient.id,
        name: createdClient.name,
        email: createdClient.email || '',
        role: UserRole.CLIENT,
        password: regPassword
      };

      // Add to mock users list for this session so re-login works
      MOCK_USERS.push(newUserUser);

      setUser(newUserUser);
      setShowLoginModal(false);
      setAuthMode('login'); // Reset for next time
      
      // Clear form
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegConfirmPassword('');

    } catch (error) {
      setLoginError('Erro ao criar conta. Tente novamente.');
    }
  };

  // Step 1: Initiate Reseller Registration (Send SMS)
  const handleResellerPreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setResellerVerificationCode(code);
    
    // Simulate Sending SMS
    // In a real app, this would call an API endpoint
    console.log(`SMS SENT TO ${resellerForm.phone}: ${code}`);
    alert(`SIMULAÇÃO SMS para ${resellerForm.phone}:\n\nSeu código de verificação Belo Salon é: ${code}`);
    
    setIsVerifyingReseller(true);
  };

  // Step 2: Verify Code and Create Account
  const handleResellerVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputResellerCode === resellerVerificationCode) {
        await createReseller(resellerForm);
        setResellerSuccess(true);
        
        // Reset everything after delay
        setTimeout(() => {
           setShowResellerModal(false);
           setResellerSuccess(false);
           setIsVerifyingReseller(false);
           setResellerForm({ name: '', email: '', phone: '', address: '', notes: '' });
           setInputResellerCode('');
        }, 3000);
    } else {
        alert('Código de verificação inválido. Tente novamente.');
    }
  };

  const handleResellerModalClose = () => {
    setShowResellerModal(false);
    setIsVerifyingReseller(false);
    setResellerSuccess(false);
    setInputResellerCode('');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const openLogin = () => {
    setAuthMode('login');
    setLoginError('');
    setShowLoginModal(true);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        if (user && (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER)) {
          return <Dashboard user={user} onConfigUpdate={() => getSalonConfig().then(setSalonConfig)} />;
        }
        return <div className="p-10 text-center">Acesso Negado. Faça login como Admin.</div>;
      
      case 'booking':
        return (
          <div className="py-12 px-4 bg-neutral-100 min-h-[80vh]">
             <BookingSystem currentUser={user} onSuccess={() => setCurrentPage('home')} />
          </div>
        );
      
      case 'store':
        return (
          <div className="bg-neutral-50 min-h-screen">
            <Store 
              onAddToCart={(p) => alert(`Produto ${p.name} adicionado! (Carrinho Mock)`)} 
              onOpenResellerModal={() => setShowResellerModal(true)}
            />
          </div>
        );

      case 'services':
        return (
           <div className="bg-white py-16">
             <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-5xl font-serif font-bold mb-4 text-gray-900">Nossos Serviços</h2>
                  <div className="w-24 h-1 bg-yellow-500 mx-auto mb-6"></div>
                  <p className="text-gray-500 max-w-2xl mx-auto">
                    Oferecemos uma ampla gama de serviços de beleza com profissionais qualificados e produtos de alta qualidade.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {MOCK_SERVICES.map(service => (
                     <div key={service.id} className="bg-white rounded-none overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                        <div className="relative h-64 overflow-hidden">
                          <img src={service.image} alt={service.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                          <div className="absolute bottom-4 left-4">
                            <h3 className="text-white font-serif text-2xl font-bold drop-shadow-md">{service.name}</h3>
                          </div>
                        </div>
                        <div className="p-8">
                           <p className="text-gray-600 mb-6 h-12 line-clamp-2">{service.description}</p>
                           
                           <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                              <Clock size={16} />
                              <span>{service.duration} min</span>
                           </div>

                           <div className="flex justify-between items-end border-t border-gray-100 pt-6">
                             <div className="flex flex-col">
                               <span className="text-xs text-gray-400 uppercase tracking-wider">Preço</span>
                               <span className="text-yellow-600 font-bold text-2xl">{service.price} MT</span>
                             </div>
                             <button 
                               onClick={() => setCurrentPage('booking')} 
                               className="bg-black text-white px-6 py-2 rounded-sm text-sm font-bold hover:bg-neutral-800 transition-colors"
                             >
                               Agendar
                             </button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           </div>
        );

      case 'portfolio':
        return (
          <div className="bg-white min-h-screen">
            {/* Portfolio Header */}
            <div className="bg-black text-white py-20 px-4 text-center">
               <h2 className="text-5xl font-serif font-bold mb-4">Nosso Portfólio</h2>
               <div className="w-24 h-1 bg-yellow-500 mx-auto mb-6"></div>
               <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
                 Conheça nosso espaço luxuoso e veja alguns dos nossos trabalhos realizados com excelência.
               </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
               {/* Section: The Salon */}
               <div>
                  <h3 className="text-3xl font-serif font-bold mb-8 text-gray-900 border-l-4 border-yellow-500 pl-4">O Nosso Espaço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="h-96 overflow-hidden rounded-sm group relative">
                        <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Salon Interior" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute bottom-0 left-0 bg-black/60 text-white px-6 py-3 w-full">
                           <p className="font-serif font-bold text-lg">Recepção & Lounge</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="h-44 md:h-full overflow-hidden rounded-sm group relative">
                           <img src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Interior Detail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        <div className="h-44 md:h-full overflow-hidden rounded-sm group relative">
                           <img src="https://images.unsplash.com/photo-1521590832169-7dad1a9976cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Chairs" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        <div className="h-44 md:h-full overflow-hidden rounded-sm group relative col-span-2">
                           <img src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Product Display" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Section: Our Work */}
               <div>
                  <h3 className="text-3xl font-serif font-bold mb-8 text-gray-900 border-l-4 border-yellow-500 pl-4">Resultados & Arte</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                     {[
                        { img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', label: 'Corte & Cor' },
                        { img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', label: 'Nail Art' },
                        { img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', label: 'Maquiagem Social' },
                        { img: 'https://images.unsplash.com/photo-1595476104699-d56d4173e684?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', label: 'Penteado' },
                        { img: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', label: 'Estética' },
                        { img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', label: 'Tratamento Capilar' },
                        { img: 'https://images.unsplash.com/photo-1632345031435-8727f6897693?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', label: 'Pedicure Spa' },
                        { img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', label: 'Design de Olhar' },
                     ].map((item, idx) => (
                        <div key={idx} className="relative group overflow-hidden rounded-sm aspect-[4/5]">
                           <img src={item.img} alt={item.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <span className="text-white border border-white px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-widest text-xs font-bold">
                                 {item.label}
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>
                  
                  <div className="text-center mt-12 flex justify-center gap-6">
                     <a 
                        href={SOCIAL_INSTAGRAM} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-black border-b-2 border-yellow-500 pb-1 hover:text-yellow-600 font-bold transition-colors"
                     >
                        <Instagram size={18} />
                        Instagram
                     </a>
                     <a 
                        href={SOCIAL_TIKTOK} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-black border-b-2 border-yellow-500 pb-1 hover:text-yellow-600 font-bold transition-colors"
                     >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                           <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                        TikTok
                     </a>
                  </div>
               </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="bg-white min-h-[80vh] flex flex-col">
            <div className="max-w-7xl mx-auto px-4 py-16 w-full grid md:grid-cols-2 gap-12 items-center">
             <div>
               <h2 className="text-4xl font-serif font-bold mb-6 text-gray-900">Onde Estamos</h2>
               <div className="w-16 h-1 bg-yellow-500 mb-8"></div>
               <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                 Venha nos visitar e relaxar em nosso ambiente luxuoso. Estamos localizados no coração de Maputo, prontos para lhe oferecer a melhor experiência.
               </p>
               
               <div className="space-y-8">
                 <div className="flex items-start gap-5">
                   <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-yellow-600 w-6 h-6" />
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-900 text-lg mb-1">Endereço</h4>
                     <p className="text-gray-600">Av. Julius Nyerere, Polana Cimento A<br/>Maputo, Moçambique</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-5">
                   <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                      <Phone className="text-yellow-600 w-6 h-6" />
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-900 text-lg mb-1">Contacto</h4>
                     <p className="text-gray-600">+258 84 123 4567</p>
                     <p className="text-gray-500 text-sm">contato@belosalonstore.com</p>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-5">
                   <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                      <Clock className="text-yellow-600 w-6 h-6" />
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-900 text-lg mb-1">Horário de Funcionamento</h4>
                     <p className="text-gray-600">Segunda - Sexta: 09:00 - 18:00</p>
                     <p className="text-gray-600">Sábado: 09:00 - 15:00</p>
                     <button onClick={() => setShowScheduleModal(true)} className="text-yellow-600 font-bold text-sm underline mt-1 hover:text-yellow-700">
                       Ver horário completo
                     </button>
                   </div>
                 </div>

                 {/* Social Media Section */}
                 <div className="flex items-start gap-5">
                   <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                      <Share2 className="text-yellow-600 w-6 h-6" />
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-900 text-lg mb-1">Redes Sociais</h4>
                     <div className="flex gap-4 mt-2">
                        <a href={SOCIAL_INSTAGRAM} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 font-bold transition-colors">
                           <Instagram size={20}/> Instagram
                        </a>
                        <a href={SOCIAL_TIKTOK} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 font-bold transition-colors">
                           {/* TikTok Icon (SVG Path) */}
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                           </svg>
                           TikTok
                        </a>
                     </div>
                   </div>
                 </div>

               </div>
             </div>
             <div className="bg-neutral-100 rounded-lg h-[500px] flex items-center justify-center text-gray-400 border border-neutral-200 shadow-inner overflow-hidden relative group">
               {/* Simulated Map Background */}
               <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/32.5892,-25.9692,14,0/600x600?access_token=pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2pwY3BjaXlzMDJ6NjNwcW15Y3V2YjVlZSJ9.xxxx')] bg-cover bg-center opacity-50 grayscale group-hover:grayscale-0 transition-all"></div>
               <div className="z-10 text-center p-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
                 <MapPin size={48} className="mx-auto mb-4 text-red-500 animate-bounce" />
                 <p className="font-bold text-gray-800">[Mapa Google Maps Integrado]</p>
                 <p className="text-xs text-gray-500 mt-2">Av. Julius Nyerere, Maputo</p>
                 <button className="mt-4 bg-blue-600 text-white text-xs px-4 py-2 rounded hover:bg-blue-700 transition">
                    Ver Rotas
                 </button>
               </div>
             </div>
          </div>
          </div>
        );

      case 'home':
      default:
        return (
          <div>
            {/* Hero Section */}
            <div className="relative h-[700px] bg-black text-white overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                alt="Hero" 
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-10 pt-20">
                 <div className="w-20 h-20 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-4xl font-serif mb-8 shadow-lg shadow-yellow-500/30 animate-fade-in-up">
                    B
                 </div>
                <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight animate-fade-in-up animation-delay-200">
                  Belo's Salon & Store <br/> 
                  <span className="text-yellow-500 font-light italic">acessórios e semi-jóias</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl animate-fade-in-up animation-delay-400 font-light">
                  Seu destino para beleza, elegância e cuidado profissional. Serviços de alta qualidade e loja de acessórios e semi-jóias exclusivas.
                </p>
                <div className="flex flex-col md:flex-row gap-4 animate-fade-in-up animation-delay-600">
                  <button 
                    onClick={() => setCurrentPage('booking')}
                    className="bg-yellow-500 text-black px-8 py-4 rounded-sm font-bold text-lg hover:bg-yellow-400 transition transform hover:-translate-y-1 shadow-lg"
                  >
                    Agendar Agora
                  </button>
                  <button 
                    onClick={() => setCurrentPage('store')}
                    className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-sm font-bold text-lg hover:bg-white hover:text-black transition transform hover:-translate-y-1"
                  >
                    Visitar Loja
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Section (Black Background) */}
            <div className="bg-black py-24 border-b border-neutral-900">
               <div className="max-w-7xl mx-auto px-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                     <div className="group">
                        <div className="w-20 h-20 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-6 group-hover:border-yellow-500 transition-colors duration-300">
                           <Users className="text-yellow-500 w-8 h-8" />
                        </div>
                        <h3 className="text-4xl font-serif font-bold text-white mb-2">500+</h3>
                        <p className="text-gray-500 uppercase text-xs tracking-widest">Clientes Satisfeitos</p>
                     </div>
                     <div className="group">
                        <div className="w-20 h-20 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-6 group-hover:border-yellow-500 transition-colors duration-300">
                           <Star className="text-yellow-500 w-8 h-8" />
                        </div>
                        <h3 className="text-4xl font-serif font-bold text-white mb-2">5.0</h3>
                        <p className="text-gray-500 uppercase text-xs tracking-widest">Avaliação Média</p>
                     </div>
                     <div className="group">
                        <div className="w-20 h-20 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-6 group-hover:border-yellow-500 transition-colors duration-300">
                           <Award className="text-yellow-500 w-8 h-8" />
                        </div>
                        <h3 className="text-4xl font-serif font-bold text-white mb-2">10+</h3>
                        <p className="text-gray-500 uppercase text-xs tracking-widest">Anos de Experiência</p>
                     </div>
                     <div className="group">
                        <div className="w-20 h-20 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-6 group-hover:border-yellow-500 transition-colors duration-300">
                           <Clock className="text-yellow-500 w-8 h-8" />
                        </div>
                        <h3 className="text-4xl font-serif font-bold text-white mb-2">98%</h3>
                        <p className="text-gray-500 uppercase text-xs tracking-widest">Pontualidade</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Services Preview Section */}
            <div className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-4">
                 <div className="text-center mb-16">
                    <h2 className="text-5xl font-serif font-bold mb-4 text-gray-900">Nossos Serviços</h2>
                    <div className="w-24 h-1 bg-yellow-500 mx-auto mb-6"></div>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light">
                       Oferecemos uma ampla gama de serviços de beleza com profissionais qualificados e produtos de alta qualidade
                    </p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {MOCK_SERVICES.slice(0, 3).map(service => (
                     <div key={service.id} className="group cursor-pointer" onClick={() => setCurrentPage('booking')}>
                        <div className="relative h-80 overflow-hidden rounded-sm mb-6">
                           <img 
                              src={service.image} 
                              alt={service.name} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80"></div>
                           <div className="absolute bottom-6 left-6">
                              <h3 className="text-white font-serif text-2xl font-bold">{service.name}</h3>
                           </div>
                        </div>
                        <div className="px-2">
                           <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                           
                           <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                              <span className="flex items-center gap-1"><Clock size={14}/> {service.duration} min</span>
                           </div>

                           <div className="flex justify-between items-center">
                             <span className="text-yellow-600 font-bold text-2xl">{service.price} MT</span>
                             <button className="text-black font-bold text-sm border-b-2 border-yellow-500 hover:text-yellow-600 transition-colors pb-1 uppercase tracking-wide">
                               Agendar Serviço
                             </button>
                           </div>
                        </div>
                     </div>
                   ))}
                 </div>

                 <div className="text-center mt-16">
                    <button 
                      onClick={() => setCurrentPage('services')}
                      className="border-2 border-black text-black px-10 py-3 rounded-sm font-bold hover:bg-black hover:text-white transition-colors uppercase tracking-widest text-sm"
                    >
                       Ver Todos os Serviços
                    </button>
                 </div>
              </div>
            </div>

            {/* Newsletter Section - Styled like 'Fique por Dentro' */}
            <div className="bg-black py-24 relative overflow-hidden">
              {/* Background dots pattern simulation */}
              <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
              
              <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                <div className="w-20 h-20 bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-8 text-yellow-500 border border-yellow-500/30">
                   <Mail size={36} />
                </div>
                
                <h2 className="text-5xl font-serif font-bold text-white mb-6">Fique por Dentro!</h2>
                
                <p className="text-gray-400 mb-12 text-lg max-w-2xl mx-auto font-light">
                  Inscreva-se em nossa newsletter e receba novidades, promoções exclusivas e dicas de beleza diretamente no seu e-mail.
                </p>
                
                <form className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <input 
                    type="text" 
                    placeholder="Seu Nome" 
                    className="bg-neutral-900/80 border border-neutral-800 text-white px-6 py-4 rounded-md focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                  />
                  <input 
                    type="email" 
                    placeholder="Seu Email" 
                    className="bg-neutral-900/80 border border-neutral-800 text-white px-6 py-4 rounded-md focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                  />
                </form>
                
                <button className="bg-yellow-500 text-black px-12 py-4 rounded-md font-bold text-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-900/20 w-full md:w-auto">
                   Inscrever-se Agora
                </button>

                <p className="text-neutral-600 text-xs mt-6">
                   Ao se inscrever, você concorda em receber emails do {APP_NAME}. Você pode cancelar a qualquer momento.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout 
      currentUser={user} 
      onLoginClick={openLogin} 
      onLogoutClick={handleLogout}
      onNavigate={setCurrentPage}
      onOpenResellerModal={() => setShowResellerModal(true)}
      currentPage={currentPage}
      salonConfig={salonConfig}
    >
      {renderContent()}

      {/* Full Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up">
            <div className="bg-black text-white p-5 flex justify-between items-center">
              <h3 className="font-bold text-lg font-serif">Horário de Funcionamento</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                 {salonConfig.schedule.map((day) => (
                    <li key={day.dayIndex} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0">
                       <span className="font-medium text-gray-700 text-sm">{day.name}</span>
                       {day.isOpen ? (
                         <span className="text-gray-900 font-bold text-sm">{day.openTime} - {day.closeTime}</span>
                       ) : (
                         <span className="text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded">Fechado</span>
                       )}
                    </li>
                 ))}
              </ul>
              <button onClick={() => setShowScheduleModal(false)} className="w-full bg-yellow-500 text-black font-bold py-3 rounded-sm mt-6 hover:bg-yellow-400 uppercase text-sm tracking-wider">
                 Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reseller Registration Modal */}
      {showResellerModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-sm">
           <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden relative">
             <button onClick={handleResellerModalClose} className="absolute top-4 right-4 text-white hover:text-gray-300"><X size={24}/></button>
             <div className="bg-black p-8 text-white">
               <div className="w-16 h-16 bg-yellow-500 text-black rounded-full flex items-center justify-center mb-4 font-bold mx-auto">
                 <Briefcase size={32} />
               </div>
               <h2 className="text-2xl font-serif font-bold text-center">Seja um Revendedor</h2>
               <p className="text-center text-gray-400 text-sm mt-2">Junte-se à nossa equipe de sucesso e revenda nossos produtos exclusivos.</p>
             </div>
             
             {resellerSuccess ? (
               <div className="p-10 text-center">
                 <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                 <h3 className="text-2xl font-bold text-gray-900 mb-2">Cadastro Confirmado!</h3>
                 <p className="text-gray-600">Sua conta foi verificada e seus dados foram enviados para nossa equipe.</p>
               </div>
             ) : isVerifyingReseller ? (
                // Verification SMS Step
                <form onSubmit={handleResellerVerification} className="p-8 space-y-6">
                   <div className="text-center mb-4">
                      <Smartphone size={32} className="mx-auto text-gray-400 mb-2" />
                      <h3 className="text-lg font-bold text-gray-900">Verificação de Telefone</h3>
                      <p className="text-sm text-gray-500">Enviamos um código por SMS para <span className="font-bold text-black">{resellerForm.phone}</span></p>
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-center">Código de Verificação</label>
                      <input 
                        required
                        type="text" 
                        value={inputResellerCode}
                        onChange={e => setInputResellerCode(e.target.value)}
                        className="w-full border-b-2 border-gray-300 p-3 text-center text-2xl tracking-[0.5em] font-bold focus:border-yellow-500 outline-none bg-white text-black"
                        placeholder="000000"
                        maxLength={6}
                      />
                   </div>

                   <button type="submit" className="w-full bg-yellow-500 text-black font-bold py-4 rounded hover:bg-yellow-400 transition uppercase tracking-wide text-sm">
                     Confirmar Código
                   </button>
                   
                   <button 
                     type="button"
                     onClick={() => setIsVerifyingReseller(false)} 
                     className="w-full text-gray-400 font-bold text-xs uppercase tracking-wide hover:text-black mt-4"
                   >
                     Voltar / Corrigir Dados
                   </button>
                </form>
             ) : (
               // Initial Data Form
               <form onSubmit={handleResellerPreSubmit} className="p-8 space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                   <input 
                     required
                     type="text" 
                     value={resellerForm.name}
                     onChange={e => setResellerForm({...resellerForm, name: e.target.value})}
                     className="w-full border border-gray-300 p-3 rounded focus:ring-black focus:border-black text-black bg-white"
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                      <input 
                        required
                        type="email" 
                        value={resellerForm.email}
                        onChange={e => setResellerForm({...resellerForm, email: e.target.value})}
                        className="w-full border border-gray-300 p-3 rounded focus:ring-black focus:border-black text-black bg-white"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
                      <input 
                        required
                        type="tel" 
                        value={resellerForm.phone}
                        onChange={e => setResellerForm({...resellerForm, phone: e.target.value})}
                        className="w-full border border-gray-300 p-3 rounded focus:ring-black focus:border-black text-black bg-white"
                      />
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Endereço / Localização</label>
                   <input 
                     required
                     type="text" 
                     value={resellerForm.address}
                     onChange={e => setResellerForm({...resellerForm, address: e.target.value})}
                     className="w-full border border-gray-300 p-3 rounded focus:ring-black focus:border-black text-black bg-white"
                     placeholder="Cidade, Bairro..."
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Observações / Interesse</label>
                   <textarea 
                     value={resellerForm.notes}
                     onChange={e => setResellerForm({...resellerForm, notes: e.target.value})}
                     className="w-full border border-gray-300 p-3 rounded focus:ring-black focus:border-black text-black bg-white"
                     rows={3}
                     placeholder="Conte-nos um pouco sobre sua experiência ou interesse..."
                   />
                 </div>
                 <button type="submit" className="w-full bg-black text-yellow-500 font-bold py-4 rounded hover:bg-gray-900 transition uppercase tracking-wide text-sm flex items-center justify-center gap-2">
                   <MessageSquare size={16} /> Verificar e Cadastrar
                 </button>
               </form>
             )}
           </div>
        </div>
      )}

      {/* Auth Modal (Login / Register) */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-sm p-10 w-full max-w-md relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowLoginModal(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              ✕
            </button>
            
            <div className="text-center mb-8">
               <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 font-serif font-bold text-xl">B</div>
               <h2 className="text-3xl font-serif font-bold text-gray-900">
                 {authMode === 'login' ? 'Bem-vindo de volta' : 'Criar Nova Conta'}
               </h2>
               <p className="text-gray-500 text-sm mt-2">
                 {authMode === 'login' 
                   ? 'Acesse sua conta para gerenciar agendamentos' 
                   : 'Preencha seus dados para se registrar'
                 }
               </p>
            </div>
            
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-sm focus:ring-black focus:border-black transition-all bg-white text-black placeholder-gray-500"
                    placeholder="ex: admin@belosalon.store"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Senha</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-sm focus:ring-black focus:border-black transition-all bg-white text-black placeholder-gray-500"
                    placeholder="******"
                    required
                  />
                </div>
                
                {loginError && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-sm border border-red-100 flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div>{loginError}</div>}

                <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-sm hover:bg-neutral-800 transition-all transform active:scale-95 uppercase tracking-wide text-sm flex items-center justify-center gap-2">
                  <LogIn size={18} /> Entrar na Conta
                </button>

                <div className="text-center mt-4">
                  <p className="text-gray-500 text-sm">
                    Não tem conta?{' '}
                    <button type="button" onClick={() => setAuthMode('register')} className="text-yellow-600 font-bold hover:underline">
                      Criar agora
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome Completo</label>
                  <input 
                    type="text" 
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-sm focus:ring-black focus:border-black transition-all bg-white text-black placeholder-gray-500"
                    placeholder="Seu nome"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                  <input 
                    type="email" 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-sm focus:ring-black focus:border-black transition-all bg-white text-black placeholder-gray-500"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Telefone</label>
                  <input 
                    type="tel" 
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-sm focus:ring-black focus:border-black transition-all bg-white text-black placeholder-gray-500"
                    placeholder="84 123 4567"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Senha</label>
                    <input 
                      type="password" 
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full border border-gray-300 p-3 rounded-sm focus:ring-black focus:border-black transition-all bg-white text-black placeholder-gray-500"
                      placeholder="******"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirmar</label>
                    <input 
                      type="password" 
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full border border-gray-300 p-3 rounded-sm focus:ring-black focus:border-black transition-all bg-white text-black placeholder-gray-500"
                      placeholder="******"
                      required
                    />
                  </div>
                </div>
                
                {loginError && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-sm border border-red-100 flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div>{loginError}</div>}

                <button type="submit" className="w-full bg-black text-yellow-500 font-bold py-4 rounded-sm hover:bg-gray-900 transition-all transform active:scale-95 uppercase tracking-wide text-sm flex items-center justify-center gap-2">
                  <UserPlus size={18} /> Criar Conta
                </button>

                <div className="text-center mt-4">
                  <p className="text-gray-500 text-sm">
                    Já tem conta?{' '}
                    <button type="button" onClick={() => setAuthMode('login')} className="text-yellow-600 font-bold hover:underline">
                      Entrar
                    </button>
                  </p>
                </div>
              </form>
            )}
            
            {authMode === 'login' && (
              <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
                <p className="mb-2">Contas de Demonstração (Senha: 123):</p>
                <div className="space-y-1 font-mono bg-gray-50 p-2 rounded">
                  <p>Admin: admin@belosalon.store</p>
                  <p>Gestor: gestor@belosalon.store</p>
                  <p>Cliente: cliente@gmail.com</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Welcome Popup */}
      {showWelcomePopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] backdrop-blur-sm">
           <div className="bg-white rounded-lg p-8 max-w-md text-center relative animate-bounce-in shadow-2xl border-t-4 border-yellow-500">
             <button onClick={() => setShowWelcomePopup(false)} className="absolute top-2 right-2 text-gray-400 hover:text-black">✕</button>
             <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600 ring-4 ring-yellow-100">
               <Star size={32} fill="currentColor" />
             </div>
             <h3 className="text-2xl font-serif font-bold mb-2 text-gray-900">Bem-vindo ao {APP_NAME}!</h3>
             <p className="text-gray-600 mb-8 leading-relaxed">Prepare-se para realçar a sua beleza. Confira nossa nova coleção de acessórios e semi-jóias e aproveite descontos exclusivos!</p>
             <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setShowWelcomePopup(false); setCurrentPage('store'); }}
                  className="bg-black text-white px-4 py-3 rounded-md font-bold hover:bg-neutral-800 text-sm transition-colors"
                >
                  Ver Loja
                </button>
                 <button 
                  onClick={() => { setShowWelcomePopup(false); setCurrentPage('booking'); }}
                  className="bg-yellow-500 text-black px-4 py-3 rounded-md font-bold hover:bg-yellow-400 text-sm transition-colors"
                >
                  Agendar Agora
                </button>
             </div>
           </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
