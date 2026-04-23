import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Bell, Check, Clock, AlertCircle, Trash2, Plus, Pill, Calendar, 
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Reminder } from "@shared/schema";

interface MedicationReminderProps {
  userId?: string;
}

export default function MedicationReminderSystem({ userId }: MedicationReminderProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({
    medicationName: "",
    dosage: "",
    frequency: "once-daily",
    time: "08:00",
    notes: "",
  });

  const { data: reminders = [], isLoading, refetch } = useQuery<Reminder[]>({
    queryKey: [`/api/reminders/user/${userId}`],
    enabled: !!userId,
  });

  const createReminderMutation = useMutation({
    mutationFn: async (reminderData: any) => {
      const response = await apiRequest("POST", "/api/reminders", {
        userId,
        ...reminderData,
        scheduledAt: new Date(`${new Date().toISOString().split('T')[0]}T${reminderData.time}:00`),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reminder created successfully",
      });
      setNewReminder({
        medicationName: "",
        dosage: "",
        frequency: "once-daily",
        time: "08:00",
        notes: "",
      });
      setShowAddReminder(false);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create reminder",
        variant: "destructive",
      });
    },
  });

  const completeReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const response = await apiRequest("PATCH", `/api/reminders/${reminderId}/complete`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reminder marked as complete",
      });
      refetch();
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      await apiRequest("DELETE", `/api/reminders/${reminderId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reminder deleted successfully",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete reminder",
        variant: "destructive",
      });
    },
  });

  const upcomingReminders = reminders
    .filter(r => !r.completed && new Date(r.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5);

  const completedReminders = reminders.filter(r => r.completed).slice(0, 3);

  const getFrequencyLabel = (frequency: string): string => {
    const labels: Record<string, string> = {
      "once-daily": "Once Daily",
      "twice-daily": "Twice Daily",
      "thrice-daily": "Thrice Daily",
      "every-6-hours": "Every 6 Hours",
      "every-12-hours": "Every 12 Hours",
      "weekly": "Weekly",
      "as-needed": "As Needed",
    };
    return labels[frequency] || frequency;
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isReminderDue = (scheduledAt: Date): boolean => {
    const now = new Date();
    const reminderTime = new Date(scheduledAt);
    const diffMinutes = Math.abs(now.getTime() - reminderTime.getTime()) / (1000 * 60);
    return diffMinutes < 30;
  };

  return (
    <>
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <CardTitle>{t("patient.reminders")}</CardTitle>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddReminder(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Reminder
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t("common.loading")}</p>
            </div>
          ) : upcomingReminders.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">{t("patient.noReminders")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    isReminderDue(reminder.scheduledAt)
                      ? "bg-red-50 border-red-400 border-2"
                      : "bg-white border-blue-400"
                  } transition-colors`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Pill className="w-4 h-4" />
                        <h3 className="font-semibold">{reminder.title || "Medication"}</h3>
                        {isReminderDue(reminder.scheduledAt) && (
                          <Badge variant="destructive" className="animate-pulse">
                            Due Now!
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{reminder.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(reminder.scheduledAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(reminder.scheduledAt).toLocaleDateString()}
                    </div>
                    {reminder.frequency && (
                      <Badge variant="outline">{getFrequencyLabel(reminder.frequency)}</Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => completeReminderMutation.mutate(reminder.id)}
                      disabled={completeReminderMutation.isPending}
                      className="gap-1"
                    >
                      <Check className="w-4 h-4" />
                      {t("patient.markComplete")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteReminderMutation.mutate(reminder.id)}
                      disabled={deleteReminderMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {completedReminders.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                Recently Completed
              </h4>
              <div className="space-y-2">
                {completedReminders.map((reminder) => (
                  <div key={reminder.id} className="p-2 bg-green-50 rounded text-sm">
                    <div className="flex items-center justify-between">
                      <span className="line-through text-muted-foreground">
                        {reminder.title || "Medication"}
                      </span>
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Reminder Dialog */}
      <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medication Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Medication Name</label>
              <Input
                placeholder="e.g., Aspirin"
                value={newReminder.medicationName}
                onChange={(e) =>
                  setNewReminder({ ...newReminder, medicationName: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Dosage</label>
              <Input
                placeholder="e.g., 500mg"
                value={newReminder.dosage}
                onChange={(e) =>
                  setNewReminder({ ...newReminder, dosage: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Frequency</label>
              <Select
                value={newReminder.frequency}
                onValueChange={(value) =>
                  setNewReminder({ ...newReminder, frequency: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once-daily">Once Daily</SelectItem>
                  <SelectItem value="twice-daily">Twice Daily</SelectItem>
                  <SelectItem value="thrice-daily">Thrice Daily</SelectItem>
                  <SelectItem value="every-6-hours">Every 6 Hours</SelectItem>
                  <SelectItem value="every-12-hours">Every 12 Hours</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="as-needed">As Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Time</label>
              <Input
                type="time"
                value={newReminder.time}
                onChange={(e) =>
                  setNewReminder({ ...newReminder, time: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Input
                placeholder="e.g., Take with food"
                value={newReminder.notes}
                onChange={(e) =>
                  setNewReminder({ ...newReminder, notes: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() =>
                  createReminderMutation.mutate(newReminder)
                }
                disabled={
                  !newReminder.medicationName ||
                  createReminderMutation.isPending
                }
                className="flex-1"
              >
                Create Reminder
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddReminder(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
