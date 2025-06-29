import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertConsultationSchema, type InsertConsultation, type Consultation, type Patient } from "@shared/schema";
import { z } from "zod";

// Form schema with string dates for HTML inputs
const consultationFormSchema = insertConsultationSchema.extend({
  appointmentDate: z.string().min(1, "Appointment date is required"),
  followUpDate: z.string().optional(),
});

type ConsultationFormData = z.infer<typeof consultationFormSchema>;

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation?: Consultation;
}

export default function ConsultationModal({ isOpen, onClose, consultation }: ConsultationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!consultation;

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: consultation ? {
      patientId: consultation.patientId,
      appointmentDate: new Date(consultation.appointmentDate).toISOString().slice(0, 16),
      consultationType: consultation.consultationType,
      status: consultation.status,
      notes: consultation.notes || "",
      diagnosis: consultation.diagnosis || "",
      treatment: consultation.treatment || "",
      prescriptions: consultation.prescriptions || "",
      followUpDate: consultation.followUpDate ? new Date(consultation.followUpDate).toISOString().slice(0, 10) : "",
    } : {
      patientId: 0,
      appointmentDate: "",
      consultationType: "",
      status: "scheduled",
      notes: "",
      diagnosis: "",
      treatment: "",
      prescriptions: "",
      followUpDate: "",
    },
  });

  const createConsultationMutation = useMutation({
    mutationFn: (data: ConsultationFormData) => {
      const payload = {
        ...data,
        appointmentDate: new Date(data.appointmentDate).toISOString(),
        followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString() : null,
      };
      return apiRequest("POST", "/api/consultations", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/consultations/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Consultation scheduled successfully",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule consultation",
        variant: "destructive",
      });
    },
  });

  const updateConsultationMutation = useMutation({
    mutationFn: (data: ConsultationFormData) => {
      const payload = {
        ...data,
        appointmentDate: new Date(data.appointmentDate).toISOString(),
        followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString() : null,
      };
      return apiRequest("PUT", `/api/consultations/${consultation?.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/consultations/today"] });
      toast({
        title: "Success",
        description: "Consultation updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update consultation",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ConsultationFormData) => {
    if (isEditing) {
      updateConsultationMutation.mutate(data);
    } else {
      createConsultationMutation.mutate(data);
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        <div className="flex items-center justify-between p-4 lg:p-6 border-b">
          <DialogTitle className="text-lg lg:text-xl font-semibold text-slate-900">
            {isEditing ? 'Edit Consultation' : 'Schedule Consultation'}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <DialogDescription className="sr-only">
          {isEditing ? 'Edit consultation details and medical information' : 'Schedule a new consultation with patient details and medical information'}
        </DialogDescription>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 lg:p-6 space-y-4 lg:space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-base lg:text-lg font-medium text-slate-900 mb-3 lg:mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients?.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id.toString()}>
                              {patient.firstName} {patient.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appointment Date & Time *</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="consultationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consultation Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select consultation type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="General Consultation">General Consultation</SelectItem>
                          <SelectItem value="Follow-up">Follow-up</SelectItem>
                          <SelectItem value="Routine Checkup">Routine Checkup</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                          <SelectItem value="Specialist Referral">Specialist Referral</SelectItem>
                          <SelectItem value="Lab Results Review">Lab Results Review</SelectItem>
                          <SelectItem value="Vaccination">Vaccination</SelectItem>
                          <SelectItem value="Physical Therapy">Physical Therapy</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Medical Details */}
            <div>
              <h4 className="text-base lg:text-lg font-medium text-slate-900 mb-3 lg:mb-4">Medical Details</h4>
              <div className="space-y-3 lg:space-y-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consultation Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter consultation notes, symptoms, observations..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosis</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter diagnosis details..."
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="treatment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treatment Plan</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter treatment plan and recommendations..."
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="prescriptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prescriptions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter prescribed medications, dosage, and instructions..."
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="followUpDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4 pt-4 lg:pt-6 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={handleClose} size="sm" className="text-sm lg:text-base">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="medical-blue-500 text-white hover:medical-blue-600 text-sm lg:text-base"
                size="sm"
                disabled={createConsultationMutation.isPending || updateConsultationMutation.isPending}
              >
                {(createConsultationMutation.isPending || updateConsultationMutation.isPending) 
                  ? "Saving..." 
                  : isEditing ? "Update Consultation" : "Schedule Consultation"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
