import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import AI from "./pages/AI";
import Reports from "./pages/Reports";
import ViewCustomer from "./pages/ViewCustomer";
import AddCustomer from "./pages/AddCustomer";
import EditCustomer from "./pages/EditCustomer";
import ProtectedRoute from "./components/ProtectedRoute";
import MainMenu from "./pages/MainMenu";
import MainMenuProductPage from "./pages/MainMenuProductPage";
import MainMenuVoiceAgentPage from "./pages/MainMenuVoiceAgentPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/main-menu" element={<MainMenu />} />
        <Route path="/products/voice-agent" element={<MainMenuVoiceAgentPage />} />
        <Route path="/products/:slug" element={<MainMenuProductPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* /customers list page is disabled/redirected to /dashboard; individual detail /customers/:id remains active */}
        <Route path="/customers" element={<Navigate to="/dashboard" replace />} />
        <Route path="/customers/:id" element={<ViewCustomer />} />
        <Route path="/customers/edit/:id" element={<EditCustomer />} />
        <Route path="/customers/add" element={<AddCustomer />} />

        {/* Status Filter & Module Routes */}
        <Route path="/interested" element={<Navigate to="/customers?filter=interested" replace />} />
        <Route path="/registered" element={<Navigate to="/customers?filter=registered" replace />} />
        <Route path="/follow-up" element={<Navigate to="/customers?filter=follow_up" replace />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai" element={<AI />} />
        <Route path="/ai-insights" element={<Navigate to="/ai" replace />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;