# Votación UNAL

Plataforma para votar sobre mecanismos asamblearios. Solo pueden participar personas con correo **@unal.edu.co** que se conecten desde Antioquia.

> **Stack:** Next.js 14 (App Router) · React 18 · Auth0 · Neon DB (PostgreSQL) · Tailwind CSS · Vercel

---

## ¿Qué hace esta plataforma?

- Los usuarios inician sesión con **Auth0** (Google @unal.edu.co).
- Pueden elegir entre 5 opciones de mecanismo (Anormalidad académica, Asamblea escalonada, Asamblea permanente, Paro, Normalidad).
- Solo se permite votar si la conexión proviene de Antioquia (verificado via header Vercel o geojs.io).
- Los resultados se muestran en la página principal en tiempo real (ISR cada 30 s).
- **El voto es anónimo:** Se almacena un hash HMAC-SHA256 del correo, nunca el correo en sí. El hash es idéntico al generado por la versión PHP anterior para compatibilidad de migraciones.

---

## Setup local

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/unalvotacion/paginavotacion.git
cd paginavotacion
npm install
```

### 2. Variables de entorno

Copia `.env.example` a `.env.local` y rellena todos los valores:

```bash
cp .env.example .env.local
```

| Variable | Descripción |
|---|---|
| `AUTH0_SECRET` | Secreto aleatorio: `openssl rand -hex 32` |
| `AUTH0_BASE_URL` | URL base, ej. `http://localhost:3000` |
| `AUTH0_ISSUER_BASE_URL` | `https://YOUR_TENANT.auth0.com` |
| `AUTH0_CLIENT_ID` | Client ID de tu app Auth0 |
| `AUTH0_CLIENT_SECRET` | Client Secret de tu app Auth0 |
| `DATABASE_URL` | Connection string de Neon DB |
| `HASH_PEPPER` | Pepper para HMAC-SHA256 |
| `GEO_RESTRICT` | `true` / `false` (deshabilitar en dev local) |

### 3. Configurar Auth0

1. Crea una **Regular Web Application** en [Auth0 Dashboard](https://manage.auth0.com).
2. En **Settings → Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
3. En **Settings → Allowed Logout URLs**: `http://localhost:3000`
4. Activa la conexión **Google** en *Authentication → Social*.
5. En la conexión Google → Settings → pon `hd=unal.edu.co` en el campo **Hosted Domain** para restringir a correos UNAL.

### 4. Crear la base de datos en Neon

1. Crea un proyecto en [console.neon.tech](https://console.neon.tech).
2. Copia la **Connection string** a `DATABASE_URL` en `.env.local`.
3. Ejecuta las migraciones:

```bash
node scripts/migrate.mjs
```

### 5. Correr en desarrollo

```bash
npm run dev
```

Visita [http://localhost:3000](http://localhost:3000).

---

## Estructura del proyecto

```
app/
  layout.tsx          # Root layout + Auth0 UserProvider
  page.tsx            # Home (resultados + login)
  vote/page.tsx       # Formulario de voto (protegido por middleware)
  thanks/page.tsx     # Confirmación post-voto
  blocked/page.tsx    # Página de restricción geo
  not-found.tsx       # 404
  api/
    auth/[auth0]/     # Auth0 catch-all handler
    results/          # GET resultados
    vote/             # POST registrar voto
components/
  HomeClient.tsx      # Título + botón disclaimer (client component)
  DisclaimerModal.tsx # Modal de disclaimer legal
  ResultsTable.tsx    # Tabla de resultados
  VoteForm.tsx        # Formulario de voto interactivo
lib/
  db.ts               # Cliente Neon DB
  hash.ts             # HMAC-SHA256 voter hash
  geo.ts              # Restricción geográfica
middleware.ts         # Protege /vote con Auth0
sql/schema.sql        # DDL PostgreSQL (Neon)
scripts/migrate.mjs   # Ejecuta el schema en Neon
```

---

## Deploy en Vercel

```bash
vercel --prod
```

Agrega las variables de entorno en **Vercel → Project → Settings → Environment Variables** y actualiza `AUTH0_BASE_URL` con tu dominio de producción.

---

## DISCLAIMER LEGAL

**1. Carácter no vinculante:** Los resultados de esta votación tienen carácter exclusivamente informativo y no constituyen, por sí mismos, una decisión oficial sobre el mecanismo a adoptar, salvo validación expresa en asamblea.

**2. No afiliación institucional:** Este sitio web es una iniciativa independiente y no está afiliado, administrado, respaldado ni representa oficialmente a la Universidad Nacional de Colombia.

**3. Uso voluntario:** La participación en esta plataforma es voluntaria y su utilización implica la aceptación de este aviso.

**4. Disponibilidad del servicio:** No se garantiza la disponibilidad continua, ausencia de errores o ininterrupción del servicio.

**5. Contacto:** Para reportes o incidencias, escribir a unalvotacion@proton.me.

---

## ¿Dónde pedir ayuda?

Si ves errores o algo no funciona, escribe a **unalvotacion@proton.me**.
