import React, { useState, useEffect } from 'react';

const AlertaCritica = ({ alerta }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!alerta) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(timer);
  }, [alerta]);

  if (!alerta || !visible) return null;

  const hora = new Date(alerta.timestamp).toLocaleTimeString('es-GT', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <div className="alerta-critica" role="alert" aria-live="assertive">
      <button
        className="alerta-critica-cerrar"
        onClick={() => setVisible(false)}
        aria-label="Cerrar alerta"
      >
        ×
      </button>

      <div className="alerta-critica-etiqueta">
        Alerta Critica — {hora}
      </div>

      <div className="alerta-critica-titulo">
        Falla en nodo detectada
      </div>

      <div className="alerta-critica-mensaje">
        {alerta.mensaje}
      </div>

      <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #D0D0CC',
        display: 'flex', gap: '16px' }}>

        <div>
          <div style={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#AAAAAA', marginBottom: 2 }}>
            Vatios
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#D62B2B' }}>
            {alerta.vatios_generados ? `${parseFloat(alerta.vatios_generados).toFixed(1)} W` : '—'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#AAAAAA', marginBottom: 2 }}>
            Voltaje
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#D62B2B' }}>
            {alerta.voltaje ? `${parseFloat(alerta.voltaje).toFixed(1)} V` : '—'}
          </div>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <div style={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#AAAAAA', marginBottom: 2 }}>
            Nodo
          </div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 500, color: '#6B6B6B', fontFamily: 'monospace' }}>
            {alerta.nodo_id?.substring(0, 8)}...
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertaCritica;
