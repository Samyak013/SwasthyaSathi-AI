import PatientDashboard from "../PatientDashboard";

export default function PatientDashboardExample() {
  return (
    <div className="p-6">
      <PatientDashboard
        patientName="Priya Sharma"
        abhaId="22-1111-2222-3333"
        age={32}
        gender="Female"
      />
    </div>
  );
}
