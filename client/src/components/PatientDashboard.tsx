import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Bell, MessageSquare, FileText, Activity, Heart, AlertCircle, X, Download, Share2, CheckCircle, Loader2, Clock, AlertTriangle, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import HealthRecordTimeline from "./HealthRecordTimeline";
import AIChatbot from "./AIChatbot";
import PrescriptionCard from "./PrescriptionCard";
import EmergencySOSButton from "./EmergencySOSButton";
import MedicationReminderSystem from "./MedicationReminderSystem";
import NearbyFacilitiesMap from "./NearbyFacilitiesMap";
import HealthRecordsManager from "./HealthRecordsManager";
import FacilityMapComponent from "./FacilityMapComponent";
import MedicationReminderSystemFull from "./MedicationReminderSystemFull";
import abhaCardImage from "@assets/generated_images/ABHA_health_card_mockup_2960ffc1.png";
import { useQuery } from "@tanstack/react-query";
import type { HealthRecord, Reminder, Prescription } from "@shared/schema";

type EnrichedHealthRecord = HealthRecord & {
  recordType: string;
  recordDate: Date;
  summary: string;
  doctorName: string;
};

type EnrichedPrescription = Prescription & {
  doctorName: string;
  doctorSpecialization: string;
  prescriptionDate: Date;
  prescriptionId: string;
  verificationStatus: "verified" | "pending" | "rejected";
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
};

interface PatientDashboardProps {
  patientName: string;
  abhaId: string;
  age: number;
  gender: string;
  userId?: string;
}

