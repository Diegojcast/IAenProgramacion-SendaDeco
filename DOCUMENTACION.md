# Documentación Técnica — Senda Deco

**Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Introducción

Senda Deco es una plataforma de ecommerce desarrollada para la venta y gestión de productos de decoración artesanal. El sistema fue diseñado con un enfoque integral: no se limita a la venta online, sino que abarca todo el ciclo de vida de un pedido, desde que el cliente lo realiza hasta que el artículo es producido, asignado a un trabajador y entregado.

La plataforma atiende tres tipos de usuarios con necesidades distintas:

- **Clientes:** navegan el catálogo, agregan productos al carrito, completan el checkout y hacen seguimiento de su pedido.
- **Administradores:** gestionan el catálogo de productos, visualizan y actualizan pedidos, administran trabajadores y configuran la página principal.
- **Trabajadores:** acceden a su agenda de tareas asignadas, visualizan los pasos de producción pendientes y registran el avance.

Un diferenciador importante es la incorporación de inteligencia artificial mediante un motor de recomendación semántico: el cliente puede describir en lenguaje natural para quién es el regalo, y el sistema sugiere productos relevantes usando embeddings y similitud coseno.

---

## 2. Descripción General del Sistema

El sistema es una aplicación web full-stack construida sobre Next.js, que actúa simultáneamente como servidor de renderizado, API REST y cliente. La base de datos es PostgreSQL alojada en Neon (serverless), accedida mediante Prisma ORM. El hosting es Vercel con despliegue continuo.

**Capacidades principales:**

| Área | Descripción |
|---|---|
| Ecommerce | Catálogo, carrito persistente en estado de cliente, checkout con validación |
| Gestión de pedidos | Flujo de estado: pendiente → en producción → listo → enviado → entregado |
| Producción | Pasos por producto, asignación por categoría de trabajador, tiempo estimado |
| Agenda | Vista de calendario por trabajador con tareas programadas |
| IA | Recomendación por consulta libre usando embeddings semánticos |
| Administración | CRUD completo de productos, categorías, colores, materiales, trabajadores |
| Emails | Confirmación de pedido al cliente y al administrador vía Resend |

---

## 3. Arquitectura del Sistema

### Patrón general

La aplicación sigue el patrón **Full-Stack Monolito Modular** sobre Next.js App Router. No existe un backend separado: los Route Handlers de Next.js (`app/api/...`) sirven como capa de API, y los Server Components realizan fetching de datos directamente en el servidor.

```
Browser
  │
  ├─ React Client Components  (carrito, checkout, recomendador)
  │
  └─ Next.js App Router
       ├─ Server Components    (catálogo, páginas de producto)
       ├─ Route Handlers       (/api/*)
       │     ├─ /api/orders        (crear pedido)
       │     ├─ /api/recommend     (motor IA)
       │     ├─ /api/admin/*       (CRUD admin)
       │     ├─ /api/worker/*      (agenda trabajadores)
       │     └─ /api/images/*      (servir imágenes binarias)
       │
       └─ Prisma ORM ──── PostgreSQL (Neon)
```

### Capas internas

- **`app/`** — Rutas y páginas (UI)
- **`components/`** — Componentes React reutilizables
- **`lib/`** — Lógica de negocio, acceso a datos, utilidades
- **`lib/repositories/`** — Queries de base de datos por dominio
- **`lib/ai/`** — Integración con Hugging Face (embeddings + similitud coseno)
- **`prisma/`** — Schema, migraciones y seed
- **`types/`** — Tipos de dominio compartidos

### Flujo de una petición típica

1. El browser hace una request (navegación o fetch).
2. Next.js enruta hacia un Server Component o Route Handler.
3. El Route Handler llama a una función de repositorio en `lib/repositories/`.
4. El repositorio ejecuta una query con Prisma Client.
5. Prisma habla con PostgreSQL en Neon sobre SSL.
6. La respuesta sube por la cadena y llega al cliente.

---

## 4. Tecnologías Utilizadas

