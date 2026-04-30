import * as assert from 'node:assert'
import { describe, it } from 'node:test'
import { AuditAction, type AuditEntityType } from '../common/prisma/generated/client'
import { auditCreate, auditDelete, auditUpdate } from './audit.utils'

describe('Audit Utils', () => {
  const entityType = 'GROUP' as AuditEntityType
  const entityId = 'test-id-123'
  const performedBy = 'user-456'

  describe('auditCreate', () => {
    it('should create an audit payload with action CREATE and a snapshot of current data', () => {
      const current = {
        name: 'Test Group',
        description: 'A group for testing',
        isActive: true
      }

      const result = auditCreate({
        entityType,
        entityId,
        performedBy,
        current
      })

      assert.deepStrictEqual(result, {
        entityType,
        entityId,
        performedBy,
        action: AuditAction.CREATE,
        changes: current
      })
    })

    it('should ignore default fields (id, createdAt, updatedAt) in the snapshot', () => {
      const current = {
        id: 'should-be-ignored',
        name: 'Test Group',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      }

      const result = auditCreate({
        entityType,
        entityId,
        performedBy,
        current
      })

      assert.deepStrictEqual(result.changes, {
        name: 'Test Group'
      })
    })

    it('should respect custom ignored fields', () => {
      const current = {
        name: 'Test Group',
        secretCode: '1234',
        createdAt: new Date()
      }

      const result = auditCreate({
        entityType,
        entityId,
        performedBy,
        current,
        ignoredFields: ['secretCode']
      })

      assert.deepStrictEqual(result.changes, {
        name: 'Test Group',
        createdAt: current.createdAt
      })
      assert.strictEqual((result.changes as Record<string, unknown>).secretCode, undefined)
    })
  })

  describe('auditUpdate', () => {
    it('should create an audit payload with action UPDATE and only changed fields', () => {
      const previous = {
        name: 'Old Name',
        description: 'Same description',
        status: 'ACTIVE'
      }

      const current = {
        name: 'New Name',
        description: 'Same description',
        status: 'INACTIVE'
      }

      const result = auditUpdate({
        entityType,
        entityId,
        performedBy,
        previous,
        current
      })

      assert.strictEqual(result.action, AuditAction.UPDATE)
      assert.deepStrictEqual(result.changes, {
        name: { from: 'Old Name', to: 'New Name' },
        status: { from: 'ACTIVE', to: 'INACTIVE' }
      })
    })

    it('should return empty changes if nothing was modified', () => {
      const previous = { name: 'Name', status: 'ACTIVE' }
      const current = { name: 'Name', status: 'ACTIVE' }

      const result = auditUpdate({
        entityType,
        entityId,
        performedBy,
        previous,
        current
      })

      assert.deepStrictEqual(result.changes, {})
    })

    it('should ignore differences in default fields (id, createdAt, updatedAt)', () => {
      const previous = {
        name: 'Same Name',
        updatedAt: new Date('2023-01-01')
      }

      const current = {
        name: 'Same Name',
        updatedAt: new Date('2023-01-02') // This changed but should be ignored
      }

      const result = auditUpdate({
        entityType,
        entityId,
        performedBy,
        previous,
        current
      })

      assert.deepStrictEqual(result.changes, {})
    })

    it('should handle added and removed fields correctly', () => {
      const previous = {
        fieldA: 'Exists',
        fieldB: 'Will be removed'
      }

      const current = {
        fieldA: 'Exists',
        fieldC: 'Newly added'
      } as unknown as typeof previous

      const result = auditUpdate({
        entityType,
        entityId,
        performedBy,
        previous,
        current
      })

      assert.deepStrictEqual(result.changes, {
        fieldB: { from: 'Will be removed', to: undefined },
        fieldC: { from: undefined, to: 'Newly added' }
      })
    })
  })

  describe('auditDelete', () => {
    it('should create an audit payload with action ARCHIVE and a snapshot of previous data', () => {
      const previous = {
        name: 'Deleted Group',
        description: 'This will be archived'
      }

      const result = auditDelete({
        entityType,
        entityId,
        performedBy,
        previous
      })

      assert.deepStrictEqual(result, {
        entityType,
        entityId,
        performedBy,
        action: AuditAction.ARCHIVE,
        changes: previous
      })
    })

    it('should ignore default fields (id, createdAt, updatedAt) in the snapshot', () => {
      const previous = {
        id: 'some-id',
        name: 'Deleted Group',
        updatedAt: new Date()
      }

      const result = auditDelete({
        entityType,
        entityId,
        performedBy,
        previous
      })

      assert.deepStrictEqual(result.changes, {
        name: 'Deleted Group'
      })
    })
  })
})
