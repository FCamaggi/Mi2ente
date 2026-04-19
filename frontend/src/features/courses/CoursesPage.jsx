import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { coursesApi } from '../../api/courses.api';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner, SkeletonGrid } from '../../components/ui/LoadingSpinner';
import { CourseCard } from './CourseCard';
import { CourseForm } from './CourseForm';

export function CoursesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['courses', statusFilter],
    queryFn: () => coursesApi.list({ status: statusFilter })
  });

  const invalidateCourses = () => queryClient.invalidateQueries({ queryKey: ['courses'] });

  const courses = data?.courses ?? [];

  const groupedBySchool = useMemo(() => {
    const map = new Map();
    courses.forEach((course) => {
      const key = course.school?.trim() || 'Sin colegio';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(course);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [courses]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--color-text-primary)]">Colegios y cursos</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {groupedBySchool.length} colegio{groupedBySchool.length !== 1 ? 's' : ''} · {courses.length} curso{courses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-[var(--radius-sm)] border border-[var(--color-border)] overflow-hidden" data-tour="courses-filter">
            {['active', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${statusFilter === status ? 'bg-[var(--color-primary-500)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]'}`}
              >
                {status === 'active' ? 'Activos' : 'Archivados'}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowCreate(true)} data-tour="courses-create-btn"><Plus size={16} /> Nuevo curso</Button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : courses.length === 0 ? (
        <EmptyState
          emoji={statusFilter === 'archived' ? '📦' : '📚'}
          title={statusFilter === 'archived' ? 'No hay cursos archivados' : 'Aún no tienes cursos'}
          description={statusFilter === 'active' ? 'Crea el primero y luego quedará agrupado por colegio automáticamente.' : undefined}
          action={statusFilter === 'active' ? <Button onClick={() => setShowCreate(true)}><Plus size={16} /> Crear curso</Button> : undefined}
        />
      ) : (
        <div className="flex flex-col gap-8" data-tour="courses-grid">
          {groupedBySchool.map(([school, schoolCourses]) => (
            <section key={school}>
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{school}</h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">{schoolCourses.length} curso{schoolCourses.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schoolCourses.map((course) => (
                  <CourseCard key={course._id || course.id} course={course} onUpdate={invalidateCourses} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {showCreate && <CourseForm onClose={() => setShowCreate(false)} onSave={() => { setShowCreate(false); invalidateCourses(); }} />}
    </div>
  );
}
