import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Hospital, Pill, Stethoscope, Phone, Navigation } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Facility {
  id: string;
  name: string;
  type: "hospital" | "clinic" | "pharmacy";
  distance: number;
  rating: number;
  phone: string;
  address: string;
  lat: number;
  lng: number;
  specialties?: string[];
}

// Mock nearby facilities data
const MOCK_FACILITIES: Facility[] = [
  {
    id: "h1",
    name: "City Hospital & Medical Center",
    type: "hospital",
    distance: 0.8,
    rating: 4.5,
    phone: "+91-98765-43210",
    address: "123 Medical Road, Mumbai",
    lat: 19.0760,
    lng: 72.8777,
    specialties: ["Cardiology", "Neurology", "Orthopedics", "Emergency"]
  },
  {
    id: "c1",
    name: "Dr. wellness Clinic",
    type: "clinic",
    distance: 1.2,
    rating: 4.8,
    phone: "+91-98765-43211",
    address: "456 Health Street, Mumbai",
    lat: 19.0800,
    lng: 72.8800,
    specialties: ["General Practice", "gynecology", "Pediatrics"]
  },
  {
    id: "p1",
    name: "HealthPlus Pharmacy",
    type: "pharmacy",
    distance: 0.5,
    rating: 4.6,
    phone: "+91-98765-43212",
    address: "789 Pharma Lane, Mumbai",
    lat: 19.0750,
    lng: 72.8760,
    specialties: ["24-7 Service", "Home Delivery", "Homeopathy"]
  },
  {
    id: "c2",
    name: "Ayurveda Wellness Centre",
    type: "clinic",
    distance: 2.0,
    rating: 4.7,
    phone: "+91-98765-43213",
    address: "321 Herbal Road, Mumbai",
    lat: 19.1000,
    lng: 72.8900,
    specialties: ["Ayurveda", "Panchakarma", "Treatment"]
  },
  {
    id: "h2",
    name: "Apollo Health Institute",
    type: "hospital",
    distance: 3.5,
    rating: 4.4,
    phone: "+91-98765-43214",
    address: "654 Apollo Plaza, Mumbai",
    lat: 19.1200,
    lng: 72.9000,
    specialties: ["ICU", "Surgery", "Diagnostics", "Emergency"]
  },
];

interface NearbyFacilitiesMapProps {
  userLat?: number;
  userLng?: number;
  type?: "hospital" | "clinic" | "pharmacy" | "all";
}

export default function NearbyFacilitiesMap({ 
  userLat = 19.0760, 
  userLng = 72.8777,
  type = "all" 
}: NearbyFacilitiesMapProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [filterType, setFilterType] = useState<string>(type);

  useEffect(() => {
    // Filter facilities based on type
    const filtered = filterType === "all" 
      ? MOCK_FACILITIES 
      : MOCK_FACILITIES.filter(f => f.type === filterType);
    setFacilities(filtered.sort((a, b) => a.distance - b.distance));
  }, [filterType]);

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocationEnabled(true);
      }, () => {
        setLocationEnabled(true); // Enable anyway for demo
      });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "hospital":
        return <Hospital className="w-5 h-5 text-red-500" />;
      case "clinic":
        return <Stethoscope className="w-5 h-5 text-blue-500" />;
      case "pharmacy":
        return <Pill className="w-5 h-5 text-green-500" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "hospital":
        return "destructive";
      case "clinic":
        return "secondary";
      case "pharmacy":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      {!locationEnabled && (
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertDescription>
            <Button 
              size="sm" 
              onClick={handleGetLocation}
              className="ml-2"
            >
              Enable Location
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {["all", "hospital", "clinic", "pharmacy"].map((f) => (
          <Button
            key={f}
            variant={filterType === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType(f)}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Map Placeholder */}
      <Card className="bg-slate-100 h-96 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col items-center justify-center gap-4">
          <MapPin className="w-12 h-12 text-slate-400" />
          <p className="text-slate-500 text-center">
            📍 Map View
            <br/>
            <span className="text-xs">
              {facilities.length} facilities near you
            </span>
          </p>
          
          {/* Mini facility dots on map area */}
          <div className="absolute inset-0 p-4">
            {facilities.map((f, idx) => (
              <div
                key={f.id}
                className="absolute hover:scale-110 transition-transform cursor-pointer"
                style={{
                  left: `${20 + (f.lng - 72.87) * 500}px`,
                  top: `${150 + (f.lat - 19.07) * 500}px`,
                }}
                onClick={() => setSelectedFacility(f)}
              >
                <div className={`p-2 rounded-full text-white text-sm font-bold flex items-center justify-center w-10 h-10 ${
                  f.type === "hospital" ? "bg-red-500" : f.type === "clinic" ? "bg-blue-500" : "bg-green-500"
                }`}>
                  {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Facilities List */}
      <div className="grid gap-3">
        <h3 className="font-semibold text-lg">
          Nearby Facilities ({facilities.length})
        </h3>
        
        {facilities.map((facility) => (
          <Card 
            key={facility.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedFacility?.id === facility.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedFacility(facility)}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 p-3 rounded-lg bg-slate-100 flex items-center justify-center">
                  {getIcon(facility.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{facility.name}</h4>
                    <Badge variant={getTypeBadgeColor(facility.type)}>
                      {facility.type}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {facility.address}
                  </p>
                  
                  {facility.specialties && (
                    <div className="flex gap-1 flex-wrap mb-2">
                      {facility.specialties.slice(0, 2).map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {facility.specialties.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{facility.specialties.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-4 h-4" />
                        {facility.distance} km
                      </span>
                      <span className="flex items-center gap-1">
                        ⭐ {facility.rating}
                      </span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `tel:${facility.phone}`;
                      }}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Facility Details */}
      {selectedFacility && (
        <Card className="bg-primary/5 border-primary">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {getIcon(selectedFacility.type)}
              {selectedFacility.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Address</p>
              <p>{selectedFacility.address}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Contact</p>
              <p>{selectedFacility.phone}</p>
            </div>
            
            {selectedFacility.specialties && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {selectedFacility.specialties.map((spec) => (
                    <Badge key={spec}>{spec}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              <Button className="flex-1">
                <MapPin className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
              <Button variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
