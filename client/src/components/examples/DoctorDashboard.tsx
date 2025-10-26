import DoctorDashboard from "../DoctorDashboard";

export default function DoctorDashboardExample() {
  return (
    <div className="p-6">
      <DoctorDashboard
        doctorName="Dr. Rajesh Kumar"
        specialization="General Physician, MD"
        onCreatePrescription={() => console.log("Create prescription")}
        onViewAnalytics={() => console.log("View analytics")}
      />
    </div>
  );
}