| Tecnología | Rol | Motivo de elección |
|---|---|---|
| **Next.js 16** | Framework full-stack | App Router, Server Components, Route Handlers en un solo proyecto |
| **TypeScript** | Lenguaje | Tipado estático, seguridad en refactors, mejor DX |
| **PostgreSQL (Neon)** | Base de datos | SQL relacional robusto; Neon ofrece serverless con branching |
| **Prisma ORM** | Acceso a datos | Schema declarativo, migraciones, cliente tipado generado |
| **Auth.js v5** | Autenticación | Manejo de sesiones JWT + OAuth sin reinventar la rueda |
| **Google OAuth** | Proveedor de identidad | Sin contraseñas; los usuarios ya tienen cuenta Google |
| **Resend** | Emails transaccionales | API simple, buen rate limit, soporte React Email |
| **Hugging Face** | Embeddings IA | Modelo `BAAI/bge-small-en-v1.5` gratuito, sin GPU local |
| **Vercel** | Hosting | Integración nativa con Next.js, despliegue por push |
| **Tailwind CSS** | Estilos | Utility-first, rápido para iterar |
| **shadcn/ui** | Componentes UI | Accesible, sin lock-in, base de Radix UI |
| **Zod** | Validación de esquemas | Validación en runtime con inferencia de tipos TypeScript |
| **Jest** | Testing | Pruebas unitarias de lógica de negocio crítica |

---

## 5. Modelo de Datos

El esquema está diseñado alrededor de tres dominios principales: **catálogo**, **pedidos** y **producción**.

### Catálogo

- **Product**: entidad central. Tiene nombre, precio, descripción, campo `metadataText` (texto enriquecido usado para generar embeddings de IA), y un flag `featured`.
- **Category / Color / Material**: entidades de referencia que se vinculan a productos mediante tablas de unión.
- **ProductCategory**: relación muchos-a-muchos entre productos y categorías.
- **ProductColor**: relación muchos-a-muchos con stock individual por variante de color (un mismo producto puede tener 3 unidades en color crudo y 1 en terracota).
- **ProductMaterial**: ingredientes del producto con cantidad (base para futura gestión de insumos).
- **ProductImage**: imágenes almacenadas como binario (`Bytes`) en la base de datos, con MIME type, dimensiones y orden de sorteo.
- **ProductStep**: pasos de producción definidos a nivel de producto (plantilla), con duración en horas y categoría de trabajador requerida.

### Pedidos

- **Order**: cabecera del pedido. Contiene datos del cliente (nombre, email, teléfono, dirección), método de entrega (`envio` / `retiro`), método de pago, total y estado.
- **OrderItem**: líneas del pedido. Guarda `productName` y `price` como snapshot para que cambios futuros en el producto no alteren históricos.
- **OrderItemUnit**: representa cada unidad física de un ítem (si se piden 3 piezas, hay 3 `OrderItemUnit`). Permite asignar pasos de producción por unidad.
- **OrderStep**: copia de los `ProductStep` al momento de crear el pedido (snapshot). Incluye flag `completed` y `completedAt`. Así los pasos quedan fijos aunque se edite el producto.
- **OrderWorker**: tabla de unión que asocia trabajadores a pedidos.

### Producción y Agenda

- **Worker**: trabajadores del taller. Tienen email único (usado para login), nombre, apellido, y pueden ser marcados como `isAdmin`.
- **WorkerCategory**: especialidades de cada trabajador.
- **WorkerAvailability**: horas disponibles por fecha concreta (excepción/override).
- **WorkerDefaultAvailability**: disponibilidad predeterminada por día de semana (ej: lunes 8hs, sábado 4hs).
- **ScheduledTask**: asignación concreta de un `OrderStep` a un trabajador en una fecha con horas asignadas. Es la unidad de la agenda.

### Configuración

- **HomepageSettings**: fila singleton que almacena la imagen hero y datos configurables de la página principal.

---

## 6. Flujo del Sistema (End-to-End)

### Flujo de compra

```
1. Cliente navega el catálogo
       │
       ▼
2. Agrega producto al carrito (estado React, sin persistencia en DB)
       │
       ▼
3. Completa el formulario de checkout
   - Validación client-side con Zod + react-hook-form
   - Campos: datos personales, método de entrega, método de pago
       │
       ▼
4. POST /api/orders
   - Validación server-side con Zod
   - Crea Order + OrderItems + OrderItemUnits + OrderSteps (snapshot de pasos)
   - Envía email de confirmación al cliente (Resend)
   - Envía email de notificación al admin (Resend)
   - Retorna { orderId }
       │
       ▼
5. Redirección a /confirmacion?orderId=...
```

