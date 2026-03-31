import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setupAxiosInterceptors } from './api/setupAxiosInterceptors';

const App = () => {
  useEffect(() => {
    // Set up API interceptors
    setupAxiosInterceptors();
  }, []);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <RouterProvider router={router} />
    </>
  );
};

export default App;
