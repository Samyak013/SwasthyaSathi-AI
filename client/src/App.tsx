import { useState } from "react";
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
              patientName="Select Patient"
              patientAbhaId=""
              onSave={(prescription) => {
                console.log("Prescription saved:", prescription);
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
        />
      );
    }

    return null;
  };

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
                onClick={() => {
                  setStep("login");
                  setUserData(null);
                  setView("main");
                }}
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
