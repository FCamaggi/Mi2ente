# 🎨 UI_UX_GUIDE.md — ProfeApp
**Guía de Diseño UI/UX · 5 Temas · Componentes · Flujos**

---

## 1. Principios de Diseño

1. **Claridad sobre belleza** — cada elemento tiene un propósito claro
2. **Mobile-first** — diseñado primero para 360px, luego expandido
3. **Reducir carga cognitiva** — la profe no debería pensar, debería hacer
4. **Feedback inmediato** — cada acción tiene respuesta visual (save, error, loading)
5. **Consistencia** — mismos colores, iconos y patrones en toda la app

---

## 2. Los 5 Temas

Cada tema define un conjunto de tokens CSS (`--color-*`) que se aplican a todo el sistema.

### 🌸 Tema 1: Rosa Sakura (default)
*Suave, femenino, acogedor. El tema de Antonia.*

```css
:root[data-theme="rosa"] {
  /* Colores primarios */
  --color-primary-50:  #fdf2f8;
  --color-primary-100: #fce7f3;
  --color-primary-200: #fbcfe8;
  --color-primary-300: #f9a8d4;
  --color-primary-400: #f472b6;
  --color-primary-500: #ec4899;   /* Principal */
  --color-primary-600: #db2777;   /* Hover */
  --color-primary-700: #be185d;   /* Active */

  /* Acento */
  --color-accent:      #a855f7;   /* Lila */
  --color-accent-soft: #f3e8ff;

  /* Superficie */
  --color-bg:          #fff7fb;   /* Fondo de la app */
  --color-surface:     #ffffff;   /* Cards, paneles */
  --color-surface-2:   #fdf4f9;   /* Filas alternas en tabla */
  --color-border:      #fce7f3;

  /* Texto */
  --color-text-primary:   #1e1b4b;
  --color-text-secondary: #9ca3af;
  --color-text-muted:     #d1d5db;

  /* Estados */
  --color-success:     #10b981;   /* Aprobado */
  --color-danger:      #ef4444;   /* Reprobado / error */
  --color-warning:     #f59e0b;
  --color-info:        #6366f1;

  /* Sidebar */
  --color-sidebar-bg:   #1e1b4b;
  --color-sidebar-text: #e0d7f7;
  --color-sidebar-active: #ec4899;

  /* Grilla de notas */
  --color-grade-fail:  #fee2e2;   /* Fondo celda con nota roja */
  --color-grade-ok:    #f0fdf4;   /* Fondo celda con nota aprobada */
  --color-row-alt:     #fdf4f9;   /* Fila par */
  --color-row-hover:   #fce7f3;   /* Fila hover */

  /* Sombras */
  --shadow-sm: 0 1px 3px rgba(236, 72, 153, 0.1);
  --shadow-md: 0 4px 12px rgba(236, 72, 153, 0.15);

  /* Tipografía */
  --font-display: 'Nunito', 'Inter', sans-serif;
  --font-body:    'Inter', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* Border radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
}
```

---

### 🌊 Tema 2: Azul Océano
*Profesional, confiable, tranquilo.*

```css
:root[data-theme="oceano"] {
  --color-primary-500: #0ea5e9;
  --color-primary-600: #0284c7;
  --color-primary-700: #0369a1;
  --color-accent:      #06b6d4;
  --color-accent-soft: #e0f2fe;
  --color-bg:          #f0f9ff;
  --color-surface:     #ffffff;
  --color-surface-2:   #f0f9ff;
  --color-border:      #bae6fd;
  --color-text-primary:   #0c4a6e;
  --color-text-secondary: #6b7280;
  --color-sidebar-bg:     #0c4a6e;
  --color-sidebar-text:   #bae6fd;
  --color-sidebar-active: #0ea5e9;
  --color-row-alt:        #f0f9ff;
  --color-row-hover:      #e0f2fe;
  --shadow-sm: 0 1px 3px rgba(14, 165, 233, 0.1);
  --shadow-md: 0 4px 12px rgba(14, 165, 233, 0.15);
  --font-display: 'Inter', sans-serif;
  --font-body:    'Inter', sans-serif;
  /* Hereda radius, success, danger, warning del root */
}
```

---

### 🌿 Tema 3: Verde Bosque
*Natural, fresco, energizante.*

