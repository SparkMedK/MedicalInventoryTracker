import { patients, consultations, type Patient, type InsertPatient, type Consultation, type InsertConsultation } from "@shared/schema";

export interface IStorage {
  // Patient methods
  getPatient(id: number): Promise<Patient | undefined>;
  getPatients(): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;
  searchPatients(query: string): Promise<Patient[]>;

  // Consultation methods
  getConsultation(id: number): Promise<Consultation | undefined>;
  getConsultations(): Promise<Consultation[]>;
  getConsultationsByPatient(patientId: number): Promise<Consultation[]>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultation(id: number, consultation: Partial<InsertConsultation>): Promise<Consultation | undefined>;
  deleteConsultation(id: number): Promise<boolean>;
  getTodayConsultations(): Promise<Consultation[]>;
}

export class MemStorage implements IStorage {
  private patients: Map<number, Patient>;
  private consultations: Map<number, Consultation>;
  private currentPatientId: number;
  private currentConsultationId: number;

  constructor() {
    this.patients = new Map();
    this.consultations = new Map();
    this.currentPatientId = 1;
    this.currentConsultationId = 1;
  }

  // Patient methods
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.currentPatientId++;
    const patient: Patient = { 
      ...insertPatient, 
      id, 
      createdAt: new Date() 
    };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: number, patientUpdate: Partial<InsertPatient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    const updatedPatient = { ...patient, ...patientUpdate };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async deletePatient(id: number): Promise<boolean> {
    // Also delete related consultations
    const consultationsToDelete = Array.from(this.consultations.values())
      .filter(c => c.patientId === id);
    consultationsToDelete.forEach(c => this.consultations.delete(c.id));
    
    return this.patients.delete(id);
  }

  async searchPatients(query: string): Promise<Patient[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.patients.values()).filter(patient =>
      patient.firstName.toLowerCase().includes(lowerQuery) ||
      patient.lastName.toLowerCase().includes(lowerQuery) ||
      patient.phoneNumber.includes(query) ||
      (patient.email && patient.email.toLowerCase().includes(lowerQuery))
    );
  }

  // Consultation methods
  async getConsultation(id: number): Promise<Consultation | undefined> {
    return this.consultations.get(id);
  }

  async getConsultations(): Promise<Consultation[]> {
    return Array.from(this.consultations.values()).sort((a, b) => 
      new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
    );
  }

  async getConsultationsByPatient(patientId: number): Promise<Consultation[]> {
    return Array.from(this.consultations.values())
      .filter(consultation => consultation.patientId === patientId)
      .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
  }

  async createConsultation(insertConsultation: InsertConsultation): Promise<Consultation> {
    const id = this.currentConsultationId++;
    const consultation: Consultation = { 
      ...insertConsultation, 
      id, 
      createdAt: new Date() 
    };
    this.consultations.set(id, consultation);
    return consultation;
  }

  async updateConsultation(id: number, consultationUpdate: Partial<InsertConsultation>): Promise<Consultation | undefined> {
    const consultation = this.consultations.get(id);
    if (!consultation) return undefined;
    
    const updatedConsultation = { ...consultation, ...consultationUpdate };
    this.consultations.set(id, updatedConsultation);
    return updatedConsultation;
  }

  async deleteConsultation(id: number): Promise<boolean> {
    return this.consultations.delete(id);
  }

  async getTodayConsultations(): Promise<Consultation[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return Array.from(this.consultations.values())
      .filter(consultation => {
        const appointmentDate = new Date(consultation.appointmentDate);
        return appointmentDate >= startOfDay && appointmentDate < endOfDay;
      })
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  }
}

export const storage = new MemStorage();
