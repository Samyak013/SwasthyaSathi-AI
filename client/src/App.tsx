import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
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
  const [role, setRole] = useState<"doctor" | "patient" | "pharmacy" | null>(null);
  const [view, setView] = useState<"main" | "prescription" | "analytics">("main");
  const [darkMode, setDarkMode] = useState(false);

  //todo: remove mock functionality
  const userData = {
    name: "Dr. Rajesh Kumar",
    abhaId: "22-1234-5678-9012",
    specialization: "General Physician, MD",
  };

  //todo: remove mock functionality
  const patientData = {
    name: "Priya Sharma",
    abhaId: "22-1111-2222-3333",
    age: 32,
    gender: "Female",
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogin = () => {
    setStep("role");
    console.log("User logged in");
  };

  const handleRoleSelection = (selectedRole: "doctor" | "patient" | "pharmacy") => {
    setRole(selectedRole);
    setStep("dashboard");
    console.log("Role selected:", selectedRole);
  };

  const renderDashboard = () => {
    if (role === "doctor") {
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
              doctorName={userData.name}
              patientName={patientData.name}
              patientAbhaId={patientData.abhaId}
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
          doctorName={userData.name}
          specialization={userData.specialization}
          onCreatePrescription={() => setView("prescription")}
          onViewAnalytics={() => setView("analytics")}
        />
      );
    }

    if (role === "patient") {
      return (
        <PatientDashboard
          patientName={patientData.name}
          abhaId={patientData.abhaId}
          age={patientData.age}
          gender={patientData.gender}
        />
      );
    }

    if (role === "pharmacy") {
      return <PharmacyPortal pharmacyName="HealthPlus Pharmacy" location="Mumbai, Maharashtra" />;
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

      {step === "role" && (
        <div className="flex items-center justify-center min-h-screen p-6">
          <RoleSelection
            userName={userData.name}
            abhaId={userData.abhaId}
            onSelectRole={handleRoleSelection}
          />
        </div>
      )}

      {step === "dashboard" && (
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
                  setRole(null);
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
