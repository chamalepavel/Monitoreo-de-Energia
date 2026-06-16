# Guia para el Video de Presentacion

## Que hice y por que — con respaldo de documentacion oficial

---

## 1. Docker Compose — La pieza central

Documentacion oficial: https://docs.docker.com/compose/

Docker Compose permite definir y correr aplicaciones multi-contenedor con un solo archivo YAML.
El comando `docker compose up --build` hace todo automaticamente:
- Descarga las imagenes base (postgres:15, node:18-alpine, nginx:alpine)
- Construye las imagenes de tu codigo fuente
- Crea la red interna entre contenedores
- Arranca los servicios en el orden correcto gracias a `depends_on`

Lo que puedes decir en el video:
"Use Docker Compose porque la documentacion oficial lo define como la herramienta estandar
para aplicaciones multi-contenedor. Con un solo archivo docker-compose.yml en la raiz,
cualquier persona puede levantar todo el ecosistema sin instalar Node, PostgreSQL
ni configurar ninguna variable de entorno."

---

## 2. Dockerfile Multi-Stage para el Frontend

Documentacion oficial: https://docs.docker.com/build/building/multi-stage/

El archivo frontend/Dockerfile usa dos etapas:

Etapa 1 (build): imagen node:18-alpine que compila React con npm run build
Etapa 2: imagen nginx:alpine que sirve el resultado estatico

Lo que puedes decir:
"El Dockerfile del frontend usa multi-stage builds, una practica documentada oficialmente
por Docker. La primera etapa compila React. La segunda copia solo los archivos compilados
a Nginx. La imagen final no incluye Node.js ni los node_modules, lo que la hace
significativamente mas pequena y mas segura."

---

## 3. Healthcheck y depends_on con condicion

Documentacion oficial: https://docs.docker.com/compose/how-tos/startup-order/

El depends_on con condition: service_healthy garantiza que PostgreSQL este listo
antes de que el backend intente conectarse.

Lo que puedes decir:
"La documentacion oficial de Docker advierte que depends_on por si solo no garantiza
que el servicio este listo, solo que el contenedor inicio. Por eso use
condition: service_healthy junto con un healthcheck en PostgreSQL que ejecuta
pg_isready. El backend y el simulator solo arrancan cuando la DB ya acepta conexiones."

---

## 4. Redes Internas de Docker

Documentacion oficial: https://docs.docker.com/engine/network/

Cuando Docker Compose crea los servicios, todos quedan en la misma red virtual.
Dentro de esa red, cada contenedor se identifica por su nombre de servicio.

Lo que puedes decir:
"Dentro de Docker, el backend se comunica con la base de datos usando el hostname 'db'
que es el nombre del servicio en el compose. El simulator usa 'backend' como hostname.
Esto funciona porque Docker crea automaticamente una red virtual donde cada servicio
es alcanzable por su nombre. Los puertos que expongo al exterior (3000, 4000, 5434)
son solo para que el navegador del usuario pueda acceder desde fuera de Docker."

---

## 5. Nginx como servidor del Frontend

Documentacion oficial: https://nginx.org/en/docs/beginners_guide.html

El archivo frontend/nginx.conf usa:

    try_files $uri $uri/ /index.html;

Esta es la configuracion estandar para Single Page Applications (SPA).
Sin esta linea, al refrescar una ruta como /dashboard Nginx devolveria 404.

Lo que puedes decir:
"Configure Nginx con try_files para que cualquier ruta que el usuario visite directamente
sea redirigida al index.html de React. Esto es necesario porque React maneja el
enrutamiento en el cliente con React Router, no en el servidor."

---

## 6. Variables de Entorno en Docker Compose

Documentacion oficial: https://docs.docker.com/compose/how-tos/environment-variables/

Las variables en la seccion environment: del compose sobreescriben las del .env local.
Por eso el backend usa DB_HOST=db en Docker aunque el .env local diga DB_HOST=127.0.0.1.

Lo que puedes decir:
"El backend usa dotenv para cargar variables del archivo .env. Pero segun la documentacion
de Docker, las variables definidas en environment: del compose tienen prioridad sobre
el archivo .env. Esto me permite mantener el .env local para desarrollo sin Docker,
y que el compose use los valores correctos para la red interna sin modificar ningun archivo."

---

## 7. El Simulator — El cambio critico que hice

El simulator original tenia dos problemas que lo hacian fallar dentro de Docker:

Problema 1: Usaba hostname: 'localhost' para conectarse al backend.
Dentro de un contenedor, localhost apunta al propio contenedor, no al backend.
Solucion: use la variable de entorno BACKEND_HOST=backend.

Problema 2: Los IDs de los nodos estaban hardcodeados.
PostgreSQL genera UUIDs nuevos en cada instalacion con uuid_generate_v4().
Los IDs del simulator original no coincidian con los de la nueva DB.
Solucion: hice que el simulator consulte SELECT id FROM nodos al arrancar,
y use esos IDs reales para enviar las metricas.

Lo que puedes decir:
"El simulator original fallaba en Docker por dos razones. Primero, localhost dentro
de Docker apunta al propio contenedor, no al backend. Lo corregi usando variables
de entorno. Segundo, los UUIDs de los nodos son generados por PostgreSQL en cada
instalacion y cambian, entonces los IDs hardcodeados nunca coincidian. Lo corregi
haciendo que el simulator consulte la DB al arrancar para obtener los IDs reales."

---

## Flujo Completo para Explicar en el Video

Paso 1: git clone https://github.com/chamalepavel/Monitoreo-de-Energia
Paso 2: cd Monitoreo-de-Energia
Paso 3: docker compose up --build

Lo que ocurre automaticamente:
- Docker descarga postgres:15, node:18-alpine, nginx:alpine
- Construye las imagenes del backend y frontend desde el codigo fuente
- PostgreSQL arranca y ejecuta init.sql automaticamente (crea tablas + inserta 5 nodos)
- El backend espera que PostgreSQL este healthy, luego conecta a la DB
- El frontend se compila con React y se sirve por Nginx en el puerto 3000
- El simulator consulta los nodos reales de la DB y empieza a enviar metricas cada 5 segundos

Paso 4: Abrir http://localhost:3000
Paso 5: Login con Auth0
Paso 6: Ver el dashboard con datos en tiempo real

---

## Puntos Clave para Mencionar

- Solo se necesita Docker Desktop instalado. Nada mas.
- No hay que tocar ningun archivo de configuracion.
- El mismo comando funciona en Windows, Mac y Linux.
- Los datos persisten entre reinicios gracias al volumen de Docker (postgres_data).
- Para borrar todo y empezar de cero: docker compose down -v
