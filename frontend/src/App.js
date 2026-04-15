import React, { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

import useSocket from './hooks/useSocket';
import {
  obtenerNodos,
  obtenerMetricas,
  obtenerUltimos5Min,
  obtenerHistorico,
  obtenerEstadoNodos,
} from './services/api';

import GraficaLinea  from './components/GraficaLinea';
import GraficaBarras from './components/GraficaBarras';
import GraficaDona   from './components/GraficaDona';
import TablaLogs     from './components/TablaLogs';
import AlertaCritica from './components/AlertaCritica';

const PantallaLogin = () => {
  const { loginWithRedirect, error } = useAuth0();

  const handleLogin = async () => {
    try {
      await loginWithRedirect({
        authorizationParams: { redirect_uri: window.location.origin },
      });
    } catch (err) {
      console.error('Error al iniciar sesion:', err);
    }
  };

  return (
    <div className="login-contenedor">
      <div className="login-label">Universidad Galileo — UIUX</div>
      <h1 className="login-titulo">Monitoreo<br />Solar IoT</h1>
      <div className="login-divider" />
      <p className="login-subtitulo">
        Sistema de monitoreo en tiempo real para nodos de energia solar.
        Inicia sesion para acceder al dashboard de metricas.
      </p>
      {error && (
        <p style={{ color: 'red', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Error: {error.message}
        </p>
      )}
      <button className="btn-login" onClick={handleLogin}>
        Iniciar Sesion
      </button>
    </div>
  );
};

const App = () => {
  const { isAuthenticated, isLoading, user, logout, getAccessTokenSilently } = useAuth0();

  const [token, setToken]                       = useState(null);
  const [nodos, setNodos]                       = useState([]);
  const [nodoSeleccionado, setNodoSeleccionado] = useState(null);
  const [datosLinea, setDatosLinea]             = useState([]);
  const [datosBarras, setDatosBarras]           = useState([]);
  const [agrupacion, setAgrupacion]             = useState('dia');
  const [datosDona, setDatosDona]               = useState([]);
  const [metricas, setMetricas]                 = useState([]);

  const { conectado, nuevaMetrica, alertaCritica } = useSocket(token);

  useEffect(() => {
    const obtenerToken = async () => {
      if (!isAuthenticated) return;
      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: 'https://monitoreo-solar-api',
            scope: 'openid profile email',
          },
        });
        setToken(accessToken);
      } catch (error) {
        console.warn('Token silencioso fallo:', error.message);
      }
    };
    obtenerToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    if (!token) return;

    const cargarDatosIniciales = async () => {
      try {
        const [listaNodos, historico, estados, ultimasMetricas] = await Promise.all([
          obtenerNodos(token),
          obtenerHistorico(token, 'dia'),
          obtenerEstadoNodos(token),
          obtenerMetricas(token, { rango: 'hoy' }),
        ]);

        setNodos(listaNodos);
        setDatosBarras(historico);
        setDatosDona(estados);
        setMetricas(ultimasMetricas);

        if (listaNodos.length > 0) {
          setNodoSeleccionado(listaNodos[0].id);
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error.message);
      }
    };

    cargarDatosIniciales();
  }, [token]);

  useEffect(() => {
    if (!token || !nodoSeleccionado) return;

    const cargarUltimos5Min = async () => {
      try {
        const datos = await obtenerUltimos5Min(token, nodoSeleccionado);
        setDatosLinea(datos);
      } catch (error) {
        console.error('Error al cargar ultimos 5 min:', error.message);
      }
    };

    cargarUltimos5Min();
  }, [token, nodoSeleccionado]);

  useEffect(() => {
    if (!nuevaMetrica || !token) return;

    const timer = setTimeout(async () => {
      try {
        const estados = await obtenerEstadoNodos(token);
        setDatosDona(estados);
      } catch (_) {}
    }, 1000);

    return () => clearTimeout(timer);
  }, [nuevaMetrica, token]);

  const manejarCambioFiltro = useCallback(async (filtros) => {
    if (!token) return;
    try {
      const nuevasMetricas = await obtenerMetricas(token, filtros);
      setMetricas(nuevasMetricas);
    } catch (error) {
      console.error('Error al filtrar metricas:', error.message);
    }
  }, [token]);

  const manejarCambioAgrupacion = async (nuevaAgrupacion) => {
    setAgrupacion(nuevaAgrupacion);
    if (!token) return;
    try {
      const historico = await obtenerHistorico(token, nuevaAgrupacion);
      setDatosBarras(historico);
    } catch (error) {
      console.error('Error al cambiar agrupacion:', error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="login-contenedor">
        <div className="login-label">Verificando sesion</div>
        <p className="login-subtitulo">Por favor espera un momento...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PantallaLogin />;
  }

  return (
    <>
      <nav className="navbar">
        <span className="navbar-titulo">Monitoreo Solar IoT</span>

        <div className="navbar-usuario">
          <div className={`indicador-socket ${conectado ? 'conectado' : 'desconectado'}`}>
            <div className="punto" />
            {conectado ? 'En vivo' : 'Sin conexion'}
          </div>

          <span>{user?.name || user?.email}</span>

          <button
            className="btn-logout"
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            Salir
          </button>
        </div>
      </nav>

      <main className="dashboard-contenedor">

        <div className="seccion">
          <div className="seccion-header">
            <span className="seccion-numero">01</span>
            <span className="seccion-titulo">Seleccion de Nodo</span>
          </div>

          <div className="selector-nodo">
            <label>Nodo activo</label>
            <select
              value={nodoSeleccionado || ''}
              onChange={(e) => setNodoSeleccionado(e.target.value)}
            >
              {nodos.map((nodo) => (
                <option key={nodo.id} value={nodo.id}>
                  {nodo.nombre} — {nodo.ubicacion}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <span className="seccion-numero">02</span>
            <span className="seccion-titulo">Metricas en Tiempo Real</span>
          </div>

          <div className="graficas-grid">
            <GraficaLinea
              datosIniciales={datosLinea}
              nuevaMetrica={nuevaMetrica}
              nodoId={nodoSeleccionado}
            />
            <GraficaBarras
              datos={datosBarras}
              agrupacion={agrupacion}
              onCambioAgrupacion={manejarCambioAgrupacion}
            />
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <span className="seccion-numero">03</span>
            <span className="seccion-titulo">Estado de la Red</span>
          </div>

          <div className="graficas-grid">
            <GraficaDona datos={datosDona} />

            <div className="tarjeta">
              <h3 className="tarjeta-titulo">Resumen del Sistema</h3>
              <div className="resumen-grid">
                <div className="resumen-item">
                  <div className="resumen-label">Nodos registrados</div>
                  <div className="resumen-valor">{nodos.length}</div>
                </div>
                <div className="resumen-item">
                  <div className="resumen-label">Ultima lectura</div>
                  <div className="resumen-valor-sm">
                    {nuevaMetrica
                      ? `${parseFloat(nuevaMetrica.vatios_generados).toFixed(1)} W`
                      : 'Esperando datos...'}
                  </div>
                </div>
                <div className="resumen-item">
                  <div className="resumen-label">Voltaje</div>
                  <div className="resumen-valor-sm">
                    {nuevaMetrica
                      ? `${parseFloat(nuevaMetrica.voltaje).toFixed(1)} V`
                      : '—'}
                  </div>
                </div>
                <div className="resumen-item">
                  <div className="resumen-label">Conexion</div>
                  <div className="resumen-valor-sm"
                    style={{ color: conectado ? 'var(--color-online)' : 'var(--color-error)' }}>
                    {conectado ? 'Socket activo' : 'Desconectado'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <span className="seccion-numero">04</span>
            <span className="seccion-titulo">Registro de Eventos</span>
          </div>

          <TablaLogs
            metricas={metricas}
            nuevaMetrica={nuevaMetrica}
            onFiltroChange={manejarCambioFiltro}
          />
        </div>

      </main>

      <AlertaCritica alerta={alertaCritica} />
    </>
  );
};

export default App;
