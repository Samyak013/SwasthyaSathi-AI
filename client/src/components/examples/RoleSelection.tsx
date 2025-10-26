import RoleSelection from "../RoleSelection";

export default function RoleSelectionExample() {
  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-background">
      <RoleSelection
        userName="Dr. Rajesh Kumar"
        abhaId="22-1234-5678-9012"
        onSelectRole={(role) => console.log("Selected role:", role)}
      />
    </div>
  );
}
