import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import BottomNav from "@/components/bottom-nav";
import Chatbot from "@/components/chatbot";
import { 
  Pill, 
  Clock, 
  IndianRupee, 
  CheckCircle, 
  Search, 
  QrCode, 
  Eye, 
  Phone, 
  Bell, 
  LogOut,
  AlertTriangle,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PharmacyDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [prescriptionId, setPrescriptionId] = useState("");

  // Fetch pharmacy profile
  const { data: pharmacyProfile } = useQuery<any>({
    queryKey: ["/api/pharmacy/profile"],
    enabled: !!user,
  });

  // Fetch pending prescriptions
  const { data: pendingPrescriptions = [] } = useQuery<any[]>({
    queryKey: ["/api/pharmacy/prescriptions/pending"],
    enabled: !!user,
  });

  // Verify prescription mutation
  const verifyPrescriptionMutation = useMutation({
    mutationFn: async (prescriptionRef: string) => {
      const res = await apiRequest("POST", "/api/abha/verify-prescription", {
        prescriptionRef,
        patientAbhaId: "sample-abha-id" // In real implementation, this would come from the prescription
      });
      return await res.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Prescription verified",
        description: result.isValid ? "Prescription is authentic" : "Invalid prescription",
        variant: result.isValid ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Dispense prescription mutation
  const dispensePrescriptionMutation = useMutation({
    mutationFn: async ({ id, dispensedMedicines }: { id: string; dispensedMedicines: any[] }) => {
      const res = await apiRequest("PATCH", `/api/pharmacy/prescriptions/${id}/dispense`, {
        dispensedMedicines
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacy/prescriptions/pending"] });
      toast({
        title: "Prescription dispensed",
        description: "Medicine has been dispensed and data sent to ABDM",
      });
    },
    onError: (error) => {
      toast({
        title: "Dispensing failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleVerifyPrescription = () => {
    if (!prescriptionId.trim()) {
      toast({
        title: "Prescription ID required",
        description: "Please enter a valid prescription ID",
        variant: "destructive",
      });
      return;
    }
    verifyPrescriptionMutation.mutate(prescriptionId);
  };

  const handleDispensePrescription = (prescriptionId: string, medicines: any[]) => {
    dispensePrescriptionMutation.mutate({
      id: prescriptionId,
      dispensedMedicines: medicines
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  const parsePrescMedications = (prescription: any) => {
    const medsRaw = prescription?.medications ?? prescription?.medicines;
    if (!medsRaw) return [];
    try {
      return typeof medsRaw === 'string' ? JSON.parse(medsRaw) : medsRaw;
    } catch {
      return Array.isArray(medsRaw) ? medsRaw : [];
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-accent/10 text-accent">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'out-of-stock':
        return <Badge className="bg-destructive/10 text-destructive">Out of Stock</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Mock data for demonstration
  const todaysSales = "₹8,450";
  const stockAlerts = [
    {
      id: 1,
      medicine: "Aspirin 75mg",
      stock: 5,
      unit: "strips",
      level: "critical"
    },
    {
      id: 2,
      medicine: "Crocin 650mg", 
      stock: 15,
      unit: "strips",
      level: "low"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <Pill className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-card-foreground" data-testid="text-pharmacy-name">
                  {pharmacyProfile?.name || 'Loading...'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  License: {pharmacyProfile?.licenseNumber || 'Loading...'} • {pharmacyProfile?.address || 'Location'}
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
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-pending-orders">
                    {pendingPrescriptions.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                </div>
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-today-sales">
                    {todaysSales}
                  </p>
                  <p className="text-sm text-muted-foreground">Today's Sales</p>
                </div>
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ABHA Prescription Verification */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-card-foreground mb-3 flex items-center">
              <CheckCircle className="h-4 w-4 text-secondary mr-2" />
              Verify ABHA Prescription
            </h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Scan or enter prescription ID"
                value={prescriptionId}
                onChange={(e) => setPrescriptionId(e.target.value)}
                className="flex-1"
                data-testid="input-prescription-id"
              />
              <Button 
                onClick={handleVerifyPrescription}
                disabled={verifyPrescriptionMutation.isPending}
                className="bg-secondary hover:bg-secondary/90"
                data-testid="button-search-prescription"
              >
                {verifyPrescriptionMutation.isPending ? (
                  "Verifying..."
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
              <Button 
                variant="outline" 
                className="border-accent text-accent hover:bg-accent/10"
                data-testid="button-scan-qr"
              >
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Prescriptions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Pending Prescriptions</h3>
            <Button variant="ghost" size="sm" data-testid="button-view-all-prescriptions">
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {pendingPrescriptions.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  No pending prescriptions
                </CardContent>
              </Card>
            ) : (
              pendingPrescriptions.map((prescription: any) => (
                <Card key={prescription.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-muted">
                            {prescription.patient?.name ? getInitials(prescription.patient.name) : 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-card-foreground" data-testid={`text-patient-${prescription.id}`}>
                            {prescription.patient?.name || 'Patient Name'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            ABHA: {prescription.patient?.abhaId || 'Not available'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(prescription.status || 'verified')}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(prescription.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      {parsePrescMedications(prescription).length > 0 ? parsePrescMedications(prescription).map((medicine: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{medicine.name || `Medicine ${index + 1}`}</span>
                          <span className="font-medium">{medicine.quantity || medicine.dosage || '30'} {medicine.unit || 'tablets'}</span>
                        </div>
                      )) : (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span>Atorvastatin 10mg</span>
                            <span className="font-medium">30 tablets</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Metformin 500mg</span>
                            <span className="font-medium">60 tablets</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1 bg-secondary hover:bg-secondary/90"
                        onClick={() => handleDispensePrescription(prescription.id, prescription.medicines || [])}
                        disabled={dispensePrescriptionMutation.isPending}
                        data-testid={`button-dispense-${prescription.id}`}
                      >
                        {dispensePrescriptionMutation.isPending ? "Processing..." : "Dispense"}
                      </Button>
                      <Button 
                        variant="outline"
                        size="icon"
                        data-testid={`button-view-${prescription.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Stock Management */}
        <div>
          <h3 className="font-semibold text-foreground mb-4">Stock Alerts</h3>
          <div className="space-y-3">
            {stockAlerts.map((item) => (
              <Card key={item.id} className={item.level === 'critical' ? 'bg-destructive/5 border-destructive/20' : 'bg-accent/5 border-accent/20'}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.level === 'critical' ? 'bg-destructive/10' : 'bg-accent/10'
                      }`}>
                        {item.level === 'critical' ? (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        ) : (
                          <Package className="h-5 w-5 text-accent" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-card-foreground" data-testid={`text-medicine-${item.id}`}>
                          {item.medicine}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Only {item.stock} {item.unit} remaining
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      className={item.level === 'critical' ? 'bg-destructive hover:bg-destructive/90' : 'bg-accent hover:bg-accent/90'}
                      data-testid={`button-reorder-${item.id}`}
                    >
                      {item.level === 'critical' ? 'Reorder' : 'Order Soon'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav role="pharmacy" />
      
      {/* Floating Chatbot */}
      <Chatbot userRole="pharmacy" />
    </div>
  );
}
