import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border border-jade-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-jade-500 text-sm">◈</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-jade-500 mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
