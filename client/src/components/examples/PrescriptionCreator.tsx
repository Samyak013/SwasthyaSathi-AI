import PrescriptionCreator from "../PrescriptionCreator";

export default function PrescriptionCreatorExample() {
  return (
    <div className="p-6">
      <PrescriptionCreator
        doctorName="Dr. Rajesh Kumar"
        patientName="Priya Sharma"
        patientAbhaId="22-1111-2222-3333"
        onSave={(prescription) => console.log("Saved:", prescription)}
      />
    </div>
  );
}
