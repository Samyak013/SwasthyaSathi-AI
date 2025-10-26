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

interface PatientDashboardProps {
  patientName: string;
  abhaId: string;
  age: number;
  gender: string;
}

export default function PatientDashboard({ patientName, abhaId, age, gender }: PatientDashboardProps) {
  //todo: remove mock functionality
  const healthRecords = [
    {
      id: "1",
      type: "prescription" as const,
      title: "General Checkup Prescription",
      date: "Jan 24, 2025",
      doctor: "Dr. Rajesh Kumar",
      summary: "Prescribed Paracetamol and Azithromycin for fever and infection",
      aiInsight: "Monitor temperature for next 3 days. Ensure complete antibiotic course.",
    },
    {
      id: "2",
      type: "lab_report" as const,
      title: "Complete Blood Count (CBC)",
      date: "Jan 20, 2025",
      doctor: "Dr. Priya Mehta",
      summary: "Hemoglobin: 13.2 g/dL, WBC: 8,500/µL, Platelets: 250,000/µL",
      aiInsight: "All values within normal range. Hemoglobin slightly low, consider iron-rich diet.",
    },
  ];

  //todo: remove mock functionality
  const upcomingReminders = [
    { id: "1", type: "medicine", message: "Take Paracetamol 500mg", time: "2:00 PM" },
    { id: "2", type: "appointment", message: "Follow-up with Dr. Kumar", time: "Tomorrow, 10:00 AM" },
    { id: "3", type: "medicine", message: "Take Azithromycin 250mg", time: "8:00 PM" },
  ];

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
              <HealthRecordTimeline
                records={healthRecords}
                onDownload={(id) => console.log("Download:", id)}
                onViewDetails={(id) => console.log("View details:", id)}
              />
            </TabsContent>
            <TabsContent value="prescriptions" className="mt-6 space-y-4">
              <PrescriptionCard
                id="1"
                doctorName="Dr. Rajesh Kumar"
                doctorSpecialization="General Physician"
                patientName={patientName}
                date="Jan 24, 2025"
                prescriptionId="RX-2025-001234"
                status="verified"
                medicines={[
                  { name: "Paracetamol 500mg", dosage: "1 tablet", frequency: "3 times/day", duration: "5 days" },
                  { name: "Azithromycin 250mg", dosage: "1 tablet", frequency: "Once/day", duration: "3 days" },
                ]}
                onDownload={() => console.log("Download")}
                onShare={() => console.log("Share")}
                onViewQR={() => console.log("View QR")}
              />
            </TabsContent>
            <TabsContent value="chat" className="mt-6">
              <AIChatbot onSendMessage={(msg, lang) => console.log("Message:", msg, lang)} />
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
              {upcomingReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-3 rounded-lg bg-muted/50 hover-elevate"
                  data-testid={`reminder-${reminder.id}`}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{reminder.message}</p>
                      <p className="text-xs text-muted-foreground">{reminder.time}</p>
                    </div>
                  </div>
                </div>
              ))}
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
