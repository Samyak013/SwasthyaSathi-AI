import PharmacyManagementSystem from "@/components/PharmacyManagementSystem";

interface PharmacyPortalProps {
  pharmacyName: string;
  location: string;
  userId?: string;
}

export default function PharmacyPortal({
  pharmacyName,
  location,
  userId,
}: PharmacyPortalProps) {
  return (
    <PharmacyManagementSystem
      pharmacyName={pharmacyName}
      location={location}
      userId={userId}
    />
  );
}
