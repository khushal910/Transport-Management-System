import { createBrowserRouter } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Registration';
import Error from '../pages/error/Error';
import AuthLayout from '../layout/AuthLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,   
    errorElement: <Error />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
    ],
  },
]);
