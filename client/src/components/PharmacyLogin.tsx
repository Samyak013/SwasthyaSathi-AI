import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Building2 } from "lucide-react";

interface PharmacyLoginProps {
  onLogin?: (userData: any) => void;
  onBack?: () => void;
}

export default function PharmacyLogin({ onLogin, onBack }: PharmacyLoginProps) {
  const [abhaId, setAbhaId] = useState("22-8888-9999-0000");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [loading, setLoading] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [email, setEmail] = useState("");
  const [currentAbhaId, setCurrentAbhaId] = useState("");
  const { toast } = useToast();

  const handleSendOTP = async () => {
    if (!abhaId) {
      toast({
        title: "Error",
        description: "Please enter an ABHA ID",
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

      if (data.user && data.user.role === "pharmacy") {
        onLogin?.(data);
      } else {
        toast({
          title: "Error",
          description: "This ABHA ID is not registered as a pharmacy. Please use your pharmacy account.",
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === "input" && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Pharmacy Login</CardTitle>
                    <CardDescription>Verify prescriptions & manage inventory</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pharmacy-abha" className="text-base">ABHA ID</Label>
                  <Input
                    id="pharmacy-abha"
                    placeholder="22-8888-9999-0000"
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Example ABHA ID: 22-8888-9999-0000
                  </p>
                </div>

                <Button
                  onClick={handleSendOTP}
                  disabled={loading || !abhaId}
                  className="w-full text-base bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  size="lg"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  We'll send a 6-digit OTP to your registered email address
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

            <Card className="border-purple-200 dark:border-purple-800">
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
                  className="w-full text-base bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
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
