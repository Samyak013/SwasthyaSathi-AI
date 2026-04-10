import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import ABHALogin from "@/components/ABHALogin";
import RoleSelection from "@/components/RoleSelection";
import DoctorDashboard from "@/components/DoctorDashboard";
import PatientDashboard from "@/components/PatientDashboard";
import PharmacyPortal from "@/components/PharmacyPortal";
import PrescriptionCreator from "@/components/PrescriptionCreator";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

function Router() {
  const [step, setStep] = useState<"login" | "role" | "dashboard">("login");
  const [userData, setUserData] = useState<any>(null);
  const [view, setView] = useState<"main" | "prescription" | "analytics">("main");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleLogin = (data: any) => {
    setUserData(data);
    
    if (data.user.role === "doctor" || data.user.role === "patient" || data.user.role === "pharmacy") {
      setStep("dashboard");
    } else {
      setStep("role");
    }
  };

  const handleRoleSelection = (selectedRole: "doctor" | "patient" | "pharmacy") => {
    if (userData) {
      setUserData({
        ...userData,
        user: {
          ...userData.user,
          role: selectedRole,
        },
      });
    }
    setStep("dashboard");
  };

  const handleLogout = () => {
    setStep("login");
    setUserData(null);
    setView("main");
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

      return (
        <DoctorDashboard
          doctorName={user.name}
          specialization={profileData?.specialization || "General Physician"}
          userId={user.id}
          onCreatePrescription={() => setView("prescription")}
          onViewAnalytics={() => setView("analytics")}
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
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleDarkMode}
          data-testid="button-theme-toggle"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      {step === "login" && (
        <div className="flex items-center justify-center min-h-screen p-6">
          <ABHALogin onLogin={handleLogin} />
        </div>
      )}

      {step === "role" && userData && (
        <div className="flex items-center justify-center min-h-screen p-6">
          <RoleSelection
            userName={userData.user.name}
            abhaId={userData.user.abhaId}
            onSelectRole={handleRoleSelection}
          />
        </div>
      )}

      {step === "dashboard" && userData && (
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Swashtya Sathi AI</h1>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                Logout
              </Button>
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