```css
:root[data-theme="bosque"] {
  --color-primary-500: #059669;
  --color-primary-600: #047857;
  --color-primary-700: #065f46;
  --color-accent:      #34d399;
  --color-accent-soft: #d1fae5;
  --color-bg:          #f0fdf4;
  --color-surface:     #ffffff;
  --color-surface-2:   #f0fdf4;
  --color-border:      #a7f3d0;
  --color-text-primary:   #064e3b;
  --color-text-secondary: #6b7280;
  --color-sidebar-bg:     #064e3b;
  --color-sidebar-text:   #a7f3d0;
  --color-sidebar-active: #34d399;
  --color-row-alt:        #f0fdf4;
  --color-row-hover:      #d1fae5;
  --shadow-sm: 0 1px 3px rgba(5, 150, 105, 0.1);
  --shadow-md: 0 4px 12px rgba(5, 150, 105, 0.15);
  --font-display: 'Nunito', 'Inter', sans-serif;
  --font-body:    'Inter', sans-serif;
}
```

---

### 🌙 Tema 4: Noche Índigo
*Dark mode elegante. Para trabajar de noche.*

```css
:root[data-theme="noche"] {
  --color-primary-500: #818cf8;
  --color-primary-600: #6366f1;
  --color-primary-700: #4f46e5;
  --color-accent:      #c084fc;
  --color-accent-soft: #312e81;
  --color-bg:          #0f0f1a;
  --color-surface:     #1a1a2e;
  --color-surface-2:   #16213e;
  --color-border:      #2d2d4e;
  --color-text-primary:   #e2e8f0;
  --color-text-secondary: #94a3b8;
  --color-text-muted:     #475569;
  --color-sidebar-bg:     #0a0a16;
  --color-sidebar-text:   #a5b4fc;
  --color-sidebar-active: #818cf8;
  --color-row-alt:        #1a1a2e;
  --color-row-hover:      #1e1e3a;
  --color-grade-fail:  #3b1616;
  --color-grade-ok:    #0d2e1a;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.5);
  --font-display: 'Inter', sans-serif;
  --font-body:    'Inter', sans-serif;
}
```

---

### 🌻 Tema 5: Otoño Dorado
*Cálido, hogareño, ámbar y terracota.*

```css
:root[data-theme="otono"] {
  --color-primary-500: #f59e0b;
  --color-primary-600: #d97706;
  --color-primary-700: #b45309;
  --color-accent:      #ef4444;
  --color-accent-soft: #fef3c7;
  --color-bg:          #fffbeb;
  --color-surface:     #ffffff;
  --color-surface-2:   #fffbeb;
  --color-border:      #fde68a;
  --color-text-primary:   #451a03;
  --color-text-secondary: #78716c;
  --color-sidebar-bg:     #451a03;
  --color-sidebar-text:   #fde68a;
  --color-sidebar-active: #f59e0b;
  --color-row-alt:        #fffbeb;
  --color-row-hover:      #fef3c7;
  --shadow-sm: 0 1px 3px rgba(245, 158, 11, 0.1);
  --shadow-md: 0 4px 12px rgba(245, 158, 11, 0.18);
  --font-display: 'Nunito', 'Inter', sans-serif;
  --font-body:    'Inter', sans-serif;
}
```

---

## 3. Implementación del ThemeProvider

```jsx
// themes/ThemeProvider.jsx
import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

export function ThemeProvider({ children }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Opcional: guardar en localStorage como respaldo
    localStorage.setItem('profeapp-theme', theme);
  }, [theme]);

  return children;
}

// store/themeStore.js
import { create } from 'zustand';

const THEMES = [
  { id: 'rosa',   name: '🌸 Rosa Sakura',   description: 'Suave y bonito' },
  { id: 'oceano', name: '🌊 Azul Océano',   description: 'Profesional y tranquilo' },
  { id: 'bosque', name: '🌿 Verde Bosque',   description: 'Natural y fresco' },
  { id: 'noche',  name: '🌙 Noche Índigo',  description: 'Dark mode elegante' },
  { id: 'otono',  name: '🌻 Otoño Dorado',  description: 'Cálido y acogedor' },
];

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('profeapp-theme') || 'rosa',
  themes: THEMES,
  setTheme: (theme) => set({ theme }),
}));
```

---

