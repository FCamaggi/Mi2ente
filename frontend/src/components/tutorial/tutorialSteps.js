/**
 * Tutorial steps for Mi2ente.
 *
 * Steps with a `_route` field are used by the full cross-page tour in
 * TutorialProvider. The provider replaces `_route` values containing
 * ':courseId' with the actual first course ID before starting the tour.
 *
 * If a target element is missing, Joyride centers the tooltip automatically.
 */

// ─── FULL TOUR (dashboard → courses → course detail) ────────────────────────

export const FULL_TOUR_STEPS = [
  // DASHBOARD
  {
    _route: '/dashboard',
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: '¡Bienvenido a Mi2ente! 👋',
    content:
      'Esta es tu plataforma para gestionar el libro de notas de tus cursos de forma simple y rápida. En este recorrido te mostramos todo lo que puedes hacer — desde crear un curso hasta exportar las notas.',
  },
  {
    _route: '/dashboard',
    target: '[data-tour="sidebar-nav"]',
    placement: 'right',
    disableBeacon: true,
    title: 'Navegación principal',
    content:
      'Desde aquí accedes a todas las secciones: el Dashboard con tu resumen general, Mis Cursos para gestionar cada curso, tu Perfil y la Configuración de la app.',
  },
  {
    _route: '/dashboard',
    target: '[data-tour="dashboard-stats"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Resumen de tu año',
    content:
      'Este panel te muestra de un vistazo cuántos cursos activos tienes, el total de alumnos y el número de evaluaciones creadas en todos tus cursos.',
  },
  {
    _route: '/dashboard',
    target: '[data-tour="create-course"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Crear un curso',
    content:
      'Empieza aquí: crea un curso para cada asignatura y nivel que impartas. Al crearlo defines el nombre, asignatura, nivel, colegio y año académico. Puedes tener tantos cursos como necesites.',
  },
  {
    _route: '/dashboard',
    target: '[data-tour="dashboard-courses"]',
    placement: 'top',
    disableBeacon: true,
    title: 'Tus cursos',
    content:
      'Cada tarjeta representa un curso. Haz clic en una para abrir el libro de notas. Desde el menú (⋯) puedes editar, archivar o eliminar el curso. Los cursos archivados se ocultan de la vista principal.',
  },
  // COURSES PAGE
  {
    _route: '/courses',
    target: '[data-tour="courses-filter"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Activos y archivados',
    content:
      'Aquí están todos tus cursos agrupados por colegio. Usa el filtro para alternar entre cursos activos y archivados. Al archivar un curso sus datos se conservan — solo deja de aparecer en las vistas activas.',
  },
  {
    _route: '/courses',
    target: '[data-tour="courses-create-btn"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Nuevo curso',
    content:
      'Crea un nuevo curso desde aquí. Al ingresar el colegio, si ya existe uno con ese nombre, se agrupará automáticamente bajo él. De esta forma puedes organizar varios cursos del mismo establecimiento.',
  },
  // COURSE DETAIL
  {
    _route: '/courses/:courseId',
    target: '[data-tour="course-header"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Información del curso',
    content:
      'El nombre, asignatura, nivel, colegio y año académico del curso. Esta información aparece en los reportes PDF y Excel que exportes. Puedes editarla desde el menú del curso en la lista de cursos.',
  },
  {
    _route: '/courses/:courseId',
    target: '[data-tour="export-btn"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Exportar a Excel',
    content:
      'Descarga el libro de notas completo como planilla Excel — con todas las columnas, promedios y ponderaciones calculados. Ideal para entregar a dirección o UTP al final del período.',
  },
  {
    _route: '/courses/:courseId',
    target: '[data-tour="import-btn"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Importar alumnos',
    content:
      'Carga una nómina desde un archivo Excel o CSV con un solo clic. La plantilla acepta número de lista, apellido y nombre. Esto te ahorra tiempo al inicio del año — no necesitas agregar cada alumno a mano.',
  },
  {
    _route: '/courses/:courseId',
    target: '[data-tour="course-tabs"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Las 4 secciones del curso',
    content:
      '① Libro de notas: ingresas y ves todas las notas. ② Alumnos: gestionas la nómina. ③ Evaluaciones: defines las evaluaciones y sus ponderaciones. ④ Estadísticas: análisis del rendimiento del curso.',
  },
  {
    _route: '/courses/:courseId',
    target: '[data-tour="grade-grid"]',
    placement: 'auto',
    disableBeacon: true,
    title: 'El Libro de notas',
    content:
      'Cada fila es un alumno y cada columna es una evaluación. Las celdas se colorean automáticamente: verde = aprobado, rojo = reprobado. Puedes navegar con las flechas del teclado y Tab para moverse entre celdas.',
  },
  {
    _route: '/courses/:courseId',
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: 'Ingresar una nota',
    content:
      'Haz clic en cualquier celda del libro para editarla. Escribe el valor (1,0 – 7,0) y presiona Enter para confirmar. También puedes marcar al alumno como Ausente (A), Exento (E) o dejar la nota Pendiente (—).',
  },
  {
    _route: '/courses/:courseId',
    target: '[data-tour="add-student-btn"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Agregar alumnos',
    content:
      'Añade alumnos uno a uno con nombre, apellido y número de lista. También puedes agregar información adicional como apoderado y observaciones. Los alumnos aparecen al instante en el libro de notas.',
  },
  {
    _route: '/courses/:courseId',
    target: '[data-tour="add-eval-btn"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Crear evaluaciones',
    content:
      'Define las evaluaciones del curso: nombre, tipo (prueba, tarea, trabajo…), fecha y ponderación. También puedes agrupar evaluaciones — por ejemplo un grupo "Controles" que vale 30% en total, con varias pruebas dentro.',
  },
  {
    _route: '/courses/:courseId',
    target: '[data-tour="theme-switcher"]',
    placement: 'right',
    disableBeacon: true,
    title: 'Temas de color',
    content:
      'Mi2ente tiene 5 temas visuales. Elige el que más te guste — los colores se aplican en toda la app y se guardan automáticamente en tu perfil.',
  },
  {
    _route: '/courses/:courseId',
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: '¡Listo para empezar! 🎉',
    content:
      'Ya conoces todo Mi2ente. El flujo habitual es: crear evaluaciones → agregar alumnos → ingresar notas → exportar. Recuerda que el botón Tutorial en la barra lateral y los íconos (?) en cada sección siempre están disponibles.',
  },
];

