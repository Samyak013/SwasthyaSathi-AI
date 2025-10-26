import PatientCard from "../PatientCard";

export default function PatientCardExample() {
  return (
    <div className="p-6 max-w-2xl">
      <PatientCard
        id="1"
        name="Priya Sharma"
        abhaId="22-1111-2222-3333"
        age={32}
        gender="Female"
        lastVisit="2 days ago"
        conditions={["Diabetes Type 2", "Hypertension"]}
        onViewRecords={() => console.log("View records")}
        onSendMessage={() => console.log("Send message")}
        onSchedule={() => console.log("Schedule")}
      />
    </div>
  );
}