## 4. Tipografía y Escala

```css
/* Fuentes (cargar desde Google Fonts) */
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* Escala tipográfica */
--text-xs:   0.75rem;    /* 12px — labels, metadatos */
--text-sm:   0.875rem;   /* 14px — texto secundario, tabla */
--text-base: 1rem;       /* 16px — texto base */
--text-lg:   1.125rem;   /* 18px — subtítulos */
--text-xl:   1.25rem;    /* 20px — títulos de sección */
--text-2xl:  1.5rem;     /* 24px — títulos de página */
--text-3xl:  1.875rem;   /* 30px — display */
```

---

## 5. Layout Principal

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (240px desktop / drawer mobile)                 │
│  ┌──────────────────────┐                               │
│  │  🌸 ProfeApp  [tema] │   HEADER (60px)               │
│  │  Antonia Pérez       │   ─────────────────────────── │
│  │  ──────────────────  │                               │
│  │  📊 Dashboard        │   MAIN CONTENT                │
│  │  📚 Mis Cursos       │   (flex, scroll vertical)     │
│  │  👤 Perfil           │                               │
│  │  ⚙️  Config          │                               │
│  │                      │                               │
│  │  ──────────────────  │                               │
│  │  🎨 [tema switcher]  │                               │
│  └──────────────────────┘                               │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Componentes Clave

### 6.1 ThemeSwitcher

Un selector de temas visible en el sidebar (desktop) o en la config (mobile). Muestra los 5 temas como pills de color con nombre.

```
[ 🌸 Rosa ] [ 🌊 Azul ] [ 🌿 Verde ] [ 🌙 Noche ] [ 🌻 Otoño ]
    ^^^
 (activo: borde + check)
```

---

### 6.2 CourseCard (dashboard)

```
┌──────────────────────────────────┐
│  📚 Lenguaje 2°B          [···] │
│  Colegio San Pedro · 2026        │
│  ─────────────────────────────── │
│  36 alumnos · 11 evaluaciones    │
│                                  │
│  Promedio: 5.1   Aprob: 61.5%   │
│  [████████░░] 61.5%              │
│                                  │
│  [Ver curso →]          [✏️][🗑] │
└──────────────────────────────────┘
```

---

### 6.3 GradeGrid (tabla de notas)

La pieza central de la app. Debe ser fluida, intuitiva y rápida.

```
┌────┬──────────────┬──────────────┬──────────┬──────────┬─────────┬────────────┬──────────────┐
│ N° │ Apellido     │ Nombre       │ Plan     │ Prueba 2 │ ...     │ 📊 Promedio│ ✅ Situación │
│    │              │              │ lector   │          │         │            │               │
│    │              │              │ 9.1%     │ 9.1%     │         │            │               │
│    │              │              │ 15-ene   │          │         │            │               │
├────┼──────────────┼──────────────┼──────────┼──────────┼─────────┼────────────┼──────────────┤
│  1 │ Arenas       │ Julieta      │    —     │    —     │ ...     │     —      │  Sin notas   │
│  3 │ Astorga      │ Gaspar       │   5.3    │    —     │ ...     │    5.3     │ ✅ Aprobada  │
│  7 │ Choque       │ Jose         │ [3.4]🔴  │    —     │ ...     │   [3.4]🔴  │ ❌ Reprobado │
└────┴──────────────┴──────────────┴──────────┴──────────┴─────────┴────────────┴──────────────┘
│ Estadísticas:  Promedio: 5.1  |  Máx: 7.0  |  Mín: 3.0  |  Aprobación: 61.5% (16/26)       │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Comportamiento de las celdas:**
- Click simple: selecciona celda (resalta en azul/rosa)
- Click doble o Enter: entra en modo edición (input numérico)
- Tab: mueve a siguiente celda (derecha, luego baja al siguiente alumno)
- Escape: cancela edición
- Enter en edición: guarda y baja a siguiente fila
- Flechas: navega entre celdas
- Guardado: debounce 800ms tras modificación → indicador de guardado (✓)

**Colores de celdas:**
- Sin nota: gris claro, texto `—`
- Nota aprobada (≥4.0): fondo `--color-grade-ok`, texto verde
- Nota reprobada (<4.0): fondo `--color-grade-fail`, texto rojo
- Celda seleccionada: borde `--color-primary-500`, sombra suave
- Celda en edición: input con fondo blanco, borde primario

---

### 6.4 StudentProfile (ficha alumno)

Panel lateral o página full con:
- Datos del alumno (editable en línea)
- Tarjeta de promedio general (grande, con color)
- Lista de notas por evaluación
- Sección de observaciones (con botón "Agregar")

---

### 6.5 Badge de Situación

```jsx
// Aprobado/a
<span className="badge badge-success">✅ Aprobado/a</span>

