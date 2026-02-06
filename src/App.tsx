import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { ColorModeProvider } from '@/theme';
import { ErrorBoundary } from '@/components/common';
import Layout from '@/pages/Layout';
import HomePage from '@/pages/HomePage';
import UploadPage from '@/pages/UploadPage';
import SearchPage from '@/pages/SearchPage';
import GalleryPage from '@/pages/GalleryPage';
import ImageDetailPage from '@/pages/ImageDetailPage';
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
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="upload" element={<UploadPage />} />
                  <Route path="search" element={<SearchPage />} />
                  <Route path="gallery" element={<GalleryPage />} />
                  <Route path="images/:imageId" element={<ImageDetailPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </SnackbarProvider>
      </QueryClientProvider>
    </ColorModeProvider>
  );
}
