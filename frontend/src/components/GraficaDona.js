import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORES = {
  Online:  '#1A1A1A',
  Offline: '#AAAAAA',
  Alerta:  '#D62B2B',
  Error:   '#D62B2B',
};

const ORDEN = ['Online', 'Alerta', 'Error', 'Offline'];

const GraficaDona = ({ datos = [] }) => {
  const datosOrdenados = ORDEN
    .map((estado) => {
      const encontrado = datos.find((d) => d.estado === estado);
      return { estado, cantidad: encontrado ? parseInt(encontrado.cantidad) : 0 };
    })
    .filter((d) => d.cantidad > 0);

  const total = datosOrdenados.reduce((sum, d) => sum + d.cantidad, 0);

  const TooltipSwiss = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0];
    const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #1A1A1A',
        borderRadius: 0,
        padding: '8px 12px',
        fontFamily: 'Inter, Helvetica Neue, Arial, sans-serif',
      }}>
        <p style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#6B6B6B', marginBottom: 2 }}>
          {item.name}
        </p>
        <p style={{ fontSize: '1rem', fontWeight: 900, color: '#1A1A1A' }}>
          {item.value} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>({pct}%)</span>
        </p>
      </div>
    );
  };

  if (datosOrdenados.length === 0 || total === 0) {
    return (
      <div className="tarjeta">
        <h3 className="tarjeta-titulo">Estado de Nodos</h3>
        <div className="estado-vacio">
          Sin datos de estado
          <small>Los nodos aun no reportan metricas</small>
        </div>
      </div>
    );
  }

  return (
    <div className="tarjeta">
      <h3 className="tarjeta-titulo">Estado de Nodos</h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ flex: '0 0 auto' }}>
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={datosOrdenados}
                dataKey="cantidad"
                nameKey="estado"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                strokeWidth={3}
                stroke="#FFFFFF"
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
              >
                {datosOrdenados.map((entry) => (
                  <Cell key={`celda-${entry.estado}`} fill={COLORES[entry.estado] || '#AAAAAA'} />
                ))}
              </Pie>
              <Tooltip content={<TooltipSwiss />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="dona-leyenda" style={{ flex: 1 }}>
          {datosOrdenados.map((entry) => {
            const pct = total > 0 ? ((entry.cantidad / total) * 100).toFixed(0) : 0;
            return (
              <div key={entry.estado} className="dona-leyenda-item">
                <div
                  className="dona-leyenda-cuadro"
                  style={{ backgroundColor: COLORES[entry.estado] || '#AAAAAA' }}
                />
                <div style={{ flex: 1 }}>
                  <div className="dona-leyenda-nombre">{entry.estado}</div>
                  <div style={{ fontSize: '0.5625rem', color: '#AAAAAA', fontWeight: 500 }}>
                    {pct}%
                  </div>
                </div>
                <div className="dona-leyenda-valor">{entry.cantidad}</div>
              </div>
            );
          })}

          <div style={{
            borderTop: '1px solid #D0D0CC',
            paddingTop: '8px',
            marginTop: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}>
            <span style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: '#6B6B6B' }}>
              Total
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1A1A1A' }}>
              {total}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficaDona;