// ─── DASHBOARD (auto-start + botón sidebar desde /dashboard) ─────────────────

export const DASHBOARD_STEPS = [
  {
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: '¡Bienvenido a Mi2ente! 👋',
    content:
      'Esta es tu plataforma para gestionar el libro de notas de tus cursos de forma simple y rápida. En este recorrido te mostramos todo lo que puedes hacer.',
  },
  {
    target: '[data-tour="sidebar-nav"]',
    placement: 'right',
    disableBeacon: true,
    title: 'Navegación principal',
    content:
      'Desde aquí accedes a todas las secciones: el Dashboard con tu resumen general, Mis Cursos para gestionar cada curso, tu Perfil y la Configuración de la app.',
  },
  {
    target: '[data-tour="create-course"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Crear un curso',
    content:
      'Empieza aquí: crea un curso para cada asignatura y nivel que impartas. Puedes tener tantos cursos como necesites y organizarlos por colegio y año académico.',
  },
  {
    target: '[data-tour="dashboard-stats"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Resumen de tu año',
    content:
      'Este panel te muestra de un vistazo cuántos cursos activos tienes, el total de alumnos y el número de evaluaciones creadas en todos tus cursos.',
  },
  {
    target: '[data-tour="dashboard-courses"]',
    placement: 'top',
    disableBeacon: true,
    title: 'Tus cursos',
    content:
      'Cada tarjeta es un curso. Haz clic en una para abrir el libro de notas. Desde el menú (⋯) puedes editar, archivar o eliminar el curso.',
  },
  {
    target: '[data-tour="theme-switcher"]',
    placement: 'right',
    disableBeacon: true,
    title: 'Temas de color',
    content:
      'Mi2ente tiene 5 temas visuales. Elige el que más te guste — los colores se aplican en toda la app y se guardan automáticamente en tu perfil.',
  },
  {
    target: '[data-tour="tutorial-btn"]',
    placement: 'right',
    disableBeacon: true,
    title: '¿Necesitas ayuda?',
    content:
      'Este botón siempre está disponible en la barra lateral. Haz clic cuando quieras volver a ver este recorrido o mostrárselo a un colega.',
  },
];

