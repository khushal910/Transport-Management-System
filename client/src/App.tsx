import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/routes';
import { setupAxiosInterceptors } from './api/setupAxiosInterceptors';
import { SidebarProvider } from './context/SidebarContext';

const App = () => {
  useEffect(() => {
    // Set up API interceptors
    setupAxiosInterceptors();
  }, []);

  return (
    <>
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </>
  );
};

export default App;
