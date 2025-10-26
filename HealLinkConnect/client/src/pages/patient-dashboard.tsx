import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNav from "@/components/bottom-nav";
import Chatbot from "@/components/chatbot";
import { 
  User, 
  Heart, 
  Activity, 
  Shield, 
  FileText, 
  Download, 
  Share, 
  Bell, 
  LogOut,
  TestTube,
  Scan
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Patient, Prescription, ConsentRequest, HealthRecord } from "@shared/schema";

export default function PatientDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  // Fetch patient profile
  const { data: patientProfile } = useQuery<Patient>({
    queryKey: ["/api/patient/profile"],
    enabled: !!user,
  });

  // Fetch prescriptions
  const { data: prescriptions = [] } = useQuery<Prescription[]>({
    queryKey: ["/api/patient/prescriptions"],
    enabled: !!user,
  });

  // Reminder timers ref: { [prescriptionId]: Array<timeoutId> }
  const reminderTimers = useRef<Record<string, number[]>>({});

  // Helper: parse meds into array
  const parseMedications = (prescription: any) => {
    const medsRaw: any = (prescription as any).medications ?? (prescription as any).medicines;
    if (!medsRaw) return [];
    try {
      const meds = typeof medsRaw === 'string' ? JSON.parse(medsRaw) : medsRaw;
      return Array.isArray(meds) ? meds : [meds];
    } catch (e) {
      return typeof medsRaw === 'object' ? [medsRaw] : [];
    }
  };

  // Map common frequency strings to milliseconds (approximate)
  const frequencyToMs = (freq: string) => {
    const s = (freq || '').toLowerCase();
    if (s.includes('once')) return 24 * 60 * 60 * 1000;
    if (s.includes('twice') || s.includes('2')) return 12 * 60 * 60 * 1000;
    if (s.includes('thrice') || s.includes('3')) return 8 * 60 * 60 * 1000;
    if (s.includes('daily')) return 24 * 60 * 60 * 1000;
    if (s.includes('weekly')) return 7 * 24 * 60 * 60 * 1000;
    // fallback: try to parse like 'Every 6 hours'
    const m = freq.match(/(\d+)\s*hour/);
    if (m) return parseInt(m[1], 10) * 60 * 60 * 1000;
    return null;
  };

  const scheduleRemindersForPrescription = (prescription: any) => {
    if (!prescription?.id) return;
    // clear existing
    const existing = reminderTimers.current[prescription.id] ?? [];
    existing.forEach((t) => clearInterval(t));
    reminderTimers.current[prescription.id] = [];

    const meds = parseMedications(prescription);
    meds.forEach((med: any, idx: number) => {
      const interval = frequencyToMs(med.frequency || med.dosage || '');
      if (!interval) return;
      // set an initial timer to fire after 5 seconds for demo, then repeat every interval
      const timerId = window.setInterval(() => {
        // Try browser Notification first
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('Medication reminder', {
            body: `${med.name} — ${med.dosage} — ${med.frequency}`,
          });
        } else {
          // fallback to toast
          toast({ title: 'Medication reminder', description: `${med.name} — ${med.dosage} — ${med.frequency}` });
        }
      }, interval);
      reminderTimers.current[prescription.id].push(timerId as unknown as number);
    });
  };

  const enableReminders = async (prescription: any) => {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      try {
        await Notification.requestPermission();
      } catch {}
    }
    scheduleRemindersForPrescription(prescription);
    // persist choice so we can reschedule on reload
    try { localStorage.setItem(`reminder:${prescription.id}`, 'enabled'); } catch {}
    toast({ title: 'Reminders enabled', description: 'You will receive reminders for this prescription' });
  };

  const disableReminders = (prescription: any) => {
    const timers = reminderTimers.current[prescription.id] ?? [];
    timers.forEach((t) => clearInterval(t));
    reminderTimers.current[prescription.id] = [];
    try { localStorage.removeItem(`reminder:${prescription.id}`); } catch {}
    toast({ title: 'Reminders disabled' });
  };

  // On prescriptions change or mount, auto-reschedule persisted reminders
  useEffect(() => {
    prescriptions.forEach((p: any) => {
      try {
        if (localStorage.getItem(`reminder:${p.id}`) === 'enabled') {
          scheduleRemindersForPrescription(p);
        }
      } catch {}
    });
    // cleanup on unmount
    return () => {
      Object.values(reminderTimers.current).forEach(arr => arr.forEach(t => clearInterval(t)));
      reminderTimers.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prescriptions]);

  // Fetch consent requests
  const { data: consentRequests = [] } = useQuery<ConsentRequest[]>({
    queryKey: ["/api/patient/consent-requests"],
    enabled: !!user,
  });

  // Fetch health records
  const { data: healthRecords = [] } = useQuery<HealthRecord[]>({
    queryKey: ["/api/patient/health-records"],
    enabled: !!user,
  });

  // Update consent mutation
  const updateConsentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/patient/consent-requests/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patient/consent-requests"] });
      toast({
        title: "Consent updated",
        description: "Consent request has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update consent",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleConsentAction = (id: string, status: 'approved' | 'rejected') => {
    updateConsentMutation.mutate({ id, status });
  };

  const formatDate = (dateString: string) => {
    const d = typeof dateString === 'number' ? new Date(dateString) : new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} years`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-card-foreground" data-testid="text-patient-name">
                  {patientProfile?.name || user?.username || 'Loading...'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  ABHA: {user?.abhaId || 'Not linked'}
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
        {/* Profile Card */}
        <Card className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 border-2 border-white/20">
                <AvatarImage src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400" />
                <AvatarFallback className="bg-white/20 text-white">
                  {patientProfile?.name ? getInitials(patientProfile.name) : 'P'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold" data-testid="text-profile-name">
                  {patientProfile?.name || user?.username || 'Patient Name'}
                </h3>
                <div className="flex items-center space-x-4 text-sm opacity-90">
                  <span data-testid="text-blood-group">
                    {patientProfile?.bloodGroup || 'Unknown'}
                  </span>
                  <span data-testid="text-age">
                    {patientProfile?.dateOfBirth ? calculateAge(patientProfile.dateOfBirth.toString()) : 'Unknown age'}
                  </span>
                </div>
                <p className="text-xs opacity-75 mt-1" data-testid="text-insurance">
                  {patientProfile?.insuranceInfo || 'No insurance info'}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/10"
                data-testid="button-edit-profile"
              >
                <FileText className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Health Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary" data-testid="text-heart-rate">72</p>
              <p className="text-sm text-muted-foreground">Heart Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-secondary" data-testid="text-blood-pressure">120/80</p>
              <p className="text-sm text-muted-foreground">Blood Pressure</p>
            </CardContent>
          </Card>
        </div>

        {/* Consent Management */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-card-foreground mb-4 flex items-center">
              <Shield className="h-4 w-4 text-accent mr-2" />
              Consent Requests
            </h3>
            
            <div className="space-y-3">
              {consentRequests.filter((req: any) => req.status === 'pending').length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No pending consent requests
                </div>
              ) : (
                consentRequests
                  .filter((req: any) => req.status === 'pending')
                  .map((request: any) => (
                    <div key={request.id} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-card-foreground" data-testid={`text-doctor-${request.id}`}>
                          {request.doctor?.name || 'Doctor Name'}
                        </h4>
                        <Badge className="bg-accent/10 text-accent">Pending</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {request.purpose || 'Requests access to your medical history for consultation'}
                      </p>
                      <div className="flex space-x-2">
                        <Button 
                          variant="default"
                          size="sm"
                          className="flex-1 bg-secondary hover:bg-secondary/90"
                          onClick={() => handleConsentAction(request.id, 'approved')}
                          disabled={updateConsentMutation.isPending}
                          data-testid={`button-approve-${request.id}`}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleConsentAction(request.id, 'rejected')}
                          disabled={updateConsentMutation.isPending}
                          data-testid={`button-reject-${request.id}`}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Prescriptions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Prescriptions</h3>
            <Button variant="ghost" size="sm" data-testid="button-view-all-prescriptions">
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {prescriptions.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  No prescriptions found
                </CardContent>
              </Card>
            ) : (
              prescriptions.slice(0, 3).map((prescription: any) => (
                <Card key={prescription.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-card-foreground" data-testid={`text-prescription-doctor-${prescription.id}`}>
                          {prescription.doctor?.name || 'Doctor Name'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {prescription.doctor?.specialization || 'Specialization'} • {formatDate(prescription.createdAt)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="Forward to Pharmacy"
                          data-testid={`button-share-${prescription.id}`}
                        >
                          <Share className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          data-testid={`button-download-${prescription.id}`}
                        >
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <strong>Medicines:</strong> {
                          // Support different shapes: prescription.medications (JSON string or array) or legacy prescription.medicines
                          (() => {
                            const medsRaw: any = (prescription as any).medications ?? (prescription as any).medicines;
                            if (!medsRaw) return 'Medicine details';
                            try {
                              const meds = typeof medsRaw === 'string' ? JSON.parse(medsRaw) : medsRaw;
                              if (Array.isArray(meds)) return meds.map((m: any) => m.name || m).join(', ');
                              return String(meds);
                            } catch (e) {
                              return String(medsRaw);
                            }
                          })()
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {prescription.instructions || 'Follow doctor\'s instructions'}
                      </p>
                      <div className="pt-2 flex space-x-2">
                        {localStorage.getItem(`reminder:${prescription.id}`) === 'enabled' ? (
                          <Button size="sm" variant="destructive" onClick={() => disableReminders(prescription)} data-testid={`button-disable-reminder-${prescription.id}`}>
                            Disable Reminders
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => enableReminders(prescription)} data-testid={`button-enable-reminder-${prescription.id}`}>
                            Enable Reminders
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Health Records */}
        <div>
          <h3 className="font-semibold text-foreground mb-4">Health Records</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2"
              data-testid="button-lab-reports"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <TestTube className="h-5 w-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Lab Reports</p>
                <p className="text-xs text-muted-foreground">
                  {healthRecords.filter((r: any) => r.type === 'lab').length} reports
                </p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2"
              data-testid="button-imaging"
            >
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Scan className="h-5 w-5 text-secondary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Imaging</p>
                <p className="text-xs text-muted-foreground">
                  {healthRecords.filter((r: any) => r.type === 'imaging').length} scans
                </p>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav role="patient" />
      
      {/* Floating Chatbot */}
      <Chatbot userRole="patient" />
    </div>
  );
}
