import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, User, Building2 } from "lucide-react";

interface RoleSelectionProps {
  userName: string;
  abhaId: string;
  onSelectRole?: (role: "doctor" | "patient" | "pharmacy") => void;
}

export default function RoleSelection({ userName, abhaId, onSelectRole }: RoleSelectionProps) {
  const roles = [
    {
      id: "patient" as const,
      title: "Patient",
      description: "Access your health records, get AI insights, and chat with doctors",
      icon: User,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "doctor" as const,
      title: "Doctor",
      description: "Manage patients, create prescriptions, and view analytics",
      icon: Stethoscope,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "pharmacy" as const,
      title: "Pharmacy",
      description: "Verify prescriptions and manage medicine inventory",
      icon: Building2,
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome, {userName}!</h1>
        <p className="text-muted-foreground">ABHA ID: {abhaId}</p>
        <p className="text-lg">Select your role to continue</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <Card
              key={role.id}
              className="hover-elevate active-elevate-2 cursor-pointer transition-all"
              onClick={() => onSelectRole?.(role.id)}
              data-testid={`card-role-${role.id}`}
            >
              <CardHeader>
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle>{role.title}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" data-testid={`button-select-${role.id}`}>
                  Continue as {role.title}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
