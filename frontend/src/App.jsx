import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

// Later, we can import things that appear on EVERY page, like a Navbar or Context
// import Navbar from './components/layout/Navbar';
// import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    // The AuthProvider would wrap everything to provide global state
    // <AuthProvider>
    <Router>
      {/* A global navbar would sit outside the AppRoutes component */}
      {/* <Navbar /> */}

      <main>
        {/* AppRoutes now handles all the page switching logic */}
        <AppRoutes />
      </main>

      {/* A global footer could go here */}
    </Router>
    // </AuthProvider>
  );
}

export default App;
