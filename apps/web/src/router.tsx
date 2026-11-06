import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import { AuthGuard, GuestGuard, ProfileGuard } from './components/auth/Guards';
import { AppShell } from './components/layout/AppShell';
import { Spinner } from './components/ui/Spinner';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { TeacherPlaceholder } from './pages/teachers/TeacherPlaceholder';
import { NotFound } from './pages/NotFound';

const ArchitectPage = lazy(() =>
  import('./pages/teachers/ArchitectPage').then((m) => ({ default: m.ArchitectPage })),
);
const VocabularyPage = lazy(() =>
  import('./pages/teachers/VocabularyPage').then((m) => ({ default: m.VocabularyPage })),
);
const ConversationPage = lazy(() =>
  import('./pages/teachers/ConversationPage').then((m) => ({ default: m.ConversationPage })),
);
const ListeningPage = lazy(() =>
  import('./pages/teachers/ListeningPage').then((m) => ({ default: m.ListeningPage })),
);
const SpeakingPage = lazy(() =>
  import('./pages/teachers/SpeakingPage').then((m) => ({ default: m.SpeakingPage })),
);
const PronunciationPage = lazy(() =>
  import('./pages/teachers/PronunciationPage').then((m) => ({ default: m.PronunciationPage })),
);
const DirectThinkingPage = lazy(() =>
  import('./pages/teachers/DirectThinkingPage').then((m) => ({ default: m.DirectThinkingPage })),
);
const ImmersionPage = lazy(() =>
  import('./pages/teachers/ImmersionPage').then((m) => ({ default: m.ImmersionPage })),
);

function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-20" role="status" aria-label="Carregando módulo">
      <Spinner size="lg" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Rotas de convidados (acessíveis apenas se deslogado) */}
        <Route element={<GuestGuard />}>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
        </Route>

        {/* Rotas autenticadas */}
        <Route element={<AuthGuard />}>
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Rotas autenticadas que requerem perfil preenchido */}
          <Route element={<ProfileGuard />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/professor/arquiteto" element={<ArchitectPage />} />
              <Route path="/professor/vocabulario" element={<VocabularyPage />} />
              <Route path="/professor/conversacao" element={<ConversationPage />} />
              <Route path="/professor/ouvido" element={<ListeningPage />} />
              <Route path="/professor/fala" element={<SpeakingPage />} />
              <Route path="/professor/pronuncia" element={<PronunciationPage />} />
              <Route path="/professor/pensamento" element={<DirectThinkingPage />} />
              <Route path="/professor/imersao" element={<ImmersionPage />} />
              <Route path="/professor/:slug" element={<TeacherPlaceholder />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
