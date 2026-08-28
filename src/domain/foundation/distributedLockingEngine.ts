import { DistributedLock } from './types';

export class EnterpriseDistributedLockingEngine {
  private activeLocks: Map<string, DistributedLock> = new Map();
  private fencingCounter: number = 1000;
  private currentLeaderNodeId: string = 'pod-app-omnipos-enterprise-01';
  private lockAcquisitionLogs: Array<{
    timestamp: string;
    resource: string;
    action: 'ACQUIRED' | 'RELEASED' | 'RENEWED' | 'FAILED_TIMEOUT' | 'FENCING_VIOLATION';
    holderNodeId: string;
    fencingToken: number;
    ttlMs: number;
  }> = [];

  constructor() {
    this.seedDefaultLocks();
  }

  private seedDefaultLocks(): void {
    this.acquireLock({
      resource: 'saga:order:ORD-2026-8801',
      holderNodeId: 'pod-app-omnipos-enterprise-01',
      ttlMs: 30000,
      purpose: 'SAGA_STEP',
    });

    this.acquireLock({
      resource: 'cron:nightly_z_report_consolidation',
      holderNodeId: 'pod-app-omnipos-enterprise-01',
      ttlMs: 60000,
      purpose: 'SCHEDULED_JOB',
    });
  }

  public acquireLock(params: {
    resource: string;
    holderNodeId: string;
    ttlMs: number;
    purpose: DistributedLock['purpose'];
  }): { success: boolean; lock?: DistributedLock; fencingToken?: number; error?: string } {
    const now = Date.now();
    const existing = this.activeLocks.get(params.resource);

    // If lock exists and is not expired
    if (existing && existing.expiresAt > now) {
      this.lockAcquisitionLogs.unshift({
        timestamp: new Date().toISOString(),
        resource: params.resource,
        action: 'FAILED_TIMEOUT',
        holderNodeId: params.holderNodeId,
        fencingToken: existing.fencingToken,
        ttlMs: params.ttlMs,
      });

      return {
        success: false,
        error: `Resource [${params.resource}] is already locked by node [${existing.holderNodeId}]. Expires in ${Math.round((existing.expiresAt - now) / 1000)}s.`,
      };
    }

    this.fencingCounter++;
    const token = `lock_${Math.random().toString(36).substring(2, 12)}`;

    const lock: DistributedLock = {
      resource: params.resource,
      token,
      fencingToken: this.fencingCounter,
      acquiredAt: now,
      expiresAt: now + params.ttlMs,
      ttlMs: params.ttlMs,
      holderNodeId: params.holderNodeId,
      purpose: params.purpose,
    };

    this.activeLocks.set(params.resource, lock);

    this.lockAcquisitionLogs.unshift({
      timestamp: new Date().toISOString(),
      resource: params.resource,
      action: 'ACQUIRED',
      holderNodeId: params.holderNodeId,
      fencingToken: this.fencingCounter,
      ttlMs: params.ttlMs,
    });

    return {
      success: true,
      lock,
      fencingToken: this.fencingCounter,
    };
  }

  public releaseLock(resource: string, token: string): boolean {
    const lock = this.activeLocks.get(resource);
    if (!lock) return false;

    if (lock.token !== token) {
      this.lockAcquisitionLogs.unshift({
        timestamp: new Date().toISOString(),
        resource,
        action: 'FENCING_VIOLATION',
        holderNodeId: lock.holderNodeId,
        fencingToken: lock.fencingToken,
        ttlMs: 0,
      });
      return false;
    }

    this.activeLocks.delete(resource);

    this.lockAcquisitionLogs.unshift({
      timestamp: new Date().toISOString(),
      resource,
      action: 'RELEASED',
      holderNodeId: lock.holderNodeId,
      fencingToken: lock.fencingToken,
      ttlMs: 0,
    });

    return true;
  }

  public renewLock(resource: string, token: string, extensionMs: number): boolean {
    const lock = this.activeLocks.get(resource);
    if (!lock || lock.token !== token) return false;

    lock.expiresAt = Date.now() + extensionMs;

    this.lockAcquisitionLogs.unshift({
      timestamp: new Date().toISOString(),
      resource,
      action: 'RENEWED',
      holderNodeId: lock.holderNodeId,
      fencingToken: lock.fencingToken,
      ttlMs: extensionMs,
    });

    return true;
  }

  public electLeader(candidateNodeId: string): { isLeader: boolean; leaderNodeId: string } {
    const res = this.acquireLock({
      resource: 'cluster:leader_election_coordinator',
      holderNodeId: candidateNodeId,
      ttlMs: 15000,
      purpose: 'LEADER_ELECTION',
    });

    if (res.success) {
      this.currentLeaderNodeId = candidateNodeId;
      return { isLeader: true, leaderNodeId: candidateNodeId };
    }

    return { isLeader: false, leaderNodeId: this.currentLeaderNodeId };
  }

  public getActiveLocks(): DistributedLock[] {
    const now = Date.now();
    return Array.from(this.activeLocks.values()).filter(l => l.expiresAt > now);
  }

  public getLockLogs() {
    return this.lockAcquisitionLogs;
  }

  public getLeaderNode(): string {
    return this.currentLeaderNodeId;
  }
}

export const distributedLockingEngine = new EnterpriseDistributedLockingEngine();
