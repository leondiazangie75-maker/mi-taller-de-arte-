-- Esquema de Base de Datos para Tienda Virtual

-- 1. Crear tabla de categorías
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Crear tabla de productos
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    old_price NUMERIC,
    is_new BOOLEAN DEFAULT FALSE,
    is_offer BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Crear tabla de mensajes de contacto
CREATE TABLE public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Configurar Políticas de Seguridad (Row Level Security - RLS)

-- Habilitar RLS en las tablas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para Categorías: Todos pueden ver (lectura), solo admins pueden modificar
CREATE POLICY "Permitir lectura pública de categorías" ON public.categories
    FOR SELECT USING (true);

-- Políticas para Productos: Todos pueden ver (lectura), solo admins pueden modificar
CREATE POLICY "Permitir lectura pública de productos" ON public.products
    FOR SELECT USING (true);

-- Políticas para Mensajes de contacto: Cualquiera puede insertar (enviar mensaje), solo admins pueden ver
CREATE POLICY "Permitir inserción pública de mensajes" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

-- Insertar datos de prueba (opcional)
INSERT INTO public.categories (id, name, icon) VALUES 
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Electrónica', '⚡'),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'Hogar', '🏠'),
('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'Moda', '👗');

INSERT INTO public.products (category_id, name, price, old_price, is_new, is_offer) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Producto Premium A', 89900, 120000, true, false),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'Producto Exclusivo B', 45000, null, false, false),
('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'Producto Especial C', 32500, 55000, false, true),
(null, 'Producto Único D', 67000, null, false, false);
