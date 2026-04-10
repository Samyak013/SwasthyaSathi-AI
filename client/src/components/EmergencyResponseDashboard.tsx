import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, MapPin, FastForward, CheckCircle, Heart, Thermometer } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmergencyAlert {
  id: string;
  userId: string;
  location: { lat: number; lng: number; address: string };
  vitals: { heartRate?: number; bloodPressure?: string; temperature?: number | string };
  status: string;
  respondedBy?: string | null;
  createdAt: Date;
  resolvedAt?: Date | null;
}

export default function EmergencyResponseDashboard({ doctorId }: { doctorId: string }) {
  const { toast } = useToast();
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);

  // Fetch active alerts - auto-refresh every 5 seconds
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["emergency-alerts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/emergency/active");
      return response as EmergencyAlert[];
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Mutation to resolve alert
  const resolveMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return await apiRequest("PATCH", `/api/emergency/${alertId}/resolve`, {
        responderId: doctorId,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Alert Resolved",
        description: `SOS alert has been marked as resolved`,
      });
      setSelectedAlert(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resolve alert",
        variant: "destructive",
      });
    },
  });

  const handleRespond = (alert: EmergencyAlert) => {
    setSelectedAlert(alert);
  };

  const handleResolve = () => {
    if (selectedAlert) {
      resolveMutation.mutate(selectedAlert.id);
    }
  };

  const activeAlertsCount = alerts.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Emergency Response Center</h2>
            <p className="text-muted-foreground">Monitor and respond to SOS alerts</p>
          </div>
          <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 text-center">
            <p className="text-xs text-red-600 font-semibold">ACTIVE ALERTS</p>
            <p className="text-3xl font-bold text-red-600">{activeAlertsCount}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Alert List */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Active Alerts
              </CardTitle>
              <CardDescription>{activeAlertsCount} emergency(ies) pending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading alerts...</p>
              ) : alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active alerts</p>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => handleRespond(alert)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                      selectedAlert?.id === alert.id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Alert #{alert.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant={alert.status === "active" ? "destructive" : "default"}>
                        {alert.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Alert Details */}
        <div className="md:col-span-2">
          {selectedAlert ? (
            <Card className="border-2 border-red-300 bg-red-50">
              <CardHeader className="bg-red-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-red-600 animate-pulse" />
                    <div>
                      <CardTitle className="text-red-700">Emergency Alert Details</CardTitle>
                      <CardDescription className="text-red-600">ID: {selectedAlert.id}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-sm">
                    {selectedAlert.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Timeline */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Timeline</h4>
                  <div className="text-sm space-y-1 bg-white p-3 rounded-lg border">
                    <p>
                      <span className="font-semibold">Alert Activated:</span>{" "}
                      {new Date(selectedAlert.createdAt).toLocaleString()}
                    </p>
                    {selectedAlert.resolvedAt && (
                      <p>
                        <span className="font-semibold">Resolved:</span> {new Date(selectedAlert.resolvedAt).toLocaleString()}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold">Duration:</span>{" "}
                      {Math.round(
                        (new Date(selectedAlert.resolvedAt || new Date()).getTime() -
                          new Date(selectedAlert.createdAt).getTime()) /
                          1000 / 60
                      )}{" "}
                      minutes
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Location
                  </div>
                  <div className="text-sm space-y-1 bg-white p-3 rounded-lg border">
                    <p className="font-mono text-xs">
                      📍 {selectedAlert.location.lat.toFixed(4)}, {selectedAlert.location.lng.toFixed(4)}
                    </p>
                    <p>{selectedAlert.location.address}</p>
                    <a
                      href={`https://maps.google.com/?q=${selectedAlert.location.lat},${selectedAlert.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      📍 Open in Maps
                    </a>
                  </div>
                </div>

                {/* Vital Signs */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <Heart className="w-5 h-5 text-red-600" />
                    Vital Signs
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedAlert.vitals.heartRate && (
                      <div className="bg-white p-3 rounded-lg border text-center">
                        <div className="text-2xl font-bold text-red-600">{selectedAlert.vitals.heartRate}</div>
                        <div className="text-xs text-muted-foreground">Heart Rate (BPM)</div>
                      </div>
                    )}
                    {selectedAlert.vitals.bloodPressure && (
                      <div className="bg-white p-3 rounded-lg border text-center">
                        <div className="text-xl font-bold text-orange-600">{selectedAlert.vitals.bloodPressure}</div>
                        <div className="text-xs text-muted-foreground">Blood Pressure</div>
                      </div>
                    )}
                    {selectedAlert.vitals.temperature && (
                      <div className="bg-white p-3 rounded-lg border text-center">
                        <div className="text-2xl font-bold text-amber-600">{selectedAlert.vitals.temperature}°C</div>
                        <div className="text-xs text-muted-foreground">Temperature</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {selectedAlert.status === "active" ? (
                    <>
                      <Button
                        size="lg"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={handleResolve}
                        disabled={resolveMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {resolveMutation.isPending ? "Resolving..." : "Mark Resolved"}
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const tel = "tel:+919876543210";
                          window.location.href = tel;
                        }}
                      >
                        <FastForward className="w-4 h-4 mr-2" />
                        Call Patient
                      </Button>
                    </>
                  ) : (
                    <div className="w-full bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                      <p className="font-semibold text-green-800">✅ Alert Resolved</p>
                      <p className="text-sm text-green-700">
                        Responded by: {selectedAlert.respondedBy || "Unknown"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-96">
              <div className="text-center space-y-2">
                <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Select an alert to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Resolved Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resolved Alerts</CardTitle>
            <CardDescription>Recently resolved emergency alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {alerts
                .filter((a) => a.status === "resolved")
                .map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div className="text-sm">
                        <p className="font-semibold">Alert #{alert.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          Resolved: {new Date(alert.resolvedAt || "").toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Resolved
                    </Badge>
                  </div>
                ))}
              {alerts.filter((a) => a.status === "resolved").length === 0 && (
                <p className="text-sm text-muted-foreground">No resolved alerts</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
