import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const prescriptionSchema = z.object({
  patientAbhaId: z.string().min(1, "Patient ABHA ID is required"),
  patientId: z.string().optional(),
  medicines: z.array(z.object({
    name: z.string().min(1, "Medicine name is required"),
    dosage: z.string().min(1, "Dosage is required"),
    frequency: z.string().min(1, "Frequency is required"),
    duration: z.string().min(1, "Duration is required"),
  })).min(1, "At least one medicine is required"),
  instructions: z.string().optional(),
});

interface PrescriptionModalProps {
  onClose: () => void;
  doctorId: string;
}

export default function PrescriptionModal({ onClose, doctorId }: PrescriptionModalProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof prescriptionSchema>>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientAbhaId: "",
      medicines: [{ name: "", dosage: "", frequency: "", duration: "" }],
      instructions: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medicines",
  });

  // Create prescription mutation
  const createPrescriptionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof prescriptionSchema>) => {
      const res = await apiRequest("POST", "/api/doctor/prescriptions", {
        patientId: data.patientId,
        patientAbhaId: data.patientAbhaId,
        medicines: data.medicines,
        instructions: data.instructions,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/prescriptions"] });
      toast({
        title: "Prescription created",
        description: "Prescription has been created and sent to patient",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to create prescription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof prescriptionSchema>) => {
    (async () => {
      const payload = { ...data } as any;
      // If only ABHA ID provided, try to resolve to local patientId first
      if (!payload.patientId && payload.patientAbhaId) {
        try {
          const res = await apiRequest('GET', `/api/abha/patient/${payload.patientAbhaId}`);
          if (res.ok) {
            const patient = await res.json();
            if (patient?.id) payload.patientId = patient.id;
          }
        } catch (e: any) {
          // ignore - we'll let mutation validate
        }
      }

      createPrescriptionMutation.mutate(payload);
    })();
  };

  const addMedicine = () => {
    append({ name: "", dosage: "", frequency: "", duration: "" });
  };

  const removeMedicine = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-card-foreground">Create Prescription</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Patient Selection */}
              <FormField
                control={form.control}
                name="patientAbhaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient ABHA ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter or search ABHA ID" 
                        {...field}
                        data-testid="input-patient-abha"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Medicines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Medicines</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMedicine}
                    data-testid="button-add-medicine"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Medicine
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="border border-border">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Medicine {index + 1}</span>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMedicine(index)}
                              className="h-6 w-6"
                              data-testid={`button-remove-medicine-${index}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`medicines.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="mb-2">
                              <FormControl>
                                <Input 
                                  placeholder="Medicine name" 
                                  {...field}
                                  data-testid={`input-medicine-name-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-3 gap-2">
                          <FormField
                            control={form.control}
                            name={`medicines.${index}.dosage`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    placeholder="Dosage" 
                                    {...field}
                                    data-testid={`input-medicine-dosage-${index}`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`medicines.${index}.frequency`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    placeholder="Frequency" 
                                    {...field}
                                    data-testid={`input-medicine-frequency-${index}`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`medicines.${index}.duration`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    placeholder="Duration" 
                                    {...field}
                                    data-testid={`input-medicine-duration-${index}`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Special instructions for patient" 
                        className="resize-none h-20"
                        {...field}
                        data-testid="textarea-instructions"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button 
                  type="submit"
                  disabled={createPrescriptionMutation.isPending}
                  className="flex-1 bg-secondary hover:bg-secondary/90"
                  data-testid="button-save-prescription"
                >
                  {createPrescriptionMutation.isPending ? "Creating..." : "Save & Send to Patient"}
                </Button>
                <Button 
                  type="submit"
                  disabled={createPrescriptionMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  data-testid="button-upload-abdm"
                >
                  {createPrescriptionMutation.isPending ? "Uploading..." : "Upload to ABDM"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
