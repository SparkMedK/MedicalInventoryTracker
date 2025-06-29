import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: text("gender").notNull(), // 'male', 'female', 'other'
  phoneNumber: text("phone_number").notNull(),
  email: text("email"),
  address: text("address"),
  bloodType: text("blood_type"),
  emergencyContact: text("emergency_contact"),
  allergies: text("allergies"),
  currentMedications: text("current_medications"),
  insuranceProvider: text("insurance_provider"),
  policyNumber: text("policy_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  appointmentDate: timestamp("appointment_date").notNull(),
  consultationType: text("consultation_type").notNull(),
  status: text("status").notNull(), // 'scheduled', 'in-progress', 'completed', 'cancelled'
  notes: text("notes"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  prescriptions: text("prescriptions"),
  followUpDate: date("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
});

export const insertConsultationSchema = createInsertSchema(consultations).omit({
  id: true,
  createdAt: true,
});

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Consultation = typeof consultations.$inferSelect;
