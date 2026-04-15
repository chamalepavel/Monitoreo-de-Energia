import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

const crearCliente = (token) => {
  return axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export const obtenerNodos = async (token) => {
  const cliente = crearCliente(token);
  const respuesta = await cliente.get('/nodos');
  return respuesta.data.datos;
};

export const obtenerMetricas = async (token, filtros = {}) => {
  const cliente = crearCliente(token);
  const respuesta = await cliente.get('/metricas', { params: filtros });
  return respuesta.data.datos;
};

export const obtenerUltimos5Min = async (token, nodoId) => {
  const cliente = crearCliente(token);
  const respuesta = await cliente.get(`/metricas/ultimos5min/${nodoId}`);
  return respuesta.data.datos;
};

export const obtenerHistorico = async (token, agrupacion = 'dia') => {
  const cliente = crearCliente(token);
  const respuesta = await cliente.get('/metricas/historico', { params: { agrupacion } });
  return respuesta.data.datos;
};

export const obtenerEstadoNodos = async (token) => {
  const cliente = crearCliente(token);
  const respuesta = await cliente.get('/metricas/estado-nodos');
  return respuesta.data.datos;
};
