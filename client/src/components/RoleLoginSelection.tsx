import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, User, Building2 } from "lucide-react";

interface RoleLoginSelectionProps {
  onSelectRole?: (role: "doctor" | "patient" | "pharmacy") => void;
}

export default function RoleLoginSelection({ onSelectRole }: RoleLoginSelectionProps) {
  const roles = [
    {
      id: "doctor" as const,
      title: "Doctor",
      description: "Manage patients, create prescriptions, and view analytics",
      icon: Stethoscope,
      color: "from-green-500 to-emerald-500",
      example: "ABHA: 22-1234-5678-9012",
    },
    {
      id: "patient" as const,
      title: "Patient",
      description: "Access your health records, get AI insights, and chat with doctors",
      icon: User,
      color: "from-blue-500 to-cyan-500",
      example: "ABHA: 22-1111-2222-3333",
    },
    {
      id: "pharmacy" as const,
      title: "Pharmacy",
      description: "Verify prescriptions and manage medicine inventory",
      icon: Building2,
      color: "from-purple-500 to-pink-500",
      example: "ABHA: 22-8888-9999-0000",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Swashtya Sathi AI
          </h1>
          <p className="text-lg text-muted-foreground">
            AI-Powered Healthcare Platform
          </p>
          <p className="text-base text-muted-foreground">
            Select your login role to get started
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.id}
                className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0"
                onClick={() => onSelectRole?.(role.id)}
              >
                <CardHeader className="space-y-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{role.title}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Example:</p>
                    <p className="text-sm font-mono font-semibold">{role.example}</p>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 dark:text-black"
                    size="lg"
                  >
                    Login as {role.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="text-center space-y-2 text-sm text-muted-foreground">
          <p>Powered by Ayushman Bharat Digital Mission</p>
          <p className="text-xs">© 2024 Swashtya Sathi AI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
