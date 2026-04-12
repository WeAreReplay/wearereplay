import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ResetScrollBehavior from "./components/ResetScrollBehavior";
import PublicLayout from "./layouts/PublicLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import GameListings from "./pages/GameListings";
import Legal from "./pages/Legal";
import Games from "./pages/Games";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ResetScrollBehavior />
        <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/games" element={<Games />} />
          <Route path="/listings/:id" element={<GameListings />} />
          <Route path="/privacy-policy" element={<Legal type="privacy" />} />
          <Route
            path="/terms-and-conditions"
            element={<Legal type="terms" />}
          />
        </Route>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