export default function PatientDashboard({ patientName, abhaId, age, gender, userId }: PatientDashboardProps) {
  const [selectedPrescription, setSelectedPrescription] = useState<EnrichedPrescription | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const { data: healthRecords = [], isLoading: loadingRecords } = useQuery<EnrichedHealthRecord[]>({
    queryKey: [`/api/health-records/patient/${userId}`],
    enabled: !!userId,
    initialData: [],
  });

  const { data: reminders = [], isLoading: loadingReminders } = useQuery<Reminder[]>({
    queryKey: [`/api/reminders/user/${userId}`],
    enabled: !!userId,
    initialData: [],
  });

  const { data: prescriptions = [], isLoading: loadingPrescriptions } = useQuery<EnrichedPrescription[]>({
    queryKey: [`/api/prescriptions/patient/${userId}`],
    enabled: !!userId,
    initialData: [],
  });

  const { data: healthInsights, isLoading: loadingInsights } = useQuery<{
    insights: Array<{
      title: string;
      description: string;
      priority: "high" | "medium" | "low";
      icon: string;
    }>;
  }>({
    queryKey: [`/api/health-insights/${userId}`],
    enabled: !!userId,
  });

  const upcomingReminders = Array.isArray(reminders) ? 
    reminders
      .filter(r => !r.completed && new Date(r.scheduledAt) > new Date())
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 5)
    : [];

  const formatTimelineRecords = (records: EnrichedHealthRecord[]) => {
    return records.map(record => ({
      id: record.id,
      type: record.recordType === "diagnosis" ? "consultation" : (record.recordType as "prescription" | "lab_report" | "consultation" | "vitals"),
      title: record.title,
      date: new Date(record.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      doctor: record.doctorName || "Unknown Doctor",
      summary: record.summary,
      aiInsight: record.aiSummary || "",
    }));
  };

  const formatReminderTime = (scheduledAt: Date) => {
    const now = new Date();
    const reminderDate = new Date(scheduledAt);
    const diffMs = reminderDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays > 0) {
      return `In ${diffDays} day${diffDays > 1 ? 's' : ''}, ${reminderDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffHours > 0) {
      return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}, ${reminderDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffMins > 0) {
      return `In ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else {
      return reminderDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img src={abhaCardImage} alt="ABHA Card" className="w-48 h-auto rounded-lg shadow-lg" />
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{patientName}</h1>
                  <p className="text-sm text-muted-foreground mt-1">Patient ID</p>
                </div>
                <div className="bg-primary/15 rounded-lg p-3 border border-primary/30">
                  <p className="text-xs text-muted-foreground mb-1">ABHA ID</p>
                  <p className="text-2xl font-bold font-mono text-primary">{abhaId}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <span>Age: {age}</span>
                  <span>Gender: {gender}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge variant="secondary">
                    <Heart className="w-3 h-3 mr-1" />
                    Diabetes Type 2
                  </Badge>
                  <Badge variant="secondary">
                    <Activity className="w-3 h-3 mr-1" />
                    Hypertension
                  </Badge>
                </div>
              </div>
            </div>
            <EmergencySOSButton patientName={patientName} abhaId={abhaId} userId={userId || ""} />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="records" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="records" data-testid="tab-records">
                <FileText className="w-4 h-4 mr-2" />
                {t("patient.medicalHistory")}
              </TabsTrigger>
              <TabsTrigger value="prescriptions" data-testid="tab-prescriptions">
                <Activity className="w-4 h-4 mr-2" />
                {t("patient.prescriptions")}
              </TabsTrigger>
              <TabsTrigger value="facilities" data-testid="tab-facilities">
                <MapPin className="w-4 h-4 mr-2" />
                Facilities
              </TabsTrigger>
              <TabsTrigger value="chat" data-testid="tab-chat">
                <MessageSquare className="w-4 h-4 mr-2" />
                {t("chat.title")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="records" className="mt-6">
              {loadingRecords ? (
                <div className="text-center py-8 text-muted-foreground">{t("common.loading")}</div>
              ) : healthRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No health records found</div>
              ) : (
                <HealthRecordTimeline
                  records={formatTimelineRecords(healthRecords)}
                  onDownload={(id) => {
                    const record = healthRecords.find(r => r.id === id);
                    if (record) {
                      const recordData = `Health Record\n\nTitle: ${record.summary}\nType: ${record.recordType}\nDate: ${record.recordDate}\n\n${record.summary}`;
                      const element = document.createElement("a");
                      element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(recordData));
                      element.setAttribute("download", `HealthRecord_${id}.txt`);
                      element.style.display = "none";
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                      toast({ title: "Downloaded", description: "Health record downloaded successfully" });
                    }
                  }}
                  onViewDetails={(id) => {
                    const record = healthRecords.find(r => r.id === id);
                    if (record) {
                      toast({ title: record.summary, description: record.summary });
                    }
                  }}
                />
              )}
            </TabsContent>
            <TabsContent value="prescriptions" className="mt-6 space-y-4">
              {loadingPrescriptions ? (
                <div className="text-center py-8 text-muted-foreground">{t("common.loading")}</div>
              ) : prescriptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No prescriptions found</div>
              ) : (
                prescriptions.map((prescription) => (
                  <PrescriptionCard
                    key={prescription.id}
                    id={prescription.id}
                    doctorName={prescription.doctorName}
                    doctorSpecialization={prescription.doctorSpecialization || ""}
                    patientName={patientName}
                    date={new Date(prescription.prescriptionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    prescriptionId={prescription.prescriptionId}
                    status={prescription.verificationStatus === "rejected" ? "dispensed" : (prescription.verificationStatus as "verified" | "pending" | "dispensed")}
                    medicines={prescription.medicines}
                    onDownload={() => {
                      const prescriptionData = `Prescription\n\nDoctor: ${prescription.doctorName}\nPatient: ${patientName}\nDate: ${prescription.prescriptionDate}\nStatus: ${prescription.verificationStatus}\n\nMedicines:\n${prescription.medicines.map((m: any) => `${m.name} - ${m.dosage}`).join('\n')}`;
                      const element = document.createElement("a");
                      element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(prescriptionData));
                      element.setAttribute("download", `Prescription_${prescription.id}.txt`);
                      element.style.display = "none";
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                      toast({ title: "Downloaded", description: "Prescription downloaded successfully" });
                    }}
                    onShare={() => {
                      const url = window.location.href;
                      navigator.clipboard.writeText(`Check my prescription from Dr. ${prescription.doctorName}: ${url}`);
                      toast({ title: "Shared", description: "Link copied to clipboard" });
                    }}
                    onViewQR={() => {
                      if (prescription.qrCode) {
                        const qrWindow = window.open();
                        if (qrWindow) {
                          qrWindow.document.write(`<html><head><title>QR Code</title></head><body><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23FFF' width='200' height='200'/%3E%3Ctext x='50' y='100' font-size='14' fill='%23000'%3EQR: ${prescription.qrCode}%3C/text%3E%3C/svg%3E" style="width: 100%; max-width: 400px;"/><p>${prescription.qrCode}</p></body></html>`);
                        }
                      } else {
                        toast({ title: "Error", description: "No QR code available", variant: "destructive" });
                      }
                    }}
                    onViewDetails={() => setSelectedPrescription(prescription)}
                  />
                ))
              )}
            </TabsContent>
            <TabsContent value="facilities" className="mt-6">
              <NearbyFacilitiesMap />
            </TabsContent>
            <TabsContent value="chat" className="mt-6">
              <AIChatbot userId={userId} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Upcoming Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingReminders ? (
                <div className="text-center py-4 text-muted-foreground text-sm">Loading reminders...</div>
              ) : upcomingReminders.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">No upcoming reminders</div>
              ) : (
                upcomingReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="p-3 rounded-lg bg-muted/50 hover-elevate"
                    data-testid={`reminder-${reminder.id}`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{reminder.message}</p>
                        <p className="text-xs text-muted-foreground">{formatReminderTime(reminder.scheduledAt)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full" data-testid="button-manage-reminders">
                Manage Reminders
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Health Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingInsights ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating personalized insights...
                </div>
              ) : healthInsights?.insights && healthInsights.insights.length > 0 ? (
                healthInsights.insights.map((insight, idx) => {
                  const bgColor = insight.priority === "high" ? "bg-red-500/5 border-red-500/10" 
                    : insight.priority === "medium" ? "bg-amber-500/5 border-amber-500/10"
                    : "bg-green-500/5 border-green-500/10";
                  
                  const textColor = insight.priority === "high" ? "text-red-700 dark:text-red-400"
                    : insight.priority === "medium" ? "text-amber-700 dark:text-amber-400"
                    : "text-green-700 dark:text-green-400";

                  return (
                    <div key={idx} className={`p-4 rounded-lg border ${bgColor}`}>
                      <p className={`text-sm font-medium mb-1 ${textColor}`}>{insight.title}</p>
                      <p className="text-sm text-foreground">{insight.description}</p>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
                  No insights available at this time
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Prescription Detail Modal */}
      <Dialog open={!!selectedPrescription} onOpenChange={(open) => !open && setSelectedPrescription(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedPrescription && (
            <>
              <DialogHeader className="pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-xl">Prescription Details</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      ID: {selectedPrescription.prescriptionId}
                    </p>
                  </div>
                  <Badge 
                    className={
                      selectedPrescription.verificationStatus === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedPrescription.verificationStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {selectedPrescription.verificationStatus.charAt(0).toUpperCase() + selectedPrescription.verificationStatus.slice(1)}
                  </Badge>
                </div>
              </DialogHeader>

              <Separator />

              {/* Doctor Information */}
              <div className="grid grid-cols-2 gap-4 text-sm py-4">
                <div>
                  <p className="text-muted-foreground font-medium">Doctor</p>
                  <p className="font-semibold text-base">{selectedPrescription.doctorName}</p>
                  <p className="text-xs text-muted-foreground">{selectedPrescription.doctorSpecialization}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Date Issued</p>
                  <p className="font-semibold">
                    {new Date(selectedPrescription.prescriptionDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Diagnosis */}
              <div className="py-4">
                <p className="font-semibold text-sm mb-2">Diagnosis</p>
                <p className="text-sm bg-muted/50 p-3 rounded">{selectedPrescription.diagnosis}</p>
              </div>

              {/* Symptoms */}
              {selectedPrescription.symptoms && selectedPrescription.symptoms.length > 0 && (
                <div className="py-4">
                  <p className="font-semibold text-sm mb-2">Symptoms Reported</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrescription.symptoms.map((symptom, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicines */}
              <div className="py-4">
                <p className="font-semibold text-sm mb-3">Prescribed Medicines</p>
                <div className="space-y-3">
                  {selectedPrescription.medicines && selectedPrescription.medicines.length > 0 ? (
                    selectedPrescription.medicines.map((medicine, idx) => (
                      <div key={idx} className="p-3 border border-border rounded-lg bg-muted/30">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-sm">{medicine.name}</p>
                          <Badge variant="outline" className="text-xs">{medicine.dosage}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            <span className="font-medium">Frequency:</span> {medicine.frequency}
                          </p>
                          <p>
                            <span className="font-medium">Duration:</span> {medicine.duration}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No medicines prescribed</p>
                  )}
                </div>
              </div>

              {/* Lab Tests */}
              {selectedPrescription.labTests && selectedPrescription.labTests.length > 0 && (
                <div className="py-4">
                  <p className="font-semibold text-sm mb-2">Recommended Lab Tests</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrescription.labTests.map((test, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        🔬 {test}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedPrescription.notes && (
                <div className="py-4">
                  <p className="font-semibold text-sm mb-2">Special Notes</p>
                  <p className="text-sm bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 rounded">
                    {selectedPrescription.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
