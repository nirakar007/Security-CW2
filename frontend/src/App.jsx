import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./components/context/AuthContext";

function App() {
  return (
    <AuthProvider>
      {" "}
      <Router>
        <main>
          <AppRoutes />
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
