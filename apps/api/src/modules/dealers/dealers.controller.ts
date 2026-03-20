import { Response, NextFunction } from 'express';
import { dealersService } from './dealers.service';
import { CreateDealerDto, UpdateDealerDto, PaginationDto } from './dealers.dto';
import { AuthRequest } from '../../middleware/auth.middleware';

/** Dealers controller handling HTTP requests for dealer management */
export const dealersController = {
  /**
   * GET /api/v1/dealers
   * Lists all dealers with pagination and filtering.
   */
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = PaginationDto.parse(req.query);
      const result = await dealersService.findAll(query);
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  /**
   * POST /api/v1/dealers
   * Creates a new dealer record.
   */
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = CreateDealerDto.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.message, code: 'VALIDATION_ERROR' });
        return;
      }
      const dealer = await dealersService.create(parsed.data);
      res.status(201).json({ success: true, data: dealer });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/v1/dealers/:id
   * Retrieves a single dealer by ID.
   */
  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dealer = await dealersService.findById(req.params['id']!);
      res.status(200).json({ success: true, data: dealer });
    } catch (err) { next(err); }
  },

  /**
   * PATCH /api/v1/dealers/:id
   * Updates a dealer's details.
   */
  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = UpdateDealerDto.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.message, code: 'VALIDATION_ERROR' });
        return;
      }
      const dealer = await dealersService.update(req.params['id']!, parsed.data);
      res.status(200).json({ success: true, data: dealer });
    } catch (err) { next(err); }
  },

  /**
   * POST /api/v1/dealers/:id/approve
   * Approves a pending dealer.
   */
  async approve(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dealer = await dealersService.approve(req.params['id']!, req.user!.id);
      res.status(200).json({ success: true, data: dealer });
    } catch (err) { next(err); }
  },

  /**
   * POST /api/v1/dealers/:id/suspend
   * Suspends an active dealer.
   */
  async suspend(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dealer = await dealersService.suspend(req.params['id']!);
      res.status(200).json({ success: true, data: dealer });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/v1/dealers/:id/transactions
   * Lists all transactions for a specific dealer.
   */
  async transactions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = PaginationDto.parse(req.query);
      const result = await dealersService.getTransactions(req.params['id']!, query);
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  },
};