// ─── COURSE DETAIL (auto-start + botón sidebar desde /courses/:id) ───────────

export const COURSE_DETAIL_STEPS = [
  {
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: 'Detalle del curso 📚',
    content:
      'Aquí está todo lo que necesitas para gestionar un curso: libro de notas, lista de alumnos, evaluaciones y estadísticas. Vamos a recorrerlo juntos.',
  },
  {
    target: '[data-tour="course-header"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Información del curso',
    content:
      'El nombre, asignatura, nivel, colegio y año académico del curso. Esta información aparece en los reportes PDF y Excel que exportes.',
  },
  {
    target: '[data-tour="export-btn"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Exportar a Excel',
    content:
      'Descarga el libro de notas completo como planilla Excel — con todas las columnas, promedios y ponderaciones. Ideal para entregar a dirección o UTP.',
  },
  {
    target: '[data-tour="import-btn"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Importar alumnos',
    content:
      'Carga una lista de alumnos desde un archivo Excel o CSV con un solo clic. La plantilla acepta número de lista, apellido y nombre. Ahorra tiempo al inicio del año.',
  },
  {
    target: '[data-tour="course-tabs"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Las 4 secciones del curso',
    content:
      '① Libro de notas: ingresas y ves todas las notas. ② Alumnos: gestionas la nómina. ③ Evaluaciones: defines pruebas y ponderaciones. ④ Estadísticas: análisis del rendimiento.',
  },
  {
    target: '[data-tour="grade-grid"]',
    placement: 'auto',
    disableBeacon: true,
    title: 'El Libro de notas',
    content:
      'Cada fila es un alumno y cada columna es una evaluación. Las celdas se colorean automáticamente: verde = aprobado, rojo = reprobado. Puedes navegar con las flechas del teclado.',
  },
  {
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: 'Ingresar una nota',
    content:
      'Haz clic en cualquier celda para editarla. Escribe el valor (1,0 – 7,0) y presiona Enter para confirmar. También puedes marcar al alumno como Ausente, Exento o dejar la nota Pendiente.',
  },
  {
    target: '[data-tour="add-student-btn"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Agregar alumnos',
    content:
      'Añade alumnos uno a uno con nombre, apellido y número de lista, o importa toda la nómina desde Excel. Los alumnos aparecen al instante en el libro de notas.',
  },
  {
    target: '[data-tour="add-eval-btn"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Crear evaluaciones',
    content:
      'Define las evaluaciones del curso: nombre, tipo (prueba, tarea, trabajo…), fecha y ponderación. Puedes agrupar evaluaciones — por ejemplo, un grupo "Controles" que vale 30% en total.',
  },
  {
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: '¡Listo para empezar! 🎉',
    content:
      'Ya conoces todo. El flujo habitual es: crear evaluaciones → agregar alumnos → ingresar notas → exportar. Recuerda que el botón Tutorial en la barra lateral y los íconos (?) en cada sección siempre están disponibles.',
  },
];

// ─── SECCIÓN: LIBRO DE NOTAS ──────────────────────────────────────────────────

export const GRADES_STEPS = [
  {
    target: '[data-tour="grade-grid"]',
    placement: 'auto',
    disableBeacon: true,
    title: 'Libro de notas 📋',
    content:
      'Cada fila es un alumno y cada columna es una evaluación. Las celdas se colorean automáticamente: verde = aprobado (≥ nota mínima), rojo = reprobado. La última columna muestra el promedio ponderado.',
  },
  {
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: 'Ingresar o editar una nota',
    content:
      'Haz clic en cualquier celda para editarla. Escribe el valor con punto o coma (ej: 4.5 o 4,5) y presiona Enter para confirmar. Usa Tab para pasar a la siguiente celda o las flechas del teclado para navegar.',
  },
  {
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: 'Estados especiales',
    content:
      'Además de la nota, una celda puede estar en estado Ausente (A) — el alumno faltó a la evaluación; Exento (E) — el alumno está exento de esa evaluación y no se considera en el promedio; o Pendiente (—) — la nota aún no se ha ingresado.',
  },
  {
    target: '[data-tour="export-btn"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Exportar el libro',
    content:
      'Descarga el libro de notas como planilla Excel (con fórmulas y formato) o como PDF (para imprimir o compartir). El archivo incluye todos los promedios y ponderaciones calculados.',
  },
];

