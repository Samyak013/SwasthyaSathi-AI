import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import abhaCardImage from "@assets/generated_images/ABHA_health_card_mockup_2960ffc1.png";

interface ABHALoginProps {
  onLogin?: (abhaId: string, method: string) => void;
}

export default function ABHALogin({ onLogin }: ABHALoginProps) {
  const [abhaId, setAbhaId] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "otp">("input");

  const handleAbhaLogin = () => {
    if (abhaId) {
      setStep("otp");
      console.log("ABHA login initiated:", abhaId);
    }
  };

  const handleAadhaarLogin = () => {
    if (aadhaar) {
      setStep("otp");
      console.log("Aadhaar login initiated:", aadhaar);
    }
  };

  const handleVerifyOtp = () => {
    if (otp) {
      onLogin?.(abhaId || aadhaar, step);
      console.log("OTP verified:", otp);
    }
  };

  if (step === "otp") {
    return (
      <Card className="w-full max-w-md" data-testid="card-otp-verification">
        <CardHeader>
          <CardTitle>Verify OTP</CardTitle>
          <CardDescription>Enter the OTP sent to your registered mobile number</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">6-Digit OTP</Label>
            <Input
              id="otp"
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              data-testid="input-otp"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleVerifyOtp} className="flex-1" data-testid="button-verify-otp">
              Verify & Login
            </Button>
            <Button variant="outline" onClick={() => setStep("input")} data-testid="button-back">
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Swashtya Sathi AI</h1>
        <p className="text-muted-foreground">AI-Powered Healthcare Platform</p>
      </div>

      <Card data-testid="card-abha-login">
        <CardHeader>
          <CardTitle>Login with ABHA</CardTitle>
          <CardDescription>Securely access your health records</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="abha" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="abha" data-testid="tab-abha">ABHA ID</TabsTrigger>
              <TabsTrigger value="aadhaar" data-testid="tab-aadhaar">Aadhaar</TabsTrigger>
            </TabsList>
            <TabsContent value="abha" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="abha-id">ABHA ID or ABHA Address</Label>
                <Input
                  id="abha-id"
                  placeholder="yourname@abdm or 22-1234-5678-9012"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  data-testid="input-abha-id"
                />
              </div>
              <Button onClick={handleAbhaLogin} className="w-full" data-testid="button-login-abha">
                Send OTP
              </Button>
            </TabsContent>
            <TabsContent value="aadhaar" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aadhaar">Aadhaar Number</Label>
                <Input
                  id="aadhaar"
                  type="text"
                  maxLength={12}
                  placeholder="XXXX XXXX XXXX"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  data-testid="input-aadhaar"
                />
              </div>
              <Button onClick={handleAadhaarLogin} className="w-full" data-testid="button-login-aadhaar">
                Send OTP
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">What is ABHA?</span>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <img src={abhaCardImage} alt="ABHA Card" className="w-full rounded-lg mb-3" />
          <p className="text-sm text-muted-foreground">
            ABHA (Ayushman Bharat Health Account) is India's digital health ID that enables secure access to your medical records across all healthcare providers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
