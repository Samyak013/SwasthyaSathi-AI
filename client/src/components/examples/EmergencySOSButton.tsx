import EmergencySOSButton from "../EmergencySOSButton";

export default function EmergencySOSButtonExample() {
  return (
    <div className="p-6 flex items-center justify-center min-h-screen">
      <EmergencySOSButton
        patientName="Priya Sharma"
        abhaId="22-1111-2222-3333"
        onActivateSOS={() => console.log("SOS ACTIVATED")}
      />
    </div>
  );
}
