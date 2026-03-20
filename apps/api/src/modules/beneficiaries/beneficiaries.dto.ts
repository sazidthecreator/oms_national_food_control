import { z } from 'zod';

export const CreateBeneficiaryDto = z.object({
  beneficiaryCode: z.string().min(1),
  name: z.string().min(1),
  nameBn: z.string().optional(),
  nid: z.string().min(10),
  phone: z.string().optional(),
  area: z.string().min(1),
  officeId: z.string().min(1),
  programId: z.string().optional(),
  category: z.enum(['WIDOW', 'ELDERLY', 'POOR_FAMILY', 'DISABLED']),
  monthlyQuotaKg: z.number().positive(),
});

export const UpdateBeneficiaryDto = CreateBeneficiaryDto.partial();

export const PaginationDto = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.enum(['WIDOW', 'ELDERLY', 'POOR_FAMILY', 'DISABLED']).optional(),
});

export type CreateBeneficiaryInput = z.infer<typeof CreateBeneficiaryDto>;
export type UpdateBeneficiaryInput = z.infer<typeof UpdateBeneficiaryDto>;
export type PaginationInput = z.infer<typeof PaginationDto>;
