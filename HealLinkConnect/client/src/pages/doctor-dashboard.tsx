import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/bottom-nav";
import Chatbot from "@/components/chatbot";
import PrescriptionModal from "@/components/prescription-modal";
import { 
  Stethoscope, 
  Users, 
  PillBottle, 
  Search, 
  Bell, 
  LogOut, 
  Calendar,
  Video,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Doctor, Appointment, Prescription } from "@shared/schema";

export default function DoctorDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [searchAbhaId, setSearchAbhaId] = useState("");
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  // Fetch doctor profile
  const { data: doctorProfile } = useQuery<Doctor>({
    queryKey: ["/api/doctor/profile"],
    enabled: !!user,
  });

  // Fetch today's appointments
  const { data: todaysAppointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/doctor/appointments/today"],
    enabled: !!user,
  });

  // Fetch prescriptions
  const { data: prescriptions = [] } = useQuery<Prescription[]>({
    queryKey: ["/api/doctor/prescriptions"],
    enabled: !!user,
  });

  // Search patient mutation
  const searchPatientMutation = useMutation({
    mutationFn: async (abhaId: string) => {
      const res = await apiRequest("GET", `/api/abha/patient/${abhaId}`);
      return await res.json();
    },
    onSuccess: (patient) => {
      toast({
        title: "Patient found",
        description: `Found patient: ${patient.name}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Patient not found",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearchPatient = () => {
    if (!searchAbhaId.trim()) {
      toast({
        title: "ABHA ID required",
        description: "Please enter a valid ABHA ID",
        variant: "destructive",
      });
      return;
    }
    searchPatientMutation.mutate(searchAbhaId);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAppointmentBadgeColor = (type: string) => {
    switch (type) {
      case 'checkup': return 'bg-accent/10 text-accent';
      case 'follow-up': return 'bg-destructive/10 text-destructive';
      case 'consultation': return 'bg-secondary/10 text-secondary';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-card-foreground" data-testid="text-doctor-name">
                  {doctorProfile?.name || 'Loading...'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {doctorProfile?.specialization} • {doctorProfile?.hospital}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                data-testid="button-notifications"
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-today-patients">
                    {todaysAppointments.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Today's Patients</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-prescriptions-count">
                    {prescriptions.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Prescriptions</p>
                </div>
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <PillBottle className="h-5 w-5 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ABHA Patient Search */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-card-foreground mb-3 flex items-center">
              <Search className="h-4 w-4 text-primary mr-2" />
              Find Patient by ABHA ID
            </h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter ABHA ID to fetch records"
                value={searchAbhaId}
                onChange={(e) => setSearchAbhaId(e.target.value)}
                className="flex-1"
                data-testid="input-abha-search"
              />
              <Button 
                onClick={handleSearchPatient}
                disabled={searchPatientMutation.isPending}
                data-testid="button-search-patient"
              >
                {searchPatientMutation.isPending ? (
                  "Searching..."
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Today's Appointments</h3>
            <Button variant="ghost" size="sm" data-testid="button-view-all-appointments">
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {todaysAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  No appointments scheduled for today
                </CardContent>
              </Card>
            ) : (
              todaysAppointments.map((appointment: any) => (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-muted-foreground">
                            {appointment.patient?.name?.charAt(0) || 'P'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-card-foreground" data-testid={`text-patient-${appointment.id}`}>
                            {appointment.patient?.name || 'Patient Name'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            ABHA: {appointment.patient?.abhaId || 'Not linked'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-card-foreground">
                          {formatTime(appointment.scheduledAt)}
                        </p>
                        <Badge className={getAppointmentBadgeColor(appointment.type)}>
                          {appointment.type}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav 
        role="doctor" 
        onPrescriptionClick={() => setShowPrescriptionModal(true)}
      />
      
      {/* Floating Chatbot */}
      <Chatbot userRole="doctor" />

      {/* Prescription Modal */}
      {showPrescriptionModal && doctorProfile?.id && (
        <PrescriptionModal 
          onClose={() => setShowPrescriptionModal(false)}
          doctorId={doctorProfile.id}
        />
      )}
    </div>
  );
}
