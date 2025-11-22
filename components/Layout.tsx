
import React, { useState } from 'react';
import { User, UserRole, SalonConfig } from '../types';
import { Menu, X, ShoppingCart, User as UserIcon, LogOut, Instagram, Calendar } from 'lucide-react';
import { APP_NAME, SOCIAL_INSTAGRAM, SOCIAL_TIKTOK } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onNavigate: (page: string) => void;
  onOpenResellerModal: () => void;
  currentPage: string;
  salonConfig?: SalonConfig;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  onLoginClick, 
  onLogoutClick, 
  onNavigate,
  onOpenResellerModal,
  currentPage,
  salonConfig
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Início' },
    { id: 'services', label: 'Serviços' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'store', label: 'Loja' },
    { id: 'contact', label: 'Contactos' },
  ];

  // Add Dashboard link if user is admin or manager
  if (currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER)) {
    navLinks.push({ id: 'dashboard', label: 'Dashboard' });
  }

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Navbar */}
      <nav className="bg-black text-white sticky top-0 z-50 border-b border-neutral-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0 cursor-pointer flex items-center gap-3 group" onClick={() => onNavigate('home')}>
              <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-xl font-serif transition-transform group-hover:scale-110">B</div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold font-serif text-white tracking-wide leading-none">{APP_NAME}</h1>
                <p className="text-[10px] text-yellow-500 uppercase tracking-[0.2em] leading-tight mt-1">Elegância & Beleza</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`${
                      currentPage === link.id 
                        ? 'text-yellow-500' 
                        : 'text-gray-400 hover:text-white transition-colors'
                    } px-2 py-2 text-sm font-medium uppercase tracking-wider relative group`}
                  >
                    {link.label}
                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500 transform origin-left transition-transform duration-300 ${currentPage === link.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-6">
               <button 
                onClick={() => onNavigate('booking')}
                className="bg-white text-black hover:bg-yellow-500 hover:text-black transition-all duration-300 px-5 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wide flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_15px_rgba(234,179,8,0.4)]"
              >
                <Calendar className="w-4 h-4" />
                Agendar
              </button>

               <button 
                 onClick={() => onNavigate('store')} 
                 className="text-gray-300 hover:text-yellow-500 transition-colors relative p-2"
                 title="Ir para a Loja"
               >
                  <ShoppingCart size={24} />
               </button>
              
              {currentUser ? (
                <div className="flex items-center gap-3 border-l border-neutral-700 pl-6">
                  <div className="flex flex-col items-end">
                     <span className="text-xs text-yellow-500 font-bold">{currentUser.name.split(' ')[0]}</span>
                     <span className="text-[10px] text-gray-500 uppercase">{currentUser.role}</span>
                  </div>
                  <button 
                    onClick={onLogoutClick}
                    className="p-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-gray-400 hover:text-red-400 transition border border-neutral-800"
                    title="Sair"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wide flex items-center gap-2 transition-all shadow-lg shadow-yellow-500/20"
                >
                  <UserIcon size={16} />
                  Entrar
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-neutral-800 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-neutral-950 border-t border-neutral-800 absolute w-full">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="text-gray-300 hover:text-yellow-500 block px-3 py-3 rounded-md text-base font-medium w-full text-left border-b border-neutral-900"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-4 grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleNavClick('booking')}
                  className="bg-white text-black block px-3 py-3 rounded-md text-center font-bold text-sm"
                >
                  Agendar
                </button>
                 {currentUser ? (
                   <button 
                   onClick={onLogoutClick}
                   className="bg-neutral-800 text-red-400 block px-3 py-3 rounded-md text-center font-bold text-sm"
                >
                  Sair
                </button>
                ) : (
                  <button 
                  onClick={onLoginClick}
                  className="bg-yellow-500 text-black block px-3 py-3 rounded-md text-center font-bold text-sm"
               >
                 Entrar
               </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white pt-16 pb-8 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold font-serif">B</div>
                <span className="text-xl font-serif font-bold tracking-wide">{APP_NAME}</span>
              </div>
              <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
                Seu destino premium para beleza e autocuidado. Transformando visuais e elevando autoestimas desde 2013.
              </p>
              <div className="flex space-x-4">
                <a href={SOCIAL_TIKTOK} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-black transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                     <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                <a href={SOCIAL_INSTAGRAM} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-black transition-all">
                  <Instagram size={20} />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-white">Links Rápidos</h3>
              <ul className="space-y-4 text-sm text-neutral-500">
                <li><button onClick={() => onNavigate('services')} className="hover:text-yellow-500 transition-colors">Nossos Serviços</button></li>
                <li><button onClick={() => onNavigate('portfolio')} className="hover:text-yellow-500 transition-colors">Portfolio</button></li>
                <li><button onClick={() => onNavigate('store')} className="hover:text-yellow-500 transition-colors">Acessórios & Semi-jóias</button></li>
                <li><button onClick={() => onNavigate('booking')} className="hover:text-yellow-500 transition-colors">Fazer Agendamento</button></li>
                <li><button onClick={onOpenResellerModal} className="hover:text-yellow-500 transition-colors">Seja Revendedor</button></li>
              </ul>
            </div>

            <div>
               <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-white">Contato</h3>
               <ul className="space-y-4 text-sm text-neutral-500">
                 <li className="flex items-center gap-3">
                   <span className="text-yellow-500"><Calendar size={16}/></span>
                   +258 84 123 4567
                 </li>
                 <li className="flex items-center gap-3">
                   <span className="text-yellow-500"><Instagram size={16}/></span>
                   contato@belosalonstore.com
                 </li>
                 <li className="flex items-start gap-3">
                   <span className="text-yellow-500 mt-1"><Menu size={16}/></span>
                   Av. Julius Nyerere, 123<br/>Maputo, Moçambique
                 </li>
               </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-white">Horário de Funcionamento</h3>
              <ul className="space-y-3 text-sm text-neutral-500">
                {salonConfig ? salonConfig.schedule.map((day, idx) => {
                   if (idx > 0 && idx < 6 && day.dayIndex !== 1) return null; // Show only Monday (as representative of weekday) and Saturday/Sunday for brevity, or just static if preferred.
                   // Let's stick to the original layout but use config data if available
                   if (day.dayIndex === 1) {
                      return (
                        <li key={day.dayIndex} className="flex justify-between border-b border-neutral-900 pb-2">
                          <span>Segunda - Sexta</span>
                          <span className="text-yellow-500 font-bold">{day.isOpen ? `${day.openTime} - ${day.closeTime}` : 'Fechado'}</span>
                        </li>
                      )
                   }
                   if (day.dayIndex === 6) {
                       return (
                        <li key={day.dayIndex} className="flex justify-between border-b border-neutral-900 pb-2">
                          <span>{day.name}</span>
                          <span className="text-yellow-500 font-bold">{day.isOpen ? `${day.openTime} - ${day.closeTime}` : 'Fechado'}</span>
                        </li>
                       )
                   }
                   if (day.dayIndex === 0) {
                       return (
                        <li key={day.dayIndex} className="flex justify-between pb-2">
                          <span>{day.name}</span>
                          <span className={`${day.isOpen ? 'text-yellow-500' : 'text-red-500'} font-bold`}>{day.isOpen ? `${day.openTime} - ${day.closeTime}` : 'Fechado'}</span>
                        </li>
                       )
                   }
                   return null;
                }) : (
                   // Fallback if no config passed yet
                   <>
                    <li className="flex justify-between border-b border-neutral-900 pb-2">
                      <span>Segunda - Sexta</span>
                      <span className="text-yellow-500 font-bold">09:00 - 18:00</span>
                    </li>
                    <li className="flex justify-between border-b border-neutral-900 pb-2">
                      <span>Sábado</span>
                      <span className="text-yellow-500 font-bold">09:00 - 15:00</span>
                    </li>
                    <li className="flex justify-between pb-2">
                      <span>Domingo</span>
                      <span className="text-red-500 font-bold">Fechado</span>
                    </li>
                   </>
                )}
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-neutral-900 text-center flex flex-col md:flex-row justify-between items-center text-xs text-neutral-600">
            <p>&copy; {new Date().getFullYear()} Belo's Salon & Store. Todos os direitos reservados.</p>
            <p className="mt-2 md:mt-0 flex items-center gap-1">Desenvolvido com <span className="text-yellow-500">▼</span> para beleza e elegância</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;