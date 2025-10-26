import HealthRecordTimeline from "../HealthRecordTimeline";

export default function HealthRecordTimelineExample() {
  //todo: remove mock functionality
  const mockRecords = [
    {
      id: "1",
      type: "prescription" as const,
      title: "General Checkup Prescription",
      date: "Jan 24, 2025",
      doctor: "Dr. Rajesh Kumar",
      summary: "Prescribed Paracetamol and Azithromycin for fever and infection",
      aiInsight: "Monitor temperature for next 3 days. Ensure complete antibiotic course.",
    },
    {
      id: "2",
      type: "lab_report" as const,
      title: "Complete Blood Count (CBC)",
      date: "Jan 20, 2025",
      doctor: "Dr. Priya Mehta",
      summary: "Hemoglobin: 13.2 g/dL, WBC: 8,500/µL, Platelets: 250,000/µL",
      aiInsight: "All values within normal range. Hemoglobin slightly low, consider iron-rich diet.",
    },
    {
      id: "3",
      type: "consultation" as const,
      title: "Follow-up Consultation",
      date: "Jan 15, 2025",
      doctor: "Dr. Rajesh Kumar",
      summary: "Patient reported improvement in symptoms. Blood pressure stable at 120/80.",
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Health Record Timeline</h2>
      <HealthRecordTimeline
        records={mockRecords}
        onDownload={(id) => console.log("Download:", id)}
        onViewDetails={(id) => console.log("View details:", id)}
      />
    </div>
  );
}