// ─── SECCIÓN: ALUMNOS ─────────────────────────────────────────────────────────

export const STUDENTS_STEPS = [
  {
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: 'Gestión de alumnos 👩‍🎓',
    content:
      'En esta sección administras la nómina del curso. Puedes agregar alumnos uno a uno, importarlos desde un archivo, ver su perfil completo o eliminarlos.',
  },
  {
    target: '[data-tour="add-student-btn"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Agregar un alumno',
    content:
      'Al hacer clic se abre el formulario de alumno. Ingresa número de lista, apellido y nombre (obligatorios). Opcionalmente puedes agregar el nombre del apoderado y observaciones. El número de lista determina el orden en el libro de notas.',
  },
  {
    target: '[data-tour="import-btn"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Importar desde Excel o CSV',
    content:
      'La forma más rápida de cargar una nómina completa. Selecciona un archivo .xlsx, .xls o .csv con las columnas: número, apellido, nombre. Si un número de lista ya existe, el alumno se omite automáticamente para evitar duplicados.',
  },
  {
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: 'Perfil del alumno',
    content:
      'Haz clic en cualquier alumno para ver su perfil completo: historial de notas, promedio actual, observaciones y datos del apoderado. Desde el perfil también puedes editar sus datos o registrar nuevas observaciones.',
  },
];

// ─── SECCIÓN: EVALUACIONES ────────────────────────────────────────────────────

export const EVALUATIONS_STEPS = [
  {
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: 'Evaluaciones y ponderaciones 📝',
    content:
      'Aquí defines qué se evalúa en el curso y cuánto pesa cada cosa. Puedes crear evaluaciones individuales o agruparlas. La suma de todas las ponderaciones debe ser 100%.',
  },
  {
    target: '[data-tour="add-eval-btn"]',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Crear una evaluación individual',
    content:
      'Al hacer clic se abre el formulario. Ingresa el nombre (ej: "Prueba 1"), el tipo (prueba, tarea, trabajo, etc.), la fecha y la ponderación sobre 100%. Esta evaluación aparecerá como una columna independiente en el libro de notas.',
  },
  {
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: 'Grupos de evaluaciones',
    content:
      'Un grupo es un conjunto de evaluaciones que comparten una ponderación total. Por ejemplo, un grupo "Controles" con ponderación 30%: si tiene 3 controles, cada uno pesa 10% (30% ÷ 3). Al agregar o quitar controles del grupo, las ponderaciones se recalculan automáticamente.',
  },
  {
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: 'Ponderaciones y validación',
    content:
      'La barra de progreso muestra cuánto del 100% tienes asignado. Mi2ente te avisa si la suma supera o no llega al 100%. No puedes guardar notas si la ponderación no es válida. Consejo: empieza por definir todas las evaluaciones antes de ingresar notas.',
  },
];

// ─── SECCIÓN: ESTADÍSTICAS ────────────────────────────────────────────────────

export const STATS_STEPS = [
  {
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: 'Estadísticas del curso 📊',
    content:
      'Esta sección te da un análisis automático del rendimiento de tus alumnos: distribución de notas, evolución en el tiempo y listado de alumnos en riesgo.',
  },
  {
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: 'Distribución de notas',
    content:
      'El histograma muestra cuántos alumnos obtuvieron cada nota (por tramos de 0.5). La línea roja marca la nota mínima de aprobación. De un vistazo puedes ver si la evaluación fue fácil, difícil o bien distribuida.',
  },
  {
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: 'Evolución en el tiempo',
    content:
      'El gráfico de línea muestra cómo ha variado el promedio del curso evaluación a evaluación. Si la tendencia baja, puede ser señal de que el nivel de dificultad aumentó o que algunos alumnos necesitan apoyo.',
  },
  {
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    title: 'Alumnos en riesgo',
    content:
      'La lista de alumnos con promedio bajo la nota mínima. Haz clic en cualquier nombre para ir directamente a su perfil y ver el detalle de sus notas. Útil para planificar reforzamientos o comunicarse con los apoderados.',
  },
];