### Flujo de producción

```
1. Admin visualiza pedido "pendiente" en panel
       │
       ▼
2. Admin asigna trabajadores al pedido
       │
       ▼
3. Admin avanza estado → "en_produccion"
       │
       ▼
4. Sistema genera ScheduledTasks automáticamente
   (distribuye horas de los OrderSteps en la agenda de trabajadores)
       │
       ▼
5. Trabajador ve tareas en su agenda (/mi-trabajo)
       │
       ▼
6. Trabajador completa pasos → actualiza OrderSteps
       │
       ▼
7. Admin avanza: "listo" → "enviado" → "entregado"
       │
       ▼
8. Cliente puede consultar estado en /seguimiento
```

### Flujo del recomendador IA

```
1. Cliente escribe descripción libre ("regalo para mamá, le gustan las plantas")
       │
       ▼
2. POST /api/recommend { query }
       │
       ▼
3. Servidor genera embedding del query (HF API, 1 llamada)
       │
       ▼
4. Servidor genera embeddings de todos los productos en paralelo (HF API, 1 llamada batch)
   - Texto = nombre + descripción + metadataText
       │
       ▼
5. Calcula similitud coseno entre query y cada producto
       │
       ▼
6. Retorna top 5 productos ordenados por score
       │
       ▼
7. UI muestra resultados con razón de recomendación
```

---

## 7. Descripción de Módulos

### 7.1 Módulo Ecommerce

El catálogo se renderiza como Server Component, consultando productos directamente en el servidor con Prisma. Los productos soportan múltiples categorías, variantes de color con stock individual, e imágenes binarias servidas vía `/api/images/product/[id]/[imageId]`.

El **carrito** es gestionado con un Context de React (`lib/cart-context.tsx`) sin persistencia en base de datos. Esta decisión mantiene la experiencia fluida sin necesidad de autenticación previa para comprar.

El **checkout** aplica validación dual: Zod en el cliente (feedback inmediato en el formulario) y Zod nuevamente en el servidor (seguridad). El esquema central vive en `lib/checkout-schema.ts` y es compartido entre ambos. Al confirmar, el servidor calcula el tiempo de entrega estimado (`lib/delivery.ts`) considerando stock disponible vs. producción bajo demanda.

Los métodos de pago soportados son MercadoPago, transferencia bancaria y efectivo. El pago online no está integrado directamente en la plataforma en esta versión; la confirmación es manual.

### 7.2 Módulo de Administración

El panel de administración (`/admin`) está protegido por middleware de Auth.js. Solo usuarios cuyo email está en la variable `ADMIN_EMAILS` pueden acceder.

Funcionalidades disponibles:

- **Productos**: creación, edición, activación/desactivación, gestión de imágenes (upload con compresión automática a WebP via `sharp`), definición de pasos de producción.
- **Categorías / Colores / Materiales**: CRUD completo.
- **Pedidos**: listado con filtros por estado, detalle de cada pedido, avance de estado, asignación de trabajadores, vista de pasos completados.
- **Trabajadores**: alta/baja, asignación de especialidades, configuración de disponibilidad.
- **Homepage**: edición de imagen hero y contenido destacado.

Las imágenes se almacenan directamente en PostgreSQL como `Bytes`. Esta decisión evita la necesidad de un servicio externo de storage (S3, Cloudinary), simplificando el stack para el volumen de imágenes esperado.

### 7.3 Módulo de Producción

Cada producto define una secuencia de **pasos de producción** (`ProductStep`): nombre, duración estimada en horas y categoría de trabajador requerida. Ejemplo: paso 1 "Armado de estructura" (macramé, 4hs), paso 2 "Teñido" (tintorería, 2hs).

Al confirmar un pedido, el sistema hace un **snapshot** de esos pasos en `OrderStep`. Esto garantiza que si el producto es modificado después, los pasos del pedido ya creado no cambian.

