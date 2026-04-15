CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE IF NOT EXISTS nodos (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    nombre VARCHAR(100) NOT NULL UNIQUE,

    ubicacion VARCHAR(255) NOT NULL,

    version_fw VARCHAR(50) NOT NULL DEFAULT 'v1.0.0',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS metricas_log (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    nodo_id UUID NOT NULL REFERENCES nodos(id) ON DELETE CASCADE,

    vatios_generados FLOAT NOT NULL,

    voltaje FLOAT NOT NULL,

    status_code INTEGER NOT NULL DEFAULT 200,

    criticidad VARCHAR(10) NOT NULL DEFAULT 'info'
        CHECK (criticidad IN ('info', 'warning', 'error')),

    mensaje TEXT NOT NULL DEFAULT ''
);


CREATE INDEX IF NOT EXISTS idx_metricas_timestamp  ON metricas_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_metricas_nodo_id    ON metricas_log(nodo_id);
CREATE INDEX IF NOT EXISTS idx_metricas_criticidad ON metricas_log(criticidad);


INSERT INTO nodos (nombre, ubicacion, version_fw) VALUES
    ('Inversor Central Mixco',    'Techo A1, Zona Industrial Mixco',    'v2.3.1'),
    ('Panel Solar Villa Nueva',   'Techo B2, Centro Comercial VN',      'v2.3.1'),
    ('Inversor Zona 10',          'Techo Corporativo, Torre Reforma',   'v2.1.0'),
    ('Panel Solar Quetzaltenango','Instalacion Industrial Xela',        'v1.9.5'),
    ('Inversor Escuintla Norte',  'Planta Solar Escuintla, Sector 3',   'v2.3.1')
ON CONFLICT (nombre) DO NOTHING;
