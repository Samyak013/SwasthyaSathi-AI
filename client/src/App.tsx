import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut } from "lucide-react";
import RoleLoginSelection from "@/components/RoleLoginSelection";
import DoctorLogin from "@/components/DoctorLogin";
import PatientLogin from "@/components/PatientLogin";
import PharmacyLogin from "@/components/PharmacyLogin";
import DoctorDashboard from "@/components/DoctorDashboard";
import PatientDashboard from "@/components/PatientDashboard";
import PharmacyPortal from "@/components/PharmacyPortal";
import PrescriptionCreator from "@/components/PrescriptionCreator";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import EmergencyResponseDashboard from "@/components/EmergencyResponseDashboard";

function Router() {
  const [step, setStep] = useState<"role-select" | "doctor-login" | "patient-login" | "pharmacy-login" | "dashboard">("role-select");
  const [userData, setUserData] = useState<any>(null);
  const [view, setView] = useState<"main" | "prescription" | "analytics" | "emergency">("main");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<"doctor" | "patient" | "pharmacy" | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem("swasthyaSathiSession");
    const savedDarkMode = localStorage.getItem("swasthyaSathiDarkMode");
    
    if (savedDarkMode === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setUserData(session.userData);
        setStep(session.step);
        setView(session.view || "main");
      } catch (error) {
        console.error("Failed to restore session:", error);
        localStorage.removeItem("swasthyaSathiSession");
      }
    }
    
    setIsLoading(false);
  }, []);

  // Save session to localStorage whenever userData or step changes
  useEffect(() => {
    if (!isLoading && userData && step === "dashboard") {
      const session = {
        userData,
        step,
        view,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("swasthyaSathiSession", JSON.stringify(session));
    }
  }, [userData, step, view, isLoading]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("swasthyaSathiDarkMode", String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleRoleSelection = (role: "doctor" | "patient" | "pharmacy") => {
    setSelectedRole(role);
    if (role === "doctor") {
      setStep("doctor-login");
    } else if (role === "patient") {
      setStep("patient-login");
    } else if (role === "pharmacy") {
      setStep("pharmacy-login");
    }
  };

  const handleLogin = (data: any) => {
    setUserData(data);
    setStep("dashboard");
  };

  const handleBackToRoleSelect = () => {
    setStep("role-select");
    setSelectedRole(null);
    setUserData(null);
  };

  const handleLogout = () => {
    setStep("role-select");
    setUserData(null);
    setView("main");
    setSelectedRole(null);
    localStorage.removeItem("swasthyaSathiSession");
  };

  const renderDashboard = () => {
    if (!userData) return null;

    const { user, profileData } = userData;

    if (user.role === "doctor") {
      if (view === "prescription") {
        return (
          <div>
            <Button
              variant="outline"
              onClick={() => setView("main")}
              className="mb-6"
              data-testid="button-back-dashboard"
            >
              ← Back to Dashboard
            </Button>
            <PrescriptionCreator
              doctorName={user.name}
              doctorId={user.id}
              onSave={(prescription) => {
                console.log("✅ Prescription shared successfully:", prescription);
                setView("main");
              }}
            />
          </div>
        );
      }

      if (view === "analytics") {
        return (
          <div>
            <Button
              variant="outline"
              onClick={() => setView("main")}
              className="mb-6"
              data-testid="button-back-analytics"
            >
              ← Back to Dashboard
            </Button>
            <AnalyticsDashboard />
          </div>
        );
      }

      if (view === "emergency") {
        return (
          <div>
            <Button
              variant="outline"
              onClick={() => setView("main")}
              className="mb-6"
              data-testid="button-back-emergency"
            >
              ← Back to Dashboard
            </Button>
            <EmergencyResponseDashboard doctorId={user.id} />
          </div>
        );
      }

      return (
        <DoctorDashboard
          doctorName={user.name}
          specialization={profileData?.specialization || "General Physician"}
          userId={user.id}
          onCreatePrescription={() => setView("prescription")}
          onViewAnalytics={() => setView("analytics")}
          onViewEmergency={() => setView("emergency")}
        />
      );
    }

    if (user.role === "patient") {
      const patientProfile = profileData || {};
      return (
        <PatientDashboard
          patientName={user.name}
          abhaId={user.abhaId}
          age={new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()}
          gender={user.gender}
          userId={user.id}
        />
      );
    }

    if (user.role === "pharmacy") {
      return (
        <PharmacyPortal 
          pharmacyName={user.name} 
          location={profileData?.location || "Mumbai, Maharashtra"}
          userId={user.id}
        />
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {step === "role-select" && (
        <RoleLoginSelection onSelectRole={handleRoleSelection} />
      )}

      {step === "doctor-login" && (
        <DoctorLogin onLogin={handleLogin} onBack={handleBackToRoleSelect} />
      )}

      {step === "patient-login" && (
        <PatientLogin onLogin={handleLogin} onBack={handleBackToRoleSelect} />
      )}

      {step === "pharmacy-login" && (
        <PharmacyLogin onLogin={handleLogin} onBack={handleBackToRoleSelect} />
      )}

      {step === "dashboard" && userData && (
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Swashtya Sathi AI</h1>
                <span className="text-sm text-muted-foreground capitalize bg-muted px-3 py-1 rounded-full">{userData.user.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleDarkMode}
                  data-testid="button-theme-toggle"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
            {renderDashboard()}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
