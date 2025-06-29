import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, calculateAge, getInitials } from "@/lib/utils";
import PatientModal from "@/components/PatientModal";
import type { Patient } from "@shared/schema";

export default function Patients() {
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>();

  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const filteredPatients = patients?.filter(patient =>
    patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phoneNumber.includes(searchQuery) ||
    (patient.email && patient.email.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsPatientModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPatientModalOpen(false);
    setEditingPatient(undefined);
  };

  if (isLoading) {
    return <div>Loading patients...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Patients</h1>
            <p className="text-sm lg:text-base text-slate-600">Manage patient records and information</p>
          </div>
          <Button 
            onClick={() => setIsPatientModalOpen(true)}
            className="medical-blue-500 text-white hover:medical-blue-600 text-sm lg:text-base"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search patients by name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm lg:text-base"
                />
              </div>
              <Button variant="outline" size="sm" className="text-sm lg:text-base">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="text-lg lg:text-xl">All Patients ({filteredPatients.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Age</th>
                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Gender</th>
                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Last Visit</th>
                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50">
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar className="mr-2 lg:mr-3 w-8 h-8 lg:w-10 lg:h-10">
                            <AvatarFallback className="medical-blue-100 text-medical-blue-600 text-xs lg:text-sm">
                              {getInitials(patient.firstName, patient.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-xs lg:text-sm font-medium text-slate-900">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-xs text-slate-500">
                              ID: P-{patient.id.toString().padStart(4, '0')}
                            </div>
                            {patient.email && (
                              <div className="text-xs text-slate-500 hidden lg:block">{patient.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-slate-900 hidden sm:table-cell">
                        {calculateAge(patient.dateOfBirth)}
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-slate-900 capitalize hidden md:table-cell">
                        {patient.gender}
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-slate-900">
                        {patient.phoneNumber}
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-slate-900 hidden lg:table-cell">
                        {formatDate(patient.createdAt)}
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden md:table-cell">
                        <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm font-medium">
                        <div className="flex items-center space-x-1 lg:space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditPatient(patient)}
                          >
                            <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 lg:px-6 py-6 lg:py-8 text-center text-slate-500 text-sm">
                        {searchQuery ? "No patients found matching your search." : "No patients found. Add your first patient to get started."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <PatientModal 
        isOpen={isPatientModalOpen} 
        onClose={handleCloseModal}
        patient={editingPatient}
      />
    </>
  );
}
