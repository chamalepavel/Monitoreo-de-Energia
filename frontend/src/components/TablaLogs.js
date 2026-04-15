import React, { useState, useEffect } from 'react';

const TablaLogs = ({ metricas = [], nuevaMetrica, onFiltroChange }) => {
  const [rango, setRango]           = useState('');
  const [criticidad, setCriticidad] = useState('');
  const [busqueda, setBusqueda]     = useState('');
  const [logs, setLogs]             = useState([]);

  useEffect(() => {
    setLogs(metricas);
  }, [metricas]);

  useEffect(() => {
    if (!nuevaMetrica) return;
    const pasaCriticidad = !criticidad || nuevaMetrica.criticidad === criticidad;
    const pasaBusqueda   = !busqueda || nuevaMetrica.nodo_id?.toLowerCase().includes(busqueda.toLowerCase());

    if (pasaCriticidad && pasaBusqueda) {
      setLogs((prev) => [nuevaMetrica, ...prev].slice(0, 100));
    }
  }, [nuevaMetrica]); // eslint-disable-line

  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltroChange({ rango, criticidad, busqueda });
    }, 300);
    return () => clearTimeout(timer);
  }, [rango, criticidad, busqueda]); // eslint-disable-line

  const formatearFecha = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-GT', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const colorStatus = (code) => {
    if (code === 200) return '#1F6B3A';
    if (code === 400) return '#C07A00';
    return '#D62B2B';
  };

  return (
    <div className="tarjeta" style={{ gridColumn: '1 / -1' }}>
      <h3 className="tarjeta-titulo">Historial de Logs</h3>

      <div className="filtros-contenedor">

        <div className="filtro-grupo">
          <span className="filtro-label">Periodo</span>
          <div className="filtro-btn-grupo">
            {[
              { valor: '',           etiqueta: 'Todo' },
              { valor: 'hoy',        etiqueta: 'Hoy' },
              { valor: 'ayer',       etiqueta: 'Ayer' },
              { valor: 'ultimo_mes', etiqueta: 'Mes' },
            ].map(({ valor, etiqueta }) => (
              <button
                key={valor}
                className={`filtro-btn ${rango === valor ? 'activo' : ''}`}
                onClick={() => setRango(valor)}
              >
                {etiqueta}
              </button>
            ))}
          </div>
        </div>

        <div className="filtro-grupo">
          <span className="filtro-label">Criticidad</span>
          <select
            className="filtro-select"
            value={criticidad}
            onChange={(e) => setCriticidad(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div className="filtro-grupo" style={{ flex: 1 }}>
          <span className="filtro-label">Buscar</span>
          <input
            type="text"
            className="filtro-input"
            placeholder="Nodo o ubicacion..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div className="filtro-grupo" style={{ justifyContent: 'flex-end' }}>
          <span className="filtro-label">Registros</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1A1A1A', lineHeight: 1 }}>
            {logs.length}
          </span>
        </div>

      </div>

      {logs.length === 0 ? (
        <div className="estado-vacio">
          Sin registros con los filtros aplicados
          <small>Modifica los filtros o espera nuevas metricas del simulador</small>
        </div>
      ) : (
        <div className="tabla-wrapper">
          <table className="tabla-logs">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Nodo</th>
                <th>Ubicacion</th>
                <th style={{ textAlign: 'right' }}>Vatios</th>
                <th style={{ textAlign: 'right' }}>Voltaje</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Criticidad</th>
                <th>Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log.id || index}>
                  <td className="td-timestamp">{formatearFecha(log.timestamp)}</td>
                  <td style={{ fontWeight: 700, fontSize: '0.75rem', color: '#1A1A1A' }}>
                    {log.nodo_nombre || log.nodo_id?.substring(0, 8) + '...'}
                  </td>
                  <td className="td-mensaje" style={{ maxWidth: '160px' }}>
                    {log.nodo_ubicacion || '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#1A1A1A', fontVariantNumeric: 'tabular-nums' }}>
                    {parseFloat(log.vatios_generados).toFixed(1)} W
                  </td>
                  <td style={{ textAlign: 'right', color: '#6B6B6B', fontVariantNumeric: 'tabular-nums' }}>
                    {parseFloat(log.voltaje).toFixed(1)} V
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.6875rem',
                    color: colorStatus(log.status_code), fontVariantNumeric: 'tabular-nums' }}>
                    {log.status_code}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge badge-${log.criticidad}`}>{log.criticidad}</span>
                  </td>
                  <td className="td-mensaje" style={{ maxWidth: '280px', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.mensaje}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TablaLogs;
