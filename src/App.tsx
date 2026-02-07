import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { ColorModeProvider } from '@/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary, ProtectedRoute } from '@/components/common';
import Layout from '@/pages/Layout';
import HomePage from '@/pages/HomePage';
import UploadPage from '@/pages/UploadPage';
import SearchPage from '@/pages/SearchPage';
import GalleryPage from '@/pages/GalleryPage';
import ImageDetailPage from '@/pages/ImageDetailPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import LandingPage from '@/pages/LandingPage';
import NotFoundPage from '@/pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <ColorModeProvider>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          autoHideDuration={4000}
        >
          <ErrorBoundary>
            <BrowserRouter>
              <AuthProvider>
                <Routes>
                  {/* Public routes */}
                  <Route index element={<LandingPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />

                  {/* Protected app routes */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="dashboard" element={<HomePage />} />
                    <Route path="upload" element={<UploadPage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="gallery" element={<GalleryPage />} />
                    <Route path="images/:imageId" element={<ImageDetailPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          </ErrorBoundary>
        </SnackbarProvider>
      </QueryClientProvider>
    </ColorModeProvider>
  );
}
