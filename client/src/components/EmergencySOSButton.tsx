import { useState } from "react";
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
import { AlertCircle } from "lucide-react";

interface EmergencySOSButtonProps {
  patientName: string;
  abhaId: string;
  onActivateSOS?: () => void;
}

export default function EmergencySOSButton({ patientName, abhaId, onActivateSOS }: EmergencySOSButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [activated, setActivated] = useState(false);

  const handleActivate = () => {
    setActivated(true);
    onActivateSOS?.();
    console.log("SOS ACTIVATED for:", patientName, abhaId);
    setTimeout(() => {
      setActivated(false);
      setShowDialog(false);
    }, 3000);
  };

  return (
    <>
      <Button
        variant="destructive"
        size="lg"
        onClick={() => setShowDialog(true)}
        className="font-bold"
        data-testid="button-sos"
      >
        <AlertCircle className="w-5 h-5 mr-2" />
        Emergency SOS
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent data-testid="dialog-sos">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              {activated ? "SOS Alert Sent!" : "Activate Emergency SOS?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activated ? (
                <div className="space-y-2">
                  <p className="font-semibold text-green-600">Emergency alert has been sent to nearest hospitals with your:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>ABHA Profile & Medical History</li>
                    <li>Current Location</li>
                    <li>Emergency Contact Information</li>
                    <li>Recent Vital Signs</li>
                  </ul>
                  <p className="text-sm mt-3">Help is on the way. Stay calm.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>This will immediately send your health profile, location, and vitals to the nearest registered hospitals.</p>
                  <p className="font-semibold">Use only in medical emergencies.</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!activated && (
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-sos">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleActivate} className="bg-destructive hover:bg-destructive/90" data-testid="button-confirm-sos">
                Activate SOS
              </AlertDialogAction>
            </AlertDialogFooter>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
