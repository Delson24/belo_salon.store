
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { getProducts } from '../services/api';
import { Search, Filter, ShoppingCart, Tag, Briefcase } from 'lucide-react';

interface StoreProps {
  onAddToCart: (product: Product) => void;
  onOpenResellerModal: () => void;
}

const Store: React.FC<StoreProps> = ({ onAddToCart, onOpenResellerModal }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Dark Header Section */}
      <div className="bg-black text-white py-24 px-4 relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div className="max-w-7xl mx-auto text-center relative z-10">
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">Acessórios & Semi-jóias</h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto mb-6"></div>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light mb-10">
              Coleção exclusiva de acessórios e semi-jóias elegantes em ouro, prata e pedras naturais. Peças únicas para realçar sua beleza
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="inline-flex items-center gap-3 px-6 py-3 border border-yellow-500/50 rounded-full bg-yellow-500/10 backdrop-blur-sm">
                 <Tag className="text-yellow-500" size={20} />
                 <span className="text-yellow-500 font-bold text-sm tracking-wide uppercase">
                   Desconto especial acima de 1000 MT!
                 </span>
              </div>

              <button 
                onClick={onOpenResellerModal}
                className="inline-flex items-center gap-3 px-6 py-3 border border-white/30 rounded-full hover:bg-white hover:text-black transition-all duration-300 group"
              >
                 <Briefcase size={20} className="group-hover:text-yellow-600 transition-colors" />
                 <span className="font-bold text-sm tracking-wide uppercase">
                   Torne-se um Revendedor
                 </span>
              </button>
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        {/* Filters & Search Bar */}
        <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100 mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
             
             {/* Filter Title + Buttons */}
             <div className="w-full lg:w-auto">
                <div className="flex items-center gap-2 mb-3 text-yellow-600 font-bold uppercase text-xs tracking-widest">
                   <Filter size={16} />
                   Filtrar por categoria:
                </div>
                <div className="flex flex-wrap gap-2">
                   {categories.map(cat => (
                     <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-4 py-2 rounded-sm text-sm font-medium transition-all duration-300 ${
                        filterCategory === cat 
                        ? 'bg-yellow-500 text-black shadow-md transform -translate-y-0.5' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                      }`}
                     >
                       {cat === 'all' ? 'Todos os Produtos' : cat}
                     </button>
                   ))}
                </div>
             </div>

             {/* Search */}
             <div className="w-full lg:w-1/3 relative">
                <input 
                   type="text" 
                   placeholder="Buscar produto (Ex: Colar, Ouro)..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none bg-gray-50"
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
             </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white group">
              <div className="relative h-80 overflow-hidden bg-gray-100 mb-4">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Quick Action Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center bg-gradient-to-t from-black/50 to-transparent">
                   <button 
                    onClick={() => onAddToCart(product)}
                    className="w-full bg-black text-white py-3 font-bold text-sm uppercase tracking-wider hover:bg-yellow-500 hover:text-black transition-colors flex items-center justify-center gap-2"
                   >
                     <ShoppingCart size={16} /> Adicionar ao Carrinho
                   </button>
                </div>
                
                {product.stock < 5 && (
                   <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                      Poucas Unidades
                   </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-1 group-hover:text-yellow-600 transition-colors truncate">{product.name}</h3>
                <p className="text-gray-500 text-xs mb-3 line-clamp-2 h-8">{product.description}</p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                   <span className="text-xl font-bold text-yellow-600">{product.price} MT</span>
                   <span className="text-xs text-gray-400">Estoque: {product.stock}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado com estes filtros.</p>
            <button onClick={() => {setFilterCategory('all'); setSearchQuery('')}} className="mt-4 text-yellow-600 underline font-bold">Limpar Filtros</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Store;
