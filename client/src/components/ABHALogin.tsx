import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import abhaCardImage from "@assets/generated_images/ABHA_health_card_mockup_2960ffc1.png";
import { Mail, Phone } from "lucide-react";

interface ABHALoginProps {
  onLogin?: (userData: any) => void;
}

export default function ABHALogin({ onLogin }: ABHALoginProps) {
  const [abhaId, setAbhaId] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "channel" | "otp">("input");
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState<"email" | "sms" | "both">("email");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentAbhaId, setCurrentAbhaId] = useState("");
  const { toast } = useToast();

  const handleAbhaInitiate = async () => {
    if (!abhaId) {
      toast({
        title: "Error",
        description: "Please enter an ABHA ID",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentAbhaId(abhaId);
    setStep("channel");
  };

  const handleAadhaarInitiate = async () => {
    if (!aadhaar) {
      toast({
        title: "Error",
        description: "Please enter an Aadhaar number",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentAbhaId(aadhaar);
    setStep("channel");
  };

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/send-otp", {
        abhaId: currentAbhaId,
        channel: channel,
      });
      const data = await response.json();
      
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setMaskedEmail(data.maskedEmail || "****");
      setMaskedPhone(data.maskedPhone || "****");
      setStep("otp");
      
      toast({
        title: "OTP Sent Successfully! ✅",
        description: `OTP sent via ${channel}. In DEV mode, check server console or browser console for OTP.`,
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
        phone,
        otp,
      });

      const data = await response.json();
      
      toast({
        title: "Login Successful! 🎉",
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

  // Step 1: Initial ABHA/Aadhaar Selection
  if (step === "input") {
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
                    👨‍⚕️ Doctor: 22-1234-5678-9012 | 👨‍🏫 Patient: 22-1111-2222-3333 | 💊 Pharmacy: 22-8888-9999-0000
                  </p>
                </div>
                <Button 
                  onClick={handleAbhaInitiate} 
                  className="w-full" 
                  data-testid="button-login-abha"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Continue →"}
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
                  onClick={handleAadhaarInitiate} 
                  className="w-full" 
                  data-testid="button-login-aadhaar"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Continue →"}
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

  // Step 2: OTP Channel Selection
  if (step === "channel") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>How should we send your OTP?</CardTitle>
          <CardDescription>Select your preferred contact method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={channel} onValueChange={(val) => setChannel(val as "email" | "sms" | "both")}>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="email" id="email" />
              <Label htmlFor="email" className="flex-1 cursor-pointer flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Via Email</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="sms" id="sms" />
              <Label htmlFor="sms" className="flex-1 cursor-pointer flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>Via SMS</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both" className="flex-1 cursor-pointer flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <Phone className="w-4 h-4" />
                <span>Both Email & SMS</span>
              </Label>
            </div>
          </RadioGroup>

          <p className="text-sm text-muted-foreground">
            💡 In development mode, the OTP will be displayed in the server console
          </p>

          <div className="flex gap-2">
            <Button 
              onClick={handleSendOTP} 
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setStep("input");
                setAbhaId("");
                setAadhaar("");
              }}
              disabled={loading}
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 3: OTP Verification
  if (step === "otp") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify OTP</CardTitle>
          <CardDescription>Enter the 6-digit OTP sent to you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
            {channel === "email" && (
              <p>📧 OTP sent to: <strong>{maskedEmail}</strong></p>
            )}
            {channel === "sms" && (
              <p>📱 OTP sent to: <strong>{maskedPhone}</strong></p>
            )}
            {channel === "both" && (
              <>
                <p>📧 Email: <strong>{maskedEmail}</strong></p>
                <p>📱 SMS: <strong>{maskedPhone}</strong></p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp">6-Digit OTP</Label>
            <Input
              id="otp"
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              data-testid="input-otp"
              disabled={loading}
              className="text-center text-2xl tracking-widest font-bold"
            />
            <p className="text-sm text-muted-foreground">
              ⚠️ DEV MODE: Check the server console or browser console (F12) for the OTP
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleVerifyOtp} 
              className="flex-1" 
              data-testid="button-verify-otp"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setStep("channel")}
              disabled={loading}
            >
              Back
            </Button>
          </div>

          <Button 
            variant="ghost"
            className="w-full"
            onClick={() => {
              setOtp("");
              handleSendOTP();
            }}
            disabled={loading}
          >
            Resend OTP
          </Button>
        </CardContent>
      </Card>
    );
  }
}
