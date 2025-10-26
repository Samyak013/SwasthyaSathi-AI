import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import abhaCardImage from "@assets/generated_images/ABHA_health_card_mockup_2960ffc1.png";

interface ABHALoginProps {
  onLogin?: (userData: any) => void;
}

export default function ABHALogin({ onLogin }: ABHALoginProps) {
  const [abhaId, setAbhaId] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAbhaLogin = async () => {
    if (!abhaId) return;
    
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/send-otp", { abhaId });
      const data = await response.json();
      
      setStep("otp");
      toast({
        title: "OTP Sent",
        description: data.message || "A 6-digit OTP has been sent to your registered mobile number. Check server console for OTP.",
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

  const handleAadhaarLogin = async () => {
    if (!aadhaar) return;
    
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/send-otp", { abhaId: aadhaar });
      const data = await response.json();
      
      setStep("otp");
      toast({
        title: "OTP Sent",
        description: data.message || "A 6-digit OTP has been sent to your registered mobile number. Check server console for OTP.",
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
        abhaId: abhaId || aadhaar,
        otp,
      });

      const data = await response.json();
      
      toast({
        title: "Login Successful",
        description: `Welcome, ${data.user.name}!`,
      });

      onLogin?.(data);
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              Check the server console logs for the OTP
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleVerifyOtp} 
              className="flex-1" 
              data-testid="button-verify-otp"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setStep("input")} 
              data-testid="button-back"
              disabled={loading}
            >
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
                <Label htmlFor="abha-id">ABHA ID</Label>
                <Input
                  id="abha-id"
                  placeholder="22-1234-5678-9012"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  data-testid="input-abha-id"
                />
                <p className="text-sm text-muted-foreground">
                  Demo IDs: 22-1234-5678-9012 (Doctor) | 22-1111-2222-3333 (Patient)
                </p>
              </div>
              <Button 
                onClick={handleAbhaLogin} 
                className="w-full" 
                data-testid="button-login-abha"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
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
              <Button 
                onClick={handleAadhaarLogin} 
                className="w-full" 
                data-testid="button-login-aadhaar"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="text-center">
        <img src={abhaCardImage} alt="ABHA Card" className="mx-auto w-64 rounded-lg shadow-md" />
        <p className="text-sm text-muted-foreground mt-4">
          Powered by Ayushman Bharat Digital Mission
        </p>
      </div>
    </div>
  );
}
