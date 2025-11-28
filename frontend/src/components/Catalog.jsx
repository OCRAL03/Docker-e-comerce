import React, { useEffect, useState } from 'react';
import { get } from '../lib/api';
import { useToast } from '../lib/toast.jsx';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const getLockFromId = (id) => {
  if (!id) return 1;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 1000);
};

const getProductImage = (category, id) => {
  const categoryMap = {
    'Electrónica': 'laptop,tech',
    'Accesorios': 'keyboard,mouse',
    'Monitores': 'monitor,screen',
    'Muebles': 'chair,office',
    'Mobiliario': 'chair,desk',
    'Audio': 'headphones',
    'Móviles': 'smartphone'
  };
  const keyword = categoryMap[category] || 'technology';
  const lockId = getLockFromId(id);
  return `https://loremflickr.com/400/300/${keyword}?lock=${lockId}`;
};

export default function Catalog({ onAddToCart }){
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const categories = ["Todos", "Electrónica", "Accesorios", "Monitores", "Mobiliario", "Audio", "Móviles"];
  const [activeCategory, setActiveCategory] = useState("Todos");
  const toast = useToast();
  const loadProducts = async (cat) => {
    setLoading(true);
    try {
      const endpoint = cat === 'Todos' ? '/products' : `/products?category=${encodeURIComponent(cat)}`;
      const r = await get(endpoint);
      setProducts(Array.isArray(r.data)? r.data : []);
    } catch { toast.add('Error al cargar catálogo', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadProducts(activeCategory); }, []);
  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-slate-900 font-semibold">Catálogo</h2>
      </div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => { setActiveCategory(cat); loadProducts(cat); }} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeCategory===cat?'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30':'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>{cat}</button>
        ))}
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_,i)=>(<div key={i} className="border border-slate-200 rounded p-3">
            <div className="h-28 bg-slate-200 rounded mb-3" />
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
          </div>))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id || p._id} className="border border-slate-200 rounded p-3 group">
              <div className="h-48 overflow-hidden rounded mb-3">
                <img src={getProductImage(p.category, p.id || p._id)} alt={p.name || 'Producto'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="flex items-start justify-between">
                <div className="text-slate-900 font-semibold"><Link to={`/product/${p.id || p._id}`}>{p.name || 'Producto'}</Link></div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${p.stock>5?'bg-emerald-50 text-emerald-700 border-emerald-200':(p.stock>0?'bg-amber-50 text-amber-700 border-amber-200':'bg-red-50 text-red-700 border-red-200')}`}>{p.stock===0?'AGOTADO':`${p.stock} en stock`}</span>
              </div>
              <div className="text-slate-600 text-sm">${Number(p.price||0).toFixed(2)}</div>
              <button className="mt-3 w-full bg-slate-900 text-white rounded py-2 flex items-center justify-center gap-2 disabled:opacity-50" disabled={p.stock===0} onClick={() => { onAddToCart(p); toast.add('Añadido al carrito', 'success'); }}>
                <ShoppingCart size={16} /> {p.stock===0?'Sin Stock':'Añadir'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
