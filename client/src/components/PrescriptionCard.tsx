import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Share2, QrCode } from "lucide-react";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionCardProps {
  id: string;
  doctorName: string;
  doctorSpecialization: string;
  patientName: string;
  date: string;
  medicines: Medicine[];
  status: "verified" | "pending" | "dispensed";
  prescriptionId: string;
  onDownload?: () => void;
  onShare?: () => void;
  onViewQR?: () => void;
}

export default function PrescriptionCard({
  id,
  doctorName,
  doctorSpecialization,
  patientName,
  date,
  medicines,
  status,
  prescriptionId,
  onDownload,
  onShare,
  onViewQR,
}: PrescriptionCardProps) {
  const statusColors = {
    verified: "bg-green-500/10 text-green-700 dark:text-green-400",
    pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    dispensed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  };

  return (
    <Card data-testid={`card-prescription-${id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Digital Prescription</CardTitle>
            <p className="text-sm text-muted-foreground">ID: {prescriptionId}</p>
          </div>
          <Badge className={statusColors[status]} data-testid={`badge-status-${id}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Doctor</p>
            <p className="font-medium">{doctorName}</p>
            <p className="text-xs text-muted-foreground">{doctorSpecialization}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Patient</p>
            <p className="font-medium">{patientName}</p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="font-medium">Medicines</p>
          <div className="space-y-3">
            {medicines.map((medicine, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">{medicine.name}</p>
                <div className="grid grid-cols-3 gap-2 mt-2 text-sm text-muted-foreground">
                  <div>
                    <span className="text-xs">Dosage:</span> {medicine.dosage}
                  </div>
                  <div>
                    <span className="text-xs">Frequency:</span> {medicine.frequency}
                  </div>
                  <div>
                    <span className="text-xs">Duration:</span> {medicine.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onDownload} data-testid={`button-download-${id}`}>
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          <Button size="sm" variant="outline" onClick={onShare} data-testid={`button-share-${id}`}>
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
          <Button size="sm" variant="outline" onClick={onViewQR} data-testid={`button-qr-${id}`}>
            <QrCode className="w-4 h-4 mr-1" />
            QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
