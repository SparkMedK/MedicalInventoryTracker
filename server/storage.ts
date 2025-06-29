import { patients, consultations, type Patient, type InsertPatient, type Consultation, type InsertConsultation } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lt, or, ilike, sql } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients).orderBy(desc(patients.createdAt));
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db
      .insert(patients)
      .values(insertPatient)
      .returning();
    return patient;
  }

  async updatePatient(id: number, patientUpdate: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [patient] = await db
      .update(patients)
      .set(patientUpdate)
      .where(eq(patients.id, id))
      .returning();
    return patient || undefined;
  }

  async deletePatient(id: number): Promise<boolean> {
    // Delete related consultations first
    await db.delete(consultations).where(eq(consultations.patientId, id));
    
    const result = await db.delete(patients).where(eq(patients.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return await db.select().from(patients).where(
      or(
        ilike(patients.firstName, `%${query}%`),
        ilike(patients.lastName, `%${query}%`),
        ilike(patients.phoneNumber, `%${query}%`),
        ilike(patients.email, `%${query}%`)
      )
    );
  }

  async getConsultation(id: number): Promise<Consultation | undefined> {
    const [consultation] = await db.select().from(consultations).where(eq(consultations.id, id));
    return consultation || undefined;
  }

  async getConsultations(): Promise<Consultation[]> {
    return await db.select().from(consultations).orderBy(desc(consultations.appointmentDate));
  }

  async getConsultationsByPatient(patientId: number): Promise<Consultation[]> {
    return await db
      .select()
      .from(consultations)
      .where(eq(consultations.patientId, patientId))
      .orderBy(desc(consultations.appointmentDate));
  }

  async createConsultation(insertConsultation: InsertConsultation): Promise<Consultation> {
    const [consultation] = await db
      .insert(consultations)
      .values(insertConsultation)
      .returning();
    return consultation;
  }

  async updateConsultation(id: number, consultationUpdate: Partial<InsertConsultation>): Promise<Consultation | undefined> {
    const [consultation] = await db
      .update(consultations)
      .set(consultationUpdate)
      .where(eq(consultations.id, id))
      .returning();
    return consultation || undefined;
  }

  async deleteConsultation(id: number): Promise<boolean> {
    const result = await db.delete(consultations).where(eq(consultations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getTodayConsultations(): Promise<Consultation[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return await db
      .select()
      .from(consultations)
      .where(
        sql`DATE(${consultations.appointmentDate}) = CURRENT_DATE`
      )
      .orderBy(consultations.appointmentDate);
  }
}

export const storage = new DatabaseStorage();
