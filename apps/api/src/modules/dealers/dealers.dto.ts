import { z } from 'zod';

/** Dealer creation validation schema */
export const CreateDealerDto = z.object({
  dealerCode: z.string().min(1, 'Dealer code is required'),
  name: z.string().min(1, 'Name is required'),
  nameBn: z.string().optional(),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Invalid Bangladeshi phone number'),
  nid: z.string().min(10, 'NID must be at least 10 characters'),
  area: z.string().min(1, 'Area is required'),
  officeId: z.string().min(1, 'Office ID is required'),
});

/** Dealer update validation schema */
export const UpdateDealerDto = CreateDealerDto.partial();

/** Pagination query validation schema */
export const PaginationDto = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'CANCELLED']).optional(),
});

export type CreateDealerInput = z.infer<typeof CreateDealerDto>;
export type UpdateDealerInput = z.infer<typeof UpdateDealerDto>;
export type PaginationInput = z.infer<typeof PaginationDto>;
