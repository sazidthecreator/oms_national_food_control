import { Response, NextFunction } from 'express';
import { beneficiariesService } from './beneficiaries.service';
import { CreateBeneficiaryDto, UpdateBeneficiaryDto, PaginationDto } from './beneficiaries.dto';
import { AuthRequest } from '../../middleware/auth.middleware';

/** Beneficiaries controller */
export const beneficiariesController = {
  /** GET /api/v1/beneficiaries */
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = PaginationDto.parse(req.query);
      const result = await beneficiariesService.findAll(query);
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  /** POST /api/v1/beneficiaries */
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = CreateBeneficiaryDto.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.message, code: 'VALIDATION_ERROR' });
        return;
      }
      const b = await beneficiariesService.create(parsed.data);
      res.status(201).json({ success: true, data: b });
    } catch (err) { next(err); }
  },

  /** GET /api/v1/beneficiaries/:id */
  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const b = await beneficiariesService.findById(req.params['id']!);
      res.status(200).json({ success: true, data: b });
    } catch (err) { next(err); }
  },

  /** GET /api/v1/beneficiaries/:code/quota-status */
  async quotaStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await beneficiariesService.getQuotaStatus(req.params['code']!);
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  /** POST /api/v1/beneficiaries/:id/face-enroll */
  async faceEnroll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // In production, face embedding data comes from the biometric device
      const faceData = Buffer.from(JSON.stringify(req.body.embedding ?? {}));
      const b = await beneficiariesService.enrollFace(req.params['id']!, faceData);
      res.status(200).json({ success: true, data: { id: b.id, enrolledAt: b.enrolledAt } });
    } catch (err) { next(err); }
  },
};

// Satisfy TypeScript — UpdateBeneficiaryDto is available for future use
export { UpdateBeneficiaryDto };
