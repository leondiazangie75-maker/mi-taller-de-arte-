import { useState, useEffect, FormEvent } from 'react';
import { supabase } from './supabase';
import './index.css'; // Let's reuse and add some specific classes if needed

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'messages' | 'services'>('products');
  
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // New Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');
  
  // New Product Form
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdOldPrice, setNewProdOldPrice] = useState('');
  const [newProdCat, setNewProdCat] = useState('');
  const [newProdIsNew, setNewProdIsNew] = useState(false);
  const [newProdIsOffer, setNewProdIsOffer] = useState(false);
  const [newProdImage, setNewProdImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // New Service Form
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceIcon, setNewServiceIcon] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) fetchAdminData();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchAdminData();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchAdminData() {
    // Categorías
    const { data: cats } = await supabase.from('categories').select('*');
    if (cats) setCategories(cats);
    
    // Productos
    const { data: prods } = await supabase.from('products').select(`*, categories(name)`);
    if (prods) setProducts(prods);

    // Mensajes
    const { data: msgs } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (msgs) setMessages(msgs);

    // Servicios
    const { data: servs } = await supabase.from('services').select('*');
    if (servs) setServices(servs);
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError('Credenciales incorrectas');
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- Handlers para Categorías ---
  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('categories').insert([{ name: newCatName, icon: newCatIcon }]);
    if (!error) {
      setNewCatName('');
      setNewCatIcon('');
      fetchAdminData();
    } else {
      alert('Error al agregar categoría: ' + error.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('¿Seguro que quieres eliminar esta categoría?')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) fetchAdminData();
      else alert('Error: ' + error.message);
    }
  };

  // --- Handlers para Productos ---
  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    let imageUrl = null;
    if (newProdImage) {
      const fileExt = newProdImage.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, newProdImage);
        
      if (uploadError) {
        alert('Error subiendo imagen: ' + uploadError.message);
        setIsUploading(false);
        return;
      }
      const { data } = supabase.storage.from('images').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from('products').insert([{
      name: newProdName,
      price: Number(newProdPrice),
      old_price: newProdOldPrice ? Number(newProdOldPrice) : null,
      category_id: newProdCat || null,
      is_new: newProdIsNew,
      is_offer: newProdIsOffer,
      image_url: imageUrl
    }]);
    
    setIsUploading(false);
    
    if (!error) {
      setNewProdName('');
      setNewProdPrice('');
      setNewProdOldPrice('');
      setNewProdCat('');
      setNewProdIsNew(false);
      setNewProdIsOffer(false);
      setNewProdImage(null);
      fetchAdminData();
    } else {
      alert('Error al agregar producto: ' + error.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Seguro que quieres eliminar este producto?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) fetchAdminData();
      else alert('Error: ' + error.message);
    }
  };

  // --- Handlers para Servicios ---
  const handleAddService = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('services').insert([{
      name: newServiceName,
      description: newServiceDesc,
      price: newServicePrice ? Number(newServicePrice) : null,
      icon: newServiceIcon
    }]);
    if (!error) {
      setNewServiceName('');
      setNewServiceDesc('');
      setNewServicePrice('');
      setNewServiceIcon('');
      fetchAdminData();
    } else {
      alert('Error al agregar servicio: ' + error.message);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('¿Seguro que quieres eliminar este servicio?')) {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (!error) fetchAdminData();
      else alert('Error: ' + error.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando panel...</div>;

  if (!session) {
    return (
      <div className="pg-admin-login">
        <form onSubmit={handleLogin} className="pg-admin-login-box">
          <h2>Acceso Administrador</h2>
          <input 
            type="email" 
            placeholder="Correo electrónico" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="pg-cf-input"
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            className="pg-cf-input"
          />
          {loginError && <div style={{color: '#ff6b6b', fontSize: '13px'}}>{loginError}</div>}
          <button type="submit" className="pg-cf-btn">Ingresar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="pg-admin-dashboard">
      <div className="pg-admin-sidebar">
        <div className="pg-admin-logo">YELI Panel</div>
        <div className="pg-admin-menu">
          <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>Productos</button>
          <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>Categorías</button>
          <button className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>Servicios</button>
          <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>Mensajes</button>
        </div>
        <button onClick={handleLogout} className="pg-admin-logout">Cerrar Sesión</button>
      </div>
      
      <div className="pg-admin-content">
        {activeTab === 'products' && (
          <div>
            <h2>Gestión de Productos</h2>
            <div className="pg-admin-card">
              <h3>Añadir Nuevo Producto</h3>
              <form onSubmit={handleAddProduct} className="pg-admin-form">
                <input placeholder="Nombre" required value={newProdName} onChange={e=>setNewProdName(e.target.value)} className="pg-cf-input" />
                <input type="number" placeholder="Precio ($)" required value={newProdPrice} onChange={e=>setNewProdPrice(e.target.value)} className="pg-cf-input" />
                <input type="number" placeholder="Precio Antiguo ($) - Opcional" value={newProdOldPrice} onChange={e=>setNewProdOldPrice(e.target.value)} className="pg-cf-input" />
                <select value={newProdCat} onChange={e=>setNewProdCat(e.target.value)} className="pg-cf-input" required>
                  <option value="">Selecciona Categoría</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                  <label style={{fontSize: '14px', color: '#666'}}>Imagen del producto (Opcional)</label>
                  <input type="file" accept="image/*" onChange={e => setNewProdImage(e.target.files ? e.target.files[0] : null)} className="pg-cf-input" style={{padding: '8px'}} />
                </div>
                <div style={{display: 'flex', gap: '1rem', marginTop: '10px'}}>
                  <label><input type="checkbox" checked={newProdIsNew} onChange={e=>setNewProdIsNew(e.target.checked)} /> Es Nuevo</label>
                  <label><input type="checkbox" checked={newProdIsOffer} onChange={e=>setNewProdIsOffer(e.target.checked)} /> Es Oferta</label>
                </div>
                <button type="submit" className="pg-cf-btn" style={{width: '200px'}} disabled={isUploading}>
                  {isUploading ? 'Subiendo...' : 'Añadir Producto'}
                </button>
              </form>
            </div>

            <div className="pg-admin-list">
              {products.map(p => (
                <div key={p.id} className="pg-admin-list-item">
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px'}} />
                    ) : (
                      <div style={{width: '50px', height: '50px', background: '#eee', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>📦</div>
                    )}
                    <div>
                      <strong>{p.name}</strong> - ${p.price} <small>({p.categories?.name})</small>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteProduct(p.id)} className="pg-admin-del-btn">Eliminar</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <h2>Gestión de Categorías</h2>
            <div className="pg-admin-card">
              <h3>Añadir Nueva Categoría</h3>
              <form onSubmit={handleAddCategory} className="pg-admin-form">
                <input placeholder="Nombre" required value={newCatName} onChange={e=>setNewCatName(e.target.value)} className="pg-cf-input" />
                <input placeholder="Emoji / Ícono" required value={newCatIcon} onChange={e=>setNewCatIcon(e.target.value)} className="pg-cf-input" />
                <button type="submit" className="pg-cf-btn" style={{width: '200px'}}>Añadir Categoría</button>
              </form>
            </div>

            <div className="pg-admin-list">
              {categories.map(c => (
                <div key={c.id} className="pg-admin-list-item">
                  <div>{c.icon} <strong>{c.name}</strong></div>
                  <button onClick={() => handleDeleteCategory(c.id)} className="pg-admin-del-btn">Eliminar</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <h2>Mensajes de Contacto</h2>
            <div className="pg-admin-msgs">
              {messages.length === 0 ? <p>No hay mensajes nuevos.</p> : messages.map(m => (
                <div key={m.id} className="pg-admin-card" style={{marginBottom: '1rem'}}>
                  <div style={{fontSize: '12px', color: '#888'}}>{new Date(m.created_at).toLocaleString()}</div>
                  <div style={{fontWeight: 'bold', margin: '5px 0'}}>{m.name} &lt;{m.email}&gt;</div>
                  <div style={{fontWeight: 'bold', color: '#C8A96E'}}>{m.subject}</div>
                  <p style={{marginTop: '10px'}}>{m.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <h2>Gestión de Servicios</h2>
            <div className="pg-admin-card">
              <h3>Añadir Nuevo Servicio</h3>
              <form onSubmit={handleAddService} className="pg-admin-form">
                <input placeholder="Nombre del Servicio" required value={newServiceName} onChange={e=>setNewServiceName(e.target.value)} className="pg-cf-input" />
                <textarea placeholder="Descripción" required value={newServiceDesc} onChange={e=>setNewServiceDesc(e.target.value)} className="pg-cf-textarea" style={{minHeight: '80px'}}></textarea>
                <input type="number" placeholder="Precio ($) - Opcional" value={newServicePrice} onChange={e=>setNewServicePrice(e.target.value)} className="pg-cf-input" />
                <input placeholder="Emoji / Ícono" required value={newServiceIcon} onChange={e=>setNewServiceIcon(e.target.value)} className="pg-cf-input" />
                <button type="submit" className="pg-cf-btn" style={{width: '200px'}}>Añadir Servicio</button>
              </form>
            </div>

            <div className="pg-admin-list">
              {services.map(s => (
                <div key={s.id} className="pg-admin-list-item">
                  <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                    <div>{s.icon} <strong>{s.name}</strong> {s.price ? `- $${s.price}` : ''}</div>
                    <div style={{fontSize: '12px', color: '#666'}}>{s.description}</div>
                  </div>
                  <button onClick={() => handleDeleteService(s.id)} className="pg-admin-del-btn">Eliminar</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
