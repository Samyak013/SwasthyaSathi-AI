import { useEffect, useRef } from "react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Star } from "lucide-react";

interface Facility {
  id: string;
  name: string;
  type: "hospital" | "clinic" | "pharmacy";
  distance: number;
  latitude: number;
  longitude: number;
  phone: string;
  rating: number;
  address: string;
}

interface NearbyFacilitiesProps {
  userId: string;
}

export function NearbyFacilities({ userId }: NearbyFacilitiesProps) {
  const [facilities, setFacilities] = React.useState<Facility[]>([]);
  const [loading, setLoading] = React.useState(true);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch nearby facilities
    const fetchFacilities = async () => {
      try {
        const response = await fetch("/api/facilities/nearby?latitude=28.5355&longitude=77.391");
        if (response.ok) {
          const data = await response.json();
          setFacilities(data.facilities || []);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching facilities:", error);
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "hospital":
        return "🏥";
      case "clinic":
        return "🏨";
      case "pharmacy":
        return "💊";
      default:
        return "📍";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Nearby Facilities
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading facilities...</div>
        ) : (
          <div className="space-y-4">
            {/* Map placeholder */}
           <div
              ref={mapRef}
              className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
            >
              <div className="text-center">
                <p className="text-gray-500 mb-2">📍 Map View (Google Maps integration)</p>
                <p className="text-sm text-gray-400">Showing {facilities.length} nearby facilities</p>
              </div>
            </div>

            {/* Facilities List */}
            <div className="grid gap-3 mt-4">
              {facilities.map((facility) => (
                <div
                  key={facility.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{getIcon(facility.type)}</span>
                        <h4 className="font-semibold">{facility.name}</h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {facility.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{facility.address}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-red-500" />
                          <span>{facility.distance} km away</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span>{facility.rating}/5</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-green-600" />
                          <a href={`tel:${facility.phone}`} className="text-blue-600 hover:underline">
                            {facility.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                    <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors">
                      Open Maps
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default NearbyFacilities;
