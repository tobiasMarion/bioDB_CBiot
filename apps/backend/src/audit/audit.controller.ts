import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query
} from '@nestjs/common'
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { Auth, CurrentUser } from '../auth/authentication.guard'
import type { User } from '../auth/types/user.type'
import { AuditAction, AuditEntityType } from '../common/prisma/generated/client'
import { AuditService } from './audit.service'

@ApiTags('Audit')
@Controller()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  // Endpoint para admins — sem restrição de entityType
  @Get('audit-logs')
  @Auth()
  @ApiOperation({
    summary: 'List all audit logs (admin)',
    description: 'Returns all audit logs in the system. Requires admin role.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions. Requires admin.' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            entityType: 'SAMPLE',
            entityId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
            action: 'UPDATE',
            changes: { name: { from: 'Sample A', to: 'Sample B' } },
            performedBy: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
            createdAt: '2026-06-05T22:15:39.932Z',
            user: { id: 'c3d4e5f6-a7b8-9012-cdef-123456789012', name: 'João Silva', email: 'joao@example.com' }
          }
        ],
        total: 42,
        page: 1,
        pageSize: 50
      }
    }
  })
  @ApiQuery({ name: 'entityType', enum: AuditEntityType, required: false })
  @ApiQuery({ name: 'entityId', required: false, description: 'Exact entity UUID' })
  @ApiQuery({ name: 'action', enum: AuditAction, required: false })
  @ApiQuery({ name: 'performedBy', required: false, description: 'User UUID' })
  @ApiQuery({ name: 'search', required: false, description: 'Sample name (also returns related tube logs)' })
  @ApiQuery({ name: 'from', required: false, description: 'ISO date string (start of range)' })
  @ApiQuery({ name: 'to', required: false, description: 'ISO date string (end of range)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findAllAdmin(
    @CurrentUser() user: User,
    @Query('entityType') entityType?: AuditEntityType,
    @Query('entityId') entityId?: string,
    @Query('action') action?: AuditAction,
    @Query('performedBy') performedBy?: string,
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('pageSize', new DefaultValuePipe(50), ParseIntPipe) pageSize?: number,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    return this.auditService.findAllAdmin(user, {
      entityType,
      entityId,
      action,
      performedBy,
      search,
      from,
      to,
      page,
      pageSize,
      sortOrder,
    })
  }

  // Endpoint para líderes de grupo — restrito ao groupId da URL
  @Get('groups/:groupId/audit')
  @Auth()
  @ApiOperation({
    summary: 'List audit logs for a group',
    description: 'Returns audit logs for a specific group. Requires LEADER role.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions. Requires LEADER role.' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            entityType: 'SAMPLE',
            entityId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
            action: 'CREATE',
            changes: { name: 'Sample A', type: 'DNA', originOrganism: 'Homo sapiens', sourceLab: 'Lab A' },
            performedBy: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
            createdAt: '2026-06-05T22:15:39.932Z',
            user: { id: 'c3d4e5f6-a7b8-9012-cdef-123456789012', name: 'João Silva', email: 'joao@example.com' }
          }
        ],
        total: 15,
        page: 1,
        pageSize: 50
      }
    }
  })
  @ApiQuery({ name: 'entityType', enum: AuditEntityType, required: false })
  @ApiQuery({ name: 'entityId', required: false, description: 'Exact entity UUID' })
  @ApiQuery({ name: 'action', enum: AuditAction, required: false })
  @ApiQuery({ name: 'performedBy', required: false, description: 'User UUID' })
  @ApiQuery({ name: 'search', required: false, description: 'Sample name (also returns related tube logs)' })
  @ApiQuery({ name: 'from', required: false, description: 'ISO date string (start of range)' })
  @ApiQuery({ name: 'to', required: false, description: 'ISO date string (end of range)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findAllByGroup(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
    @Query('entityType') entityType?: AuditEntityType,
    @Query('entityId') entityId?: string,
    @Query('action') action?: AuditAction,
    @Query('performedBy') performedBy?: string,
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('pageSize', new DefaultValuePipe(50), ParseIntPipe) pageSize?: number,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    return this.auditService.findAllByGroup(groupId, user, {
      entityType,
      entityId,
      action,
      performedBy,
      search,
      from,
      to,
      page,
      pageSize,
      sortOrder,
    })
  }
}
