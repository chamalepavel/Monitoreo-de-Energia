import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const GraficaBarras = ({ datos = [], agrupacion, onCambioAgrupacion }) => {

  const TooltipSwiss = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #1A1A1A',
        borderRadius: 0,
        padding: '8px 12px',
        fontFamily: 'Inter, Helvetica Neue, Arial, sans-serif',
      }}>
        <p style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#6B6B6B', marginBottom: 4 }}>
          {label}
        </p>
        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1A1A1A' }}>
          {parseFloat(payload[0].value).toLocaleString('es-GT')} W
        </p>
      </div>
    );
  };

  return (
    <div className="tarjeta">
      <h3 className="tarjeta-titulo">Generacion Historica</h3>

      <div className="agrupacion-btn-grupo">
        <button
          className={`agrupacion-btn ${agrupacion === 'dia' ? 'activo' : ''}`}
          onClick={() => onCambioAgrupacion('dia')}
        >
          Por dia
        </button>
        <button
          className={`agrupacion-btn ${agrupacion === 'mes' ? 'activo' : ''}`}
          onClick={() => onCambioAgrupacion('mes')}
        >
          Por mes
        </button>
      </div>

      {datos.length === 0 ? (
        <div className="estado-vacio">
          Sin datos historicos
          <small>Los datos apareceran cuando el simulador envie metricas</small>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={datos} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="0" stroke="#E8E8E4" strokeWidth={1} vertical={false} />
            <XAxis
              dataKey={agrupacion === 'dia' ? 'dia' : 'mes'}
              tick={{ fill: '#6B6B6B', fontSize: 9, fontWeight: 700 }}
              tickLine={false}
              axisLine={{ stroke: '#D0D0CC', strokeWidth: 1 }}
            />
            <YAxis
              tick={{ fill: '#6B6B6B', fontSize: 9, fontWeight: 700 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              width={40}
            />
            <Tooltip content={<TooltipSwiss />} cursor={{ fill: '#F0F0ED' }} />
            <Bar dataKey="total_vatios" radius={0}>
              {datos.map((entry, index) => (
                <Cell
                  key={`celda-${index}`}
                  fill={index === datos.length - 1 ? '#D62B2B' : '#1A1A1A'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GraficaBarras;
