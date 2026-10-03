import { SeedQuestion } from './questions_aptitude';

export const INTERVIEW_QUESTIONS: SeedQuestion[] = [
  // ==========================================
  // SYSTEM DESIGN & ARCHITECTURE (20 QUESTIONS)
  // ==========================================
  {
    statement: 'What does the CAP Theorem state regarding distributed data systems?',
    explanation: 'The CAP theorem (Brewer\'s theorem) states that any distributed data store can simultaneously provide at most two out of the following three guarantees:\n1. Consistency (C): every read receives the most recent write or an error.\n2. Availability (A): every non-failing node returns a response (without guarantee that it contains most recent write).\n3. Partition Tolerance (P): system continues operating despite arbitrary network partitioning / dropped messages.\nBecause network partitions are inevitable in real networks (P is mandatory), systems must choose between CP and AP.',
    category_slug: 'technical-aptitude',
    topic: 'System Design - CAP Theorem',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'A distributed system can guarantee at most two of: Consistency, Availability, and Partition Tolerance in the presence of network partitions', is_correct: true },
      { label: 'B', content: 'All distributed databases must sacrifice Partition Tolerance in cloud deployments', is_correct: false },
      { label: 'C', content: 'Consistency can be maintained only if CPU power exceeds 99%', is_correct: false },
      { label: 'D', content: 'Availability is impossible in systems with more than 3 nodes', is_correct: false }
    ]
  },
  {
    statement: 'What is the primary difference between Horizontal Scaling (Scaling Out) and Vertical Scaling (Scaling Up)?',
    explanation: '- Vertical Scaling (Scale Up): adding more CPU, RAM, or faster NVMe disks to a single server. Limited by hardware ceiling and introduces a single point of failure.\n- Horizontal Scaling (Scale Out): adding more server instances to the pool and distributing load via a load balancer. Provides linear scalability, fault tolerance, and redundancy.',
    category_slug: 'technical-aptitude',
    topic: 'System Design - Scalability',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Horizontal scaling adds more machine instances to a cluster; Vertical scaling adds more hardware resources (CPU/RAM) to a single machine', is_correct: true },
      { label: 'B', content: 'Vertical scaling is cheaper and infinite in capacity; Horizontal scaling is limited by motherboard sockets', is_correct: false },
      { label: 'C', content: 'Horizontal scaling applies only to monolithic architectures', is_correct: false },
      { label: 'D', content: 'Vertical scaling eliminates database locks', is_correct: false }
    ]
  },
  {
    statement: 'In distributed caching, what is the difference between Cache-Aside (Lazy Loading) and Write-Through caching strategies?',
    explanation: '- Cache-Aside: Application looks for data in cache; on cache miss, it reads from database, writes data to cache, and returns it. Updates write directly to database and invalidate the cache entry.\n- Write-Through: Application writes data to the cache, and the cache synchronously writes to the database before confirming success (ensures strong consistency between cache and DB, but increases write latency).',
    category_slug: 'technical-aptitude',
    topic: 'System Design - Caching Strategies',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Cache-Aside loads cache on misses and invalidates on update; Write-Through updates cache and database synchronously on write', is_correct: true },
      { label: 'B', content: 'Write-Through writes only to memory and ignores database persistence', is_correct: false },
      { label: 'C', content: 'Cache-Aside is only used for static images', is_correct: false },
      { label: 'D', content: 'Write-Through causes cache misses on every read', is_correct: false }
    ]
  },
  {
    statement: 'What is "Consistent Hashing" and why is it preferred over simple modulo hashing (`hash(key) % N`) in distributed caching and storage clusters?',
    explanation: 'Simple modulo hashing maps keys to N servers. When a server is added or removed (N changes), almost 100% of all keys are remapped, causing a massive cache stampede / data reshuffling.\nConsistent Hashing maps both keys and servers to points on a virtual ring (0 to 2^32 - 1). Adding or removing a server remaps only K/N keys on average (only immediate neighbors), minimizing data migration.',
    category_slug: 'technical-aptitude',
    topic: 'System Design - Consistent Hashing',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Maps keys and nodes to a circular hash ring so that adding/removing a node only remaps K/N keys instead of all keys', is_correct: true },
      { label: 'B', content: 'Guarantees that no two keys produce the same hash code in memory', is_correct: false },
      { label: 'C', content: 'Encrypts cached data with AES-256 before hashing', is_correct: false },
      { label: 'D', content: 'Reroutes database queries to the nearest geographic continent', is_correct: false }
    ]
  },
  {
    statement: 'How does a Content Delivery Network (CDN) accelerate content delivery to global users?',
    explanation: 'A CDN is a geographically distributed network of Point of Presence (PoP) edge proxy servers that cache static assets (images, CSS, JS, videos) geographically close to end users, reducing round-trip latency (RTT) and offloading traffic from the origin server.',
    category_slug: 'technical-aptitude',
    topic: 'System Design - CDNs',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Caches static and dynamic content at edge proxy servers geographically closest to end users, minimizing latency and origin server load', is_correct: true },
      { label: 'B', content: 'Overclocks client Wi-Fi routers automatically', is_correct: false },
      { label: 'C', content: 'Replaces TCP/IP with satellite laser links', is_correct: false },
      { label: 'D', content: 'Compresses database rows into JSON', is_correct: false }
    ]
  },
  {
    statement: 'What is the role of an Asynchronous Message Queue (like RabbitMQ, Apache Kafka) in modern software architectures?',
    explanation: 'Message queues decouple producer and consumer services, absorb sudden traffic spikes (rate smoothing / load leveling), enable asynchronous background task processing (email, video encoding), and enhance system resilience (if consumer crashes, messages persist in queue).',
    category_slug: 'technical-aptitude',
    topic: 'System Design - Message Queues',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Decouples microservices, smooths traffic spikes, and enables asynchronous background processing with persistent message storage', is_correct: true },
      { label: 'B', content: 'Replaces relational databases for all SQL transactions', is_correct: false },
      { label: 'C', content: 'Provides synchronous point-to-point HTTP routing without buffering', is_correct: false },
      { label: 'D', content: 'Manages user authentication sessions in memory', is_correct: false }
    ]
  },
  {
    statement: 'What is Database Sharding (Horizontal Partitioning) and what challenge does it introduce?',
    explanation: 'Sharding splits a huge database table across multiple independent database servers based on a shard key (e.g. `user_id % num_shards`). While it enables horizontal scaling beyond single-server storage/CPU limits, it makes cross-shard joins, distributed transactions (2PC), and schema migrations complex and costly.',
    category_slug: 'technical-aptitude',
    topic: 'System Design - Database Sharding',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Partitions rows across separate database nodes by shard key; introduces challenges for cross-shard joins and distributed transactions', is_correct: true },
      { label: 'B', content: 'Duplicates the database schema to read-only replicas without splitting data', is_correct: false },
      { label: 'C', content: 'Converts relational tables into unindexed CSV files', is_correct: false },
      { label: 'D', content: 'Encrypts database disks against hardware theft', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Rate Limiter" and how does the Token Bucket algorithm work?',
    explanation: 'A rate limiter restricts the frequency of API requests from clients to prevent abuse, DoS, and resource starvation.\nIn the Token Bucket algorithm: Tokens are added to a bucket of capacity B at a constant rate R tokens/sec. Each incoming request consumes 1 token. If the bucket has tokens, request is allowed; if empty, request is dropped (HTTP 429 Too Many Requests). It allows short burst traffic up to bucket capacity B.',
    category_slug: 'technical-aptitude',
    topic: 'System Design - Rate Limiting',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Tokens refill at a fixed rate up to capacity B; incoming requests consume tokens and are throttled if bucket is empty (allows controlled bursts)', is_correct: true },
      { label: 'B', content: 'Counts requests in fixed 1-minute blocks with no burst support', is_correct: false },
      { label: 'C', content: 'A firewall that blocks all traffic from non-HTTPS origins', is_correct: false },
      { label: 'D', content: 'Limits the size of JSON payloads to 1 MB', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between SQL (Relational) and NoSQL (Document / Key-Value) databases, and when should NoSQL be chosen?',
    explanation: 'SQL databases (PostgreSQL, MySQL) enforce fixed structured schemas, ACID transactions, and complex relational joins (ideal for financial records, ERPs).\nNoSQL databases (MongoDB, DynamoDB, Redis) offer dynamic unstructured schemas, horizontal scaling by default, and high write throughput (ideal for high-velocity IoT telemetry, user sessions, unstructured catalogs, real-time analytics).',
    category_slug: 'technical-aptitude',
    topic: 'System Design - SQL vs NoSQL',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'SQL provides strict schemas and ACID transactions for relational data; NoSQL provides flexible schemas, horizontal scale, and high throughput for unstructured/semi-structured data', is_correct: true },
      { label: 'B', content: 'NoSQL databases do not use hard drives or SSDs', is_correct: false },
      { label: 'C', content: 'SQL databases cannot scale beyond 100 rows', is_correct: false },
      { label: 'D', content: 'NoSQL is strictly faster than SQL in every single benchmark', is_correct: false }
    ]
  },
  {
    statement: 'What is the "Circuit Breaker" pattern in distributed microservices?',
    explanation: 'The Circuit Breaker pattern prevents cascading failures across microservices: when downstream calls fail repeatedly beyond a threshold, the circuit trips (opens), immediately returning fallback errors without waiting for timeouts. Periodically (half-open), test requests are sent to check if the downstream service has recovered.',
    category_slug: 'technical-aptitude',
    topic: 'System Design - Resiliency Patterns',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Prevents cascading failures by failing fast when a remote service is failing, allowing it time to recover before retrying', is_correct: true },
      { label: 'B', content: 'Cuts physical electricity to overheating server racks', is_correct: false },
      { label: 'C', content: 'Terminates runaway database queries after 5 seconds', is_correct: false },
      { label: 'D', content: 'Validates API JWT tokens at the gateway level', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between Layer 4 and Layer 7 Load Balancing?',
    explanation: '- Layer 4 (Transport) Load Balancer: routes traffic based on IP address and TCP/UDP port without inspecting application payload (faster, lower CPU overhead, e.g. AWS NLB, IPVS).\n- Layer 7 (Application) Load Balancer: inspects HTTP/HTTPS headers, cookies, URL paths, and query parameters to perform smart content-based routing (e.g. NGINX, AWS ALB).',
    category_slug: 'technical-aptitude',
    topic: 'System Design - Load Balancing',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Layer 4 routes packets based on IP/port; Layer 7 inspects HTTP headers, URLs, and cookies for smart content routing', is_correct: true },
      { label: 'B', content: 'Layer 7 operates on optical fiber; Layer 4 operates on copper cables', is_correct: false },
      { label: 'C', content: 'Layer 4 is only used for email servers', is_correct: false },
      { label: 'D', content: 'Layer 7 load balancers cannot handle SSL/TLS termination', is_correct: false }
    ]
  },
  {
    statement: 'What is "Database Replication" and what is the difference between Synchronous and Asynchronous replication?',
    explanation: '- Replication copies data from a Primary (Leader) node to one or more Replica (Follower) nodes for read scaling and high availability.\n- Synchronous: Primary writes data and waits for confirmation from replicas before returning success to client (strong consistency, higher write latency).\n- Asynchronous: Primary writes data and returns success immediately, propagating changes to replicas in background (lower latency, risk of data loss on leader crash).',
    category_slug: 'technical-aptitude',
    topic: 'System Design - Replication',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Synchronous replication waits for replicas to acknowledge before confirming write; Asynchronous confirms write immediately and replicates in background', is_correct: true },
      { label: 'B', content: 'Asynchronous replication requires fiber optic cables', is_correct: false },
      { label: 'C', content: 'Synchronous replication eliminates the need for database backups', is_correct: false },
      { label: 'D', content: 'Replication can only duplicate read-only views', is_correct: false }
    ]
  },
  {
    statement: 'In URL Shortener design (like bit.ly), which encoding scheme is standard to encode a 64-bit integer ID into a compact alphanumeric string?',
    explanation: 'Base62 encoding (using characters [a-z], [A-Z], [0-9]) provides 62 characters per digit. A 7-character Base62 string can represent 62^7 = ~3.5 trillion unique URLs without special characters, keeping URLs clean and URL-safe.',
    category_slug: 'technical-aptitude',
    topic: 'System Design - URL Shortener',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Base62 encoding ([a-z], [A-Z], [0-9]), producing 62^7 (~3.5 trillion) compact, URL-safe identifiers', is_correct: true },
      { label: 'B', content: 'Hexadecimal (Base16) encoding', is_correct: false },
      { label: 'C', content: 'Binary encoding with ASCII parity bits', is_correct: false },
      { label: 'D', content: 'Base64 with padding characters (+, /, =)', is_correct: false }
    ]
  },
  {
    statement: 'What is a "WebSocket" connection and how does it differ from traditional HTTP polling?',
    explanation: 'HTTP is a request-response protocol where clients initiate requests and connections close after response (or poll repeatedly).\nWebSocket provides a persistent, full-duplex, bidirectional communication channel over a single TCP socket initiated via an HTTP 101 Switching Protocols upgrade handshake, allowing server to push data with minimal framing overhead (2-10 bytes).',
    category_slug: 'technical-aptitude',
    topic: 'System Design - Real-time WebSockets',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Provides a persistent, bidirectional, full-duplex TCP channel with minimal overhead after an HTTP upgrade handshake', is_correct: true },
      { label: 'B', content: 'Periodically sends HTTP GET requests every 500ms', is_correct: false },
      { label: 'C', content: 'A protocol that runs only inside browser service workers', is_correct: false },
      { label: 'D', content: 'An encrypted UDP tunnel used exclusively for video', is_correct: false }
    ]
  },
  {
    statement: 'What is the "Split-Brain" problem in distributed consensus clusters?',
    explanation: 'Split-Brain occurs during a network partition when cluster nodes are partitioned into two or more isolated sub-clusters, each believing the other is dead and independently electing a new leader. Both sub-clusters accept conflicting writes, leading to severe data inconsistency.\nIt is prevented using Quorum: requiring a strict majority (> N/2 nodes) to elect leaders and commit writes.',
    category_slug: 'technical-aptitude',
    topic: 'System Design - Split-Brain and Quorum',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Network partition causes sub-clusters to independently elect leaders and accept conflicting writes; prevented via Quorum (> N/2)', is_correct: true },
      { label: 'B', content: 'A CPU running out of registers during floating point operations', is_correct: false },
      { label: 'C', content: 'When a database has both clustered and non-clustered indexes', is_correct: false },
      { label: 'D', content: 'Two user threads calling System.exit() simultaneously', is_correct: false }
    ]
  },
  {
    statement: 'What is an "API Gateway" in a microservices architecture?',
    explanation: 'An API Gateway is a reverse proxy that acts as the single entry point for all client requests into the microservices architecture. It handles cross-cutting concerns such as authentication, authorization, rate limiting, request routing, SSL termination, and API versioning.',
    category_slug: 'technical-aptitude',
    topic: 'System Design - API Gateway',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'A single entry reverse proxy handling routing, authentication, rate limiting, and SSL termination for microservices', is_correct: true },
      { label: 'B', content: 'A physical router installed in the data center server rack', is_correct: false },
      { label: 'C', content: 'A database that stores API keys in encrypted tables', is_correct: false },
      { label: 'D', content: 'A tool that automatically writes Swagger OpenAPI documentation', is_correct: false }
    ]
  },
  {
    statement: 'What is "Eventual Consistency" in distributed databases?',
    explanation: 'Eventual Consistency is a consistency model in distributed systems (often BASE instead of ACID): if no new updates are made to a given data item, all replicas will eventually become consistent and converge on the same value after propagation delay.',
    category_slug: 'technical-aptitude',
    topic: 'System Design - Eventual Consistency',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Replicas may temporarily diverge during updates, but are guaranteed to converge to the same value in the absence of new writes', is_correct: true },
      { label: 'B', content: 'Data is guaranteed to be consistent only at midnight every day', is_correct: false },
      { label: 'C', content: 'Data is never consistent across multiple nodes', is_correct: false },
      { label: 'D', content: 'Transactions are rolled back if replicas disagree within 1 millisecond', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Bloom Filter" and what is its trade-off in distributed systems?',
    explanation: 'A Bloom Filter is a space-efficient probabilistic data structure used to test whether an element is a member of a set. It can return False Positives ("element might be in set"), but NEVER returns False Negatives ("element definitely not in set"). It avoids expensive disk reads for non-existent keys.',
    category_slug: 'technical-aptitude',
    topic: 'System Design - Bloom Filters',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'A probabilistic data structure with zero false negatives (can return false positives), saving disk I/O on non-existent keys', is_correct: true },
      { label: 'B', content: 'A lossless compression algorithm for streaming media', is_correct: false },
      { label: 'C', content: 'A cryptographic hash function designed to prevent collision attacks', is_correct: false },
      { label: 'D', content: 'A network packet filter operating on physical optical switches', is_correct: false }
    ]
  },
  {
    statement: 'What does "Idempotency" mean in RESTful API design?',
    explanation: 'An HTTP method or API operation is idempotent if making multiple identical requests has the same intended effect and leaves the server state identical to making a single request (e.g. GET, PUT, DELETE are idempotent; POST is typically non-idempotent).',
    category_slug: 'technical-aptitude',
    topic: 'REST API Design - Idempotency',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Executing the same request multiple times produces the exact same server state as executing it once', is_correct: true },
      { label: 'B', content: 'The request can only be executed by administrators', is_correct: false },
      { label: 'C', content: 'The API endpoint requires an encryption password', is_correct: false },
      { label: 'D', content: 'The response is returned in binary format rather than JSON', is_correct: false }
    ]
  },
  {
    statement: 'What is "Write-Behind" (Write-Back) caching and what is its main drawback?',
    explanation: 'In Write-Behind caching, application writes directly to cache memory, and the cache confirms success immediately while asynchronously batch-writing updates to database later. While write latency is near-zero, a cache node crash before dirty data is flushed results in permanent data loss.',
    category_slug: 'technical-aptitude',
    topic: 'System Design - Write-Behind Caching',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Writes to cache and acknowledges immediately, flushing to DB asynchronously; risk of data loss if cache crashes before flush', is_correct: true },
      { label: 'B', content: 'Writes directly to DB bypassing cache entirely', is_correct: false },
      { label: 'C', content: 'Writes data to tape drives in reverse order', is_correct: false },
      { label: 'D', content: 'Requires read-only replicas to process write commands', is_correct: false }
    ]
  },

  // ==========================================
  // TRICKY OUTPUT & CODE PREDICTION (15 QUESTIONS)
  // ==========================================
  {
    statement: 'What is the output of the following JavaScript code snippet?\n\n```javascript\nconsole.log(1 + "2" + "2");\nconsole.log(1 + +"2" + "2");\nconsole.log(1 + -"1" + "2");\n```',
    explanation: '- `1 + "2" + "2"`: `1 + "2"` undergoes string concatenation -> `"12"` + `"2"` -> `"122"`.\n- `1 + +"2" + "2"`: Unary plus `+"2"` converts string to number `2`. `1 + 2 = 3` + `"2"` -> `"32"`.\n- `1 + -"1" + "2"`: Unary minus `-"1"` converts string to number `-1`. `1 + (-1) = 0` + `"2"` -> `"02"`.',
    category_slug: 'technical-aptitude',
    topic: 'Type Coercion and Output Prediction',
    difficulty: 'medium',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: '122, 32, 02', is_correct: true },
      { label: 'B', content: '5, 5, 2', is_correct: false },
      { label: 'C', content: '122, 122, 1-12', is_correct: false },
      { label: 'D', content: 'NaN, NaN, NaN', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the following C code snippet?\n\n```c\n#include <stdio.h>\nint main() {\n    int x = 5;\n    if (x == 5)\n        if (x == 6)\n            printf("A");\n    else\n        printf("B");\n    return 0;\n}\n```',
    explanation: 'Dangling Else problem: In C, an `else` statement is always paired with the closest preceding unmatched `if` statement unless braces `{}` are used. Here, `else` belongs to `if (x == 6)`. Since `x == 5` is true, the inner `if (x == 6)` evaluates to false, executing its else branch which prints "B".',
    category_slug: 'c-programming',
    topic: 'Dangling Else in C',
    difficulty: 'medium',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: 'B', is_correct: true },
      { label: 'B', content: 'A', is_correct: false },
      { label: 'C', content: 'Nothing is printed', is_correct: false },
      { label: 'D', content: 'Compilation error', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the following Java snippet?\n\n```java\nInteger a = 127;\nInteger b = 127;\nSystem.out.print((a == b) + " ");\n\nInteger c = 128;\nInteger d = 128;\nSystem.out.print(a == b ? (c == d) : false);\n```',
    explanation: 'Java caches `Integer` objects within the range -128 to 127 (Integer Cache). For values within this range, autoboxing returns the same cached reference, so `a == b` is `true`. For values outside this range (128), new Integer object instances are created on heap, so reference equality `c == d` evaluates to `false`. Output: `true false`.',
    category_slug: 'java',
    topic: 'Integer Cache and Autoboxing',
    difficulty: 'medium',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: 'true false', is_correct: true },
      { label: 'B', content: 'true true', is_correct: false },
      { label: 'C', content: 'false false', is_correct: false },
      { label: 'D', content: 'false true', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the following Python snippet?\n\n```python\nfuncs = [lambda: i for i in range(4)]\nprint([f() for f in funcs])\n```',
    explanation: 'Late binding in Python closures: The variable `i` is looked up in the surrounding scope when the lambda is CALLED, not when it is created. When the list comprehension finishes, `i` has the value 3. Therefore, calling each function returns 3. Output: `[3, 3, 3, 3]`. (To bind eagerly: `lambda i=i: i`).',
    category_slug: 'python',
    topic: 'Late Binding Closures',
    difficulty: 'medium',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: '[3, 3, 3, 3]', is_correct: true },
      { label: 'B', content: '[0, 1, 2, 3]', is_correct: false },
      { label: 'C', content: '[0, 0, 0, 0]', is_correct: false },
      { label: 'D', content: 'SyntaxError', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the following JavaScript event loop snippet?\n\n```javascript\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);\n```',
    explanation: 'Execution order in JS event loop:\n1. Synchronous code executes immediately: logs `1`, then logs `4`.\n2. Microtask queue (Promises) executes before macrotasks: logs `3`.\n3. Macrotask queue (setTimeout timer callback) executes: logs `2`.\nFinal output order: 1, 4, 3, 2.',
    category_slug: 'technical-aptitude',
    topic: 'Event Loop and Microtasks',
    difficulty: 'medium',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: '1, 4, 3, 2', is_correct: true },
      { label: 'B', content: '1, 2, 3, 4', is_correct: false },
      { label: 'C', content: '1, 4, 2, 3', is_correct: false },
      { label: 'D', content: '1, 3, 4, 2', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the following C code snippet?\n\n```c\n#include <stdio.h>\nint main() {\n    int a = 10, b = 20, c = 30;\n    if (c > b > a)\n        printf("TRUE");\n    else\n        printf("FALSE");\n    return 0;\n}\n```',
    explanation: 'Relational operators in C have left-to-right associativity: `c > b > a` is evaluated as `(c > b) > a`.\n`c > b` (30 > 20) evaluates to `1` (true).\nThen `1 > a` (1 > 10) evaluates to `0` (false).\nTherefore, the if condition fails and "FALSE" is printed.',
    category_slug: 'c-programming',
    topic: 'Operator Associativity',
    difficulty: 'medium',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: 'FALSE', is_correct: true },
      { label: 'B', content: 'TRUE', is_correct: false },
      { label: 'C', content: 'Compilation error', is_correct: false },
      { label: 'D', content: 'Undefined behavior', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the following Java snippet?\n\n```java\nString s1 = "Placement";\nString s2 = new String("Placement");\nString s3 = s2.intern();\nSystem.out.println((s1 == s2) + " " + (s1 == s3));\n```',
    explanation: '`s1` references the string literal in the String Constant Pool.\n`s2` is created via `new String()` on the heap, so `s1 == s2` is `false` (different object references).\n`s2.intern()` returns the canonical reference from the String Constant Pool, which matches `s1`, so `s1 == s3` is `true`. Output: `false true`.',
    category_slug: 'java',
    topic: 'String Interning',
    difficulty: 'medium',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: 'false true', is_correct: true },
      { label: 'B', content: 'true true', is_correct: false },
      { label: 'C', content: 'false false', is_correct: false },
      { label: 'D', content: 'true false', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the following C++ code snippet?\n\n```cpp\n#include <iostream>\nstruct Base {\n    virtual void print() { std::cout << "Base "; }\n};\nstruct Derived : Base {\n    void print() { std::cout << "Derived "; }\n};\nint main() {\n    Derived d;\n    Base b = d;\n    b.print();\n    Base *bp = &d;\n    bp->print();\n    return 0;\n}\n```',
    explanation: '- `Base b = d;` causes Object Slicing: `d` is value-copied into a `Base` object `b`, slicing away derived members and resetting vptr to Base. `b.print()` invokes `Base::print()`, printing "Base ".\n- `Base *bp = &d;` is a polymorphic pointer to the original `Derived` instance. `bp->print()` undergoes dynamic dispatch via vtable, invoking `Derived::print()`, printing "Derived ".\nCombined output: "Base Derived ".',
    category_slug: 'cpp-programming',
    topic: 'Object Slicing and Polymorphism',
    difficulty: 'hard',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: 'Base Derived ', is_correct: true },
      { label: 'B', content: 'Derived Derived ', is_correct: false },
      { label: 'C', content: 'Base Base ', is_correct: false },
      { label: 'D', content: 'Compilation error', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the following Python snippet?\n\n```python\nx = (1)\ny = (1,)\nprint(type(x), type(y))\n```',
    explanation: 'Parentheses around a single item without a trailing comma `(1)` are treated as grouping parentheses around an integer, so `type(x)` is `int`.\nTo define a single-element tuple in Python, a trailing comma is required `(1,)`, so `type(y)` is `tuple`. Output: `<class \'int\'> <class \'tuple\'>`.',
    category_slug: 'python',
    topic: 'Tuple Syntax',
    difficulty: 'easy',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: "<class 'int'> <class 'tuple'>", is_correct: true },
      { label: 'B', content: "<class 'tuple'> <class 'tuple'>", is_correct: false },
      { label: 'C', content: "<class 'int'> <class 'int'>", is_correct: false },
      { label: 'D', content: 'SyntaxError', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the following SQL query when table `T` has 3 rows where column `A` values are `1`, `2`, `NULL`?\n\n`SELECT COUNT(*), COUNT(A), SUM(A), AVG(A) FROM T;`',
    explanation: '- `COUNT(*)` counts all rows including NULL -> 3.\n- `COUNT(A)` counts non-NULL rows -> 2.\n- `SUM(A)` ignores NULL: 1 + 2 = 3.\n- `AVG(A)` divides sum by count of non-NULL values: 3 / 2 = 1.5 (NOT 3 / 3).\nResult: 3, 2, 3, 1.5.',
    category_slug: 'dbms',
    topic: 'SQL Aggregate Handling of NULL',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '3, 2, 3, 1.5', is_correct: true },
      { label: 'B', content: '3, 3, 3, 1.0', is_correct: false },
      { label: 'C', content: '3, 2, NULL, NULL', is_correct: false },
      { label: 'D', content: '2, 2, 3, 1.5', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the following C code snippet?\n\n```c\n#include <stdio.h>\nint main() {\n    printf(5 + "Good Morning\\n");\n    return 0;\n}\n```',
    explanation: 'A string literal is an array of characters decayable to a pointer to the first character `char*`. Adding 5 (`5 + ptr`) advances the pointer by 5 character offsets past \'G\', \'o\', \'o\', \'d\', \' \' to the \'M\'. `printf` prints from \'M\' to the end, outputting "Morning\\n".',
    category_slug: 'c-programming',
    topic: 'String Pointer Arithmetic',
    difficulty: 'medium',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: 'Morning', is_correct: true },
      { label: 'B', content: 'Good Morning', is_correct: false },
      { label: 'C', content: 'Compilation error', is_correct: false },
      { label: 'D', content: '5 Good Morning', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the following Java snippet?\n\n```java\ntry {\n    System.out.print("A ");\n    throw new Exception();\n} catch (Exception e) {\n    System.out.print("B ");\n    return;\n} finally {\n    System.out.print("C ");\n}\n```',
    explanation: 'The `try` block prints "A " and throws an Exception. The `catch` block catches it and prints "B ". Even though `return;` is executed inside the catch block, the `finally` block is guaranteed to execute before the method returns, printing "C ". Output: "A B C ".',
    category_slug: 'java',
    topic: 'Try Catch Finally Execution Order',
    difficulty: 'easy',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: 'A B C ', is_correct: true },
      { label: 'B', content: 'A B ', is_correct: false },
      { label: 'C', content: 'A C ', is_correct: false },
      { label: 'D', content: 'Compilation error', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the following JavaScript closure loop?\n\n```javascript\nfor (var i = 0; i < 3; i++) {\n    setTimeout(() => console.log(i), 10);\n}\n```',
    explanation: '`var` is function-scoped (or globally scoped), not block-scoped. All three timer callbacks close over the exact same variable `i`. By the time the 10ms timer expires and the callbacks execute on the event loop, the loop has completed and `i` equals 3. Output: 3, 3, 3. (Using `let` solves this because `let` is block-scoped per iteration).',
    category_slug: 'technical-aptitude',
    topic: 'JavaScript Var vs Let Scope',
    difficulty: 'easy',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: '3, 3, 3', is_correct: true },
      { label: 'B', content: '0, 1, 2', is_correct: false },
      { label: 'C', content: 'undefined, undefined, undefined', is_correct: false },
      { label: 'D', content: '0, 0, 0', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the following C++ code snippet?\n\n```cpp\n#include <iostream>\nint main() {\n    int a = 1;\n    std::cout << (a << 3) + (a >> 1);\n    return 0;\n}\n```',
    explanation: 'Addition `+` has higher precedence than bitwise shifts `<<` and `>>`! Therefore, the expression is parsed as `a << (3 + (a >> 1))`.\n`a >> 1` = `1 >> 1` = `0`.\n`3 + 0` = `3`.\n`a << 3` = `1 << 3` = `8`.\nResult printed is 8.',
    category_slug: 'cpp-programming',
    topic: 'Bitwise Operator Precedence',
    difficulty: 'hard',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: '8', is_correct: true },
      { label: 'B', content: '9', is_correct: false },
      { label: 'C', content: '4', is_correct: false },
      { label: 'D', content: '0', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the following Python dictionary key equality test?\n\n```python\nd = {}\nd[1] = "integer"\nd[1.0] = "float"\nd[True] = "boolean"\nprint(len(d), d[1])\n```',
    explanation: 'In Python, `hash(1) == hash(1.0) == hash(True) == 1`, and `1 == 1.0 == True` evaluates to `True`. Because keys are compared for equality and identical hash codes, all three keys point to the exact same dictionary bucket! Each assignment overwrites the previous value. Final dictionary has `len(d) = 1` and `d[1] = "boolean"`.',
    category_slug: 'python',
    topic: 'Hash Collision and Key Equality',
    difficulty: 'hard',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: '1 boolean', is_correct: true },
      { label: 'B', content: '3 integer', is_correct: false },
      { label: 'C', content: '3 boolean', is_correct: false },
      { label: 'D', content: 'TypeError: unhashable types', is_correct: false }
    ]
  },

  // ==========================================
  // BEHAVIORAL & HR INTERVIEW SCENARIOS (20 QUESTIONS)
  // ==========================================
  {
    statement: 'In the STAR interview methodology used by top tier tech companies (Amazon, Microsoft, Google), what do the four letters stand for?',
    explanation: 'The STAR method structures behavioral responses effectively:\n- Situation: Describe the context, project background, and constraints.\n- Task: Clarify your specific responsibility or goal.\n- Action: Detail the specific steps and technical initiatives you personally took.\n- Result: Quantify the concrete business outcome, performance impact, or lessons learned.',
    category_slug: 'verbal-aptitude',
    topic: 'STAR Methodology',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Situation, Task, Action, Result', is_correct: true },
      { label: 'B', content: 'Strategy, Target, Assessment, Review', is_correct: false },
      { label: 'C', content: 'Scope, Timeline, Allocation, Revenue', is_correct: false },
      { label: 'D', content: 'Skill, Technique, Application, Resilience', is_correct: false }
    ]
  },
  {
    statement: 'When an interviewer asks: "Tell me about a time you had a technical disagreement with a team member. How did you resolve it?", what is the best strategy?',
    explanation: 'The optimal answer demonstrates professional maturity: focus on objective data and requirements rather than ego, actively listen to the teammate\'s perspective, evaluate trade-offs (e.g. benchmarking latency vs development time), collaborate on a prototype, and commit fully to the agreed solution.',
    category_slug: 'verbal-aptitude',
    topic: 'Behavioral - Conflict Resolution',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Focus on technical data and trade-offs, listen objectively, evaluate via benchmarking or prototyping, and align constructively', is_correct: true },
      { label: 'B', content: 'Insist firmly on your idea until the teammate concedes defeat', is_correct: false },
      { label: 'C', content: 'Immediately escalate to the manager to force the teammate to comply', is_correct: false },
      { label: 'D', content: 'Silently implement your version in secret without informing the team', is_correct: false }
    ]
  },
  {
    statement: 'When asked: "Why are you interested in joining our company?", which response structure creates the strongest positive impression?',
    explanation: 'A strong answer demonstrates thorough research: reference specific engineering products, open-source projects, or business scale of the company; connect your personal technical skills and career goals to their mission; and articulate where you can deliver immediate impact.',
    category_slug: 'verbal-aptitude',
    topic: 'Behavioral - Company Alignment',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Demonstrate concrete knowledge of their engineering challenges/products, align your skills to their mission, and show enthusiasm for contributing', is_correct: true },
      { label: 'B', content: 'State that you need a job with high compensation and remote flexibility', is_correct: false },
      { label: 'C', content: 'Mention that your college placement cell told everyone to apply', is_correct: false },
      { label: 'D', content: 'Compliment the company headquarters campus amenities exclusively', is_correct: false }
    ]
  },
  {
    statement: 'How should a candidate answer: "What is your greatest weakness?" in an HR placement round?',
    explanation: 'Choose a genuine professional skill (not a fake flaw like "I work too hard"), show self-awareness, and focus the majority of your answer on the concrete proactive actions and systems you are currently employing to overcome it.',
    category_slug: 'verbal-aptitude',
    topic: 'Behavioral - Self-Awareness',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Identify a real professional growth area, explain its impact, and highlight concrete proactive steps you are taking to improve', is_correct: true },
      { label: 'B', content: 'Say "I am a perfectionist and work too hard for my own good"', is_correct: false },
      { label: 'C', content: 'State that you have no weaknesses and never make mistakes', is_correct: false },
      { label: 'D', content: 'Admit that you struggle with waking up on time for morning shifts', is_correct: false }
    ]
  },
  {
    statement: 'During a live coding assessment, what is the most important etiquette when you encounter an unfamiliar problem?',
    explanation: 'Think out loud: clarify assumptions and constraints with the interviewer, state the brute-force approach first to establish a baseline, analyze its time/space complexity, and collaborate transparently as you optimize toward an efficient solution.',
    category_slug: 'technical-aptitude',
    topic: 'Technical Interview Etiquette',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Think out loud, clarify constraints, explain brute-force first, and communicate thought process while optimizing', is_correct: true },
      { label: 'B', content: 'Stay completely silent for 30 minutes until you have written 100% bug-free code', is_correct: false },
      { label: 'C', content: 'Immediately tell the interviewer the problem is unfair and request a different one', is_correct: false },
      { label: 'D', content: 'Copy-paste code from another tab without explaining', is_correct: false }
    ]
  },
  {
    statement: 'When an interviewer asks: "Do you have any questions for me?" at the end of an interview, what is the best approach?',
    explanation: 'Always ask thoughtful, curious questions about engineering practices, team tech stack challenges, deployment velocity, or the interviewer\'s day-to-day experience. It demonstrates genuine interest and engagement.',
    category_slug: 'verbal-aptitude',
    topic: 'Interview Wrap-up Questions',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Ask about engineering challenges, technical architecture trade-offs, and team culture/workflows', is_correct: true },
      { label: 'B', content: 'Say "No, I have no questions at all" and leave immediately', is_correct: false },
      { label: 'C', content: 'Ask if they are going to hire you on the spot', is_correct: false },
      { label: 'D', content: 'Ask how many vacation days you can take in the first month', is_correct: false }
    ]
  },
  {
    statement: 'How should you answer when asked about a past project failure or mistake?',
    explanation: 'Own the mistake transparently without blaming teammates or external circumstances, explain the root cause analysis, highlight how you rectified the situation, and emphasize what safeguards or learnings you implemented to prevent recurrence.',
    category_slug: 'verbal-aptitude',
    topic: 'Behavioral - Handling Failure',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Take ownership transparently, explain the root cause, show how you fixed it, and emphasize safeguards put in place', is_correct: true },
      { label: 'B', content: 'Blame your junior teammates or professors for giving unclear requirements', is_correct: false },
      { label: 'C', content: 'Claim you have never experienced any project failure in your academic career', is_correct: false },
      { label: 'D', content: 'Downplay the project as unimportant anyway', is_correct: false }
    ]
  },
  {
    statement: 'When asked: "How do you handle working under tight deadlines with shifting project requirements?", what behavior is expected?',
    explanation: 'Demonstrate adaptability and prioritization: break tasks into iterative milestones, communicate transparently with stakeholders about trade-offs, focus on delivering a high-quality core MVP first, and reprioritize backlog items systematically.',
    category_slug: 'verbal-aptitude',
    topic: 'Behavioral - Adaptability',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Demonstrate ruthless prioritization, clear communication of trade-offs, focus on core MVP, and agile adaptability', is_correct: true },
      { label: 'B', content: 'Work 24 hours without sleep and refuse to communicate until done', is_correct: false },
      { label: 'C', content: 'Ignore new requirements and continue building the old specification', is_correct: false },
      { label: 'D', content: 'Complain publicly about poor project management', is_correct: false }
    ]
  },
  {
    statement: 'In an interview explanation of your capstone project, which structure conveys technical depth best?',
    explanation: '1. Problem Statement & Impact (Why it matters).\n2. Architecture & Tech Stack (Frameworks, databases, communication protocols).\n3. Key Technical Challenges & Your Individual Contribution (Overcoming bottlenecks, concurrency, optimization).\n4. Results & Metrics (Latency reduction, throughput, user adoption).',
    category_slug: 'technical-aptitude',
    topic: 'Project Presentation Structure',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Problem -> System Architecture -> Key Technical Challenges & Individual Contributions -> Measurable Results', is_correct: true },
      { label: 'B', content: 'Reciting lines of code from top to bottom without discussing architecture', is_correct: false },
      { label: 'C', content: 'Describing only the visual UI colors and login screen', is_correct: false },
      { label: 'D', content: 'Stating that the project was generated entirely by a template tutorial', is_correct: false }
    ]
  },
  {
    statement: 'When an interviewer points out a bug or edge-case in your code during an interview, what is the best response?',
    explanation: 'Remain calm and receptive: thank the interviewer for the catch, trace through the code step-by-step with the provided test input to confirm the issue, explain why the bug occurs, and write a clean fix calmly.',
    category_slug: 'technical-aptitude',
    topic: 'Interview Feedback Handling',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Accept feedback positively, trace the edge-case calmly, explain root cause, and implement a clean fix', is_correct: true },
      { label: 'B', content: 'Argue defensively that the edge case is unrealistic in production', is_correct: false },
      { label: 'C', content: 'Panic, delete all your code, and start writing an entirely new algorithm', is_correct: false },
      { label: 'D', content: 'Pretend you already knew about it and did not fix it intentionally', is_correct: false }
    ]
  },
  {
    statement: 'What does "DRY" and "KISS" stand for in software engineering best practices?',
    explanation: '- DRY: "Don\'t Repeat Yourself" (avoid code duplication by encapsulating logic in reusable functions/modules).\n- KISS: "Keep It Simple, Stupid" (prefer straightforward, readable code over clever, convoluted abstractions).',
    category_slug: 'technical-aptitude',
    topic: 'Engineering Principles',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Don\'t Repeat Yourself and Keep It Simple, Stupid', is_correct: true },
      { label: 'B', content: 'Data Relational Yield and Key Indexed Search System', is_correct: false },
      { label: 'C', content: 'Direct Routing Yield and Kernel Interrupt Subsystem', is_correct: false },
      { label: 'D', content: 'Dynamic Request Yield and Keyword Indexed Storage', is_correct: false }
    ]
  },
  {
    statement: 'What is the role of Unit Testing and what is the difference between a Unit Test and an Integration Test?',
    explanation: '- Unit Test: Tests an individual function or class in complete isolation from external dependencies (mocking databases, network calls, file system).\n- Integration Test: Verifies that multiple interconnected modules, databases, and APIs work together correctly.',
    category_slug: 'technical-aptitude',
    topic: 'Software Testing Best Practices',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Unit tests isolate individual functions with mocks; Integration tests verify multiple collaborating components and external systems together', is_correct: true },
      { label: 'B', content: 'Unit tests are performed manually by QA; Integration tests are run by users in production', is_correct: false },
      { label: 'C', content: 'Unit tests are written in Python; Integration tests are written in C', is_correct: false },
      { label: 'D', content: 'Integration tests run before compilation', is_correct: false }
    ]
  },
  {
    statement: 'In Git version control, what is the difference between `git merge` and `git rebase`?',
    explanation: '- `git merge`: Preserves complete historical commit sequence and branch topology, creating a 3-way merge commit joining the two branches.\n- `git rebase`: Re-applies commits from the feature branch on top of the target base branch tip, producing a linear, clean commit history without merge commits.',
    category_slug: 'technical-aptitude',
    topic: 'Git Workflows',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Merge creates a merge commit preserving full branch history; Rebase replays commits linearly on top of target branch', is_correct: true },
      { label: 'B', content: 'Rebase deletes all commits; Merge keeps only the first commit', is_correct: false },
      { label: 'C', content: 'Merge only works on local branches; Rebase works on remote repos', is_correct: false },
      { label: 'D', content: 'They are completely identical commands with different names', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Memory Leak" and how does it affect long-running production server applications?',
    explanation: 'A memory leak occurs when an application allocates memory on the heap but fails to release it after it is no longer needed (or retains unintended references preventing garbage collection). Over time, RAM consumption grows continuously until the operating system terminates the process with an Out-Of-Memory (OOM) error.',
    category_slug: 'technical-aptitude',
    topic: 'Memory Leaks and Profiling',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Unreleased or unreferenced heap memory that accumulates over time until causing Out-Of-Memory crashes', is_correct: true },
      { label: 'B', content: 'Physical RAM chip overheating and leaking thermal paste', is_correct: false },
      { label: 'C', content: 'Data written to disk without password encryption', is_correct: false },
      { label: 'D', content: 'A virus that deletes CPU cache lines', is_correct: false }
    ]
  },
  {
    statement: 'What is Continuous Integration and Continuous Deployment (CI/CD)?',
    explanation: 'CI/CD is a software engineering practice where code changes are automatically built, linted, tested, and validated upon every push to version control (CI), and automatically deployed to staging or production environments upon passing all quality checks (CD).',
    category_slug: 'technical-aptitude',
    topic: 'DevOps and CI/CD',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Automated pipeline that builds, tests, and deploys code changes frequently and reliably upon each commit', is_correct: true },
      { label: 'B', content: 'Continuous manual code review performed 24/7 by human supervisors', is_correct: false },
      { label: 'C', content: 'A protocol for streaming music over Wi-Fi', is_correct: false },
      { label: 'D', content: 'A database synchronization tool for backup servers', is_correct: false }
    ]
  },
  {
    statement: 'When explaining an algorithm during an interview, what is the best way to analyze Space Complexity?',
    explanation: 'Distinguish clearly between Auxiliary Space (temporary working memory allocated by the algorithm such as hash maps, vectors, or recursion stack frames) and Input Space (memory required to hold the inputs themselves). Big-O space complexity typically refers to auxiliary space.',
    category_slug: 'technical-aptitude',
    topic: 'Space Complexity Analysis',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Analyze auxiliary space (extra memory allocated + call stack) separately from input space', is_correct: true },
      { label: 'B', content: 'Only count the number of variables declared in the main function', is_correct: false },
      { label: 'C', content: 'Measure physical RAM usage in megabytes using Task Manager', is_correct: false },
      { label: 'D', content: 'Ignore recursion call stack frames', is_correct: false }
    ]
  },
  {
    statement: 'What does the term "Technical Debt" signify in engineering teams?',
    explanation: 'Technical debt refers to the implied future cost of rework caused by choosing an easy, expedient, or hacky short-term code solution now instead of using a better, well-architected approach that takes longer.',
    category_slug: 'technical-aptitude',
    topic: 'Engineering Management Concepts',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'The future rework and maintenance cost caused by prioritizing quick expedience over clean architecture', is_correct: true },
      { label: 'B', content: 'The financial money owed to cloud service providers like AWS', is_correct: false },
      { label: 'C', content: 'Software licenses that have expired', is_correct: false },
      { label: 'D', content: 'The salary paid to offshore contracting engineers', is_correct: false }
    ]
  },
  {
    statement: 'Why should a candidate avoid memorizing code solutions and instead focus on problem-solving patterns?',
    explanation: 'Real interview questions frequently introduce unique constraints, variations, or edge cases. Mastering patterns (Two Pointers, Sliding Window, Monotonic Stack, BFS/DFS, TopoSort, DP) allows solving thousands of variations adaptively, whereas memorized code falls apart under slight modifications.',
    category_slug: 'technical-aptitude',
    topic: 'Placement Interview Strategy',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Pattern mastery allows solving hundreds of unseen problem variations adaptively under changing constraints', is_correct: true },
      { label: 'B', content: 'Interviewers only ask questions from page 1 of textbooks', is_correct: false },
      { label: 'C', content: 'Memorization is strictly illegal under cyber laws', is_correct: false },
      { label: 'D', content: 'Patterns allow code to execute without a compiler', is_correct: false }
    ]
  },
  {
    statement: 'In an HR interview, what is the best way to handle salary expectation questions for a campus fresher?',
    explanation: 'State that you are enthusiastic about the learning opportunity and role impact, and that you are confident the company offers competitive, industry-standard compensation packages for campus graduates according to policy.',
    category_slug: 'verbal-aptitude',
    topic: 'HR Salary Negotiations for Freshers',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Express enthusiasm for the role, state trust in the company\'s competitive standardized campus compensation framework, and stay open to discussion', is_correct: true },
      { label: 'B', content: 'Demand a 300% salary increase over market rate immediately', is_correct: false },
      { label: 'C', content: 'Refuse to answer and tell the interviewer to name a number first', is_correct: false },
      { label: 'D', content: 'Say you will work for free indefinitely', is_correct: false }
    ]
  },
  {
    statement: 'What is the most constructive response when an interviewer asks about a gap in your resume or a semester with low grades?',
    explanation: 'Be honest and accountable: explain the context succinctly without making excuses, emphasize the self-discipline or study adjustments you made, and point to upward academic or project trends that demonstrated your resilience and recovery.',
    category_slug: 'verbal-aptitude',
    topic: 'Handling Resume Gaps',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Be honest without making excuses, explain the lessons learned, and highlight subsequent improvement and resilience', is_correct: true },
      { label: 'B', content: 'Invent a fake medical emergency to gain sympathy', is_correct: false },
      { label: 'C', content: 'Claim the college university professors graded you unfairly', is_correct: false },
      { label: 'D', content: 'Refuse to discuss academic history', is_correct: false }
    ]
  }
];
