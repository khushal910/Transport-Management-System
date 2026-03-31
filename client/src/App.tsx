import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/routes';
import { setupAxiosInterceptors } from './api/setupAxiosInterceptors';

const App = () => {
  useEffect(() => {
    // Set up API interceptors
    setupAxiosInterceptors();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
