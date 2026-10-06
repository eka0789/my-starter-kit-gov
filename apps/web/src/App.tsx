import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { PageErrorFallback } from '@kit/ui';
import { HomePage } from './features/dashboard/pages/home-page';

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={PageErrorFallback}>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </ErrorBoundary>
  );
}