// Reprobado/a
<span className="badge badge-danger">❌ Reprobado/a</span>

// Sin notas
<span className="badge badge-neutral">— Sin notas</span>
```

---

### 6.6 WeightBar (barra de ponderaciones)

```
Evaluaciones: [Plan lector 9.1%] [Prueba 2: 9.1%] ... Total: 100% ✅
                                                              [≠100%] ⚠️
```

Barra visual que muestra cómo se distribuye el 100% entre evaluaciones. Si no suma 100%, aparece advertencia amarilla (no bloquea).

---

## 7. Flujos de Usuario

### Flujo 1: Primera vez en la app
```
1. Register → completar nombre, email, password, colegio
2. Redirect a Dashboard vacío
3. Banner: "¡Bienvenida! Crea tu primer curso 👇"
4. Click "Crear curso" → Modal con formulario
5. Guardar → aparece curso en dashboard
6. Click "Ver curso" → CourseDetail vacío
7. Agregar evaluaciones → Agregar alumnos → Ingresar notas
```

### Flujo 2: Ingresar notas (uso diario)
```
1. Dashboard → click en el curso
2. GradeGrid visible de inmediato
3. Click en celda de nota
4. Escribir nota → Tab para siguiente
5. Guardado automático → toast "✓ Guardado"
```

### Flujo 3: Ver ficha de alumno
```
1. GradeGrid → click en nombre del alumno
2. Panel lateral se abre (slide-in)
3. Ver promedio, notas por evaluación, observaciones
4. Agregar observación → textarea + botón Guardar
5. Panel se cierra con Escape o click fuera
```

### Flujo 4: Cambiar tema
```
1. Sidebar → selector de temas (siempre visible)
2. Click en un tema → la app cambia al instante (sin reload)
3. Preferencia se guarda en la API (User.theme)
```

---

## 8. Estados y Microcopy

| Situación | Texto UI |
|---|---|
| Sin cursos | "Aún no tienes cursos. ¡Crea el primero! 📚" |
| Sin alumnos | "Agrega alumnos para comenzar" |
| Sin evaluaciones | "Define las evaluaciones del curso primero" |
| Guardando nota | Spinner pequeño en celda |
| Nota guardada | Checkmark verde (desaparece en 1s) |
| Error de red | Toast rojo: "Error al guardar. Reintentando..." |
| Ponderaciones ≠ 100% | "⚠️ Las ponderaciones suman X%. Ajusta para que sumen 100%." |
| Nota inválida | Celda con borde rojo + tooltip: "Nota entre 1.0 y 7.0" |

---

## 9. Responsive

| Breakpoint | Comportamiento |
|---|---|
| `< 640px` (móvil) | Sidebar como drawer, tabla horizontal scroll, botones full-width |
| `640-1024px` (tablet) | Sidebar colapsable, tabla visible |
| `> 1024px` (desktop) | Sidebar fija, tabla completa |

**GradeGrid en móvil:**
- La tabla hace scroll horizontal
- Las columnas N°, Apellido/Nombre y Promedio están "sticky" (fijas a la izquierda)
- Las columnas de evaluaciones hacen scroll
- Tamaño de celda mínimo 44×44px para touch

---

## 10. Íconos y Emoji

Usar **Lucide React** para íconos de interfaz. Los emoji se usan como decoración en estado vacío y onboarding, no en botones de acción.

```
BookOpen    → Cursos
Users       → Alumnos
ClipboardList → Evaluaciones
BarChart2   → Estadísticas
MessageSquare → Observaciones
Settings    → Configuración
LogOut      → Salir
Plus        → Crear
Pencil      → Editar
Trash2      → Eliminar
Download    → Exportar
ChevronRight → Navegación
Check       → Aprobado / guardado
X           → Reprobado / cerrar
AlertTriangle → Advertencia
```
