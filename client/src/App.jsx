
import { AppRoutes } from '../src/Routes/AppRoutes'
import { ToastContainer } from "react-toastify";


function App() {
  return (
    <div>
        <ToastContainer
        position="top-right"
        autoClose={500}
        hideProgressBar={true}
        theme="dark"
      />
      <AppRoutes/>  
    </div>
  )
}

export default App