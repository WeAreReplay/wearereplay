import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ResetScrollBehavior from "./components/ResetScrollBehavior";
import AdminRoute from "./components/AdminRoute";
import PublicLayout from "./layouts/PublicLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/UserDashboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Legal from "./pages/Legal";
import Catalogue from "./pages/Catalogue";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ViewItem from "./pages/ViewItem";
import Contact from "./pages/Contact";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ResetScrollBehavior />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/listing/:id" element={<ViewItem />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<Legal type="privacy" />} />
            <Route
              path="/terms-and-conditions"
              element={<Legal type="terms" />}
            />
          </Route>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
