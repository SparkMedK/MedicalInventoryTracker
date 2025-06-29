import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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
}).extend({
  // Transform nullable string fields to empty strings for forms
  email: z.string().nullish().transform(val => val || ""),
  address: z.string().nullish().transform(val => val || ""),
  bloodType: z.string().nullish().transform(val => val || ""),
  emergencyContact: z.string().nullish().transform(val => val || ""),
  allergies: z.string().nullish().transform(val => val || ""),
  currentMedications: z.string().nullish().transform(val => val || ""),
  insuranceProvider: z.string().nullish().transform(val => val || ""),
  policyNumber: z.string().nullish().transform(val => val || ""),
});

export const insertConsultationSchema = createInsertSchema(consultations).omit({
  id: true,
  createdAt: true,
}).extend({
  // Transform nullable string fields to empty strings for forms
  notes: z.string().nullish().transform(val => val || ""),
  diagnosis: z.string().nullish().transform(val => val || ""),
  treatment: z.string().nullish().transform(val => val || ""),
  prescriptions: z.string().nullish().transform(val => val || ""),
  followUpDate: z.string().nullish().transform(val => val || ""),
});

// Relations
export const patientsRelations = relations(patients, ({ many }) => ({
  consultations: many(consultations),
}));

export const consultationsRelations = relations(consultations, ({ one }) => ({
  patient: one(patients, {
    fields: [consultations.patientId],
    references: [patients.id],
  }),
}));

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Consultation = typeof consultations.$inferSelect;
