import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Users, BarChart2 } from 'lucide-react';
import { coursesApi } from '../../api/courses.api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonGrid } from '../../components/ui/LoadingSpinner';
import { CourseCard } from '../courses/CourseCard';
import { useState } from 'react';
import { CourseForm } from '../courses/CourseForm';

export function DashboardPage() {
  const { user } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.list({ status: 'active' })
  });

  const { data: allData } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => coursesApi.list({})
  });

  const courses = data?.courses ?? [];
  const allCourses = allData?.courses ?? [];
  const allAreArchived = !isLoading && courses.length === 0 && allCourses.length > 0;

  const totalStudents = courses.reduce((s, c) => s + (c.studentCount || 0), 0);
  const totalEvals = courses.reduce((s, c) => s + (c.evaluationCount || 0), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--color-text-primary)]">
            Hola, {user?.name?.split(' ')[0]} 👋
          </h1>
          {user?.school && <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{user.school}</p>}
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Nuevo curso
        </Button>
      </div>

      {/* Stats summary */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-4 border border-[var(--color-border)] shadow-[var(--shadow-sm)] flex items-center gap-4">
            <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-50)]">
              <BookOpen size={18} className="text-[var(--color-primary-500)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">Cursos activos</p>
              <p className="text-2xl font-bold text-[var(--color-primary-500)]">{courses.length}</p>
            </div>
          </div>
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-4 border border-[var(--color-border)] shadow-[var(--shadow-sm)] flex items-center gap-4">
            <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-50)]">
              <Users size={18} className="text-[var(--color-primary-500)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">Total alumnos</p>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{totalStudents}</p>
            </div>
          </div>
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-4 border border-[var(--color-border)] shadow-[var(--shadow-sm)] flex items-center gap-4">
            <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--color-primary-50)]">
              <BarChart2 size={18} className="text-[var(--color-primary-500)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">Evaluaciones</p>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{totalEvals}</p>
            </div>
          </div>
        </div>
      )}

      {/* Courses */}
      {isLoading ? (
        <SkeletonGrid count={3} />
      ) : allAreArchived ? (
        <EmptyState
          emoji="📦"
          title="Todos tus cursos están archivados"
          description="Reactívalos desde «Mis Cursos» o crea uno nuevo."
          action={
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => window.location.href = '/courses'}>Ver archivados</Button>
              <Button onClick={() => setShowCreate(true)}><Plus size={16} /> Nuevo curso</Button>
            </div>
          }
        />
      ) : courses.length === 0 ? (
        <EmptyState
          emoji="📚"
          title="Aún no tienes cursos"
          description="¡Crea el primero para empezar a gestionar tus notas!"
          action={<Button onClick={() => setShowCreate(true)}><Plus size={16} /> Crear primer curso</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <CourseCard key={course._id || course.id} course={course} onUpdate={refetch} />
          ))}
        </div>
      )}

      {showCreate && (
        <CourseForm onClose={() => setShowCreate(false)} onSave={() => { setShowCreate(false); refetch(); }} />
      )}
    </div>
  );
}
