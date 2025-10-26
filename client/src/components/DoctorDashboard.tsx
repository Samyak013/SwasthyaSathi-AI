import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, TrendingUp, Users, FileText, Activity } from "lucide-react";
import PatientCard from "./PatientCard";
import doctorAvatar from "@assets/generated_images/Indian_male_doctor_portrait_31c5b0e1.png";

interface DoctorDashboardProps {
  doctorName: string;
  specialization: string;
  onCreatePrescription?: () => void;
  onViewAnalytics?: () => void;
}

export default function DoctorDashboard({
  doctorName,
  specialization,
  onCreatePrescription,
  onViewAnalytics,
}: DoctorDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");

  //todo: remove mock functionality
  const stats = [
    { label: "Total Patients", value: "248", icon: Users, color: "text-blue-600" },
    { label: "Today's Consultations", value: "12", icon: Activity, color: "text-green-600" },
    { label: "Prescriptions", value: "156", icon: FileText, color: "text-purple-600" },
    { label: "Recovery Rate", value: "94%", icon: TrendingUp, color: "text-orange-600" },
  ];

  //todo: remove mock functionality
  const patients = [
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
                  onViewRecords={() => console.log("View records:", patient.id)}
                  onSendMessage={() => console.log("Send message:", patient.id)}
                  onSchedule={() => console.log("Schedule:", patient.id)}
                />
              ))}
            </TabsContent>
            <TabsContent value="recent" className="space-y-4">
              <PatientCard
                {...patients[0]}
                onViewRecords={() => console.log("View records")}
                onSendMessage={() => console.log("Send message")}
                onSchedule={() => console.log("Schedule")}
              />
            </TabsContent>
            <TabsContent value="critical" className="space-y-4">
              <p className="text-center text-muted-foreground py-8">No critical patients at the moment</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
