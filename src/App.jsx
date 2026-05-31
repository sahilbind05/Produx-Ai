import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Logo } from "./config/branding.jsx";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <Logo size="lg" showText={false} className="justify-center mb-4" />
          <div className="w-2 h-2 rounded-full bg-accent-500 mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthPage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}
