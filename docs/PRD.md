# 📋 PRD — ProfeApp
**Product Requirements Document · v1.0**

---

## 1. Visión General

ProfeApp es una aplicación web multi-usuario para profesores/as que reemplaza planillas Excel por una interfaz intuitiva, accesible desde cualquier dispositivo. Gestiona cursos, alumnos, evaluaciones ponderadas, calificaciones y observaciones, con estadísticas en tiempo real.

**Problema:** Los profesores gestionan sus notas en Excel, lo que implica archivos pesados, sin acceso desde el celular, sin respaldo automático y sin soporte multi-usuario.

**Solución:** App web ligera, mobile-first, con base de datos en la nube.

---

## 2. Usuarios

| Rol | Descripción |
|---|---|
| `teacher` | Profesor/a — crea y gestiona sus propios cursos, alumnos y notas |
| `admin` | Administrador de la plataforma — puede ver todos los usuarios y resetear contraseñas |

> En v1.0 todos los registros son `teacher`. El rol `admin` existe en base de datos pero no tiene UI diferenciada.

---

## 3. Módulos Funcionales

### 3.1 🔐 Autenticación

| # | Funcionalidad | Prioridad |
|---|---|---|
| A1 | Registro con nombre, email y contraseña | Alta |
| A2 | Login con email y contraseña | Alta |
| A3 | JWT + Refresh Token (sesión persistente 7 días) | Alta |
| A4 | Logout (invalida refresh token) | Alta |
| A5 | Recuperación de contraseña por email | Media |
| A6 | Cambiar contraseña desde perfil | Media |
| A7 | Editar nombre y preferencias de perfil | Media |

---

### 3.2 🏫 Gestión de Cursos

Un **curso** = una asignatura impartida a un grupo (ej: "Lenguaje 2°B").

| # | Funcionalidad | Prioridad |
|---|---|---|
| C1 | Crear curso (nombre, asignatura, año, descripción, colegio) | Alta |
| C2 | Listar todos los cursos del profesor con tarjetas resumen | Alta |
| C3 | Ver detalle de curso (alumnos + evaluaciones) | Alta |
| C4 | Editar curso | Alta |
| C5 | Eliminar curso (con confirmación) | Alta |
| C6 | Archivar/Desarchivar curso (sin borrarlo) | Media |
| C7 | Duplicar curso (copia estructura sin notas, útil para nuevo año) | Media |
| C8 | Estadísticas del curso en la vista de detalle | Alta |

**Campos del curso:**
```
- nombre (ej: "Lenguaje 2°B")
- asignatura (ej: "Lenguaje y Comunicación")
- nivel (ej: "2° Básico")
- año académico (ej: 2026)
- nombre del colegio
- descripción / notas internas
- configuración de notas:
    - nota mínima (default 1.0)
    - nota máxima (default 7.0)
    - nota de aprobación (default 4.0)
    - decimales en promedio (0, 1 o 2)
- estado: activo | archivado
```

---

### 3.3 👥 Gestión de Alumnos

| # | Funcionalidad | Prioridad |
|---|---|---|
| S1 | Agregar alumno/a a un curso (apellido, nombre, N° de lista) | Alta |
| S2 | Listar alumnos del curso ordenados por N° de lista | Alta |
| S3 | Ver ficha completa del alumno (notas + observaciones) | Alta |
| S4 | Editar datos del alumno | Alta |
| S5 | Eliminar alumno (con confirmación, elimina notas asociadas) | Alta |
| S6 | Reordenar número de lista (drag & drop o edición directa) | Media |
| S7 | Agregar foto de perfil opcional (URL o upload) | Baja |
| S8 | Importar lista de alumnos desde Excel/CSV | Media |
| S9 | Buscar alumno/a por nombre dentro del curso | Alta |
| S10 | Ver resumen de situación del alumno (promedio general, aprobado/reprobado) | Alta |

**Campos del alumno:**
```
- número de lista (N°)
- apellidos
- nombre
- fecha de nacimiento (opcional)
- contacto apoderado (nombre + teléfono/email) (opcional)
- notas internas de la profe
- foto (URL, opcional)
- estado: activo | retirado
```

---

### 3.4 📝 Gestión de Evaluaciones

Una **evaluación** = una prueba, tarea, trabajo, etc. pertenece a un curso.

| # | Funcionalidad | Prioridad |
|---|---|---|
| E1 | Crear evaluación en un curso (nombre, ponderación %, fecha, tipo) | Alta |
| E2 | Listar evaluaciones del curso | Alta |
| E3 | Editar evaluación | Alta |
| E4 | Eliminar evaluación (con confirmación) | Alta |
| E5 | Validar que las ponderaciones sumen 100% (alerta visual, no bloqueo) | Alta |
| E6 | Tipos de evaluación: Prueba, Tarea, Trabajo, Disertación, Otro | Media |
| E7 | Reordenar evaluaciones | Baja |

