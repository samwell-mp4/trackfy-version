import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import { VideoProvider } from '@contexts/VideoContext';
import { ProtectedRoute } from '@components/auth/ProtectedRoute';
import { Login } from '@pages/Login';
import { Dashboard } from '@pages/Dashboard';
import { LoadingOverlay } from '@components/common/LoadingOverlay';
import { useVideo } from '@contexts/VideoContext';
import '@styles/global.css';

const AppContent = () => {
  const { isGenerating } = useVideo();
  return (
    <>
      <LoadingOverlay isVisible={isGenerating} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VideoProvider>
          <VideoProvider>
            <AppContent />
          </VideoProvider>
        </VideoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
