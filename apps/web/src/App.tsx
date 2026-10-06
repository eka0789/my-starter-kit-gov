import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { PageErrorFallback } from '@kit/ui';
import { HomePage } from './features/dashboard/pages/home-page';
import { LoginPage } from './features/auth/pages/login-page';
import { ProtectedRoute } from './features/auth/components/protected-route';

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={PageErrorFallback}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}