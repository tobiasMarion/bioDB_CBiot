import { AuditAction, type AuditEntityType, type Prisma } from '../common/prisma/generated/client'

type JsonValue = Prisma.JsonValue
type JsonObject = Prisma.JsonObject

type ComparableRecord = Record<string, unknown>

type BaseAuditParams = {
  entityType: AuditEntityType
  entityId: string
  performedBy: string | null
  ignoredFields?: readonly string[]
}

type AuditPayload = {
  entityType: AuditEntityType
  entityId: string
  performedBy: string | null
  action: AuditAction
  changes: Prisma.InputJsonValue
}

const DEFAULT_IGNORED_FIELDS = ['id', 'createdAt', 'updatedAt'] as const

function isEqual(valueA: unknown, valueB: unknown): boolean {
  return JSON.stringify(valueA) === JSON.stringify(valueB)
}

function toJsonValue(value: unknown): JsonValue {
  return value as JsonValue
}

function buildSnapshot<T extends ComparableRecord>(
  data: T,
  ignoredFields: readonly string[]
): JsonObject {
  const snapshot: JsonObject = {}

  for (const key of Object.keys(data)) {
    if (ignoredFields.includes(key)) continue
    snapshot[key] = toJsonValue(data[key])
  }

  return snapshot
}

function diffObjects<T extends ComparableRecord>(
  previous: T,
  current: T,
  ignoredFields: readonly string[]
): JsonObject {
  const changes: JsonObject = {}

  const keys = new Set([...Object.keys(previous), ...Object.keys(current)])

  for (const key of keys) {
    if (ignoredFields.includes(key)) continue

    const oldValue = previous[key]
    const newValue = current[key]

    if (!isEqual(oldValue, newValue)) {
      changes[key] = {
        from: toJsonValue(oldValue),
        to: toJsonValue(newValue)
      }
    }
  }

  return changes
}

export function auditCreate<T extends ComparableRecord>(
  params: BaseAuditParams & {
    current: T
  }
): AuditPayload {
  const ignoredFields = params.ignoredFields ?? DEFAULT_IGNORED_FIELDS

  return {
    entityType: params.entityType,
    entityId: params.entityId,
    performedBy: params.performedBy,
    action: AuditAction.CREATE,
    changes: buildSnapshot(params.current, ignoredFields)
  }
}

export function auditUpdate<T extends ComparableRecord>(
  params: BaseAuditParams & {
    previous: T
    current: T
  }
): AuditPayload {
  const ignoredFields = params.ignoredFields ?? DEFAULT_IGNORED_FIELDS

  return {
    entityType: params.entityType,
    entityId: params.entityId,
    performedBy: params.performedBy,
    action: AuditAction.UPDATE,
    changes: diffObjects(params.previous, params.current, ignoredFields)
  }
}

export function auditDelete<T extends ComparableRecord>(
  params: BaseAuditParams & {
    previous: T
    reasonForArchiving?: string
  }
): AuditPayload {
  const ignoredFields = params.ignoredFields ?? DEFAULT_IGNORED_FIELDS

  return {
    entityType: params.entityType,
    entityId: params.entityId,
    performedBy: params.performedBy,
    action: AuditAction.ARCHIVE,
    changes: {
      ...(params.reasonForArchiving ? { reasonForArchiving: params.reasonForArchiving } : {}),
      ...buildSnapshot(params.previous, ignoredFields)
    }
  }
}

export function auditNotify(
  params: Omit<BaseAuditParams, 'performedBy'> & {
    message: string
    recipientIds: string[]
  }
): AuditPayload {
  return {
    entityType: params.entityType,
    entityId: params.entityId,
    performedBy: null,
    action: AuditAction.NOTIFY,
    changes: {
      message: params.message,
      notifiedUserIds: params.recipientIds
    }
  }
}
