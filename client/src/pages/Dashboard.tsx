import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, FileText, DollarSign, CalendarCheck, Plus, UserPlus, Pill, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, formatTime, calculateAge, getInitials } from "@/lib/utils";
import { useState } from "react";
import PatientModal from "@/components/PatientModal";
import type { Patient, Consultation } from "@shared/schema";

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  completedToday: number;
  remainingToday: number;
  pendingReports: number;
  monthlyRevenue: number;
}

export default function Dashboard() {
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentPatients, isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: todayConsultations, isLoading: consultationsLoading } = useQuery<Consultation[]>({
    queryKey: ["/api/consultations/today"],
  });

  const { data: allPatients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Get patient names for consultations
  const getPatientName = (patientId: number) => {
    const patient = allPatients?.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient";
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

  const getConditionColor = (condition: string) => {
    if (condition?.toLowerCase().includes('routine') || condition?.toLowerCase().includes('checkup')) {
      return 'bg-green-100 text-green-800';
    }
    if (condition?.toLowerCase().includes('follow')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-red-100 text-red-800';
  };

  if (statsLoading || patientsLoading || consultationsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Patients</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.totalPatients || 0}</p>
              </div>
              <div className="w-12 h-12 medical-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-medical-blue-500 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-medical-green-600 text-sm font-medium">+5.2%</span>
              <span className="text-slate-500 text-sm ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Today's Appointments</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.todayAppointments || 0}</p>
              </div>
              <div className="w-12 h-12 medical-green-100 rounded-lg flex items-center justify-center">
                <CalendarCheck className="text-medical-green-500 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-slate-500 text-sm">
                {stats?.completedToday || 0} completed, {stats?.remainingToday || 0} remaining
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Reports</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.pendingReports || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="text-yellow-500 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-yellow-600 text-sm font-medium">Urgent: 2</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Revenue (Month)</p>
                <p className="text-3xl font-bold text-slate-900">${stats?.monthlyRevenue?.toLocaleString() || '0'}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-500 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-600 text-sm font-medium">+12.3%</span>
              <span className="text-slate-500 text-sm ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Patients */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Patients</CardTitle>
                <Button 
                  onClick={() => setIsPatientModalOpen(true)}
                  className="medical-blue-500 text-white hover:medical-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Patient
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Age</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Visit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Condition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {recentPatients?.slice(0, 5).map((patient) => (
                      <tr key={patient.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="mr-3">
                              <AvatarFallback className="medical-blue-100 text-medical-blue-600">
                                {getInitials(patient.firstName, patient.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {patient.firstName} {patient.lastName}
                              </div>
                              <div className="text-sm text-slate-500">ID: P-{patient.id.toString().padStart(4, '0')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {calculateAge(patient.dateOfBirth)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {formatDate(patient.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getConditionColor("Routine Checkup")}>
                            Routine Checkup
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="link" className="text-medical-blue-600 hover:text-medical-blue-800 mr-3">
                            View
                          </Button>
                          <Button variant="link" className="text-slate-600 hover:text-slate-800">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {(!recentPatients || recentPatients.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          No patients found. Add your first patient to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <div>
          <Card>
            <CardHeader className="border-b border-slate-200">
              <CardTitle>Today's Schedule</CardTitle>
              <p className="text-sm text-slate-500 mt-1">{formatDate(new Date())}</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {todayConsultations?.map((consultation) => (
                  <div key={consultation.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 medical-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">
                          {formatTime(consultation.appointmentDate)}
                        </p>
                        <Badge className={getConsultationStatusColor(consultation.status)}>
                          {consultation.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {getPatientName(consultation.patientId)}
                      </p>
                      <p className="text-xs text-slate-500">{consultation.consultationType}</p>
                    </div>
                  </div>
                ))}
                {(!todayConsultations || todayConsultations.length === 0) && (
                  <p className="text-center text-slate-500 py-4">No appointments scheduled for today</p>
                )}
              </div>
            </CardContent>
            <div className="p-6 border-t border-slate-200">
              <Button variant="outline" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader className="border-b border-slate-200">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start medical-blue-50 text-medical-blue-700 hover:medical-blue-100"
                  onClick={() => setIsPatientModalOpen(true)}
                >
                  <UserPlus className="w-4 h-4 mr-3" />
                  New Patient Registration
                </Button>
                <Button variant="outline" className="w-full justify-start medical-green-50 text-medical-green-700 hover:medical-green-100">
                  <Pill className="w-4 h-4 mr-3" />
                  Prescription Management
                </Button>
                <Button variant="outline" className="w-full justify-start bg-purple-50 text-purple-700 hover:bg-purple-100">
                  <TrendingUp className="w-4 h-4 mr-3" />
                  Generate Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <PatientModal 
        isOpen={isPatientModalOpen} 
        onClose={() => setIsPatientModalOpen(false)} 
      />
    </>
  );
}
