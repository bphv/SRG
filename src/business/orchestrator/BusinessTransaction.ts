import type { OrchestratorWorkflowName } from '#/business/orchestrator/types'

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export type TransactionStatus = 'started' | 'committed' | 'rolled_back' | 'failed'

export type BusinessTransactionRecord = {
  id: string
  workflow: OrchestratorWorkflowName
  startedAt: string
  endedAt?: string
  status: TransactionStatus
  userId?: string
  errorMessage?: string
}

export class BusinessTransactionManager {
  private readonly transactions: BusinessTransactionRecord[] = []

  start(workflow: OrchestratorWorkflowName, userId?: string): BusinessTransactionRecord {
    const transaction: BusinessTransactionRecord = {
      id: randomId('txn'),
      workflow,
      startedAt: new Date().toISOString(),
      status: 'started',
      userId,
    }
    this.transactions.unshift(transaction)
    return transaction
  }

  commit(id: string): void {
    this.update(id, 'committed')
  }

  rollback(id: string): void {
    this.update(id, 'rolled_back')
  }

  fail(id: string, errorMessage: string): void {
    this.update(id, 'failed', errorMessage)
  }

  list(userId?: string): BusinessTransactionRecord[] {
    if (!userId) return [...this.transactions]
    return this.transactions.filter((item) => item.userId === userId)
  }

  private update(id: string, status: TransactionStatus, errorMessage?: string): void {
    const index = this.transactions.findIndex((item) => item.id === id)
    if (index < 0) return

    this.transactions[index] = {
      ...this.transactions[index],
      status,
      endedAt: new Date().toISOString(),
      errorMessage,
    }
  }
}