Cada ítem del pedido se descompone en unidades físicas (`OrderItemUnit`). Si el cliente pidió 2 jarrones, existen 2 unidades, y cada una tiene su propia copia de los pasos. Esto permite trackear el progreso individualmente.

Las **tareas programadas** (`ScheduledTask`) distribuyen las horas de cada paso en el calendario de los trabajadores, respetando su disponibilidad configurada.

### 7.4 Módulo Recomendador IA

El recomendador utiliza un enfoque de **búsqueda semántica por similitud vectorial**. La implementación no requiere base de datos vectorial ni infraestructura adicional: los embeddings se generan en tiempo real y la similitud se calcula en memoria.

**Componentes técnicos:**

- **`lib/ai/embeddings.ts`**: cliente HTTP contra la API de Hugging Face. Usa el modelo `BAAI/bge-small-en-v1.5` (384 dimensiones). Soporta embedding individual y batch en una sola llamada. Como la API retorna embeddings por token (matriz `seq_len × 384`), se aplica **mean pooling** para obtener un único vector por texto.

- **`lib/ai/similarity.ts`**: implementación de similitud coseno en TypeScript puro. Calcula el ángulo entre dos vectores: valores cercanos a 1 indican alta similitud semántica.

- **`app/api/recommend/route.ts`**: el endpoint orquesta el flujo con exactamente 2 llamadas a la API externa (query + batch de productos), ejecutadas en paralelo con `Promise.all`. Retorna los 5 productos más relevantes con su score y una razón descriptiva.

El campo `metadataText` en cada producto permite enriquecer el texto usado para generar embeddings con palabras clave adicionales que no aparecen en el nombre ni descripción visible.

## 7.5 Diseño de la Arquitectura de Inteligencia Artificial

El sistema fue diseñado contemplando desde su concepción la integración de inteligencia artificial como un componente transversal, no como una funcionalidad aislada.

En lugar de incorporar IA como una capa externa posterior, se definieron puntos claros dentro de la arquitectura donde la inteligencia artificial puede intervenir en la toma de decisiones y mejora de la experiencia del usuario.

### Principios adoptados

- **Desacoplamiento:** el módulo de IA (recomendador) se implementa como un componente independiente dentro de `lib/ai/`, permitiendo reemplazar fácilmente el proveedor de embeddings sin afectar el resto del sistema.
  
- **Interfaz estable:** la función `getEmbedding()` abstrae el proveedor de IA, permitiendo cambiar entre Hugging Face, OpenAI o modelos locales sin modificar la lógica de negocio.

- **Procesamiento semántico:** el sistema no depende de reglas rígidas ni filtros predefinidos, sino que interpreta intención del usuario mediante representaciones vectoriales.

- **Extensibilidad:** el uso de embeddings habilita futuras funcionalidades como:
  - búsqueda semántica de productos
  - clustering de catálogo
  - generación automática de metadata
  - optimización de producción basada en demanda

### Ubicación en la arquitectura

El módulo de IA se integra en el backend como un servicio interno:

- Es invocado desde `/api/recommend`
- Interactúa con servicios externos (Hugging Face)
- Procesa datos del dominio (productos)
- Devuelve resultados enriquecidos al frontend

### Evolución futura

La arquitectura permite evolucionar hacia:

- modelos locales (ej: Transformers)
- bases de datos vectoriales (pgvector)
- sistemas de recomendación híbridos (reglas + IA)

Esto demuestra que la inteligencia artificial no fue solo utilizada, sino considerada como un componente estructural del sistema.

---

## 8. Integraciones Externas

### 8.1 Autenticación — Google OAuth + Auth.js

La autenticación está manejada por Auth.js v5 con el proveedor de Google. El sistema usa sesiones JWT (sin base de datos de sesiones).

La lógica de autorización es personalizada:
- Si el email del usuario está en `ADMIN_EMAILS` → rol `admin`.
- Si el email existe en la tabla `Worker` → rol `worker`, con el `workerId` incluido en el token.
- Si ninguna condición se cumple → acceso denegado (`signIn` retorna `false`).

Esta restricción permite que el sistema no sea de registro abierto: solo pueden acceder personas que el administrador haya registrado previamente.

