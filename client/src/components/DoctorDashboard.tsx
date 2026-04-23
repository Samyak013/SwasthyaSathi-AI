import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Plus, TrendingUp, Users, FileText, Activity, X, Calendar, MessageSquare, Clock, AlertCircle, MapPin } from "lucide-react";
import PatientCard from "./PatientCard";
import AIChatbot from "./AIChatbot";
import NearbyFacilitiesMap from "./NearbyFacilitiesMap";
import doctorAvatar from "@assets/generated_images/Indian_male_doctor_portrait_31c5b0e1.png";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/context/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DoctorDashboardProps {
  doctorName: string;
  specialization: string;
  userId?: string;
  onCreatePrescription?: () => void;
  onViewAnalytics?: () => void;
  onViewEmergency?: () => void;
}

interface Patient {
  id: string;
  name: string;
  abhaId: string;
  age: number;
  gender: string;
  lastVisit: string;
  conditions: string[];
  status?: "critical" | "normal";
}

export default function DoctorDashboard({
  doctorName,
  specialization,
  userId,
  onCreatePrescription,
  onViewAnalytics,
  onViewEmergency,
}: DoctorDashboardProps) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [messageText, setMessageText] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [newAppointment, setNewAppointment] = useState({ date: "", time: "", reason: "" });
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("April 2026");

  // Month-wise critical patients data
  const criticalPatientsByMonth: Record<string, Patient[]> = {
    "April 2026": [
      {
        id: "c1",
        name: "Rajesh Verma",
        abhaId: "22-9999-1111-2222",
        age: 58,
        gender: "Male",
        lastVisit: "Today",
        conditions: ["Severe Hypertension", "Heart Disease"],
        status: "critical",
      },
      {
        id: "c2",
        name: "Neha Gupta",
        abhaId: "22-5555-6666-7777",
        age: 42,
        gender: "Female",
        lastVisit: "Today",
        conditions: ["Acute Asthma", "Respiratory Issues"],
        status: "critical",
      },
    ],
    "March 2026": [
      {
        id: "c3",
        name: "Arjun Singh",
        abhaId: "22-2222-3333-4444",
        age: 52,
        gender: "Male",
        lastVisit: "1 day ago",
        conditions: ["Diabetes Crisis", "Kidney Issues"],
        status: "critical",
      },
    ],
    "February 2026": [
      {
        id: "c4",
        name: "Kavya Nair",
        abhaId: "22-3333-4444-5555",
        age: 38,
        gender: "Female",
        lastVisit: "2 days ago",
        conditions: ["Pneumonia", "High Fever"],
        status: "critical",
      },
    ],
    "January 2026": [
      {
        id: "c5",
        name: "Vikram Rao",
        abhaId: "22-6666-7777-8888",
        age: 65,
        gender: "Male",
        lastVisit: "3 days ago",
        conditions: ["Stroke Recovery", "Paralysis"],
        status: "critical",
      },
    ],
    "December 2025": [
      {
        id: "c6",
        name: "Anjali Reddy",
        abhaId: "22-4444-5555-7777",
        age: 48,
        gender: "Female",
        lastVisit: "1 week ago",
        conditions: ["Sepsis", "Organ Failure Risk"],
        status: "critical",
      },
    ],
  };

  const stats = [
    { labelKey: "doctor.totalPatients", value: "248", icon: Users, color: "text-blue-600" },
    { labelKey: "doctor.todayConsultations", value: "12", icon: Activity, color: "text-green-600" },
    { labelKey: "doctor.prescriptions", value: "156", icon: FileText, color: "text-purple-600" },
    { labelKey: "doctor.recoveryRate", value: "94%", icon: TrendingUp, color: "text-orange-600" },
  ];

  // Extended patient list with more Indian names
  const patients: Patient[] = [
    {
      id: "1",
      name: "Priya Sharma",
      abhaId: "22-1111-2222-3333",
      age: 32,
      gender: "Female",
      lastVisit: "2 days ago",
      conditions: ["Diabetes Type 2", "Hypertension"],
      status: "normal",
    },
    {
      id: "2",
      name: "Amit Patel",
      abhaId: "22-4444-5555-6666",
      age: 45,
      gender: "Male",
      lastVisit: "1 week ago",
      conditions: ["Asthma"],
      status: "normal",
    },
    {
      id: "3",
      name: "Sunita Reddy",
      abhaId: "22-7777-8888-9999",
      age: 28,
      gender: "Female",
      lastVisit: "3 days ago",
      conditions: [],
      status: "normal",
    },
    {
      id: "4",
      name: "Rohit Kumar",
      abhaId: "22-1234-5678-9101",
      age: 35,
      gender: "Male",
      lastVisit: "1 day ago",
      conditions: ["Migraine", "Stress"],
      status: "normal",
    },
    {
      id: "5",
      name: "Divya Mishra",
      abhaId: "22-1112-1314-1516",
      age: 29,
      gender: "Female",
      lastVisit: "3 days ago",
      conditions: ["PCOD"],
      status: "normal",
    },
    {
      id: "6",
      name: "Sanjay Desai",
      abhaId: "22-1718-1920-2122",
      age: 55,
      gender: "Male",
      lastVisit: "5 days ago",
      conditions: ["High Cholesterol", "Obesity"],
      status: "normal",
    },
    {
      id: "7",
      name: "Meera Iyer",
      abhaId: "22-2324-2526-2728",
      age: 41,
      gender: "Female",
      lastVisit: "1 week ago",
      conditions: ["Thyroid"],
      status: "normal",
    },
    {
      id: "8",
      name: "Vivek Agarwal",
      abhaId: "22-2930-3132-3334",
      age: 38,
      gender: "Male",
      lastVisit: "4 days ago",
      conditions: ["Gastritis", "Acidity"],
      status: "normal",
    },
    {
      id: "9",
      name: "Shreya Bhat",
      abhaId: "22-3536-3738-3940",
      age: 26,
      gender: "Female",
      lastVisit: "2 days ago",
      conditions: [],
      status: "normal",
    },
    {
      id: "10",
      name: "Harsh Joshi",
      abhaId: "22-4142-4344-4546",
      age: 47,
      gender: "Male",
      lastVisit: "6 days ago",
      conditions: ["Arthritis", "Joint Pain"],
      status: "normal",
    },
  ];

  const handleViewRecords = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleSendMessage = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleSchedule = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const sendMessage = () => {
    if (!messageText.trim()) return;
    setMessages([
      ...messages,
      {
        id: Date.now(),
        sender: "doctor",
        text: messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setMessageText("");
  };

  const scheduleAppointment = () => {
    if (!newAppointment.date || !newAppointment.time) return;
    setAppointments([
      ...appointments,
      {
        id: Date.now(),
        date: newAppointment.date,
        time: newAppointment.time,
        reason: newAppointment.reason,
        status: "scheduled",
      },
    ]);
    setNewAppointment({ date: "", time: "", reason: "" });
  };
    
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={doctorAvatar} alt={doctorName} className="w-16 h-16 rounded-full object-cover" />
          <div>
            <h1 className="text-3xl font-bold">{t("doctor.welcome")}, {doctorName}</h1>
            <p className="text-muted-foreground">{specialization}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onCreatePrescription} data-testid="button-create-prescription">
            <Plus className="w-4 h-4 mr-2" />
            {t("doctor.createPrescription")}
          </Button>
          <Button variant="outline" onClick={onViewAnalytics} data-testid="button-view-analytics">
            <TrendingUp className="w-4 h-4 mr-2" />
            {t("doctor.analyticsDashboard")}
          </Button>
          <Button variant="destructive" onClick={onViewEmergency} data-testid="button-view-emergency">
            <AlertCircle className="w-4 h-4 mr-2" />
            {t("doctor.emergencySos")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.labelKey} data-testid={`stat-${stat.labelKey.toLowerCase().replace(/\s+/g, "-")}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t(stat.labelKey)}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("doctor.patientManagement")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="all" data-testid="tab-all-patients">{t("doctor.allPatients")}</TabsTrigger>
                    <TabsTrigger value="recent" data-testid="tab-recent">{t("doctor.recent")}</TabsTrigger>
                    <TabsTrigger value="critical" data-testid="tab-critical">{t("doctor.critical")}</TabsTrigger>
                  </TabsList>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, ABHA ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-patients"
                    />
                  </div>
                </div>
                <TabsContent value="all" className="space-y-4">
                  {patients.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      {...patient}
                      onViewRecords={() => handleViewRecords(patient)}
                      onSendMessage={() => handleSendMessage(patient)}
                      onSchedule={() => handleSchedule(patient)}
                    />
                  ))}
                </TabsContent>
                <TabsContent value="recent" className="space-y-4">
                  {patients.slice(0, 3).map((patient) => (
                    <PatientCard
                      key={patient.id}
                      {...patient}
                      onViewRecords={() => handleViewRecords(patient)}
                      onSendMessage={() => handleSendMessage(patient)}
                      onSchedule={() => handleSchedule(patient)}
                    />
                  ))}
                </TabsContent>
                <TabsContent value="critical" className="space-y-4">
                  <div className="mb-4">
                    <Label className="text-base font-semibold mb-2 block">{t("doctor.selectMonth")}</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="April 2026">April 2026</SelectItem>
                        <SelectItem value="March 2026">March 2026</SelectItem>
                        <SelectItem value="February 2026">February 2026</SelectItem>
                        <SelectItem value="January 2026">January 2026</SelectItem>
                        <SelectItem value="December 2025">December 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {criticalPatientsByMonth[selectedMonth] && criticalPatientsByMonth[selectedMonth].length > 0 ? (
                    <div className="space-y-3">
                      {criticalPatientsByMonth[selectedMonth].map((patient) => (
                        <Card key={patient.id} className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="destructive">Critical</Badge>
                                  <span className="text-sm font-semibold text-red-700 dark:text-red-300">{patient.lastVisit}</span>
                                </div>
                                <h3 className="font-semibold">{patient.name}</h3>
                                <p className="text-sm text-muted-foreground">ABHA: {patient.abhaId}</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                  {t("doctor.patientName")}: {patient.age} {patient.gender}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {patient.conditions.map((cond, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {cond}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleViewRecords(patient)}
                              >
                                {t("doctor.viewRecords")}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">{t("doctor.noCriticalPatients")}</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Selected Patient Details */}
        {selectedPatient && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedPatient.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">ABHA: {selectedPatient.abhaId}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPatient(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <Tabs defaultValue="records" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="records" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    Records
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Message
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    Schedule
                  </TabsTrigger>
                  <TabsTrigger value="facilities" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    Facilities
                  </TabsTrigger>
                </TabsList>

                {/* Records Tab */}
                <TabsContent value="records" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Medical Conditions</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.conditions.length > 0 ? (
                        selectedPatient.conditions.map((c, i) => (
                          <Badge key={i} variant="secondary">{c}</Badge>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">No conditions recorded</p>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-semibold mb-2">Recent Records</p>
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Last visit: {selectedPatient.lastVisit}
                      </AlertDescription>
                    </Alert>
                  </div>
                </TabsContent>

                {/* Messages Tab */}
                <TabsContent value="messages" className="space-y-3 mt-4">
                  <div className="space-y-3 h-48 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                    {messages.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6">No messages yet</p>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className="flex justify-end">
                          <div className="bg-primary text-primary-foreground text-xs p-2 rounded max-w-xs">
                            <p>{msg.text}</p>
                            <p className="text-xs opacity-70">{msg.timestamp}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="min-h-20 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) sendMessage();
                      }}
                    />
                    <Button onClick={sendMessage} className="self-end">
                      Send
                    </Button>
                  </div>
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule" className="space-y-3 mt-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Date</Label>
                        <input
                          type="date"
                          aria-label="Appointment Date"
                          value={newAppointment.date}
                          onChange={(e) =>
                            setNewAppointment({ ...newAppointment, date: e.target.value })
                          }
                          className="w-full text-sm px-2 py-1 border rounded"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Time</Label>
                        <input
                          type="time"
                          aria-label="Appointment Time"
                          value={newAppointment.time}
                          onChange={(e) =>
                            setNewAppointment({ ...newAppointment, time: e.target.value })
                          }
                          className="w-full text-sm px-2 py-1 border rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Reason</Label>
                      <input
                        type="text"
                        placeholder="Consultation reason"
                        value={newAppointment.reason}
                        onChange={(e) =>
                          setNewAppointment({ ...newAppointment, reason: e.target.value })
                        }
                        className="w-full text-sm px-2 py-1 border rounded"
                      />
                    </div>
                    <Button onClick={scheduleAppointment} className="w-full text-sm">
                      Schedule Appointment
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-semibold mb-2">Scheduled Appointments</p>
                    {appointments.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No appointments scheduled</p>
                    ) : (
                      <div className="space-y-2">
                        {appointments.map((apt) => (
                          <div key={apt.id} className="text-xs border rounded p-2 bg-muted/50">
                            <p className="font-semibold">{apt.date} at {apt.time}</p>
                            <p className="text-muted-foreground">{apt.reason}</p>
                            <Badge className="mt-1" variant="outline">{apt.status}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="facilities" className="mt-4">
                  <NearbyFacilitiesMap />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Assistant Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            AI Health Assistant
          </CardTitle>
          <p className="text-sm text-muted-foreground">Get AI-powered insights and support for patient care</p>
        </CardHeader>
        <CardContent>
          {userId ? (
            <AIChatbot userId={userId} />
          ) : (
            <p className="text-center py-8 text-muted-foreground">Sign in to use AI assistant features</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
