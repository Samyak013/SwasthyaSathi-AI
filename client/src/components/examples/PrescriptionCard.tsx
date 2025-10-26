import PrescriptionCard from "../PrescriptionCard";

export default function PrescriptionCardExample() {
  return (
    <div className="p-6 max-w-2xl">
      <PrescriptionCard
        id="1"
        doctorName="Dr. Rajesh Kumar"
        doctorSpecialization="General Physician"
        patientName="Priya Sharma"
        date="Jan 24, 2025"
        prescriptionId="RX-2025-001234"
        status="verified"
        medicines={[
          { name: "Paracetamol 500mg", dosage: "1 tablet", frequency: "3 times/day", duration: "5 days" },
          { name: "Azithromycin 250mg", dosage: "1 tablet", frequency: "Once/day", duration: "3 days" },
        ]}
        onDownload={() => console.log("Download")}
        onShare={() => console.log("Share")}
        onViewQR={() => console.log("View QR")}
      />
    </div>
  );
}