### 8.2 Emails — Resend

Se envían emails transaccionales en dos momentos:
1. **Confirmación al cliente**: cuando el pedido es creado exitosamente.
2. **Notificación al administrador**: para alertar de un nuevo pedido.

Los emails están configurados en `lib/email/` usando la API de Resend. El remitente es configurable vía la variable `EMAIL_FROM`.

### 8.3 IA — Hugging Face Inference API

La integración usa el endpoint serverless de Hugging Face (no requiere GPU propia ni instancia dedicada). El modelo `BAAI/bge-small-en-v1.5` es un modelo de embedding de texto ligero (~33M parámetros) con buenos resultados en tareas de recuperación semántica.

La autenticación se hace con un token Bearer definido en `HUGGINGFACE_API_KEY`. El endpoint es `router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5`.

**Consideración de idioma:** el modelo fue entrenado principalmente en inglés. Para un catálogo en español, el rendimiento es aceptable pero no óptimo. Una mejora futura sería usar un modelo multilingüe como `intfloat/multilingual-e5-small`.

---

## 9. Seguridad

### Autenticación y autorización
- Todas las rutas `/admin/*` y `/api/admin/*` están protegidas por middleware de Auth.js que verifica el token JWT y el rol.
- Las rutas de trabajador (`/mi-trabajo`, `/api/worker/*`) requieren rol `worker` o `admin`.
- Los endpoints públicos (`/api/orders`, `/api/recommend`) aplican validación de entrada con Zod para prevenir datos malformados.

### Validación de entrada
- El esquema de checkout en `lib/checkout-schema.ts` es la fuente de verdad tanto para el cliente como para el servidor. Ningún pedido puede crearse sin pasar validación server-side, independientemente de lo que el cliente envíe.
- Los parámetros de ruta dinámica son validados antes de usarse en queries.

### Variables de entorno
- Todas las claves sensibles (DB, OAuth, APIs) se gestionan como variables de entorno. El archivo `.env` no se commitea al repositorio.
- En Vercel, las variables de entorno se configuran en el panel del proyecto y se inyectan en build y runtime.

### Almacenamiento de imágenes
- Las imágenes se sirven vía API Route, no como archivos estáticos. El servidor controla el acceso y puede aplicar validaciones adicionales si fuera necesario.

### Protección contra inyección SQL
- Al usar Prisma ORM con queries parametrizadas, no hay interpolación directa de strings en SQL. El riesgo de SQL injection está eliminado por diseño.

---

## 10. Pruebas (Testing)

El proyecto incluye una suite de pruebas unitarias con **Jest** ubicadas en `__tests__/`, cubriendo la lógica de negocio más crítica:

| Archivo de test | Qué cubre |
|---|---|
| `checkout-schema.test.ts` | Validación del formulario de checkout: campos obligatorios, formatos, reglas condicionales (dirección obligatoria solo si el método es envío) |
| `delivery.test.ts` | Cálculo de plazos de entrega: stock disponible vs. fabricación bajo demanda, cálculo de días de producción a partir de horas |
| `format.test.ts` | Funciones de formateo: precios, fechas, textos |

Estas pruebas corren con `jest` y están configuradas en `jest.config.ts`. Al ser pruebas unitarias puras (sin base de datos ni red), son rápidas y pueden ejecutarse en cualquier entorno.

La estrategia de testing es **pragmática**: se priorizan las funciones con lógica de negocio compleja y propensa a errores de regresión, sin apuntar a cobertura total del código.

---

## 11. Calidad de Código

- **TypeScript estricto**: tipado en toda la base de código. Los tipos de dominio están centralizados en `types/index.ts` y los tipos de repositorio en `lib/repositories/`.
- **Separación de responsabilidades**: la lógica de negocio vive en `lib/`, no en los componentes ni en los Route Handlers. Los handlers son delgados: validan, llaman a repositorios y retornan respuestas.
- **Fuente única de verdad**: el esquema de validación del checkout, los estados de pedido y sus transiciones válidas son definidos una sola vez y reutilizados en todos los contextos (cliente, servidor, admin, worker).
- **ESLint** configurado con reglas estándar para Next.js.
- **Prettier** configurado para formateo consistente.
- **Sin código muerto**: los campos deprecados del modelo (`production_time`, `drying_time`) están documentados explícitamente en el schema con comentarios que explican el motivo de su existencia.

