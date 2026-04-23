import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, User, Users } from "lucide-react";

interface PatientLoginProps {
  onLogin?: (userData: any) => void;
  onBack?: () => void;
}

const PATIENT_OPTIONS = [
  {
    name: "Priya Sharma",
    abhaId: "22-1111-2222-3333",
    icon: "👩‍⚕️",
  },
  {
    name: "Amit Patel",
    abhaId: "22-4444-5555-6666",
    icon: "👨‍⚕️",
  },
];

export default function PatientLogin({ onLogin, onBack }: PatientLoginProps) {
  const [abhaId, setAbhaId] = useState("22-1111-2222-3333");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"select" | "input" | "otp">("select");
  const [loading, setLoading] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [email, setEmail] = useState("");
  const [currentAbhaId, setCurrentAbhaId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSelectPatient = (patientAbhaId: string, patientName: string) => {
    setSelectedPatient(patientName);
    setAbhaId(patientAbhaId);
    setCurrentAbhaId(patientAbhaId);
    setStep("input");
  };

  const handleSendOTP = async () => {
    if (!abhaId) {
      toast({
        title: "Error",
        description: "Please select an ABHA ID",
        variant: "destructive",
      });
      return;
    }

    setCurrentAbhaId(abhaId);
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/send-otp", {
        abhaId,
      });
      const data = await response.json();

      setEmail(data.email || "");
      setMaskedEmail(data.maskedEmail || "****");
      setStep("otp");

      toast({
        title: "OTP Sent! ✅",
        description: `Check your email at ${data.maskedEmail}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/verify-otp", {
        abhaId: currentAbhaId,
        email,
        otp,
      });

      const data = await response.json();

      if (data.user && data.user.role === "patient") {
        onLogin?.(data);
      } else {
        toast({
          title: "Error",
          description: "This ABHA ID is not registered as a patient. Please use your patient account.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === "select" && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Select Patient</CardTitle>
                    <CardDescription>Choose your account to continue</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {PATIENT_OPTIONS.map((patient) => (
                  <Button
                    key={patient.abhaId}
                    onClick={() => handleSelectPatient(patient.abhaId, patient.name)}
                    variant="outline"
                    className="w-full h-auto p-4 flex items-center justify-between hover:bg-blue-50 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-3xl">{patient.icon}</span>
                      <div className="text-left">
                        <p className="font-semibold text-base">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">{patient.abhaId}</p>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Button>
                ))}

                <div className="mt-6 pt-4 border-t">
                  <Label className="text-xs text-muted-foreground">Or enter ABHA ID manually:</Label>
                  <Input
                    placeholder="22-XXXX-XXXX-XXXX"
                    className="mt-2 text-sm"
                    onChange={(e) => setAbhaId(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      if (abhaId && !PATIENT_OPTIONS.some(p => p.abhaId === abhaId)) {
                        setStep("input");
                      }
                    }}
                    disabled={!abhaId || PATIENT_OPTIONS.some(p => p.abhaId === abhaId)}
                    variant="secondary"
                    className="w-full mt-2"
                    size="sm"
                  >
                    Continue with custom ABHA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "input" && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => {
                setStep("select");
                setAbhaId("22-1111-2222-3333");
                setSelectedPatient(null);
              }}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Patient Login</CardTitle>
                    {selectedPatient && (
                      <CardDescription>{selectedPatient}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                  <p className="text-sm font-medium">ABHA ID</p>
                  <p className="text-lg font-mono font-bold">{abhaId}</p>
                </div>

                <Button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full text-base bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  size="lg"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  We'll send a 6-digit OTP to samyak@acpce.ac.in
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setStep("input")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-2xl">Verify OTP</CardTitle>
                <CardDescription>
                  We sent an OTP to <br />
                  <span className="font-semibold text-foreground">{maskedEmail}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-base">Enter 6-Digit OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="text-center text-3xl letter-spacing tracking-widest font-mono"
                  />
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full text-base bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  size="lg"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  OTP valid for 5 minutes
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
