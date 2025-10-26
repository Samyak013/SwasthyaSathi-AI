import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageSquare, FileText, Activity, Heart, AlertCircle } from "lucide-react";
import HealthRecordTimeline from "./HealthRecordTimeline";
import AIChatbot from "./AIChatbot";
import PrescriptionCard from "./PrescriptionCard";
import EmergencySOSButton from "./EmergencySOSButton";
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
  const { data: healthRecords = [], isLoading: loadingRecords } = useQuery<EnrichedHealthRecord[]>({
    queryKey: [`/api/health-records/patient/${userId}`],
    enabled: !!userId,
  });

  const { data: reminders = [], isLoading: loadingReminders } = useQuery<Reminder[]>({
    queryKey: [`/api/reminders/user/${userId}`],
    enabled: !!userId,
  });

  const { data: prescriptions = [], isLoading: loadingPrescriptions } = useQuery<EnrichedPrescription[]>({
    queryKey: [`/api/prescriptions/patient/${userId}`],
    enabled: !!userId,
  });

  const upcomingReminders = reminders
    .filter(r => !r.completed && new Date(r.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5);

  const formatTimelineRecords = (records: EnrichedHealthRecord[]) => {
    return records.map(record => ({
      id: record.id,
      type: record.recordType as "prescription" | "lab_report" | "diagnosis" | "vitals",
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
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{patientName}</h1>
                <p className="text-lg text-muted-foreground">ABHA ID: {abhaId}</p>
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
            <EmergencySOSButton patientName={patientName} abhaId={abhaId} />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="records" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="records" data-testid="tab-records">
                <FileText className="w-4 h-4 mr-2" />
                Health Records
              </TabsTrigger>
              <TabsTrigger value="prescriptions" data-testid="tab-prescriptions">
                <Activity className="w-4 h-4 mr-2" />
                Prescriptions
              </TabsTrigger>
              <TabsTrigger value="chat" data-testid="tab-chat">
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Assistant
              </TabsTrigger>
            </TabsList>
            <TabsContent value="records" className="mt-6">
              {loadingRecords ? (
                <div className="text-center py-8 text-muted-foreground">Loading health records...</div>
              ) : healthRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No health records found</div>
              ) : (
                <HealthRecordTimeline
                  records={formatTimelineRecords(healthRecords)}
                  onDownload={(id) => console.log("Download:", id)}
                  onViewDetails={(id) => console.log("View details:", id)}
                />
              )}
            </TabsContent>
            <TabsContent value="prescriptions" className="mt-6 space-y-4">
              {loadingPrescriptions ? (
                <div className="text-center py-8 text-muted-foreground">Loading prescriptions...</div>
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
                    status={prescription.verificationStatus as "verified" | "pending" | "rejected"}
                    medicines={prescription.medicines}
                    onDownload={() => console.log("Download")}
                    onShare={() => console.log("Share")}
                    onViewQR={() => console.log("View QR")}
                  />
                ))
              )}
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
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-sm font-medium text-primary mb-2">Blood Sugar Monitoring</p>
                <p className="text-sm">Your recent readings show good control. Continue current medication and diet plan.</p>
              </div>
              <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/10">
                <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Exercise Recommendation</p>
                <p className="text-sm">30 minutes of walking daily can improve your cardiovascular health.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
