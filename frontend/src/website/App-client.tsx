import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { appRoutes } from "../appRoutes";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        {appRoutes()}
      </AuthProvider>
    </Router>
  );
}
