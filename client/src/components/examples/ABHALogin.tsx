import ABHALogin from "../ABHALogin";

export default function ABHALoginExample() {
  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-background">
      <ABHALogin onLogin={(id, method) => console.log("Logged in:", id, method)} />
    </div>
  );
}
