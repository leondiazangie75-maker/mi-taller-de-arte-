import { useEffect, useState, type FormEvent } from 'react';
import './index.css';
import logo from './assets/LOGO.PNG.jpeg';
import { supabase } from './supabase';

interface Product {
  id: string;
  name: string;
  price: number;
  old_price: number | null;
  is_new: boolean;
  is_offer: boolean;
  category_id: string;
  image_url?: string | null;
  categories: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formStatus, setFormStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Fetch Categories
      const { data: cats, error: catError } = await supabase
        .from('categories')
        .select('*');
      
      if (catError) throw catError;
      if (cats) setCategories(cats);

      // Fetch Products with category names
      const { data: prods, error: prodError } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `);
      
      if (prodError) throw prodError;
      if (prods) setProducts(prods);

      // Fetch Services
      const { data: servs, error: servError } = await supabase.from('services').select('*');
      if (servError) throw servError;
      if (servs) setServices(servs);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormStatus('Enviando...');
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([formData]);
      
      if (error) throw error;
      setFormStatus('¡Mensaje enviado con éxito!');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setFormStatus(''), 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      setFormStatus('Error al enviar el mensaje.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="pg">
      <nav className="pg-nav">
        <div className="pg-nav-logo">
          <img src={logo} alt="YELI Logo" onError={(e) => { e.currentTarget.style.display='none'; }} />
        </div>
        <div className={`pg-nav-links ${isMenuOpen ? 'open' : ''}`}>
          <a href="#inicio" className="active" onClick={() => setIsMenuOpen(false)}>Inicio</a>
          <a href="#productos" onClick={() => setIsMenuOpen(false)}>Productos</a>
          <a href="#servicios" onClick={() => setIsMenuOpen(false)}>Servicios</a>
          <a href="#categorias" onClick={() => setIsMenuOpen(false)}>Categorías</a>
          <a href="#contacto" onClick={() => setIsMenuOpen(false)}>Contacto</a>
          <a href="/admin" style={{ color: '#C8A96E', fontWeight: 'bold' }}>Admin <span style={{fontSize:'12px'}}>🔒</span></a>
        </div>
        <div className="pg-search">
          <span style={{ color: '#666', fontSize: '14px' }}>⌕</span>
          <input placeholder="Buscar productos..." />
        </div>
        <button className="pg-hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </nav>

      <div className="pg-hero" id="inicio">
        <div className="pg-hero-content">
          <div className="pg-hero-tag">Colección 2025</div>
          <div className="pg-hero-title">Descubre lo<br /><span>Extraordinario</span></div>
          <div className="pg-hero-sub">Los mejores productos seleccionados para ti, con calidad garantizada y envío rápido.</div>
          <a href="#productos" style={{ textDecoration: 'none' }}>
            <button className="pg-hero-btn" style={{ pointerEvents: 'none' }}>Ver colección</button>
          </a>
        </div>
        <div className="pg-hero-deco"></div>
        <div className="pg-hero-img">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <rect x="5" y="5" width="50" height="50" rx="6" stroke="white" strokeWidth="2" />
            <line x1="5" y1="5" x2="55" y2="55" stroke="white" strokeWidth="2" />
            <line x1="55" y1="5" x2="5" y2="55" stroke="white" strokeWidth="2" />
          </svg>
        </div>
      </div>

      <div className="pg-section" id="productos">
        <div className="pg-section-header">
          <div className="pg-section-title">Productos destacados</div>
          <a href="#productos" className="pg-section-link">Ver todos →</a>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Cargando productos...</div>
        ) : (
          <div className="pg-products">
            {products.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', color: '#888' }}>No hay productos disponibles aún.</div>
            ) : (
              products.map(product => (
                <div className="pg-card" key={product.id}>
                  <div className="pg-card-img" style={{ background: product.is_offer ? '#EEF2EC' : product.is_new ? '#F0ECE4' : '#EEE9F0', overflow: 'hidden' }}>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="pg-card-img-inner" style={{ background: product.is_offer ? '#DDE6D9' : product.is_new ? '#E2DDD4' : '#DED4E4' }}>
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                          <rect x="2" y="2" width="32" height="32" rx="4" stroke="#888" strokeWidth="1.5" />
                          <line x1="2" y1="2" x2="34" y2="34" stroke="#888" strokeWidth="1.5" />
                          <line x1="34" y1="2" x2="2" y2="34" stroke="#888" strokeWidth="1.5" />
                        </svg>
                      </div>
                    )}
                    {product.is_new && <div className="pg-card-badge">Nuevo</div>}
                    {product.is_offer && <div className="pg-card-badge" style={{ background: '#7B9E87' }}>Oferta</div>}
                  </div>
                  <div className="pg-card-body">
                    <div className="pg-card-cat">{product.categories?.name || 'General'}</div>
                    <div className="pg-card-name">{product.name}</div>
                    <div>
                      <span className="pg-card-price">{formatPrice(product.price)}</span>
                      {product.old_price && <span className="pg-card-price-old">{formatPrice(product.old_price)}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="pg-section" id="servicios" style={{ background: '#fcfaf8' }}>
        <div className="pg-section-header" style={{ padding: '0 2rem' }}>
          <div className="pg-section-title">Nuestros Servicios</div>
        </div>
        
        {loading ? null : (
          <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {services.length === 0 ? (
              <div style={{ color: '#888' }}>No hay servicios disponibles aún.</div>
            ) : (
              services.map(serv => (
                <div key={serv.id} style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{serv.icon}</div>
                  <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', marginBottom: '0.5rem', color: '#1a1a1a' }}>{serv.name}</h3>
                  <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', marginBottom: '1rem' }}>{serv.description}</p>
                  {serv.price && <div style={{ color: '#C8A96E', fontWeight: '600', fontSize: '18px' }}>{formatPrice(serv.price)}</div>}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div style={{ padding: '0 2rem' }} id="categorias">
        <div className="pg-section-header">
          <div className="pg-section-title" style={{ fontSize: '18px' }}>Categorías populares</div>
        </div>
      </div>
      
      {loading ? null : (
        <div className="pg-cats">
          {categories.map(cat => (
            <div className="pg-cat" key={cat.id}>
              <div className="pg-cat-icon">{cat.icon}</div>
              <div>
                <div className="pg-cat-name">{cat.name}</div>
                {/* Count could be dynamic via a SQL view or RPC, using hardcoded placeholder for now since we just fetched pure categories */}
                <div className="pg-cat-count">Ver productos</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pg-contact" id="contacto">
        <div className="pg-contact-grid">
          <div>
            <div className="pg-contact-title">¿Hablamos?</div>
            <div className="pg-contact-sub">Estamos aquí para ayudarte. Contáctanos por cualquier duda, pedido especial o consulta sobre nuestros productos.</div>
            
            <div className="pg-contact-item">
              <div className="pg-contact-icon">📍</div>
              <div>
                <div className="pg-contact-label">Dirección</div>
                <div className="pg-contact-val">Calle 15 #8-42, Maicao, La Guajira</div>
              </div>
            </div>
            
            <div className="pg-contact-item">
              <div className="pg-contact-icon">📞</div>
              <div>
                <div className="pg-contact-label">Teléfono</div>
                <div className="pg-contact-val">+57 310 000 0000</div>
              </div>
            </div>
            
            <div className="pg-contact-item">
              <div className="pg-contact-icon">✉️</div>
              <div>
                <div className="pg-contact-label">Correo</div>
                <div className="pg-contact-val">hola@mitienda.com</div>
              </div>
            </div>
          </div>
          
          <form className="pg-contact-form" onSubmit={handleContactSubmit}>
            <input 
              className="pg-cf-input" 
              placeholder="Tu nombre" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <input 
              className="pg-cf-input" 
              type="email" 
              placeholder="Tu correo electrónico" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <input 
              className="pg-cf-input" 
              placeholder="Asunto" 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
            <textarea 
              className="pg-cf-textarea" 
              placeholder="Escribe tu mensaje..." 
              required
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            ></textarea>
            <button className="pg-cf-btn" type="submit" disabled={formStatus === 'Enviando...'}>
              {formStatus === 'Enviando...' ? 'Enviando...' : 'Enviar mensaje'}
            </button>
            {formStatus && formStatus !== 'Enviando...' && (
              <div style={{ color: formStatus.includes('Error') ? '#ff6b6b' : '#7B9E87', fontSize: '13px', textAlign: 'center' }}>
                {formStatus}
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="pg-footer">
        <div className="pg-footer-top">
          <div>
            <div className="pg-footer-brand">
              <img src={logo} alt="YELI Logo" onError={(e) => { e.currentTarget.style.display='none'; }} />
            </div>
            <div className="pg-footer-desc">Tu destino de compras con los mejores productos y precios del mercado. Calidad garantizada en cada pedido.</div>
            <div className="pg-footer-socials">
              <a className="pg-social-btn" title="Instagram">
                <svg className="pg-social-icon" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a className="pg-social-btn" title="Facebook">
                <svg className="pg-social-icon" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a className="pg-social-btn" title="WhatsApp" href="https://wa.me/573003991693" target="_blank" rel="noopener noreferrer">
                <svg className="pg-social-icon" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <div className="pg-footer-col-title">Tienda</div>
            <div className="pg-footer-col-links">
              <a>Productos</a>
              <a>Novedades</a>
              <a>Marcas</a>
            </div>
          </div>
          <div>
            <div className="pg-footer-col-title">Ayuda</div>
            <div className="pg-footer-col-links">
              <a>Preguntas frecuentes</a>
              <a>Envíos</a>
              <a>Devoluciones</a>
              <a>Garantía</a>
            </div>
          </div>
        </div>
        <div className="pg-footer-bottom">
          <div className="pg-footer-copy">© 2025 YELI - El Taller de la Creatividad. Todos los derechos reservados.</div>
          <div className="pg-footer-legal">
            <a>Privacidad</a>
            <a>Términos</a>
            <a>Cookies</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
