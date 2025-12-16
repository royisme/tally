import { z } from "zod";

export const invoiceEmailSettingsSchema = z.object({
  provider: z.enum(["mailto", "resend", "smtp"]),
  from: z
    .string()
    .min(1, "Required")
    .regex(
      /^([^<]+<[^>]+>|[^@\s]+@[^@\s]+\.[^@\s]+)$/,
      "Invalid sender format. Use 'Name <email@domain.com>' or 'email@domain.com'"
    ),
  replyTo: z.string().optional(),
  resendApiKey: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().int().optional(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpUseTls: z.boolean().optional(),
  subjectTemplate: z.string().optional(),
  bodyTemplate: z.string().optional(),
  signature: z.string().optional(),
});

export const financeSettingsSchema = z.object({
  defaultAccountId: z.number().optional(),
  autoCategorize: z.boolean(),
  autoReconcile: z.boolean(),
  userId: z.number(),
});

export const generalSettingsSchema = z.object({
  currency: z.string().min(1, "Currency is required"),
  defaultTaxRate: z.number().min(0).max(1),
  dateFormat: z.string().min(1, "Date format is required"),
  timezone: z.string().min(1, "Timezone is required"),
  language: z.string(),
  theme: z.string(),
});

export const profileSettingsSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  avatarUrl: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const invoiceSettingsSchema = z.object({
  invoiceTerms: z.string().optional(),
  defaultMessageTemplate: z.string().optional(),
  senderName: z.string().optional(),
  senderCompany: z.string().optional(),
  senderAddress: z.string().optional(),
  senderPostalCode: z.string().optional(),
  senderPhone: z.string().optional(),
  senderEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  hstRegistered: z.boolean(),
  hstNumber: z.string().optional(),
  expectedIncome: z.string().optional(),
  taxEnabled: z.boolean(),
});
