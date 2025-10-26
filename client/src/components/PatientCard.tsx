import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, FileText, Calendar } from "lucide-react";

interface PatientCardProps {
  id: string;
  name: string;
  abhaId: string;
  age: number;
  gender: string;
  lastVisit: string;
  conditions?: string[];
  avatar?: string;
  onViewRecords?: () => void;
  onSendMessage?: () => void;
  onSchedule?: () => void;
}

export default function PatientCard({
  id,
  name,
  abhaId,
  age,
  gender,
  lastVisit,
  conditions = [],
  avatar,
  onViewRecords,
  onSendMessage,
  onSchedule,
}: PatientCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="hover-elevate" data-testid={`card-patient-${id}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-lg" data-testid={`text-patient-name-${id}`}>{name}</h3>
              <p className="text-sm text-muted-foreground" data-testid={`text-abha-${id}`}>ABHA: {abhaId}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Age:</span> {age}
              </div>
              <div>
                <span className="text-muted-foreground">Gender:</span> {gender}
              </div>
              <div>
                <span className="text-muted-foreground">Last Visit:</span> {lastVisit}
              </div>
            </div>
            {conditions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {conditions.map((condition, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={onViewRecords} data-testid={`button-view-records-${id}`}>
                <FileText className="w-4 h-4 mr-1" />
                Records
              </Button>
              <Button size="sm" variant="outline" onClick={onSendMessage} data-testid={`button-message-${id}`}>
                <MessageSquare className="w-4 h-4 mr-1" />
                Message
              </Button>
              <Button size="sm" variant="outline" onClick={onSchedule} data-testid={`button-schedule-${id}`}>
                <Calendar className="w-4 h-4 mr-1" />
                Schedule
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
