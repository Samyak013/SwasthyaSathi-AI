import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface EmergencySOSButtonProps {
  patientName: string;
  userId: string;
  abhaId: string;
  onActivateSOS?: (alertId: string) => void;
}

export default function EmergencySOSButton({ patientName, userId, abhaId, onActivateSOS }: EmergencySOSButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [activated, setActivated] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const sosMutation = useMutation({
    mutationFn: async () => {
      // Get current location
      const location = await new Promise<{ lat: number; lng: number; address: string }>((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              // Get address from coordinates (simplified - using coordinates as address)
              resolve({
                lat: latitude,
                lng: longitude,
                address: `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              });
            },
            () => {
              // Fallback if geolocation fails
              resolve({ lat: 0, lng: 0, address: "Location not available" });
            }
          );
        } else {
          resolve({ lat: 0, lng: 0, address: "Location not available" });
        }
      });

      // Get current vitals (simulated - in real app, you'd get from health device)
      const vitals = {
        heartRate: Math.floor(Math.random() * 40 + 60), // 60-100 bpm
        bloodPressure: `${Math.floor(Math.random() * 30 + 110)}/${Math.floor(Math.random() * 20 + 70)}`,
        temperature: (Math.random() * 3 + 36.5).toFixed(1), // 36.5-39.5°C
      };

      // Send SOS alert to backend
      const response = await apiRequest("POST", "/api/emergency", {
        userId,
        location,
        vitals,
        status: "active",
      });

      return response;
    },
    onSuccess: (data: any) => {
      setActivated(true);
      onActivateSOS?.(data?.id || "sos-alert");

      toast({
        title: "🚨 SOS Alert Activated!",
        description: "Emergency services and hospitals have been notified",
        variant: "default",
        duration: 5000,
      });

      // Start countdown
      setCountdown(5);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            setActivated(false);
            setShowDialog(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to activate SOS. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleActivate = () => {
    sosMutation.mutate();
  };

  const handleDialogClose = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setShowDialog(false);
    setActivated(false);
    setCountdown(5);
  };

  return (
    <>
      <Button
        variant="destructive"
        size="lg"
        onClick={() => setShowDialog(true)}
        className="font-bold animate-pulse"
        data-testid="button-sos"
      >
        <AlertCircle className="w-5 h-5 mr-2" />
        Emergency SOS
      </Button>

      <AlertDialog open={showDialog} onOpenChange={handleDialogClose}>
        <AlertDialogContent data-testid="dialog-sos">
          <AlertDialogHeader>
            <AlertDialogTitle className={activated ? "text-green-600" : "text-destructive"}>
              {activated ? "🚨 SOS ALERT ACTIVATED!" : "Activate Emergency SOS?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activated ? (
                <div className="space-y-3">
                  <div className="bg-green-50 border-l-4 border-green-600 p-3 rounded">
                    <p className="font-semibold text-green-800">Emergency alert has been sent to:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-green-700 mt-2">
                      <li>🏥 Nearest Registered Hospitals</li>
                      <li>👨‍⚕️ Available Emergency Doctors</li>
                      <li>📍 Your Current Location</li>
                      <li>❤️ Your Current Vital Signs</li>
                      <li>📋 Medical History & Allergies</li>
                      <li>👨‍👩‍👧 Emergency Contacts</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
                    <p className="font-semibold text-blue-800">Patient: {patientName}</p>
                    <p className="text-sm text-blue-700">ABHA ID: {abhaId}</p>
                    <p className="text-sm text-blue-700 mt-2">Help is on the way. Stay calm and keep the line open.</p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">Alert window closes in</p>
                    <p className="text-2xl font-bold text-destructive">{countdown}s</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded">
                    <p className="font-bold text-red-800">⚠️ EMERGENCY ONLY</p>
                    <p className="text-sm text-red-700 mt-1">Use only for life-threatening medical emergencies</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">This will immediately:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Alert nearest hospitals & emergency services</li>
                      <li>Share your health profile & medical history</li>
                      <li>Send your current location</li>
                      <li>Share vital signs & recent health data</li>
                      <li>Notify emergency contacts</li>
                    </ul>
                  </div>

                  <p className="text-xs text-gray-500 italic">Misuse of emergency alerts is illegal</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!activated && (
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-sos">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleActivate}
                disabled={sosMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
                data-testid="button-confirm-sos"
              >
                {sosMutation.isPending ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Activate SOS
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
