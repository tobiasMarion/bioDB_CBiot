import * as assert from 'node:assert'
import { describe, it } from 'node:test'

import { AuditAction, type AuditEntityType } from '../common/prisma/generated/client'

import { auditCreate, auditDelete, auditUpdate } from './audit.utils'

describe('Audit Utils', () => {
  const entityType = 'GROUP' as AuditEntityType
  const entityId = 'test-id-123'
  const performedBy = 'user-456'

  describe('auditCreate', () => {
    it('should create an audit payload with action CREATE and snapshot data', () => {
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

    it('should ignore default fields', () => {
      const current = {
        id: 'ignore-me',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        name: 'Visible'
      }

      const result = auditCreate({
        entityType,
        entityId,
        performedBy,
        current
      })

      assert.deepStrictEqual(result.changes, {
        name: 'Visible'
      })
    })

    it('should respect custom ignored fields instead of defaults', () => {
      const current = {
        id: 'should-remain',
        name: 'Visible',
        secret: 'hidden'
      }

      const result = auditCreate({
        entityType,
        entityId,
        performedBy,
        current,
        ignoredFields: ['secret']
      })

      assert.deepStrictEqual(result.changes, {
        id: 'should-remain',
        name: 'Visible'
      })
    })

    it('should preserve arrays, nulls and nested objects', () => {
      const current = {
        tags: ['a', 'b'],
        meta: { enabled: true },
        deletedAt: null
      }

      const result = auditCreate({
        entityType,
        entityId,
        performedBy,
        current
      })

      assert.deepStrictEqual(result.changes, current)
    })
  })

  describe('auditUpdate', () => {
    it('should create an audit payload with only changed fields', () => {
      const previous = {
        name: 'Old Name',
        description: 'Same',
        status: 'ACTIVE'
      }

      const current = {
        name: 'New Name',
        description: 'Same',
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

    it('should return empty changes when nothing changed', () => {
      const previous = { name: 'Same' }
      const current = { name: 'Same' }

      const result = auditUpdate({
        entityType,
        entityId,
        performedBy,
        previous,
        current
      })

      assert.deepStrictEqual(result.changes, {})
    })

    it('should ignore default fields', () => {
      const previous = {
        name: 'Same',
        updatedAt: new Date('2024-01-01')
      }

      const current = {
        name: 'Same',
        updatedAt: new Date('2025-01-01')
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

    it('should detect added and removed fields', () => {
      const previous = {
        fieldA: 'Exists',
        fieldB: 'Removed'
      }

      const current = {
        fieldA: 'Exists',
        fieldC: 'Added'
      } as unknown as typeof previous

      const result = auditUpdate({
        entityType,
        entityId,
        performedBy,
        previous,
        current
      })

      assert.deepStrictEqual(result.changes, {
        fieldB: { from: 'Removed', to: undefined },
        fieldC: { from: undefined, to: 'Added' }
      })
    })

    it('should respect custom ignored fields', () => {
      const previous = {
        version: 1,
        name: 'Old'
      }

      const current = {
        version: 2,
        name: 'New'
      }

      const result = auditUpdate({
        entityType,
        entityId,
        performedBy,
        previous,
        current,
        ignoredFields: ['version']
      })

      assert.deepStrictEqual(result.changes, {
        name: { from: 'Old', to: 'New' }
      })
    })

    it('should compare nested objects deeply through serialization', () => {
      const previous = {
        config: { enabled: true, level: 1 }
      }

      const current = {
        config: { enabled: true, level: 2 }
      }

      const result = auditUpdate({
        entityType,
        entityId,
        performedBy,
        previous,
        current
      })

      assert.deepStrictEqual(result.changes, {
        config: {
          from: { enabled: true, level: 1 },
          to: { enabled: true, level: 2 }
        }
      })
    })
  })

  describe('auditDelete', () => {
    it('should create an audit payload with ARCHIVE action', () => {
      const previous = {
        name: 'Deleted Group',
        description: 'Archived'
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

    it('should ignore default fields', () => {
      const previous = {
        id: 'ignore',
        updatedAt: new Date(),
        name: 'Deleted'
      }

      const result = auditDelete({
        entityType,
        entityId,
        performedBy,
        previous
      })

      assert.deepStrictEqual(result.changes, {
        name: 'Deleted'
      })
    })

    it('should respect custom ignored fields', () => {
      const previous = {
        id: 'keep-id',
        internalCode: 'hide',
        name: 'Deleted'
      }

      const result = auditDelete({
        entityType,
        entityId,
        performedBy,
        previous,
        ignoredFields: ['internalCode']
      })

      assert.deepStrictEqual(result.changes, {
        id: 'keep-id',
        name: 'Deleted'
      })
    })
  })
})
