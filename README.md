## Requisitos

- Docker Desktop instalado y corriendo

## Iniciar el proyecto

```
docker compose up --build
```

## Acceso

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Health check: http://localhost:4000/health

## Detener

```
docker compose down
```

## Eliminar datos de la base de datos

```
docker compose down -v
```
