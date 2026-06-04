import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Joyride, { STATUS, EVENTS, ACTIONS } from 'react-joyride';
import {
  DASHBOARD_STEPS,
  COURSE_DETAIL_STEPS,
  FULL_TOUR_STEPS,
} from './tutorialSteps';

const SEEN_DASHBOARD = 'mi2ente-tour-dashboard';
const SEEN_COURSE    = 'mi2ente-tour-course';
const SEEN_FULL      = 'mi2ente-tour-full';

const TutorialContext = createContext({
  startDashboardTour:  () => {},
  startCourseTour:     () => {},
  startFullTour:       () => {},
  startSectionTour:    () => {},
  startTour:           () => {},
  stopTour:            () => {},
  registerFirstCourseId: () => {},
});

export function useTutorial() {
  return useContext(TutorialContext);
}

function buildStyles() {
  const primary     = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-500').trim() || '#ec4899';
  const surface     = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim()    || '#ffffff';
  const textPrimary = getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim() || '#1e1b4b';
  const border      = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim()     || '#fce7f3';

  return {
    options: {
      arrowColor:      surface,
      backgroundColor: surface,
      overlayColor:    'rgba(0, 0, 0, 0.45)',
      primaryColor:    primary,
      textColor:       textPrimary,
      zIndex:          10000,
    },
    tooltip: {
      borderRadius: '12px',
      boxShadow:    '0 8px 32px rgba(0,0,0,0.15)',
      border:       `1px solid ${border}`,
      padding:      '16px',
      maxWidth:     'min(340px, calc(100vw - 24px))',
    },
    tooltipTitle: {
      fontSize:     '0.95rem',
      fontWeight:   '700',
      marginBottom: '6px',
    },
    tooltipContent: {
      fontSize:   '0.875rem',
      lineHeight: '1.5',
      paddingTop: '4px',
    },
    buttonNext: {
      backgroundColor: primary,
      borderRadius:    '8px',
      fontSize:        '0.8rem',
      padding:         '7px 16px',
    },
    buttonBack: {
      color:    primary,
      fontSize: '0.8rem',
    },
    buttonSkip: {
      fontSize: '0.75rem',
    },
  };
}

export function TutorialProvider({ children }) {
  const [run,       setRun]       = useState(false);
  const [steps,     setSteps]     = useState([]);
  const [stepIndex, setStepIndex] = useState(0);

  const currentStepsRef    = useRef(null);
  const firstCourseIdRef   = useRef(null);
  const navigatingRef      = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();

  const registerFirstCourseId = useCallback((id) => {
    firstCourseIdRef.current = id;
  }, []);

  // Resolve :courseId placeholders in FULL_TOUR_STEPS with the real ID
  const resolveFullTourSteps = useCallback(() => {
    const courseId = firstCourseIdRef.current;
    return FULL_TOUR_STEPS.map((step) => ({
      ...step,
      _route: step._route?.replace(':courseId', courseId ?? ''),
    }));
  }, []);

  const startTourWith = useCallback((tourSteps) => {
    currentStepsRef.current = tourSteps;
    setSteps(tourSteps);
    setStepIndex(0);
    setRun(true);
  }, []);

  const startDashboardTour = useCallback(() => startTourWith(DASHBOARD_STEPS),      [startTourWith]);
  const startCourseTour    = useCallback(() => startTourWith(COURSE_DETAIL_STEPS),   [startTourWith]);
  const startSectionTour   = useCallback((s) => startTourWith(s),                   [startTourWith]);

  const startFullTour = useCallback(() => {
    const resolved = resolveFullTourSteps();
    currentStepsRef.current = resolved;
    setSteps(resolved);
    setStepIndex(0);
    // Navigate to dashboard first if not there
    if (location.pathname !== '/dashboard') {
      navigatingRef.current = true;
      navigate('/dashboard');
      setTimeout(() => {
        navigatingRef.current = false;
        setRun(true);
      }, 350);
    } else {
      setRun(true);
    }
  }, [resolveFullTourSteps, navigate, location.pathname]);

  // Route-aware startTour: full tour from dashboard, section tour from course detail
  const startTour = useCallback(() => {
    if (location.pathname.startsWith('/courses/') && location.pathname.split('/').length > 2) {
      startCourseTour();
    } else {
      startDashboardTour();
    }
  }, [location.pathname, startDashboardTour, startCourseTour]);

  const stopTour = useCallback(() => {
    setRun(false);
    setStepIndex(0);
    currentStepsRef.current = null;
  }, []);

  const handleCallback = useCallback(({ status, action, index, type }) => {
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      setStepIndex(0);

      const cur = currentStepsRef.current;
      const isFullTour = cur?.[0]?._route !== undefined;

      if (isFullTour) {
        // Full tour completion marks both keys so auto-start won't retrigger
        localStorage.setItem(SEEN_FULL, 'true');
        localStorage.setItem(SEEN_DASHBOARD, 'true');
        localStorage.setItem(SEEN_COURSE, 'true');
      } else if (cur === DASHBOARD_STEPS) {
        localStorage.setItem(SEEN_DASHBOARD, 'true');
      } else if (cur === COURSE_DETAIL_STEPS) {
        localStorage.setItem(SEEN_COURSE, 'true');
      }
      currentStepsRef.current = null;
      return;
    }

    if (type === EVENTS.STEP_AFTER) {
      const nextIndex = action === ACTIONS.PREV ? index - 1 : index + 1;
      const nextStep  = currentStepsRef.current?.[nextIndex];

      if (nextStep?._route && nextStep._route !== location.pathname) {
        setRun(false);
        navigate(nextStep._route);
        setTimeout(() => {
          setStepIndex(nextIndex);
          setRun(true);
        }, 400);
      } else {
        setStepIndex(nextIndex);
      }
    }
  }, [navigate, location.pathname]);

  // Auto-start: trigger the appropriate tour once per session
  useEffect(() => {
    if (run || navigatingRef.current) return;

    if (location.pathname === '/dashboard' && !localStorage.getItem(SEEN_DASHBOARD)) {
      const t = setTimeout(() => startDashboardTour(), 900);
      return () => clearTimeout(t);
    }

    if (location.pathname.startsWith('/courses/') && location.pathname.split('/').length > 2
        && !localStorage.getItem(SEEN_COURSE)) {
      const t = setTimeout(() => startCourseTour(), 900);
      return () => clearTimeout(t);
    }
  }, [location.pathname, run, startDashboardTour, startCourseTour]);

  return (
    <TutorialContext.Provider value={{
      startDashboardTour,
      startCourseTour,
      startFullTour,
      startSectionTour,
      startTour,
      stopTour,
      registerFirstCourseId,
    }}>
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous
        showProgress
        showSkipButton
        scrollToFirstStep
        spotlightClicks={false}
        disableScrolling={false}
        locale={{
          back:  'Anterior',
          close: 'Cerrar',
          last:  'Finalizar',
          next:  'Siguiente',
          open:  'Abrir',
          skip:  'Omitir tour',
        }}
        styles={buildStyles()}
        callback={handleCallback}
      />
      {children}
    </TutorialContext.Provider>
  );
}
