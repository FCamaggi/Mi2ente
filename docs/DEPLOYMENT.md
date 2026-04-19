# 🚀 DEPLOYMENT.md — ProfeApp
**Render (Frontend + Backend) + MongoDB Atlas**

---

## Resumen

| Servicio | Plan | Costo | URL |
|---|---|---|---|
| MongoDB Atlas | M0 (free) | $0/mes | cluster0.xxxxx.mongodb.net |
| Render Backend | Starter ($7/mes) o Free | $0-7/mes | profe-app-api.onrender.com |
| Render Frontend | Static Site (free) | $0/mes | profe-app.onrender.com |

> ⚠️ El plan Free de Render hace spin-down tras 15min de inactividad (primer request tarda ~30s en despertar). Para producción real usar plan Starter ($7/mes).

---

## Paso 1 — MongoDB Atlas

### 1.1 Crear cuenta y cluster
1. Ir a [cloud.mongodb.com](https://cloud.mongodb.com)
2. Crear cuenta gratuita
3. Crear un proyecto: `ProfeApp`
4. Crear cluster: **M0 Free** · proveedor AWS · región más cercana (ej: São Paulo)
5. Nombre del cluster: `Cluster0`

### 1.2 Configurar usuario de base de datos
1. Security → Database Access → Add New Database User
2. Authentication Method: Password
3. Username: `profeapp-user`
4. Password: generar contraseña segura y guardarla
5. Database User Privileges: **Read and write to any database**
6. Click Add User

### 1.3 Whitelist de IPs
1. Security → Network Access → Add IP Address
2. Seleccionar **Allow Access from Anywhere** (`0.0.0.0/0`)
   > Render usa IPs dinámicas, por lo que necesitas permitir todas.
   > En producción seria recomendable usar VPC peering (planes pagados).

### 1.4 Obtener la Connection String
1. Clusters → Connect → Connect your application
2. Driver: Node.js · Version: 5.5 or later
3. Copiar la string: `mongodb+srv://profeapp-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
4. Reemplazar `<password>` con la contraseña del paso 1.2
5. Agregar el nombre de la DB: `.../profeapp?retryWrites=true&w=majority`

**Connection string final:**
```
mongodb+srv://profeapp-user:TU_PASSWORD@cluster0.xxxxx.mongodb.net/profeapp?retryWrites=true&w=majority
```

---

## Paso 2 — Preparar el Repositorio

### Estructura de repositorios (2 opciones)

**Opción A — Monorepo (recomendada):**
```
profe-app/          ← 1 solo repo en GitHub
├── frontend/
│   ├── package.json
│   └── ...
├── backend/
│   ├── package.json
│   └── ...
└── README.md
```

**Opción B — 2 repos separados:**
```
profe-app-frontend/     ← repo 1
profe-app-backend/      ← repo 2
```

### Backend: package.json scripts
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev":   "nodemon src/index.js"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### Frontend: variables de entorno para build
```env
# frontend/.env.production
VITE_API_URL=https://profe-app-api.onrender.com/api
```

### Frontend: vite.config.js
```js
export default {
  build: { outDir: 'dist' },
  // Sin base path si es dominio raíz
}
```

---

## Paso 3 — Deploy del Backend en Render

1. Ir a [render.com](https://render.com) → New → **Web Service**
2. Conectar tu cuenta de GitHub y seleccionar el repositorio
3. Configurar:

| Campo | Valor |
|---|---|
| Name | `profe-app-api` |
| Root Directory | `backend` (si monorepo) |
| Environment | `Node` |
| Region | Oregon (o la más cercana) |
| Branch | `main` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Plan | Free (o Starter $7 para producción) |

4. **Environment Variables** → Add from .env:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://profeapp-user:...
JWT_ACCESS_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<64-char-random-string>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://profe-app.onrender.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=ProfeApp <no-reply@profeapp.com>
```

> Para generar secrets seguros:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

5. Click **Create Web Service** → Render hace deploy automático
6. Esperar ~3 minutos → URL: `https://profe-app-api.onrender.com`
7. Verificar: `GET https://profe-app-api.onrender.com/api/health` → `200` con `data.database.connected = true`

---

## Paso 4 — Deploy del Frontend en Render

1. Render → New → **Static Site**
2. Seleccionar el mismo repositorio
3. Configurar:

| Campo | Valor |
|---|---|
| Name | `profe-app` |
| Root Directory | `frontend` (si monorepo) |
| Branch | `main` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

4. **Environment Variables:**
```
VITE_API_URL=https://profe-app-api.onrender.com/api
```

5. **Redirects/Rewrites** → Add Rule:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: Rewrite
   > Necesario para que React Router funcione en refresh/deep links

6. Click **Create Static Site** → URL: `https://profe-app.onrender.com`

---

## Paso 5 — Dominio Personalizado (opcional)

Si Antonia (o tú) quieren un dominio propio como `profeapp.cl`:

1. Comprar dominio en NIC.cl (~$5/año) o Namecheap
2. Render → tu sitio → Settings → Custom Domains
3. Agregar el dominio → Render da los DNS records (CNAME o A)
4. Configurar los DNS en el proveedor del dominio
5. Render provisiona SSL automáticamente con Let's Encrypt ✅

---

## Paso 6 — CI/CD Automático

Render hace **auto-deploy** en cada push a `main`. No requiere configuración adicional.

**Flujo recomendado:**
```
dev branch → PR → code review → merge to main → Render deploy automático
```

---

## Monitoreo y Logs

### Ver logs del backend en Render:
- Render Dashboard → profe-app-api → Logs
- Filtrar por nivel: info, warn, error

### MongoDB Atlas:
- Atlas → tu cluster → Monitoring
- Ver conexiones activas, queries lentas, espacio usado

---

## Checklist de Deploy

### Pre-deploy:
- [ ] Variables de entorno configuradas en Render (backend)
- [ ] `VITE_API_URL` apunta al backend de Render (frontend)
- [ ] MongoDB Atlas: usuario creado + IP whitelist configurada
- [ ] CORS del backend permite `FRONTEND_URL` de Render
- [ ] `engines.node` en package.json del backend
- [ ] `render.yaml` presente y ajustado si usas deploy desde repositorio

### Post-deploy:
- [ ] `GET /api/health` retorna 200
- [ ] `GET /api/health` reporta `database.connected: true`
- [ ] `POST /api/auth/register` funciona
- [ ] `POST /api/auth/login` funciona
- [ ] Frontend carga sin errores de consola
- [ ] Redirect de React Router funciona (escribir URL directo en barra)
- [ ] Las notas se guardan y persisten tras reload

---

## Solución de Problemas Comunes

### Error: "MongooseServerSelectionError"
→ Verificar que la IP `0.0.0.0/0` está en el whitelist de Atlas  
→ Verificar que la connection string es correcta (sin `<password>` literal)

### Error: "CORS policy"
→ Verificar que `FRONTEND_URL` en las env vars del backend es exactamente `https://profe-app.onrender.com` (sin slash final)

### Frontend muestra pantalla en blanco en rutas directas
→ Verificar que la regla de Rewrite `/*` → `/index.html` está configurada en Render

### Backend en Free tier tarda en responder
→ Normal. El primer request después de inactividad tarda ~30s (cold start)  
→ Solución: upgrade a plan Starter ($7/mes)

### Las notas no se guardan
→ Verificar en Render logs si hay errores de conexión a MongoDB  
→ Verificar que `MONGODB_URI` en las env vars no tiene caracteres especiales sin encodear

---

## Backup y Recuperación

MongoDB Atlas M0 no incluye backups bajo demanda, pero:
- Puedes exportar manualmente: Atlas → your cluster → Command Line Tools → `mongodump`
- Para producción real, considerar M10+ que incluye Point-in-Time Recovery

**Script de export:**
```bash
mongodump \
  --uri="mongodb+srv://profeapp-user:PASSWORD@cluster0.xxxxx.mongodb.net/profeapp" \
  --out=./backup-$(date +%Y%m%d)
```
