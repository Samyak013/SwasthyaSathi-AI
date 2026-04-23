import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, Star, Navigation } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

interface Facility {
  id: string;
  name: string;
  type: "hospital" | "clinic" | "pharmacy";
  distance: number; // in km
  rating: number;
  address: string;
  phone: string;
  openHours?: string;
  isOpen: boolean;
  lat: number;
  lng: number;
}

interface FacilityMapProps {
  userLocation?: {
    lat: number;
    lng: number;
  };
  facilityType?: "hospital" | "clinic" | "pharmacy" | "all";
  radius?: number;
}

// Sample facility data - in production, this would come from an API with real data
const SAMPLE_FACILITIES: Facility[] = [
  {
    id: "h1",
    name: "City General Hospital",
    type: "hospital",
    distance: 1.2,
    rating: 4.5,
    address: "123 Medical Street, City Center",
    phone: "+91-9876543210",
    openHours: "24/7",
    isOpen: true,
    lat: 19.0760,
    lng: 72.8777,
  },
  {
    id: "c1",
    name: "HealthCare Clinic",
    type: "clinic",
    distance: 0.8,
    rating: 4.2,
    address: "456 Health Avenue, Downtown",
    phone: "+91-9876543211",
    openHours: "9 AM - 9 PM",
    isOpen: true,
    lat: 19.0758,
    lng: 72.8785,
  },
  {
    id: "p1",
    name: "Wellness Pharmacy",
    type: "pharmacy",
    distance: 0.5,
    rating: 4.7,
    address: "789 Care Lane, Nearby",
    phone: "+91-9876543212",
    openHours: "9 AM - 10 PM",
    isOpen: true,
    lat: 19.0762,
    lng: 72.8774,
  },
  {
    id: "h2",
    name: "Advanced Medical Center",
    type: "hospital",
    distance: 2.1,
    rating: 4.3,
    address: "321 Hospital Road, Medical District",
    phone: "+91-9876543213",
    openHours: "24/7",
    isOpen: true,
    lat: 19.0750,
    lng: 72.8790,
  },
  {
    id: "c2",
    name: "Quick Care Clinic",
    type: "clinic",
    distance: 1.5,
    rating: 4.0,
    address: "654 Quick Street, Commercial Area",
    phone: "+91-9876543214",
    openHours: "10 AM - 8 PM",
    isOpen: true,
    lat: 19.0765,
    lng: 72.8770,
  },
  {
    id: "p2",
    name: "MediPro Pharmacy",
    type: "pharmacy",
    distance: 1.8,
    rating: 4.4,
    address: "987 Medicine Road, Shopping Zone",
    phone: "+91-9876543215",
    openHours: "8 AM - 11 PM",
    isOpen: true,
    lat: 19.0755,
    lng: 72.8795,
  },
];

export default function FacilityMap({ userLocation, facilityType = "all", radius = 5 }: FacilityMapProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    loadFacilities();
    requestLocationPermission();
  }, [facilityType, radius]);

  const requestLocationPermission = async () => {
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setHasLocationPermission(true);
          },
          (error) => {
            console.log("Location permission denied:", error);
            setHasLocationPermission(false);
          }
        );
      }
    } catch (error) {
      console.error("Error requesting location:", error);
    }
  };

  const loadFacilities = () => {
    setIsLoading(true);
    try {
      let filtered = SAMPLE_FACILITIES;

      // Filter by facility type
      if (facilityType !== "all") {
        filtered = filtered.filter((f) => f.type === facilityType);
      }

      // Filter by radius
      filtered = filtered.filter((f) => f.distance <= radius);

      // Sort by distance
      filtered.sort((a, b) => a.distance - b.distance);

      setFacilities(filtered);
    } catch (error) {
      console.error("Error loading facilities:", error);
      toast({
        title: "Error",
        description: "Failed to load nearby facilities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openInMaps = (facility: Facility) => {
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(facility.name)}/@${facility.lat},${facility.lng},15z`;
    window.open(mapsUrl, "_blank");
  };

  const callFacility = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const getTitleKey = () => {
    switch (facilityType) {
      case "hospital":
        return "facilities.nearbyHospitals";
      case "clinic":
        return "facilities.nearbyClinics";
      case "pharmacy":
        return "facilities.nearbyPharmacies";
      default:
        return "facilities.nearbyHospitals";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {t(getTitleKey())}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasLocationPermission && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            📍 Enable location services to see nearby facilities
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : facilities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No facilities found within {radius} km</p>
          </div>
        ) : (
          <div className="space-y-3">
            {facilities.map((facility) => (
              <div
                key={facility.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setSelectedFacility(facility)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{facility.name}</h3>
                      <Badge variant="outline" className="capitalize">
                        {facility.type}
                      </Badge>
                      {facility.isOpen ? (
                        <Badge variant="default" className="bg-green-600">
                          Open
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Closed</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {facility.address}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{facility.rating}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {facility.distance} {t("facilities.distance")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {facility.openHours}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {facility.phone}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      openInMaps(facility);
                    }}
                  >
                    <Navigation className="w-4 h-4 mr-1" />
                    {t("facilities.viewOnMap")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      callFacility(facility.phone);
                    }}
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          ℹ️ Showing {facilities.length} facilities within {radius} km
        </div>
      </CardContent>
    </Card>
  );
}
