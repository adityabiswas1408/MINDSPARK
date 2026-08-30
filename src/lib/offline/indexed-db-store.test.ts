import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db, MindsparkOfflineDatabase } from './indexed-db-store';

describe('IndexedDB Store', () => {
  beforeEach(async () => {
    // Ensure clean state before each test
    await Dexie.delete('mindspark_exam');
  });

  afterEach(() => {
    if (db.isOpen()) {
      db.close();
    }
  });

  it('can store and retrieve queued items', async () => {
    await db.open();
    const item = {
      idempotency_key: 'key-1',
      session_id: 'sess-1',
      question_id: 'q1',
      selected_option: 'A' as const,
      answered_at: Date.now(),
      time_spent_ms: 100,
      synced: false,
      created_at: Date.now()
    };

    await db.pendingAnswers.add(item);
    
    const count = await db.pendingAnswers.count();
    expect(count).toBe(1);

    const retrieved = await db.pendingAnswers.get('key-1');
    expect(retrieved).toEqual(item);
  });

  it('can query items by session_id', async () => {
    await db.open();
    await db.pendingAnswers.bulkAdd([
      { idempotency_key: 'k1', session_id: 'sess-A', question_id: 'q1', selected_option: 'A', answered_at: 1, time_spent_ms: 100, synced: false, created_at: 1 },
      { idempotency_key: 'k2', session_id: 'sess-A', question_id: 'q2', selected_option: 'B', answered_at: 2, time_spent_ms: 100, synced: false, created_at: 2 },
      { idempotency_key: 'k3', session_id: 'sess-B', question_id: 'q3', selected_option: 'C', answered_at: 3, time_spent_ms: 100, synced: false, created_at: 3 }
    ]);

    const sessAItems = await db.pendingAnswers.where({ session_id: 'sess-A' }).toArray();
    expect(sessAItems.length).toBe(2);
  });

  it('migrates v1 records to v2 by adding time_spent_ms: 0', async () => {
    // 1. Create a v1-schema database using a raw Dexie instance
    const v1Db = new Dexie('mindspark_exam');
    v1Db.version(1).stores({
      pendingAnswers: 'idempotency_key, session_id, synced'
    });
    
    await v1Db.open();
    
    // 2. Insert a v1-shaped record missing time_spent_ms
    await v1Db.table('pendingAnswers').add({
      idempotency_key: 'mig-key-1',
      session_id: 'mig-sess',
      question_id: 'q1',
      selected_option: 'A',
      answered_at: 12345,
      synced: false,
      created_at: 12345
    });
    
    v1Db.close();
    
    // 3. Trigger the version-2 upgrade path using the real class
    const upgradedDb = new MindsparkOfflineDatabase();
    await upgradedDb.open();
    
    // 4. Assert the record was backfilled with time_spent_ms: 0
    const migratedRecord = await upgradedDb.pendingAnswers.get('mig-key-1');
    expect(migratedRecord).toBeDefined();
    expect(migratedRecord?.time_spent_ms).toBe(0);
    
    // Ensure other fields remain intact
    expect(migratedRecord?.idempotency_key).toBe('mig-key-1');
    expect(migratedRecord?.synced).toBe(false);
    
    upgradedDb.close();
  });
});
