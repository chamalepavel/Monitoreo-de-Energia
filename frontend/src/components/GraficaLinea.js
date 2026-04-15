import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const GraficaLinea = ({ datosIniciales = [], nuevaMetrica, nodoId }) => {
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    const formateados = datosIniciales.map((d) => ({
      hora: new Date(d.timestamp).toLocaleTimeString('es-GT', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }),
      vatios: parseFloat(d.vatios_generados),
    }));
    setDatos(formateados);
  }, [datosIniciales]);

  useEffect(() => {
    if (!nuevaMetrica || nuevaMetrica.nodo_id !== nodoId) return;

    const nuevoPunto = {
      hora: new Date(nuevaMetrica.timestamp).toLocaleTimeString('es-GT', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }),
      vatios: parseFloat(nuevaMetrica.vatios_generados),
    };

    setDatos((prev) => {
      const actualizado = [...prev, nuevoPunto];
      return actualizado.length > 60 ? actualizado.slice(-60) : actualizado;
    });
  }, [nuevaMetrica, nodoId]);

  if (datos.length === 0) {
    return (
      <div className="tarjeta">
        <h3 className="tarjeta-titulo">Vatios — Ultimos 5 minutos</h3>
        <div className="estado-vacio">
          Sin datos disponibles
          <small>Verifica que el simulador este corriendo</small>
        </div>
      </div>
    );
  }

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
        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#D62B2B' }}>
          {payload[0].value.toFixed(1)} W
        </p>
      </div>
    );
  };

  return (
    <div className="tarjeta">
      <h3 className="tarjeta-titulo">Vatios — Ultimos 5 minutos</h3>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={datos} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="0" stroke="#E8E8E4" strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="hora"
            tick={{ fill: '#6B6B6B', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em' }}
            tickLine={false}
            axisLine={{ stroke: '#D0D0CC', strokeWidth: 1 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#6B6B6B', fontSize: 9, fontWeight: 700 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}W`}
            width={48}
          />
          <Tooltip content={<TooltipSwiss />} cursor={{ stroke: '#D0D0CC', strokeWidth: 1 }} />
          <Line
            type="monotone"
            dataKey="vatios"
            stroke="#D62B2B"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#D62B2B', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficaLinea;
