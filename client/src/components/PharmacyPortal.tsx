import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QrCode, Check, X, Package } from "lucide-react";

interface PharmacyPortalProps {
  pharmacyName: string;
  location: string;
}

export default function PharmacyPortal({ pharmacyName, location }: PharmacyPortalProps) {
  const [prescriptionId, setPrescriptionId] = useState("");
  const [verifiedPrescription, setVerifiedPrescription] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "verified" | "invalid">("idle");

  const handleVerify = () => {
    //todo: remove mock functionality
    if (prescriptionId) {
      setStatus("verified");
      setVerifiedPrescription({
        id: prescriptionId,
        doctor: "Dr. Rajesh Kumar",
        patient: "Priya Sharma",
        date: "Jan 24, 2025",
        medicines: [
          { name: "Paracetamol 500mg", dosage: "1 tablet", frequency: "3 times/day", duration: "5 days", inStock: true },
          { name: "Azithromycin 250mg", dosage: "1 tablet", frequency: "Once/day", duration: "3 days", inStock: true },
        ],
      });
      console.log("Verified prescription:", prescriptionId);
    }
  };

  const handleDispense = () => {
    console.log("Prescription dispensed:", prescriptionId);
    setStatus("idle");
    setPrescriptionId("");
    setVerifiedPrescription(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{pharmacyName}</h1>
          <p className="text-muted-foreground">{location}</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Package className="w-5 h-5 mr-2" />
          Pharmacy Portal
        </Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Verify Prescription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-8 border-2 border-dashed rounded-lg hover-elevate active-elevate-2 cursor-pointer">
              <QrCode className="w-16 h-16 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">Scan QR Code</p>
              <p className="text-xs text-muted-foreground mt-1">Or enter prescription ID manually</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Enter Prescription ID (e.g., RX-2025-001234)"
                value={prescriptionId}
                onChange={(e) => setPrescriptionId(e.target.value)}
                data-testid="input-prescription-id"
              />
              <Button onClick={handleVerify} className="w-full" data-testid="button-verify">
                <Check className="w-4 h-4 mr-2" />
                Verify Prescription
              </Button>
            </div>

            {status === "verified" && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">Prescription Verified</span>
                </div>
              </div>
            )}

            {status === "invalid" && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-destructive">
                  <X className="w-5 h-5" />
                  <span className="font-semibold">Invalid Prescription</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {verifiedPrescription && (
          <Card>
            <CardHeader>
              <CardTitle>Prescription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Doctor</p>
                  <p className="font-medium">{verifiedPrescription.doctor}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Patient</p>
                  <p className="font-medium">{verifiedPrescription.patient}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{verifiedPrescription.date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Prescription ID</p>
                  <p className="font-medium">{verifiedPrescription.id}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="font-semibold">Medicines to Dispense</p>
                {verifiedPrescription.medicines.map((medicine: any, idx: number) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{medicine.name}</p>
                      <Badge variant={medicine.inStock ? "default" : "destructive"}>
                        {medicine.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>Dosage: {medicine.dosage}</div>
                      <div>Frequency: {medicine.frequency}</div>
                      <div>Duration: {medicine.duration}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleDispense} className="w-full" data-testid="button-dispense">
                <Package className="w-4 h-4 mr-2" />
                Mark as Dispensed
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover-elevate">
                <div>
                  <p className="font-medium">RX-2025-00{i}230</p>
                  <p className="text-sm text-muted-foreground">Patient: Sample Name {i}</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">Dispensed</Badge>
                  <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
