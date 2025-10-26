import { Button } from "@/components/ui/button";
import { 
  Home, 
  Calendar, 
  FileText, 
  Video, 
  User, 
  CalendarCheck, 
  Shield, 
  Pill, 
  Package, 
  BarChart3,
  Stethoscope
} from "lucide-react";

interface BottomNavProps {
  role: 'doctor' | 'patient' | 'pharmacy';
  onPrescriptionClick?: () => void;
}

export default function BottomNav({ role, onPrescriptionClick }: BottomNavProps) {
  const doctorTabs = [
    { icon: Home, label: 'Home', active: true, testId: 'nav-home' },
    { icon: Calendar, label: 'Appointments', testId: 'nav-appointments' },
    { icon: Stethoscope, label: 'Prescribe', testId: 'nav-prescribe', onClick: onPrescriptionClick },
    { icon: Video, label: 'Consult', testId: 'nav-consult' },
  ];

  const patientTabs = [
    { icon: Home, label: 'Home', active: true, testId: 'nav-home' },
    { icon: FileText, label: 'Records', testId: 'nav-records' },
    { icon: CalendarCheck, label: 'Appointments', testId: 'nav-appointments' },
    { icon: Shield, label: 'Consent', testId: 'nav-consent' },
  ];

  const pharmacyTabs = [
    { icon: Home, label: 'Home', active: true, testId: 'nav-home' },
    { icon: Pill, label: 'Orders', testId: 'nav-orders' },
    { icon: Package, label: 'Stock', testId: 'nav-stock' },
    { icon: BarChart3, label: 'Reports', testId: 'nav-reports' },
  ];

  const getTabs = () => {
    switch (role) {
      case 'doctor':
        return doctorTabs;
      case 'patient':
        return patientTabs;
      case 'pharmacy':
        return pharmacyTabs;
      default:
        return [];
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30">
      <div className="flex items-center justify-around py-3">
        {getTabs().map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.label}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 h-auto py-2 px-3 ${
                tab.active 
                  ? 'text-primary hover:text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={tab.onClick || undefined}
              data-testid={tab.testId}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
