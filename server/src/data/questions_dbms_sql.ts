import { SeedQuestion } from './questions_aptitude';

export const DBMS_SQL_QUESTIONS: SeedQuestion[] = [
  // ==========================================
  // DBMS CONCEPTS (30 QUESTIONS)
  // ==========================================
  {
    statement: 'Which ACID property guarantees that all operations within a database transaction either execute to completion or leave the database in its original state if a failure occurs?',
    explanation: 'Atomicity (the "all-or-nothing" rule) ensures that either all modifications performed by a transaction are committed to the database, or the entire transaction is rolled back and undone in the event of an abort or crash.',
    category_slug: 'dbms',
    topic: 'ACID Properties',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Atomicity', is_correct: true },
      { label: 'B', content: 'Consistency', is_correct: false },
      { label: 'C', content: 'Isolation', is_correct: false },
      { label: 'D', content: 'Durability', is_correct: false }
    ]
  },
  {
    statement: 'A relation R with functional dependencies is in Boyce-Codd Normal Form (BCNF) if and only if for every non-trivial functional dependency X -> Y:',
    explanation: 'The strict definition of BCNF requires that for every non-trivial functional dependency X -> Y, the determinant X MUST be a Superkey. In contrast to 3NF, BCNF does not allow Y to be a prime attribute if X is not a superkey.',
    category_slug: 'dbms',
    topic: 'Normalization and BCNF',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'X is a superkey of the relation', is_correct: true },
      { label: 'B', content: 'Y is a prime attribute', is_correct: false },
      { label: 'C', content: 'X is a foreign key', is_correct: false },
      { label: 'D', content: 'Y contains no null values', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Phantom Read" anomaly in relational database concurrency?',
    explanation: 'A Phantom Read occurs when transaction T1 executes a query reading a set of rows satisfying a WHERE clause, transaction T2 inserts or deletes rows matching that search condition and commits, and T1 re-executes the query and encounters newly added/missing ("phantom") rows.',
    category_slug: 'dbms',
    topic: 'Transaction Concurrency Anomalies',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'A transaction re-executes a range query and finds newly inserted or deleted rows committed by another concurrent transaction', is_correct: true },
      { label: 'B', content: 'A transaction reads uncommitted changes that are subsequently rolled back', is_correct: false },
      { label: 'C', content: 'A transaction reads a row, another transaction updates that row, and the first transaction re-reads a different value', is_correct: false },
      { label: 'D', content: 'Two transactions attempt to update the same row simultaneously causing deadlock', is_correct: false }
    ]
  },
  {
    statement: 'Which ANSI SQL transaction isolation level prevents Dirty Reads and Non-Repeatable Reads, but may still permit Phantom Reads?',
    explanation: 'The four ANSI SQL isolation levels:\n- Read Uncommitted: permits Dirty, Non-repeatable, and Phantom reads.\n- Read Committed: prevents Dirty reads; permits Non-repeatable and Phantom reads.\n- Repeatable Read: prevents Dirty and Non-repeatable reads; permits Phantom reads.\n- Serializable: prevents all three anomalies.',
    category_slug: 'dbms',
    topic: 'Transaction Isolation Levels',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Repeatable Read', is_correct: true },
      { label: 'B', content: 'Read Committed', is_correct: false },
      { label: 'C', content: 'Read Uncommitted', is_correct: false },
      { label: 'D', content: 'Serializable', is_correct: false }
    ]
  },
  {
    statement: 'Why are B+ Trees predominantly preferred over B-Trees for relational database disk storage and indexing?',
    explanation: 'In a B+ Tree, non-leaf nodes store only routing keys, allowing more keys per disk block (higher fan-out and shallower tree depth). Furthermore, all data pointers reside in leaf nodes, which are linked together in a sequential linked list, allowing extremely fast range scans (e.g. `WHERE age BETWEEN 20 AND 30`) without tree traversals.',
    category_slug: 'dbms',
    topic: 'Indexing and B+ Trees',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'All records are stored at leaf nodes and leaves are doubly-linked for efficient range queries, with higher branching factor', is_correct: true },
      { label: 'B', content: 'B+ Trees consume zero disk space for non-leaf pointers', is_correct: false },
      { label: 'C', content: 'B-Trees cannot store duplicate keys under any circumstance', is_correct: false },
      { label: 'D', content: 'B+ Trees do not require rebalancing during deletions', is_correct: false }
    ]
  },
  {
    statement: 'In the Two-Phase Locking (2PL) protocol, what characterizes the Growing Phase and the Shrinking Phase?',
    explanation: 'In Basic 2PL:\n- Growing Phase: a transaction may acquire new locks, but cannot release any lock.\n- Shrinking Phase: once the first lock is released, the transaction can only release locks and cannot acquire any new lock.\nThis rule guarantees conflict serializability of concurrent schedules.',
    category_slug: 'dbms',
    topic: 'Two-Phase Locking (2PL)',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Locks can only be acquired in the Growing Phase and only released in the Shrinking Phase', is_correct: true },
      { label: 'B', content: 'Locks are acquired and released arbitrarily in both phases', is_correct: false },
      { label: 'C', content: 'Growing phase expands memory; shrinking phase deallocates swap', is_correct: false },
      { label: 'D', content: 'Growing phase writes to log; shrinking phase commits to disk', is_correct: false }
    ]
  },
  {
    statement: 'What is the key difference between Strict 2PL and Rigorous 2PL?',
    explanation: 'Strict 2PL requires that all Exclusive (X) locks held by a transaction be retained until the transaction terminates (commits or aborts), preventing cascading aborts.\nRigorous 2PL requires that ALL locks (both Shared and Exclusive) be retained until transaction termination, guaranteeing conflict serializability and strictness.',
    category_slug: 'dbms',
    topic: 'Concurrency Control Variants',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Strict 2PL holds exclusive locks until commit/abort; Rigorous 2PL holds both shared and exclusive locks until commit/abort', is_correct: true },
      { label: 'B', content: 'Strict 2PL allows dirty reads; Rigorous 2PL does not', is_correct: false },
      { label: 'C', content: 'Rigorous 2PL does not support shared read locks', is_correct: false },
      { label: 'D', content: 'Strict 2PL is for distributed databases only', is_correct: false }
    ]
  },
  {
    statement: 'What is the "Write-Ahead Logging" (WAL) rule in database recovery management?',
    explanation: 'The WAL rule mandates that log records describing a change (the undo/redo log) must be written and flushed to non-volatile disk storage BEFORE the corresponding modified database page is written to disk, ensuring Atomicity and Durability during a crash.',
    category_slug: 'dbms',
    topic: 'Database Recovery and WAL',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Log records describing a data page update must be flushed to stable storage before the data page itself is written to disk', is_correct: true },
      { label: 'B', content: 'All database queries must be written to log files before execution', is_correct: false },
      { label: 'C', content: 'A transaction must commit in memory before any log is written', is_correct: false },
      { label: 'D', content: 'Transactions are written ahead of index creation', is_correct: false }
    ]
  },
  {
    statement: 'Under the "Wait-Die" deadlock prevention scheme (non-preemptive based on timestamps where older transactions have smaller timestamps): what happens when transaction Ti requests a data item held by Tj?',
    explanation: 'Wait-Die is non-preemptive:\n- If Ti is older than Tj (Timestamp(Ti) < Timestamp(Tj)), Ti is allowed to WAIT.\n- If Ti is younger than Tj (Timestamp(Ti) > Timestamp(Tj)), Ti DIES (is rolled back and restarted with original timestamp).\nYounger transactions are never allowed to wait for older ones, eliminating circular wait.',
    category_slug: 'dbms',
    topic: 'Deadlock Prevention Schemes',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'If Ti is older, it waits; if Ti is younger, it dies (rolls back)', is_correct: true },
      { label: 'B', content: 'If Ti is younger, it waits; if Ti is older, it kills Tj', is_correct: false },
      { label: 'C', content: 'Both transactions wait indefinitely until a timer expires', is_correct: false },
      { label: 'D', content: 'Tj is always aborted immediately', is_correct: false }
    ]
  },
  {
    statement: 'What constitutes a "Transitive Dependency" in relational database normalization?',
    explanation: 'A transitive dependency occurs in a relation when X -> Y and Y -> Z hold, where X is a candidate key, Y is a non-prime attribute (or set of attributes not a candidate key), and Z is a non-prime attribute. This violates Third Normal Form (3NF).',
    category_slug: 'dbms',
    topic: 'Normalization 3NF',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'A non-key attribute depends on another non-key attribute, which in turn depends on the primary key', is_correct: true },
      { label: 'B', content: 'A prime attribute depends on a composite key', is_correct: false },
      { label: 'C', content: 'Two foreign keys reference each other circularly', is_correct: false },
      { label: 'D', content: 'An attribute depends on itself', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Clustered Index" in a relational database management system?',
    explanation: 'A clustered index determines the physical storage order of rows in the table. Because physical rows can only be sorted on disk in one order, a table can have at most ONE clustered index (typically created automatically on the Primary Key).',
    category_slug: 'dbms',
    topic: 'Clustered vs Non-Clustered Indexes',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'An index that determines the physical ordering of data rows in the table file (maximum one per table)', is_correct: true },
      { label: 'B', content: 'An index stored on a separate cluster of database servers', is_correct: false },
      { label: 'C', content: 'An index that contains only composite text columns', is_correct: false },
      { label: 'D', content: 'An index that cannot be used in WHERE clause lookups', is_correct: false }
    ]
  },
  {
    statement: 'In Relational Algebra, which fundamental operation is equivalent to a Cartesian Product followed by a Selection condition?',
    explanation: 'A Theta Join (or Equi-Join) is formally defined in relational algebra as a Cartesian Product (X) followed by a Selection (sigma_condition): R JOIN_theta S = sigma_theta(R X S).',
    category_slug: 'dbms',
    topic: 'Relational Algebra',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Theta Join (or Inner Join)', is_correct: true },
      { label: 'B', content: 'Projection (pi)', is_correct: false },
      { label: 'C', content: 'Union (U)', is_correct: false },
      { label: 'D', content: 'Set Difference (-)', is_correct: false }
    ]
  },
  {
    statement: 'What is the purpose of Checkpoints in database log recovery?',
    explanation: 'Checkpoints periodically write all modified dirty buffer pages and active transaction log records from RAM to disk. During recovery after a system crash, the database engine only needs to scan the log back to the most recent checkpoint, dramatically shortening crash recovery time.',
    category_slug: 'dbms',
    topic: 'Recovery and Checkpoints',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'To flush dirty pages to disk so the log does not need to be processed from the beginning of time upon recovery', is_correct: true },
      { label: 'B', content: 'To check database tables for viral corruption', is_correct: false },
      { label: 'C', content: 'To automatically calculate table statistics for the query planner', is_correct: false },
      { label: 'D', content: 'To back up the database to tape drive storage', is_correct: false }
    ]
  },
  {
    statement: 'A relation R(A, B, C, D) has functional dependencies: A -> B, B -> C, C -> D. What is the candidate key of R?',
    explanation: 'Computing the closure of A:\nA+ = {A, B} (since A -> B)\nUsing B -> C: A+ = {A, B, C}\nUsing C -> D: A+ = {A, B, C, D}\nSince A+ contains all attributes of R and no proper subset of A can determine all attributes, A is the unique Candidate Key of R.',
    category_slug: 'dbms',
    topic: 'Functional Dependency Closure and Keys',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'A', is_correct: true },
      { label: 'B', content: 'B', is_correct: false },
      { label: 'C', content: 'C', is_correct: false },
      { label: 'D', content: 'ABCD', is_correct: false }
    ]
  },
  {
    statement: 'In the relational model, what is "Referential Integrity"?',
    explanation: 'Referential integrity states that any foreign key value in a referencing table must either match a valid primary key value in the referenced table, or be NULL.',
    category_slug: 'dbms',
    topic: 'Integrity Constraints',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Foreign key values must match an existing primary key value in the referenced table or be NULL', is_correct: true },
      { label: 'B', content: 'Primary keys must never contain alphanumeric characters', is_correct: false },
      { label: 'C', content: 'Every table must have at least two indexes', is_correct: false },
      { label: 'D', content: 'Column names in child tables must match parent table column names exactly', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between a Dense Index and a Sparse Index in database physical storage?',
    explanation: 'A Dense Index contains an index entry for every single search key value in the data file.\nA Sparse Index contains index entries only for some search key values (typically one entry per disk block/page), reducing index size and RAM usage but requiring sorted data files.',
    category_slug: 'dbms',
    topic: 'Dense vs Sparse Indexing',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Dense index has an entry for every record; sparse index has entries only for some records (e.g. per disk block)', is_correct: true },
      { label: 'B', content: 'Sparse index is stored in memory; dense index on tape', is_correct: false },
      { label: 'C', content: 'Dense index only supports integer columns', is_correct: false },
      { label: 'D', content: 'Sparse indexes cannot be updated', is_correct: false }
    ]
  },
  {
    statement: 'What is the "Cascading Rollback" (or cascading abort) problem in concurrent database schedules?',
    explanation: 'A cascading rollback occurs when the failure or abort of a single transaction T1 causes other dependent transactions (which read uncommitted data written by T1) to also be rolled back. Concurrency protocols like Strict 2PL prevent cascading aborts.',
    category_slug: 'dbms',
    topic: 'Cascading Aborts',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'When the abort of one transaction forces multiple other dependent transactions that read its uncommitted data to roll back', is_correct: true },
      { label: 'B', content: 'When a database runs out of disk storage during a large batch insertion', is_correct: false },
      { label: 'C', content: 'When multiple deadlocks occur consecutively', is_correct: false },
      { label: 'D', content: 'When dropped foreign keys cause recursive table deletions', is_correct: false }
    ]
  },
  {
    statement: 'Which of the following schedules is guaranteed to be Conflict Serializable?',
    explanation: 'A schedule is conflict serializable if and only if its Precedence Graph (Serialization Graph) contains NO directed cycles.',
    category_slug: 'dbms',
    topic: 'Serializability and Precedence Graphs',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'A schedule whose precedence graph contains no directed cycles (is a DAG)', is_correct: true },
      { label: 'B', content: 'Any schedule where transactions execute sequentially with no overlap', is_correct: false },
      { label: 'C', content: 'A schedule that contains at least 3 conflicting read operations', is_correct: false },
      { label: 'D', content: 'Any schedule executing under Read Uncommitted isolation', is_correct: false }
    ]
  },
  {
    statement: 'What is the 3-Schema Architecture (ANSI/SPARC Architecture) in DBMS design?',
    explanation: 'The 3-Schema Architecture defines three distinct levels of abstraction to achieve data independence:\n1. Internal (Physical) Level: physical storage structures and file organization.\n2. Conceptual (Logical) Level: community view of entities, attributes, relationships, and constraints.\n3. External (View) Level: user-specific views and UI projections.',
    category_slug: 'dbms',
    topic: 'Three-Schema Architecture',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Physical (Internal), Logical (Conceptual), and View (External) levels', is_correct: true },
      { label: 'B', content: 'Frontend, Middleware, and Database levels', is_correct: false },
      { label: 'C', content: 'Tables, Columns, and Rows levels', is_correct: false },
      { label: 'D', content: 'OLTP, OLAP, and Data Warehouse levels', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between Physical Data Independence and Logical Data Independence?',
    explanation: '- Physical Data Independence: ability to modify physical schema (storage devices, file organization, indexes) without altering the conceptual schema or application programs.\n- Logical Data Independence: ability to modify the conceptual schema (adding tables, attributes) without altering external schemas or application programs (harder to achieve).',
    category_slug: 'dbms',
    topic: 'Data Independence',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Physical independence insulates from storage/index changes; Logical independence insulates from conceptual schema changes', is_correct: true },
      { label: 'B', content: 'Physical independence applies to cloud DBs; Logical applies to on-premises DBs', is_correct: false },
      { label: 'C', content: 'They are identical concepts', is_correct: false },
      { label: 'D', content: 'Logical independence means data cannot be deleted', is_correct: false }
    ]
  },
  {
    statement: 'In Second Normal Form (2NF), which condition must be satisfied?',
    explanation: 'A relation is in 2NF if and only if it is in 1NF AND no non-prime attribute is partially dependent on any candidate key (i.e. every non-prime attribute must depend on the WHOLE candidate key, not a proper subset of a composite key).',
    category_slug: 'dbms',
    topic: 'Normalization 2NF',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Relation is in 1NF and contains no partial functional dependencies on composite keys', is_correct: true },
      { label: 'B', content: 'Relation contains no multi-valued dependencies', is_correct: false },
      { label: 'C', content: 'Every determinant is a candidate key', is_correct: false },
      { label: 'D', content: 'All columns must contain alphanumeric text', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Blind Write" in transaction management?',
    explanation: 'A blind write occurs when a transaction writes (updates) a data item without first reading its current value: `W(X)` without preceding `R(X)`. Blind writes are characteristic of view-serializable schedules that are not conflict-serializable.',
    category_slug: 'dbms',
    topic: 'Serializability Blind Writes',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'A transaction writes a data item without reading it first', is_correct: true },
      { label: 'B', content: 'Writing to a disk sector that has corrupted parity bits', is_correct: false },
      { label: 'C', content: 'A write operation executed without obtaining an exclusive lock', is_correct: false },
      { label: 'D', content: 'A write operation to a temporary log file', is_correct: false }
    ]
  },
  {
    statement: 'In database query optimization, what is "Cost-Based Query Optimization" (CBO)?',
    explanation: 'Cost-Based Optimization generates multiple alternative execution plans (relational algebra trees with physical algorithms like Hash Join, Merge Join, Index Scan) and uses database statistics (histograms, row counts, index heights) to estimate disk I/O, CPU cycles, and latency, selecting the plan with minimum estimated cost.',
    category_slug: 'dbms',
    topic: 'Query Optimization',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Estimating disk I/O, CPU costs, and cardinality using statistics to select the cheapest execution plan', is_correct: true },
      { label: 'B', content: 'Billing cloud users based on query runtime', is_correct: false },
      { label: 'C', content: 'Enforcing financial budget limits on SQL updates', is_correct: false },
      { label: 'D', content: 'Executing queries based on alphabetical operator precedence', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Dirty Read" anomaly?',
    explanation: 'A dirty read occurs when transaction T1 updates a row, and transaction T2 reads that updated row BEFORE T1 commits. If T1 subsequently rolls back or aborts, T2 has processed a value that never officially existed in the database.',
    category_slug: 'dbms',
    topic: 'Concurrency Anomalies',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Reading uncommitted data written by a concurrent transaction that later aborts', is_correct: true },
      { label: 'B', content: 'Reading data that contains null bytes or SQL injection strings', is_correct: false },
      { label: 'C', content: 'Reading from a backup file during hardware failure', is_correct: false },
      { label: 'D', content: 'Reading stale cache entries from Redis', is_correct: false }
    ]
  },
  {
    statement: 'What is Multi-Version Concurrency Control (MVCC) used in modern databases like PostgreSQL?',
    explanation: 'MVCC allows concurrent reads and writes without blocking each other: readers never block writers, and writers never block readers. Updates create a new version of the row with transaction timestamps/IDs (`xmin`, `xmax`), allowing each transaction to view a consistent snapshot of data.',
    category_slug: 'dbms',
    topic: 'MVCC Concurrency',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Maintains multiple physical versions of rows so readers do not block writers and writers do not block readers', is_correct: true },
      { label: 'B', content: 'Duplicates tables across multiple geographical regions', is_correct: false },
      { label: 'C', content: 'Stores Git commit histories inside database columns', is_correct: false },
      { label: 'D', content: 'Restricts the database to single-threaded operations', is_correct: false }
    ]
  },
  {
    statement: 'Which Armstrong\'s Axiom states: "If X -> Y and Y -> Z, then X -> Z"?',
    explanation: 'Armstrong\'s Axioms:\n1. Reflexivity: If Y is a subset of X, then X -> Y.\n2. Augmentation: If X -> Y, then XZ -> YZ.\n3. Transitivity: If X -> Y and Y -> Z, then X -> Z.',
    category_slug: 'dbms',
    topic: 'Armstrong\'s Axioms',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Transitivity Rule', is_correct: true },
      { label: 'B', content: 'Reflexivity Rule', is_correct: false },
      { label: 'C', content: 'Augmentation Rule', is_correct: false },
      { label: 'D', content: 'Decomposition Rule', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Weak Entity Set" in an Entity-Relationship (ER) model and how is it identified?',
    explanation: 'A weak entity set is an entity set that does not possess sufficient attributes to form a primary key on its own. It is existence-dependent on an identifying (owner) entity set, and its records are uniquely identified by a Partial Key (discriminator) combined with the primary key of the identifying entity set.',
    category_slug: 'dbms',
    topic: 'ER Modeling Weak Entities',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'An entity without a primary key of its own, identified by a partial discriminator combined with its owner primary key', is_correct: true },
      { label: 'B', content: 'An entity with all attributes set to optional NULL', is_correct: false },
      { label: 'C', content: 'A table that has fewer than 10 rows', is_correct: false },
      { label: 'D', content: 'An entity that cannot have foreign keys', is_correct: false }
    ]
  },
  {
    statement: 'What is the role of the ARIES recovery algorithm in modern databases?',
    explanation: 'ARIES (Algorithm for Recovery and Isolation Exploiting Semantics) uses:\n1. Analysis Pass: scans log forward from last checkpoint to determine dirty pages and active transactions at crash time.\n2. Redo Pass: repeats history by redoing all logged operations to restore state at crash.\n3. Undo Pass: scans backwards and rolls back active uncommitted transactions.',
    category_slug: 'dbms',
    topic: 'ARIES Crash Recovery',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Three-pass crash recovery (Analysis, Redo repeating history, and Undo uncommitted transactions)', is_correct: true },
      { label: 'B', content: 'Single-pass instant recovery without logging', is_correct: false },
      { label: 'C', content: 'A hash-based indexing algorithm for memory databases', is_correct: false },
      { label: 'D', content: 'A schema migration validation utility', is_correct: false }
    ]
  },
  {
    statement: 'What is the cardinality of the Cartesian Product of relation R with M tuples and relation S with N tuples?',
    explanation: 'The Cartesian Product R X S pairs every tuple in R with every tuple in S. The total number of tuples (cardinality) is M * N. (The degree of the resulting relation is Degree(R) + Degree(S)).',
    category_slug: 'dbms',
    topic: 'Relational Algebra Cardinality',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'M * N', is_correct: true },
      { label: 'B', content: 'M + N', is_correct: false },
      { label: 'C', content: 'max(M, N)', is_correct: false },
      { label: 'D', content: 'M^N', is_correct: false }
    ]
  },
  {
    statement: 'In B-Tree indexing, what is the minimum number of keys in any non-root node of order M?',
    explanation: 'In a B-Tree of order M, every node except the root must have at least ceil(M / 2) children, which corresponds to at least ceil(M / 2) - 1 keys.',
    category_slug: 'dbms',
    topic: 'B-Tree Key Properties',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'ceil(M / 2) - 1', is_correct: true },
      { label: 'B', content: 'M / 2', is_correct: false },
      { label: 'C', content: 'M - 1', is_correct: false },
      { label: 'D', content: '1', is_correct: false }
    ]
  },

  // ==========================================
  // SQL (30 QUESTIONS)
  // ==========================================
  {
    statement: 'What is the crucial difference between the `WHERE` clause and the `HAVING` clause in SQL?',
    explanation: '`WHERE` filters individual rows BEFORE grouping and aggregation occur (cannot use aggregate functions like `SUM` or `COUNT`).\n`HAVING` filters aggregated groups AFTER `GROUP BY` has grouped the rows (can evaluate aggregate expressions).',
    category_slug: 'dbms',
    topic: 'WHERE vs HAVING',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'WHERE filters rows before aggregation; HAVING filters aggregated groups after GROUP BY', is_correct: true },
      { label: 'B', content: 'HAVING filters individual rows; WHERE filters grouped rows', is_correct: false },
      { label: 'C', content: 'WHERE can use aggregate functions like COUNT(); HAVING cannot', is_correct: false },
      { label: 'D', content: 'They are completely interchangeable in ANSI SQL', is_correct: false }
    ]
  },
  {
    statement: 'What does `COUNT(*)` return versus `COUNT(column_name)` in SQL?',
    explanation: '`COUNT(*)` counts the total number of rows in the result set, including rows with NULL values.\n`COUNT(column_name)` counts only rows where the specified `column_name` is NOT NULL.',
    category_slug: 'dbms',
    topic: 'SQL Aggregate Functions',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'COUNT(*) counts all rows including NULLs; COUNT(column_name) counts only non-NULL values', is_correct: true },
      { label: 'B', content: 'COUNT(*) ignores duplicate rows; COUNT(column_name) includes duplicates', is_correct: false },
      { label: 'C', content: 'COUNT(column_name) counts rows including NULLs; COUNT(*) does not', is_correct: false },
      { label: 'D', content: 'COUNT(*) is slower because it scans all column data', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between `RANK()` and `DENSE_RANK()` window functions in SQL when ties occur?',
    explanation: 'Both assign identical ranks to tied rows. However:\n- `RANK()` leaves gaps in the ranking sequence after ties (e.g. 1, 2, 2, 4).\n- `DENSE_RANK()` does not leave gaps, incrementing sequentially to the next immediate integer (e.g. 1, 2, 2, 3).',
    category_slug: 'dbms',
    topic: 'SQL Window Functions',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'RANK() skips subsequent rank numbers after ties (e.g., 1, 2, 2, 4); DENSE_RANK() leaves no gaps (1, 2, 2, 3)', is_correct: true },
      { label: 'B', content: 'DENSE_RANK() skips ranks; RANK() leaves no gaps', is_correct: false },
      { label: 'C', content: 'RANK() operates without an ORDER BY clause; DENSE_RANK() requires PARTITION BY', is_correct: false },
      { label: 'D', content: 'DENSE_RANK() is only available in NoSQL systems', is_correct: false }
    ]
  },
  {
    statement: 'What is the SQL query to find the N-th highest salary from an `employees` table without using vendor-specific LIMIT / OFFSET?',
    explanation: 'Using standard ANSI SQL correlated subquery:\n`SELECT DISTINCT salary FROM employees e1 WHERE N = (SELECT COUNT(DISTINCT salary) FROM employees e2 WHERE e2.salary >= e1.salary);`\nAlternatively, `DENSE_RANK()` in a CTE: `WITH Ranked AS (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rnk FROM employees) SELECT salary FROM Ranked WHERE rnk = N;`',
    category_slug: 'dbms',
    topic: 'Nth Highest Salary Query',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Using DENSE_RANK() OVER (ORDER BY salary DESC) in a CTE / subquery and filtering by rank = N', is_correct: true },
      { label: 'B', content: 'SELECT MAX(salary) FROM employees GROUP BY department_id', is_correct: false },
      { label: 'C', content: 'SELECT salary FROM employees ORDER BY salary ASC LIMIT 1', is_correct: false },
      { label: 'D', content: 'SELECT salary FROM employees WHERE salary > AVG(salary)', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between `UNION` and `UNION ALL` in SQL?',
    explanation: '`UNION` combines results from two queries and performs an implicit `DISTINCT` sort operation to remove all duplicate rows (more CPU/memory intensive).\n`UNION ALL` combines results and appends all rows directly, preserving duplicates with higher execution performance.',
    category_slug: 'dbms',
    topic: 'Set Operations',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'UNION eliminates duplicate rows with a sort/dedup pass; UNION ALL retains duplicates and is faster', is_correct: true },
      { label: 'B', content: 'UNION ALL removes duplicates; UNION keeps all rows', is_correct: false },
      { label: 'C', content: 'UNION requires different column counts; UNION ALL requires identical columns', is_correct: false },
      { label: 'D', content: 'UNION can only be used with primary keys', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Correlated Subquery" in SQL?',
    explanation: 'A correlated subquery is an inner subquery that references one or more columns from the outer query table. Because it depends on the outer row, it must be evaluated repeatedly for each candidate row processed by the outer query.',
    category_slug: 'dbms',
    topic: 'Subqueries',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'A subquery that references columns from the outer query and executes once for each outer row', is_correct: true },
      { label: 'B', content: 'A subquery that executes only once independently before the outer query runs', is_correct: false },
      { label: 'C', content: 'A subquery joined using a cross join', is_correct: false },
      { label: 'D', content: 'A query that modifies multiple tables simultaneously', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the comparison `NULL = NULL` in standard SQL three-valued logic?',
    explanation: 'In SQL, NULL represents an unknown value. The comparison of NULL with any value (including another NULL) using `=` evaluates to `UNKNOWN` (neither TRUE nor FALSE). To test for nullness, `IS NULL` or `IS NOT NULL` must be used.',
    category_slug: 'dbms',
    topic: 'Three-Valued Logic and NULL',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'UNKNOWN (falsy in WHERE filtering)', is_correct: true },
      { label: 'B', content: 'TRUE', is_correct: false },
      { label: 'C', content: 'FALSE', is_correct: false },
      { label: 'D', content: 'Throws a syntax error', is_correct: false }
    ]
  },
  {
    statement: 'What is the effect of `ON DELETE CASCADE` in a Foreign Key constraint definition?',
    explanation: 'When a referenced row in the parent table is deleted, the database automatically deletes all referencing child rows in the child table that have foreign key values pointing to that deleted parent row.',
    category_slug: 'dbms',
    topic: 'Foreign Key Actions',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Automatically deletes all corresponding child rows when the parent row is deleted', is_correct: true },
      { label: 'B', content: 'Sets the child foreign key values to NULL', is_correct: false },
      { label: 'C', content: 'Blocks the deletion of the parent row with an error', is_correct: false },
      { label: 'D', content: 'Replaces child foreign keys with the primary key of another table', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between `DELETE`, `TRUNCATE`, and `DROP` commands in SQL?',
    explanation: '- `DELETE`: DML statement that removes rows one by one (or filtered by WHERE), logs each row deletion, activates triggers, and can be rolled back.\n- `TRUNCATE`: DDL statement that deallocates entire table data pages at once, cannot use WHERE, does not fire per-row triggers, and is much faster.\n- `DROP`: DDL statement that completely removes the table schema, constraints, indexes, and data from the catalog.',
    category_slug: 'dbms',
    topic: 'DDL vs DML Commands',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'DELETE removes rows with logging/triggers; TRUNCATE deallocates data pages quickly; DROP removes table schema completely', is_correct: true },
      { label: 'B', content: 'TRUNCATE can use a WHERE clause; DELETE cannot', is_correct: false },
      { label: 'C', content: 'DROP only clears rows leaving schema intact', is_correct: false },
      { label: 'D', content: 'All three are identical DML commands', is_correct: false }
    ]
  },
  {
    statement: 'What does the `COALESCE()` function do in SQL?',
    explanation: '`COALESCE(val1, val2, ..., valN)` evaluates arguments from left to right and returns the first non-null expression in the list. If all arguments evaluate to NULL, it returns NULL.',
    category_slug: 'dbms',
    topic: 'SQL Built-in Functions',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Returns the first non-null expression from the provided list of arguments', is_correct: true },
      { label: 'B', content: 'Concatenates multiple string columns into a single string', is_correct: false },
      { label: 'C', content: 'Calculates the statistical covariance between two numeric columns', is_correct: false },
      { label: 'D', content: 'Converts null values into empty string exclusively', is_correct: false }
    ]
  },
  {
    statement: 'In SQL window functions, what do `LEAD()` and `LAG()` do?',
    explanation: '- `LAG(col, offset)` accesses data from a preceding row at a given physical offset within the window partition without self-joining.\n- `LEAD(col, offset)` accesses data from a subsequent (following) row at a given physical offset within the window partition.',
    category_slug: 'dbms',
    topic: 'LEAD and LAG Window Functions',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'LAG accesses previous row values; LEAD accesses subsequent row values in the partition', is_correct: true },
      { label: 'B', content: 'LAG pauses query execution; LEAD accelerates index scans', is_correct: false },
      { label: 'C', content: 'LEAD accesses previous rows; LAG accesses subsequent rows', is_correct: false },
      { label: 'D', content: 'They are aggregate functions identical to MIN and MAX', is_correct: false }
    ]
  },
  {
    statement: 'What is a Common Table Expression (CTE) in SQL defined with the `WITH` keyword?',
    explanation: 'A Common Table Expression (CTE) is a temporary, named result set defined within the execution scope of a single `SELECT`, `INSERT`, `UPDATE`, or `DELETE` statement. CTEs improve readability over deeply nested subqueries and can be recursive.',
    category_slug: 'dbms',
    topic: 'Common Table Expressions (CTEs)',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'A temporary named result set defined within the scope of a single query statement using WITH', is_correct: true },
      { label: 'B', content: 'A permanent table created in a temporary database directory', is_correct: false },
      { label: 'C', content: 'A stored procedure that accepts parameters', is_correct: false },
      { label: 'D', content: 'A physical index that speeds up string comparisons', is_correct: false }
    ]
  },
  {
    statement: 'How do you delete duplicate rows from a table while keeping only one copy in standard SQL using window functions?',
    explanation: 'Using `ROW_NUMBER()` in a CTE:\n```sql\nWITH CTE AS (\n  SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) as rn\n  FROM users\n)\nDELETE FROM users WHERE id IN (SELECT id FROM CTE WHERE rn > 1);\n```',
    category_slug: 'dbms',
    topic: 'Deleting Duplicate Rows',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Use ROW_NUMBER() OVER (PARTITION BY duplicate_cols ORDER BY id) in a CTE and delete where rn > 1', is_correct: true },
      { label: 'B', content: 'SELECT DISTINCT * INTO new_table; DROP old_table;', is_correct: false },
      { label: 'C', content: 'DELETE FROM table WHERE id != MAX(id)', is_correct: false },
      { label: 'D', content: 'TRUNCATE TABLE with a UNIQUE constraint', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Self Join" in SQL and when is it typically used?',
    explanation: 'A self join is a regular join in which a table is joined with itself by using distinct table aliases (e.g. `FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.id`). It is used to evaluate hierarchical relationships within the same table.',
    category_slug: 'dbms',
    topic: 'Self Joins',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Joining a table to itself using aliases, typically to query hierarchical or organizational relationships', is_correct: true },
      { label: 'B', content: 'A join that runs automatically on every primary key', is_correct: false },
      { label: 'C', content: 'A join between two tables with identical column definitions', is_correct: false },
      { label: 'D', content: 'A cross product between a table and an empty view', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between a View and a Materialized View in PostgreSQL / SQL?',
    explanation: 'A standard View is a stored virtual query: it does not store data on disk and re-runs the underlying query every time it is referenced.\nA Materialized View physically caches the query results on disk like a real table, allowing fast reads and indexing, but requires explicit `REFRESH MATERIALIZED VIEW` to update.',
    category_slug: 'dbms',
    topic: 'Views vs Materialized Views',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Standard view is a virtual query executed on demand; materialized view physically caches result data on disk', is_correct: true },
      { label: 'B', content: 'Materialized views cannot be indexed', is_correct: false },
      { label: 'C', content: 'Standard views can only query a single table', is_correct: false },
      { label: 'D', content: 'Materialized views update automatically on every single row insertion', is_correct: false }
    ]
  },
  {
    statement: 'What is the purpose of the `EXPLAIN ANALYZE` command in PostgreSQL / SQL?',
    explanation: '`EXPLAIN ANALYZE` executes the statement (in contrast to plain `EXPLAIN` which only estimates), displays the query planner\'s execution tree (Seq Scan, Index Scan, Nested Loop, Hash Join), and shows actual execution times and row counts for each step.',
    category_slug: 'dbms',
    topic: 'Query Performance and EXPLAIN',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Executes the query and displays the actual execution plan, time costs, and row counts for each operator', is_correct: true },
      { label: 'B', content: 'Validates SQL grammar without accessing the database catalog', is_correct: false },
      { label: 'C', content: 'Automatically rewrites slow queries into faster equivalents', is_correct: false },
      { label: 'D', content: 'Estimates storage bytes consumed by uncompressed indexes', is_correct: false }
    ]
  },
  {
    statement: 'What is the result of `SELECT 1 WHERE NULL = NULL OR 1 = 1;` in SQL?',
    explanation: 'In SQL three-valued logic: `NULL = NULL` is UNKNOWN.\n`1 = 1` is TRUE.\nIn boolean OR logic: `UNKNOWN OR TRUE` evaluates to `TRUE`.\nTherefore, the WHERE condition is satisfied and the query outputs `1`.',
    category_slug: 'dbms',
    topic: 'Three-Valued Logic Evaluation',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Returns 1 because UNKNOWN OR TRUE evaluates to TRUE', is_correct: true },
      { label: 'B', content: 'Returns no rows because NULL makes the expression false', is_correct: false },
      { label: 'C', content: 'Throws a syntax error', is_correct: false },
      { label: 'D', content: 'Returns NULL', is_correct: false }
    ]
  },
  {
    statement: 'What is the function of the `CASE` statement in SQL?',
    explanation: 'The `CASE` statement is SQL\'s conditional expression (analogous to if-then-else or switch in procedural languages): `CASE WHEN condition THEN result ELSE default_result END`. It can be used anywhere expressions are valid (SELECT, WHERE, ORDER BY).',
    category_slug: 'dbms',
    topic: 'Conditional Logic CASE',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Provides conditional if-then-else expression logic within SQL queries', is_correct: true },
      { label: 'B', content: 'Converts strings between uppercase and lowercase', is_correct: false },
      { label: 'C', content: 'Switches database connections at runtime', is_correct: false },
      { label: 'D', content: 'Encodes data into base64', is_correct: false }
    ]
  },
  {
    statement: 'What does a `CROSS JOIN` produce in SQL?',
    explanation: 'A `CROSS JOIN` produces the Cartesian product of the two tables, combining every row of the first table with every row of the second table. If table A has 10 rows and table B has 20 rows, the result has 200 rows.',
    category_slug: 'dbms',
    topic: 'Cross Joins',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'The Cartesian product of both tables (combining every row of table 1 with every row of table 2)', is_correct: true },
      { label: 'B', content: 'Only rows where primary keys match exactly', is_correct: false },
      { label: 'C', content: 'The intersection of both tables', is_correct: false },
      { label: 'D', content: 'A join across two remote database servers', is_correct: false }
    ]
  },
  {
    statement: 'Which constraint ensures that all values in a column are distinct, but unlike `PRIMARY KEY`, allows NULL values?',
    explanation: 'A `UNIQUE` constraint guarantees that all non-null values in a column or set of columns are distinct. In standard SQL, multiple rows can have a NULL value in a column with a UNIQUE constraint, whereas a `PRIMARY KEY` strictly prohibits NULL values.',
    category_slug: 'dbms',
    topic: 'Constraints',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'UNIQUE constraint', is_correct: true },
      { label: 'B', content: 'PRIMARY KEY constraint', is_correct: false },
      { label: 'C', content: 'CHECK constraint', is_correct: false },
      { label: 'D', content: 'FOREIGN KEY constraint', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the query: `SELECT department, AVG(salary) FROM employees WHERE salary > 50000 GROUP BY department HAVING COUNT(*) > 5;`?',
    explanation: 'The query processes as follows:\n1. `WHERE salary > 50000`: filters only employees earning > 50,000.\n2. `GROUP BY department`: groups those filtered employees by department.\n3. `HAVING COUNT(*) > 5`: retains only departments that have more than 5 such employees.\n4. `SELECT department, AVG(salary)`: calculates and displays average salary of those employees in qualifying departments.',
    category_slug: 'dbms',
    topic: 'Query Order of Execution',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Average salary of employees earning > 50,000 in departments having more than 5 such employees', is_correct: true },
      { label: 'B', content: 'Average salary of all employees in departments where total headcount exceeds 5', is_correct: false },
      { label: 'C', content: 'Syntax error because WHERE and HAVING cannot appear in the same query', is_correct: false },
      { label: 'D', content: 'The highest 5 salaries across all departments', is_correct: false }
    ]
  },
  {
    statement: 'What does the SQL wildcard character `%` represent when used with the `LIKE` operator?',
    explanation: 'In SQL `LIKE` pattern matching:\n- `%` represents zero, one, or multiple arbitrary characters.\n- `_` represents exactly one single character.',
    category_slug: 'dbms',
    topic: 'Pattern Matching LIKE',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Zero, one, or multiple characters', is_correct: true },
      { label: 'B', content: 'Exactly one single character', is_correct: false },
      { label: 'C', content: 'Any numeric digit from 0 to 9', is_correct: false },
      { label: 'D', content: 'An escape sequence prefix', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Composite Primary Key" in SQL?',
    explanation: 'A composite primary key is a primary key composed of two or more columns that together uniquely identify each row in a table. It is defined at the table level using `PRIMARY KEY (col1, col2)`.',
    category_slug: 'dbms',
    topic: 'Composite Keys',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'A primary key made up of two or more columns to guarantee uniqueness', is_correct: true },
      { label: 'B', content: 'A primary key that references another primary key', is_correct: false },
      { label: 'C', content: 'A primary key that contains encrypted hashes', is_correct: false },
      { label: 'D', content: 'A key that automatically increments by 2', is_correct: false }
    ]
  },
  {
    statement: 'In SQL, what is the logical order of execution of query clauses?',
    explanation: 'The standard SQL execution order is:\n1. FROM / JOIN\n2. WHERE\n3. GROUP BY\n4. HAVING\n5. SELECT (evaluating window functions & expressions)\n6. DISTINCT\n7. ORDER BY\n8. LIMIT / OFFSET',
    category_slug: 'dbms',
    topic: 'SQL Execution Pipeline',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT', is_correct: true },
      { label: 'B', content: 'SELECT -> FROM -> WHERE -> GROUP BY -> HAVING -> ORDER BY', is_correct: false },
      { label: 'C', content: 'FROM -> SELECT -> WHERE -> ORDER BY -> GROUP BY', is_correct: false },
      { label: 'D', content: 'WHERE -> FROM -> GROUP BY -> HAVING -> SELECT', is_correct: false }
    ]
  },
  {
    statement: 'What does `PARTITION BY` do inside an `OVER()` window clause in SQL?',
    explanation: '`PARTITION BY` divides the query result set into distinct partitions/groups of rows over which the window function operates independently, without collapsing rows (unlike `GROUP BY` which aggregates rows into a single row per group).',
    category_slug: 'dbms',
    topic: 'Window Partitioning',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Divides rows into subsets over which window functions compute while preserving individual row outputs', is_correct: true },
      { label: 'B', content: 'Collapses multiple rows into a single aggregate row', is_correct: false },
      { label: 'C', content: 'Partitions data tables across physical hard drives', is_correct: false },
      { label: 'D', content: 'Sorts rows in descending order', is_correct: false }
    ]
  },
  {
    statement: 'What happens when you execute `INSERT INTO ... ON CONFLICT DO NOTHING` in PostgreSQL?',
    explanation: 'In PostgreSQL, `ON CONFLICT DO NOTHING` specifies that if an insertion violates a unique or exclusion constraint (such as a duplicate primary key), the database will silently skip inserting that row without raising an error or aborting the transaction.',
    category_slug: 'dbms',
    topic: 'Upserts and Conflict Handling',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Silently ignores unique constraint violations and skips insertion without failing the transaction', is_correct: true },
      { label: 'B', content: 'Deletes the existing conflicting row and inserts the new row', is_correct: false },
      { label: 'C', content: 'Throws a runtime exception that must be caught by PL/pgSQL', is_correct: false },
      { label: 'D', content: 'Overwrites all columns with NULL values', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Recursive CTE" in SQL and what are its two constituent query parts?',
    explanation: 'A Recursive CTE references itself to traverse hierarchical or graph data (like org charts or bill-of-materials). It consists of:\n1. An Anchor Member (base non-recursive query).\n2. A Recursive Member joined to the CTE itself via `UNION ALL`.\nIt runs repeatedly until the recursive query yields an empty result set.',
    category_slug: 'dbms',
    topic: 'Recursive CTEs',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'An Anchor Member query and a Recursive Member query combined with UNION ALL', is_correct: true },
      { label: 'B', content: 'A stored procedure that invokes itself recursively', is_correct: false },
      { label: 'C', content: 'A circular foreign key reference between two tables', is_correct: false },
      { label: 'D', content: 'A query that executes continuously on a cron schedule', is_correct: false }
    ]
  },
  {
    statement: 'What is the SQL standard command to cancel all changes made within an uncommitted transaction?',
    explanation: 'The `ROLLBACK` command aborts the current transaction and undoes all modifications performed since the transaction started (or since the last `SAVEPOINT`).',
    category_slug: 'dbms',
    topic: 'TCL Commands',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'ROLLBACK', is_correct: true },
      { label: 'B', content: 'COMMIT', is_correct: false },
      { label: 'C', content: 'CANCEL', is_correct: false },
      { label: 'D', content: 'REVERT', is_correct: false }
    ]
  },
  {
    statement: 'What is an "Index Scan" vs a "Sequential Scan" (Seq Scan) in SQL database query execution?',
    explanation: '- Sequential Scan: reads every single page and row in the table file from start to finish.\n- Index Scan: navigates the B+ Tree index structure using the search key to locate specific row pointers (TIDs) and fetches only matching pages from disk.',
    category_slug: 'dbms',
    topic: 'Query Plans Index vs Seq Scan',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Seq scan reads all table pages sequentially; Index scan navigates an index tree to directly fetch matching rows', is_correct: true },
      { label: 'B', content: 'Seq scan only reads indexes; Index scan reads the entire hard drive', is_correct: false },
      { label: 'C', content: 'Index scan is always slower than Seq scan for tiny tables of 5 rows', is_correct: false },
      { label: 'D', content: 'Seq scan is only performed when an index is corrupted', is_correct: false }
    ]
  },
  {
    statement: 'What does `NULLIF(expression1, expression2)` return in SQL?',
    explanation: '`NULLIF(exp1, exp2)` returns NULL if `expression1 == expression2`; otherwise, it returns `expression1`. It is commonly used to prevent division by zero errors: `val / NULLIF(divisor, 0)`.',
    category_slug: 'dbms',
    topic: 'NULLIF Function',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'NULL if both expressions are equal; otherwise returns expression1', is_correct: true },
      { label: 'B', content: 'expression2 if expression1 is NULL', is_correct: false },
      { label: 'C', content: 'TRUE if both expressions are NULL', is_correct: false },
      { label: 'D', content: 'The sum of both expressions if neither is NULL', is_correct: false }
    ]
  }
];
