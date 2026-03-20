import { z } from 'zod';

export const VerifyDto = z.object({
  beneficiaryCode: z.string().min(1),
  dealerId: z.string().min(1),
  faceMatchScore: z.number().min(0).max(1),
});

export const DispenseDto = z.object({
  beneficiaryId: z.string().min(1),
  dealerId: z.string().min(1),
  programId: z.string().optional(),
  productType: z.enum(['RICE', 'FLOUR']),
  quantityKg: z.number().positive(),
  faceMatchScore: z.number().min(0).max(1).optional(),
  verificationMethod: z.enum(['FACE', 'EXCEPTION']),
});

export const ExceptionDto = z.object({
  beneficiaryId: z.string().min(1),
  dealerId: z.string().min(1),
  reason: z.string().min(1),
  authorizedBy: z.string().min(1),
});

export const SyncDto = z.object({
  items: z.array(z.object({
    beneficiaryId: z.string(),
    dealerId: z.string(),
    programId: z.string().optional(),
    productType: z.enum(['RICE', 'FLOUR']),
    quantityKg: z.number().positive(),
    verificationMethod: z.enum(['FACE', 'EXCEPTION']),
    offlineCreatedAt: z.string().datetime(),
    deviceId: z.string(),
  })),
});

export type VerifyInput = z.infer<typeof VerifyDto>;
export type DispenseInput = z.infer<typeof DispenseDto>;
export type ExceptionInput = z.infer<typeof ExceptionDto>;
export type SyncInput = z.infer<typeof SyncDto>;
