import Dexie, { type EntityTable } from 'dexie';

export interface PendingAnswer {
  idempotency_key: string;
  session_id: string;
  question_id: string;
  selected_option: 'A' | 'B' | 'C' | 'D' | null;
  answered_at: number; // Client timestamp to prevent Server logic drift
  synced: boolean;     // ⚠️ Must be explicitly set to `false` at the application insert boundary
  created_at: number;  // Local insertion time
}

export class MindsparkOfflineDatabase extends Dexie {
  // Dexie v4 EntityTable strictly types the structure and the Primary Key
  pendingAnswers!: EntityTable<
    PendingAnswer,
    'idempotency_key'
  >;

  constructor() {
    super('mindspark_exam');

    this.version(1).stores({
      /**
       * Primary Key: idempotency_key
       * Indexed Fields: session_id, synced
       * 
       * Note: Dexie schemas do not support default values. The application layer
       * is strictly responsible for providing `synced: false` when inserting.
       */
      pendingAnswers: 'idempotency_key, session_id, synced'
    });
  }
}

// Singleton export 
export const db = new MindsparkOfflineDatabase();
