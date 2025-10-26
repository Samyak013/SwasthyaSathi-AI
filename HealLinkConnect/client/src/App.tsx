import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DoctorDashboard from "@/pages/doctor-dashboard";
import PatientDashboard from "@/pages/patient-dashboard";
import PharmacyDashboard from "@/pages/pharmacy-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/doctor" component={DoctorDashboard} requiredRole="doctor" />
      <ProtectedRoute path="/patient" component={PatientDashboard} requiredRole="patient" />
      <ProtectedRoute path="/pharmacy" component={PharmacyDashboard} requiredRole="pharmacy" />
      <ProtectedRoute path="/" component={DashboardRedirect} />
      <Route component={NotFound} />
    </Switch>
  );
}

function DashboardRedirect() {
  const { user } = useAuth();
  
  if (user?.role === 'doctor') {
    return <Redirect to="/doctor" />;
  } else if (user?.role === 'patient') {
    return <Redirect to="/patient" />;
  } else if (user?.role === 'pharmacy') {
    return <Redirect to="/pharmacy" />;
  }
  
  return <Redirect to="/auth" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
