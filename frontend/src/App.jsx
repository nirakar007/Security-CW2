import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./components/context/authContext";
import AppRoutes from "./routes/AppRoutes";

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