---

## 12. Decisiones de Diseño (Trade-offs)

### Imágenes en base de datos (no en storage externo)
**Decisión:** las imágenes de productos y categorías se almacenan como `Bytes` en PostgreSQL.  
**Ventaja:** stack más simple, sin servicios externos adicionales, sin costos de S3.  
**Trade-off:** el tamaño de la base de datos crece con las imágenes; no es la solución más eficiente para un catálogo muy grande. Las imágenes se comprimen a WebP antes de almacenarse para mitigar esto.

### Carrito en estado del cliente (no en DB)
**Decisión:** el carrito vive en un Context de React, sin persistencia en base de datos.  
**Ventaja:** compras sin necesidad de crear cuenta; arquitectura más simple.  
**Trade-off:** el carrito se pierde si el usuario cierra el browser. Para el perfil de clientes de una tienda artesanal, esto es aceptable.

### Embeddings en tiempo real (no pre-computados)
**Decisión:** los embeddings de productos se generan en cada consulta al recomendador, no se persisten.  
**Ventaja:** siempre reflejan el estado actual del catálogo; no requiere proceso de indexación.  
**Trade-off:** cada consulta genera N+1 embeddings (query + todos los productos). Mitigado usando la API batch de HF que agrupa todos los productos en una sola llamada HTTP. Para un catálogo grande, la solución correcta sería pre-computar y almacenar los embeddings en DB.

### Snapshot de pasos en pedidos
**Decisión:** al crear un pedido, los pasos de producción del producto se copian en `OrderStep`.  
**Ventaja:** los pedidos históricos no se ven afectados si se modifica el producto posteriormente.  
**Trade-off:** hay duplicación de datos entre `ProductStep` y `OrderStep`. Es una duplicación intencionada y necesaria.

### Auth sin base de datos de sesiones
**Decisión:** Auth.js configurado con JWT, sin tabla de sesiones en la DB.  
**Ventaja:** sin overhead de DB en cada request autenticado.  
**Trade-off:** no es posible invalidar sesiones activas de forma inmediata (el token sigue siendo válido hasta su expiración). Aceptable para el uso interno del panel.

---

## 13. Escalabilidad y Mejoras Futuras

### Corto plazo

- **Pre-computar embeddings:** almacenar el vector de embedding de cada producto en la base de datos y actualizarlo solo cuando el producto cambia. Esto elimina la dependencia de la API de HF en cada consulta y reduce la latencia del recomendador de ~700ms a ~50ms.

- **Modelo multilingüe:** reemplazar `BAAI/bge-small-en-v1.5` por `intfloat/multilingual-e5-small` o similar para mejor calidad semántica con texto en español.

- **Pago online:** integrar MercadoPago Checkout Pro para procesar pagos en línea directamente, eliminando la confirmación manual.

### Mediano plazo

- **Gestión de stock en tiempo real:** actualmente el stock por variante de color se descuenta manualmente. Implementar descuento automático al confirmar un pedido y reposición al cancelarlo.

- **Notificaciones push / email al cliente:** informar automáticamente al cliente cuando su pedido cambia de estado.

- **Panel de analytics:** métricas de ventas, productos más vendidos, tiempos promedio de producción.

### Largo plazo

- **Separación frontend/backend:** a medida que crece el equipo, puede tener sentido separar la API en un servicio independiente. La arquitectura actual facilita esta transición porque la lógica de negocio ya está desacoplada en `lib/`.

- **Base de datos vectorial:** si el catálogo crece significativamente, reemplazar la similitud coseno en memoria por una base de datos vectorial (pgvector sobre el mismo PostgreSQL es la opción más natural dado el stack actual) para búsquedas más eficientes.

- **Cache de respuestas:** implementar caché en los endpoints públicos más consultados (catálogo, detalle de producto) usando los mecanismos de caché de Next.js, reduciendo la carga sobre la base de datos.

---

*Documentación generada a partir del código fuente del proyecto Senda Deco — Abril 2026.*
