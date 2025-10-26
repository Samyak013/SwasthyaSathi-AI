import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionCreatorProps {
  doctorName: string;
  patientName: string;
  patientAbhaId: string;
  onSave?: (prescription: any) => void;
}

export default function PrescriptionCreator({
  doctorName,
  patientName,
  patientAbhaId,
  onSave,
}: PrescriptionCreatorProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: "1", name: "", dosage: "", frequency: "", duration: "" },
  ]);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const addMedicine = () => {
    setMedicines([...medicines, { id: Date.now().toString(), name: "", dosage: "", frequency: "", duration: "" }]);
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(medicines.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const checkDrugInteractions = () => {
    //todo: remove mock functionality
    setAiSuggestions([
      "No drug interactions detected",
      "Recommended: Take Paracetamol with food",
      "Patient allergies checked: No conflicts",
    ]);
    console.log("AI Drug Interaction Check triggered");
  };

  const handleSave = () => {
    const prescription = {
      doctor: doctorName,
      patient: patientName,
      patientAbhaId,
      diagnosis,
      medicines: medicines.filter((m) => m.name),
      notes,
      date: new Date().toISOString(),
    };
    onSave?.(prescription);
    console.log("Prescription saved:", prescription);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Prescription</CardTitle>
          <p className="text-sm text-muted-foreground">Patient: {patientName} ({patientAbhaId})</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              placeholder="Enter diagnosis..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              data-testid="input-diagnosis"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Medicines</Label>
              <Button size="sm" variant="outline" onClick={addMedicine} data-testid="button-add-medicine">
                <Plus className="w-4 h-4 mr-1" />
                Add Medicine
              </Button>
            </div>
            {medicines.map((medicine, idx) => (
              <div key={medicine.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Medicine {idx + 1}</span>
                  {medicines.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeMedicine(medicine.id)}
                      data-testid={`button-remove-medicine-${idx}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Medicine name"
                  value={medicine.name}
                  onChange={(e) => updateMedicine(medicine.id, "name", e.target.value)}
                  data-testid={`input-medicine-name-${idx}`}
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Dosage"
                    value={medicine.dosage}
                    onChange={(e) => updateMedicine(medicine.id, "dosage", e.target.value)}
                    data-testid={`input-dosage-${idx}`}
                  />
                  <Select
                    value={medicine.frequency}
                    onValueChange={(value) => updateMedicine(medicine.id, "frequency", value)}
                  >
                    <SelectTrigger data-testid={`select-frequency-${idx}`}>
                      <SelectValue placeholder="Frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Once/day">Once/day</SelectItem>
                      <SelectItem value="2 times/day">2 times/day</SelectItem>
                      <SelectItem value="3 times/day">3 times/day</SelectItem>
                      <SelectItem value="Before meals">Before meals</SelectItem>
                      <SelectItem value="After meals">After meals</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Duration"
                    value={medicine.duration}
                    onChange={(e) => updateMedicine(medicine.id, "duration", e.target.value)}
                    data-testid={`input-duration-${idx}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Instructions, precautions, follow-up advice..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              data-testid="textarea-notes"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={checkDrugInteractions} variant="outline" data-testid="button-ai-check">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Drug Check
            </Button>
            <Button onClick={handleSave} className="flex-1" data-testid="button-save-prescription">
              <Save className="w-4 h-4 mr-2" />
              Save & Sign
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Prescription Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">Doctor:</span>
                <span>{doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Patient:</span>
                <span>{patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">ABHA ID:</span>
                <span>{patientAbhaId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {diagnosis && (
              <>
                <Separator />
                <div>
                  <p className="font-semibold mb-1">Diagnosis</p>
                  <p className="text-sm">{diagnosis}</p>
                </div>
              </>
            )}

            {medicines.some((m) => m.name) && (
              <>
                <Separator />
                <div>
                  <p className="font-semibold mb-2">Prescribed Medicines</p>
                  <div className="space-y-2">
                    {medicines
                      .filter((m) => m.name)
                      .map((medicine, idx) => (
                        <div key={medicine.id} className="text-sm p-2 bg-muted/30 rounded">
                          <p className="font-medium">{idx + 1}. {medicine.name}</p>
                          {(medicine.dosage || medicine.frequency || medicine.duration) && (
                            <p className="text-muted-foreground text-xs mt-1">
                              {[medicine.dosage, medicine.frequency, medicine.duration].filter(Boolean).join(" • ")}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}

            {notes && (
              <>
                <Separator />
                <div>
                  <p className="font-semibold mb-1">Notes</p>
                  <p className="text-sm">{notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {aiSuggestions.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {aiSuggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="mt-0.5">✓</Badge>
                  <span>{suggestion}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
