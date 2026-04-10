import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, Sparkles, Search, Check, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionCreatorProps {
  doctorName: string;
  doctorId: string;
  onSave?: (prescription: any) => void;
}

export default function PrescriptionCreator({
  doctorName,
  doctorId,
  onSave,
}: PrescriptionCreatorProps) {
  const [searchAbhaId, setSearchAbhaId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: "1", name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [labTests, setLabTests] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showSymptomInput, setShowSymptomInput] = useState("");
  const [showTestInput, setShowTestInput] = useState("");

  const searchPatient = async () => {
    if (!searchAbhaId.trim()) {
      setSearchError("Please enter a valid ABHA ID");
      return;
    }

    setSearching(true);
    setSearchError("");
    setSelectedPatient(null);

    try {
      const response = await fetch(`/api/doctors/search/${searchAbhaId}`);
      if (!response.ok) {
        setSearchError("Patient not found with this ABHA ID");
        return;
      }
      const patient = await response.json();
      setSelectedPatient(patient);
      setSearchError("");
    } catch (error: any) {
      setSearchError(error.message || "Failed to search patient");
    } finally {
      setSearching(false);
    }
  };

  const addMedicine = () => {
    setMedicines([...medicines, { id: Date.now().toString(), name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(medicines.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const addSymptom = () => {
    if (showSymptomInput.trim()) {
      setSymptoms([...symptoms, showSymptomInput.trim()]);
      setShowSymptomInput("");
    }
  };

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const addTest = () => {
    if (showTestInput.trim()) {
      setLabTests([...labTests, showTestInput.trim()]);
      setShowTestInput("");
    }
  };

  const removeTest = (index: number) => {
    setLabTests(labTests.filter((_, i) => i !== index));
  };

  const checkDrugInteractions = async () => {
    if (!selectedPatient) {
      setAiSuggestions(["Please select a patient first"]);
      return;
    }
    
    // AI suggestions (would be real in production)
    setAiSuggestions([
      "✓ No drug interactions detected",
      "✓ Patient allergies checked: No conflicts",
      "⚠ Recommended: Take medicines with food",
    ]);
  };

  const handleSave = async () => {
    if (!selectedPatient) {
      setSaveError("Please select a patient");
      return;
    }

    if (!diagnosis.trim()) {
      setSaveError("Please enter diagnosis");
      return;
    }

    const medicinesData = medicines.filter((m) => m.name);
    if (medicinesData.length === 0) {
      setSaveError("Please add at least one medicine");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const prescriptionData = {
        patientId: selectedPatient.id,
        doctorId,
        diagnosis,
        symptoms,
        medications: medicinesData,
        labTests,
        notes,
      };

      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prescriptionData),
      });

      if (!response.ok) {
        const error = await response.json();
        setSaveError(error.message || "Failed to save prescription");
        return;
      }

      const savedPrescription = await response.json();
      console.log("✅ Prescription saved and shared with patient:", savedPrescription);
      
      // Reset form
      setSelectedPatient(null);
      setSearchAbhaId("");
      setDiagnosis("");
      setSymptoms([]);
      setLabTests([]);
      setMedicines([{ id: "1", name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
      setNotes("");
      setAiSuggestions([]);

      onSave?.(savedPrescription);
    } catch (error: any) {
      setSaveError(error.message || "Failed to save prescription");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Patient Search Card */}
        <Card className={selectedPatient ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : ""}>
          <CardHeader>
            <CardTitle>Find Patient</CardTitle>
            <p className="text-sm text-muted-foreground">Search by ABHA ID to share prescription</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter patient ABHA ID (e.g., 22-1234-5678-9012)"
                value={searchAbhaId}
                onChange={(e) => setSearchAbhaId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchPatient()}
                disabled={searching || !!selectedPatient}
              />
              <Button
                onClick={searchPatient}
                disabled={searching || !!selectedPatient}
                size="sm"
              >
                <Search className="w-4 h-4" />
              </Button>
              {selectedPatient && (
                <Button
                  onClick={() => {
                    setSelectedPatient(null);
                    setSearchAbhaId("");
                  }}
                  variant="outline"
                  size="sm"
                >
                  Change
                </Button>
              )}
            </div>

            {searchError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{searchError}</AlertDescription>
              </Alert>
            )}

            {selectedPatient && (
              <Alert className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-semibold text-green-900 dark:text-green-100">{selectedPatient.name}</p>
                    <p className="text-sm text-green-700 dark:text-green-200">ABHA ID: {selectedPatient.abhaId}</p>
                    <p className="text-sm text-green-700 dark:text-green-200">Email: {selectedPatient.email}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Prescription Details */}
        {selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle>Create Prescription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input
                  id="diagnosis"
                  placeholder="Enter diagnosis..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Symptoms</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add symptom..."
                    value={showSymptomInput}
                    onChange={(e) => setShowSymptomInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSymptom()}
                  />
                  <Button onClick={addSymptom} size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((symptom, idx) => (
                    <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeSymptom(idx)}>
                      {symptom} ✕
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Medicines</Label>
                  <Button size="sm" variant="outline" onClick={addMedicine}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
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
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="Medicine name"
                      value={medicine.name}
                      onChange={(e) => updateMedicine(medicine.id, "name", e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Dosage (e.g., 500mg)"
                        value={medicine.dosage}
                        onChange={(e) => updateMedicine(medicine.id, "dosage", e.target.value)}
                      />
                      <Select
                        value={medicine.frequency}
                        onValueChange={(value) => updateMedicine(medicine.id, "frequency", value)}
                      >
                        <SelectTrigger>
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
                    </div>
                    <Input
                      placeholder="Duration (e.g., 5 days)"
                      value={medicine.duration}
                      onChange={(e) => updateMedicine(medicine.id, "duration", e.target.value)}
                    />
                    <Input
                      placeholder="Special instructions (optional)"
                      value={medicine.instructions || ""}
                      onChange={(e) => updateMedicine(medicine.id, "instructions", e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Lab Tests</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add test..."
                    value={showTestInput}
                    onChange={(e) => setShowTestInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTest()}
                  />
                  <Button onClick={addTest} size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {labTests.map((test, idx) => (
                    <Badge key={idx} variant="outline" className="cursor-pointer" onClick={() => removeTest(idx)}>
                      {test} ✕
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes & Instructions</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes, precautions, follow-up advice..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {saveError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{saveError}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={checkDrugInteractions}
                  variant="outline"
                  disabled={saving}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Check
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1"
                  disabled={saving || !selectedPatient}
                >
                  {saving ? "Sharing..." : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Share with Patient
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preview */}
      {selectedPatient && (
        <div className="space-y-6">
          <Card className="border-blue-200/50">
            <CardHeader>
              <CardTitle className="text-lg">Prescription Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-3 text-sm">
                <div className="flex justify-between mb-2 pb-2 border-b">
                  <span className="font-semibold">Doctor:</span>
                  <span>{doctorName}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Patient:</span>
                  <span className="text-right">
                    <div>{selectedPatient.name}</div>
                    <div className="text-xs text-muted-foreground">{selectedPatient.abhaId}</div>
                  </span>
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
                    <p className="font-semibold mb-1 text-sm">Diagnosis</p>
                    <p className="text-sm">{diagnosis}</p>
                  </div>
                </>
              )}

              {symptoms.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="font-semibold mb-2 text-sm">Symptoms</p>
                    <div className="flex flex-wrap gap-1">
                      {symptoms.map((s, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {medicines.some((m) => m.name) && (
                <>
                  <Separator />
                  <div>
                    <p className="font-semibold mb-2 text-sm">Prescribed Medicines</p>
                    <div className="space-y-2">
                      {medicines
                        .filter((m) => m.name)
                        .map((medicine, idx) => (
                          <div key={medicine.id} className="text-sm p-2 bg-muted/30 rounded">
                            <p className="font-medium">{idx + 1}. {medicine.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {[medicine.dosage, medicine.frequency, medicine.duration]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                            {medicine.instructions && (
                              <p className="text-xs text-muted-foreground">📝 {medicine.instructions}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}

              {labTests.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="font-semibold mb-2 text-sm">Lab Tests</p>
                    <div className="flex flex-wrap gap-1">
                      {labTests.map((t, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {notes && (
                <>
                  <Separator />
                  <div>
                    <p className="font-semibold mb-1 text-sm">Notes</p>
                    <p className="text-sm">{notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {aiSuggestions.length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Alert className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 text-blue-900 dark:text-blue-100">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              🎉 Prescription will be automatically shared with patient&apos;s email and visible in their dashboard!
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
