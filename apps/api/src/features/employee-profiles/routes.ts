import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware, requirePermission } from '../../middleware/auth';
import { EmployeeListQuerySchema, CreateEmployeeSchema } from './schema';
import { listEmployees, createEmployee, softDeleteEmployee } from './service';

export const employeeRoutes = new Hono();

employeeRoutes.use('*', authMiddleware);

employeeRoutes.get(
  '/',
  requirePermission('pegawai.read'),
  zValidator('query', EmployeeListQuerySchema),
  async (c) => {
    const query = c.req.valid('query');
    const result = await listEmployees(query);

    return c.json({
      success: true,
      message: 'Berhasil mengambil data pegawai',
      data: result.data,
      meta: {
        request_id: c.get('requestId'),
        timestamp: new Date().toISOString(),
        version: 'v1',
        pagination: result.pagination,
        sdi_metadata: {
          dataOwner: process.env.INSTANSI_NAME ?? 'Instansi',
          dataClassification: 'INTERNAL',
        },
      },
    });
  }
);

employeeRoutes.post(
  '/',
  requirePermission('pegawai.create'),
  zValidator('json', CreateEmployeeSchema),
  async (c) => {
    const actor = c.get('actor');
    const input = c.req.valid('json');
    const requestId = c.get('requestId');
    const ipAddress = c.req.header('x-forwarded-for') ?? c.req.header('cf-connecting-ip');

    const employee = await createEmployee(actor, input, requestId, ipAddress);

    return c.json(
      {
        success: true,
        message: 'Pegawai berhasil ditambahkan',
        data: { id: employee.id },
        meta: {
          request_id: requestId,
          timestamp: new Date().toISOString(),
          version: 'v1',
          pagination: null,
          sdi_metadata: null,
        },
      },
      201
    );
  }
);

employeeRoutes.delete(
  '/:id',
  requirePermission('pegawai.delete'),
  async (c) => {
    const actor = c.get('actor');
    const id = String(c.req.param('id'));
    const requestId = c.get('requestId');
    const ipAddress = c.req.header('x-forwarded-for');

    await softDeleteEmployee(actor, id, requestId, ipAddress);

    return c.json({
      success: true,
      message: 'Pegawai berhasil dihapus',
      data: null,
      meta: {
        request_id: requestId,
        timestamp: new Date().toISOString(),
        version: 'v1',
        pagination: null,
        sdi_metadata: null,
      },
    });
  }
);
