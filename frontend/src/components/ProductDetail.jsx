import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { get } from '../lib/api';
import { useToast } from '../lib/toast.jsx';

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

export default function ProductDetail({ onAddToCart }){
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  useEffect(() => {
    let mounted = true;
    (async () => {
      try { const r = await get(`/products/${id}`); if(mounted) setProduct(r.data); }
      catch { toast.add('Error al cargar producto', 'error'); }
      finally { if(mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [id]);
  if (loading) return (<div className="animate-pulse space-y-2"><div className="h-6 bg-slate-200 rounded w-1/3" /><div className="h-4 bg-slate-200 rounded w-2/3" /><div className="h-24 bg-slate-200 rounded" /></div>);
  if (!product) return (<div className="text-slate-500">Producto no encontrado</div>);
  const stock = Number(product.stock||0);
  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <div className="h-64 overflow-hidden rounded mb-3">
        <img src={getProductImage(product.category, product.id || product._id)} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <h2 className="text-slate-900 font-semibold text-xl mb-2">{product.name}</h2>
      <div className="text-slate-600 mb-3">{product.description}</div>
      <div className="flex items-center justify-between">
        <div className="text-slate-700 font-semibold">Precio: ${Number(product.price||0).toFixed(2)}</div>
        <div className={`text-xs px-2 py-1 rounded border ${stock>0?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-red-50 text-red-700 border-red-200'}`}>{stock>0?`Stock: ${stock}`:'Agotado'}</div>
      </div>
      <div className="mt-4">
        <button className="px-4 py-2 bg-slate-900 text-white rounded disabled:opacity-50" disabled={stock<=0} onClick={() => { onAddToCart(product); toast.add('Añadido al carrito', 'success'); }}>Añadir al Carrito</button>
      </div>
    </div>
  );
}
