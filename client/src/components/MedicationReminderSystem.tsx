import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Bell, Plus, Trash2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface MedicationReminder {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  nextDueAt: Date;
  taken: boolean;
  skipped: boolean;
  missedCount: number;
  takenCount: number;
  prescriptionId: string;
}

interface MedicationReminderSystemProps {
  medicines: Medicine[];
  prescriptionId: string;
  userId?: string;
  prescriptionStartDate?: Date;
  prescriptionEndDate?: Date;
}

export default function MedicationReminderSystem({
  medicines,
  prescriptionId,
  userId,
  prescriptionStartDate = new Date(),
  prescriptionEndDate,
}: MedicationReminderSystemProps) {
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [selectedReminder, setSelectedReminder] = useState<MedicationReminder | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Initialize reminders from medicines
  useEffect(() => {
    if (medicines && medicines.length > 0) {
      const newReminders = medicines.map((medicine, idx) => ({
        id: `${prescriptionId}-med-${idx}`,
        medicationName: medicine.name,
        dosage: medicine.dosage,
        frequency: medicine.frequency,
        nextDueAt: new Date(),
        taken: false,
        skipped: false,
        missedCount: 0,
        takenCount: 0,
        prescriptionId,
      }));
      setReminders(newReminders);
      saveReminders(newReminders);
    }
  }, [medicines, prescriptionId]);

  const saveReminders = async (reminderData: MedicationReminder[]) => {
    if (!userId) return;
    
    try {
      await apiRequest("POST", "/api/medication-reminders", {
        userId,
        prescriptionId,
        reminders: reminderData,
      });
    } catch (error) {
      console.error("Failed to save reminders:", error);
    }
  };

  const getNextDueTime = (frequency: string): Date => {
    const now = new Date();
    const dueTime = new Date();

    // Parse frequency string and calculate next due time
    if (frequency.toLowerCase().includes("twice")) {
      const hour = now.getHours();
      if (hour < 8) {
        dueTime.setHours(8, 0, 0, 0);
      } else if (hour < 20) {
        dueTime.setHours(20, 0, 0, 0);
      } else {
        dueTime.setDate(dueTime.getDate() + 1);
        dueTime.setHours(8, 0, 0, 0);
      }
    } else if (frequency.toLowerCase().includes("thrice") || frequency.toLowerCase().includes("three")) {
      const hour = now.getHours();
      if (hour < 8) {
        dueTime.setHours(8, 0, 0, 0);
      } else if (hour < 14) {
        dueTime.setHours(14, 0, 0, 0);
      } else if (hour < 20) {
        dueTime.setHours(20, 0, 0, 0);
      } else {
        dueTime.setDate(dueTime.getDate() + 1);
        dueTime.setHours(8, 0, 0, 0);
      }
    } else {
      // Once daily
      const hour = now.getHours();
      if (hour < 9) {
        dueTime.setHours(9, 0, 0, 0);
      } else {
        dueTime.setDate(dueTime.getDate() + 1);
        dueTime.setHours(9, 0, 0, 0);
      }
    }

    return dueTime;
  };

  const handleMarkAsTaken = async (reminderId: string) => {
    const updated = reminders.map((r) =>
      r.id === reminderId
        ? {
            ...r,
            taken: true,
            skipped: false,
            takenCount: r.takenCount + 1,
            nextDueAt: getNextDueTime(r.frequency),
          }
        : r
    );
    setReminders(updated);
    saveReminders(updated);

    const reminder = reminders.find((r) => r.id === reminderId);
    toast({
      title: "✅ Medication Recorded",
      description: `${reminder?.medicationName} marked as taken at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
    });
  };

  const handleMarkAsSkipped = async (reminderId: string) => {
    const updated = reminders.map((r) =>
      r.id === reminderId
        ? {
            ...r,
            taken: false,
            skipped: true,
            missedCount: r.missedCount + 1,
            nextDueAt: getNextDueTime(r.frequency),
          }
        : r
    );
    setReminders(updated);
    saveReminders(updated);

    const reminder = reminders.find((r) => r.id === reminderId);
    toast({
      title: "⚠️ Medication Skipped",
      description: `${reminder?.medicationName} marked as not taken`,
      variant: "destructive",
    });
  };

  const handleSnoozeReminder = (reminderId: string, minutesToAdd: number = 15) => {
    const updated = reminders.map((r) =>
      r.id === reminderId
        ? {
            ...r,
            nextDueAt: new Date(r.nextDueAt.getTime() + minutesToAdd * 60 * 1000),
          }
        : r
    );
    setReminders(updated);

    toast({
      title: "⏰ Reminder Snoozed",
      description: `Reminder set for ${minutesToAdd} minutes later`,
    });
  };

  const handleDeleteReminder = (reminderId: string) => {
    setReminders(reminders.filter((r) => r.id !== reminderId));
    toast({
      title: "Reminder Deleted",
      description: "Medication reminder has been removed",
    });
  };

  // Get reminders due in the next 24 hours
  const upcomingReminders = reminders.filter((r) => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return r.nextDueAt >= now && r.nextDueAt <= tomorrow;
  }).sort((a, b) => a.nextDueAt.getTime() - b.nextDueAt.getTime());

  // Get overdue reminders
  const overdueReminders = reminders.filter((r) => r.nextDueAt < new Date() && !r.taken);

  const formatTimeUntilDue = (dueTime: Date): string => {
    const now = new Date();
    const diffMs = dueTime.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMs < 0) {
      return `Overdue by ${Math.abs(diffMins)} min`;
    } else if (diffHours > 0) {
      return `In ${diffHours}h ${diffMins % 60}m`;
    } else {
      return `In ${diffMins}m`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overdue Alert */}
      {overdueReminders.length > 0 && (
        <Card className="border-red-500/30 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-700 dark:text-red-400">
                {overdueReminders.length} overdue medication{overdueReminders.length !== 1 ? "s" : ""}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Please take your pending medications
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Reminders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Medication Reminders
              {reminders.length > 0 && (
                <Badge variant="secondary">{reminders.length}</Badge>
              )}
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {reminders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No medications to track
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReminders.map((reminder) => {
                const isOverdue = reminder.nextDueAt < new Date();
                return (
                  <div
                    key={reminder.id}
                    className={`p-4 rounded-lg border ${
                      isOverdue
                        ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"
                        : "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">{reminder.medicationName}</p>
                          <Badge variant="outline" className="text-xs">
                            {reminder.dosage}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {reminder.frequency}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-3 h-3" />
                          <span className={isOverdue ? "text-red-600 dark:text-red-400 font-semibold" : ""}>
                            {isOverdue ? "⚠️ OVERDUE" : formatTimeUntilDue(reminder.nextDueAt)}
                          </span>
                          <span className="text-muted-foreground">
                            • Taken: {reminder.takenCount} | Missed: {reminder.missedCount}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap justify-end">
                        <Button
                          size="sm"
                          variant={reminder.taken ? "default" : "outline"}
                          onClick={() => handleMarkAsTaken(reminder.id)}
                          className={reminder.taken ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Taken
                        </Button>
                        <Button
                          size="sm"
                          variant={reminder.skipped ? "destructive" : "outline"}
                          onClick={() => handleMarkAsSkipped(reminder.id)}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Skip
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSnoozeReminder(reminder.id, 15)}
                          title="Snooze for 15 minutes"
                        >
                          ⏰
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reminder Statistics */}
      {reminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {reminders.map((reminder) => {
                const total = reminder.takenCount + reminder.missedCount || 1;
                const compliance = Math.round((reminder.takenCount / total) * 100);
                return (
                  <div key={reminder.id} className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {reminder.medicationName.split(" ")[0]}
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          compliance >= 80
                            ? "bg-green-600"
                            : compliance >= 50
                            ? "bg-yellow-600"
                            : "bg-red-600"
                        }`}
                        style={{ width: `${Math.min(compliance, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm font-semibold">{compliance}%</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reminder Details Dialog */}
      {selectedReminder && (
        <Dialog open={!!selectedReminder} onOpenChange={(open) => !open && setSelectedReminder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedReminder.medicationName}</DialogTitle>
              <DialogDescription>
                Medication reminder details and history
              </DialogDescription>
            </DialogHeader>
            <Separator />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Dosage</p>
                  <p className="font-semibold">{selectedReminder.dosage}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Frequency</p>
                  <p className="font-semibold">{selectedReminder.frequency}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Times Taken</p>
                  <p className="font-semibold text-green-600">{selectedReminder.takenCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Times Missed</p>
                  <p className="font-semibold text-red-600">{selectedReminder.missedCount}</p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedReminder(null);
                    handleDeleteReminder(selectedReminder.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as Taken
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
