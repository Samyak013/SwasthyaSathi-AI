import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Activity, Pill, Calendar, Download } from "lucide-react";
import emptyRecordsImage from "@assets/generated_images/Empty_medical_records_illustration_70e461ba.png";

interface HealthRecord {
  id: string;
  type: "prescription" | "lab_report" | "consultation" | "vitals";
  title: string;
  date: string;
  doctor?: string;
  summary: string;
  aiInsight?: string;
}

interface HealthRecordTimelineProps {
  records: HealthRecord[];
  onDownload?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export default function HealthRecordTimeline({ records, onDownload, onViewDetails }: HealthRecordTimelineProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "prescription":
        return Pill;
      case "lab_report":
        return Activity;
      case "consultation":
        return Calendar;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "prescription":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "lab_report":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "consultation":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <img src={emptyRecordsImage} alt="No records" className="w-48 h-48 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Health Records Yet</h3>
          <p className="text-muted-foreground">
            Your health records from consultations and lab tests will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record, idx) => {
        const Icon = getIcon(record.type);
        return (
          <div key={record.id} className="flex gap-4" data-testid={`record-${record.id}`}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(record.type)}`}>
                <Icon className="w-5 h-5" />
              </div>
              {idx < records.length - 1 && <div className="w-0.5 flex-1 bg-border my-2" />}
            </div>
            <Card className="flex-1 hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{record.title}</h3>
                    <p className="text-sm text-muted-foreground">{record.date}</p>
                    {record.doctor && <p className="text-sm text-muted-foreground">by {record.doctor}</p>}
                  </div>
                  <Badge className={getTypeColor(record.type)}>
                    {record.type.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm mb-3">{record.summary}</p>
                {record.aiInsight && (
                  <div className="p-3 bg-primary/5 rounded-lg mb-3 border border-primary/10">
                    <p className="text-xs font-medium text-primary mb-1">AI Insight</p>
                    <p className="text-sm">{record.aiInsight}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails?.(record.id)}
                    data-testid={`button-view-${record.id}`}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownload?.(record.id)}
                    data-testid={`button-download-${record.id}`}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
