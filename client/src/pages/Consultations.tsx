import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Eye, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDateTime, getInitials } from "@/lib/utils";
import ConsultationModal from "@/components/ConsultationModal";
import type { Consultation, Patient } from "@shared/schema";

export default function Consultations() {
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingConsultation, setEditingConsultation] = useState<Consultation | undefined>();

  const { data: consultations, isLoading } = useQuery<Consultation[]>({
    queryKey: ["/api/consultations"],
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const getPatient = (patientId: number) => {
    return patients?.find(p => p.id === patientId);
  };

  const getConsultationStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredConsultations = consultations?.filter(consultation => {
    const patient = getPatient(consultation.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : '';
    
    return patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           consultation.consultationType.toLowerCase().includes(searchQuery.toLowerCase()) ||
           consultation.status.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const handleEditConsultation = (consultation: Consultation) => {
    setEditingConsultation(consultation);
    setIsConsultationModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsConsultationModalOpen(false);
    setEditingConsultation(undefined);
  };

  if (isLoading) {
    return <div>Loading consultations...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Consultations</h1>
            <p className="text-slate-600">Manage appointments and consultation records</p>
          </div>
          <Button 
            onClick={() => setIsConsultationModalOpen(true)}
            className="medical-blue-500 text-white hover:medical-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Consultation
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search consultations by patient, type, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Consultations Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Consultations ({filteredConsultations.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Diagnosis</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredConsultations.map((consultation) => {
                    const patient = getPatient(consultation.patientId);
                    return (
                      <tr key={consultation.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="mr-3">
                              <AvatarFallback className="medical-blue-100 text-medical-blue-600">
                                {patient ? getInitials(patient.firstName, patient.lastName) : 'UK'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                              </div>
                              <div className="text-sm text-slate-500">
                                ID: C-{consultation.id.toString().padStart(4, '0')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                            <div>
                              <div className="text-sm text-slate-900">
                                {formatDateTime(consultation.appointmentDate)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {consultation.consultationType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getConsultationStatusColor(consultation.status)}>
                            {consultation.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {consultation.diagnosis || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditConsultation(consultation)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredConsultations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        {searchQuery ? "No consultations found matching your search." : "No consultations found. Schedule your first consultation to get started."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConsultationModal 
        isOpen={isConsultationModalOpen} 
        onClose={handleCloseModal}
        consultation={editingConsultation}
      />
    </>
  );
}
