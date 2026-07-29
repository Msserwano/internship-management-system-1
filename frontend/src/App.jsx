import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <AppRouter />
          <Toaster
            position="top-right"
            toastOptions={{
              className: "!rounded-xl !shadow-card-lg !text-sm !font-medium",
              success: { iconTheme: { primary: "#16A34A", secondary: "#fff" }, duration: 3000 },
              error:   { iconTheme: { primary: "#DC2626", secondary: "#fff" }, duration: 4000 },
            }}
          />
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
export default App;