**Campos de evaluación:**
```
- nombre (ej: "Plan Lector - Grandes Amigos")
- tipo: prueba | tarea | trabajo | disertacion | otro
- ponderación (% del promedio final)
- fecha (opcional)
- descripción / instrucciones (opcional)
```

---

### 3.5 🔢 Ingreso y Gestión de Notas

| # | Funcionalidad | Prioridad |
|---|---|---|
| G1 | Vista de grilla (tabla): alumnos × evaluaciones | Alta |
| G2 | Editar nota directamente en la celda (click o doble click) | Alta |
| G3 | Navegación teclado: Tab, Enter, Flechas entre celdas | Alta |
| G4 | Validación de rango: nota entre 1.0 y 7.0 | Alta |
| G5 | Indicador visual: nota roja si < nota de aprobación | Alta |
| G6 | Promedio ponderado calculado automáticamente | Alta |
| G7 | Columna "Situación": ✅ Aprobado/a · ❌ Reprobado/a · — Sin notas | Alta |
| G8 | Guardar notas automáticamente (debounce 800ms) o botón "Guardar" | Alta |
| G9 | Marcar nota como "ausente" / "exento/a" | Media |
| G10 | Vista compacta (solo promedios) vs vista completa (todas las eval) | Media |
| G11 | Resaltar fila del alumno al pasar el mouse | Alta |
| G12 | Estadísticas al pie: promedio del curso, máx, mín, % aprobación | Alta |

---

### 3.6 💬 Observaciones

| # | Funcionalidad | Prioridad |
|---|---|---|
| O1 | Agregar observación a un alumno (texto libre, fecha automática) | Alta |
| O2 | Listar historial de observaciones del alumno | Alta |
| O3 | Editar observación | Alta |
| O4 | Eliminar observación | Alta |
| O5 | Categoría de observación: Académica, Conductual, Positiva, Apoderado, Otro | Media |
| O6 | Observaciones a nivel de curso (no alumno) | Baja |

---

### 3.7 📊 Estadísticas y Resumen

| # | Funcionalidad | Prioridad |
|---|---|---|
| R1 | Dashboard del profesor: resumen de todos sus cursos | Alta |
| R2 | Promedio del curso por evaluación | Alta |
| R3 | % aprobación por evaluación y general | Alta |
| R4 | Nota más alta y más baja | Alta |
| R5 | Desviación estándar | Media |
| R6 | Mediana del curso | Media |
| R7 | Gráfico de distribución de notas (histograma) | Media |
| R8 | Gráfico de evolución del promedio del curso por evaluación (línea) | Media |
| R9 | Listado de alumnos reprobados con sus promedios | Alta |
| R10 | Resumen general: todos los cursos en una vista | Alta |

---

### 3.8 📤 Exportación

| # | Funcionalidad | Prioridad |
|---|---|---|
| X1 | Exportar libro de notas del curso a Excel (.xlsx) | Alta |
| X2 | Exportar libro de notas a PDF | Alta |
| X3 | Exportar lista de alumnos a PDF | Media |
| X4 | Exportar ficha individual del alumno (notas + observaciones) a PDF | Media |

---

### 3.9 🎨 Personalización

| # | Funcionalidad | Prioridad |
|---|---|---|
| T1 | Selector de tema visual (5 opciones, guardado por usuario) | Alta |
| T2 | Nombre y colegio del profesor en el encabezado | Alta |
| T3 | Configuración global de escala de notas por usuario | Media |
| T4 | Configuración específica de escala por curso | Media |

**5 Temas disponibles:**

| # | Nombre | Descripción |
|---|---|---|
| 1 | 🌸 Rosa Sakura | Rosa pastel, suave, bonito — pensado para Antonia |
| 2 | 🌊 Azul Océano | Azul profesional, tranquilo |
| 3 | 🌿 Verde Bosque | Verde esmeralda, fresco y natural |
| 4 | 🌙 Noche Índigo | Dark mode elegante, índigo profundo |
| 5 | 🌻 Otoño Dorado | Ámbar y terracota, cálido |

---

## 4. Funcionalidades No Incluidas en v1.0

- Compartir cursos entre profesores
- Notificaciones push
- App móvil nativa
- Integración con SIGE u otros sistemas del MINEDUC
- Asistencia / control de asistencia

---

## 5. Criterios de Calidad

- **Performance:** carga inicial < 2s, guardado de nota < 300ms
- **Responsive:** funcional en mobile (360px+), tablet y desktop
- **Accesibilidad:** contraste AA mínimo, navegación por teclado
- **Seguridad:** cada usuario solo accede a sus propios datos (aislamiento por `userId`)
- **Persistencia:** notas guardadas en MongoDB, sin pérdida de datos
