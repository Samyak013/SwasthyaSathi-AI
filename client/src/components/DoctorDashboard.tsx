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
}

export default function DoctorDashboard({
  doctorName,
  specialization,
  userId,
  onCreatePrescription,
  onViewAnalytics,
  onViewEmergency,
}: DoctorDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [messageText, setMessageText] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [newAppointment, setNewAppointment] = useState({ date: "", time: "", reason: "" });
  const [messages, setMessages] = useState<any[]>([]);

  //todo: remove mock functionality
  const stats = [
    { label: "Total Patients", value: "248", icon: Users, color: "text-blue-600" },
    { label: "Today's Consultations", value: "12", icon: Activity, color: "text-green-600" },
    { label: "Prescriptions", value: "156", icon: FileText, color: "text-purple-600" },
    { label: "Recovery Rate", value: "94%", icon: TrendingUp, color: "text-orange-600" },
  ];

  //todo: remove mock functionality
  const patients: Patient[] = [
    {
      id: "1",
      name: "Priya Sharma",
      abhaId: "22-1111-2222-3333",
      age: 32,
      gender: "Female",
      lastVisit: "2 days ago",
      conditions: ["Diabetes Type 2", "Hypertension"],
    },
    {
      id: "2",
      name: "Amit Patel",
      abhaId: "22-4444-5555-6666",
      age: 45,
      gender: "Male",
      lastVisit: "1 week ago",
      conditions: ["Asthma"],
    },
    {
      id: "3",
      name: "Sunita Reddy",
      abhaId: "22-7777-8888-9999",
      age: 28,
      gender: "Female",
      lastVisit: "3 days ago",
      conditions: [],
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
            <h1 className="text-3xl font-bold">Welcome, {doctorName}</h1>
            <p className="text-muted-foreground">{specialization}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onCreatePrescription} data-testid="button-create-prescription">
            <Plus className="w-4 h-4 mr-2" />
            New Prescription
          </Button>
          <Button variant="outline" onClick={onViewAnalytics} data-testid="button-view-analytics">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button variant="destructive" onClick={onViewEmergency} data-testid="button-view-emergency">
            <AlertCircle className="w-4 h-4 mr-2" />
            Emergency SOS
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
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
              <CardTitle>Patient Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="all" data-testid="tab-all-patients">All Patients</TabsTrigger>
                    <TabsTrigger value="recent" data-testid="tab-recent">Recent</TabsTrigger>
                    <TabsTrigger value="critical" data-testid="tab-critical">Critical</TabsTrigger>
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
                  <PatientCard
                    {...patients[0]}
                    onViewRecords={() => handleViewRecords(patients[0])}
                    onSendMessage={() => handleSendMessage(patients[0])}
                    onSchedule={() => handleSchedule(patients[0])}
                  />
                </TabsContent>
                <TabsContent value="critical" className="space-y-4">
                  <p className="text-center text-muted-foreground py-8">No critical patients at the moment</p>
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
