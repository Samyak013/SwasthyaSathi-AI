import PrescriptionCreator from "../PrescriptionCreator";

export default function PrescriptionCreatorExample() {
  return (
    <div className="p-6">
      <PrescriptionCreator
        doctorName="Dr. Rajesh Kumar"
        doctorId="doc-123"
        onSave={(prescription) => console.log("Saved:", prescription)}
      />
    </div>
  );
}
