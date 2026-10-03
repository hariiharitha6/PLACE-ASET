import { SeedQuestion } from './questions_aptitude';

export const OS_NETWORKS_QUESTIONS: SeedQuestion[] = [
  // ==========================================
  // OPERATING SYSTEMS (30 QUESTIONS)
  // ==========================================
  {
    statement: 'What is the fundamental difference between a Process and a Thread in modern operating systems?',
    explanation: 'A Process is an executing program instance with its own dedicated virtual address space, file descriptors, and security context (heavyweight).\nA Thread is the basic unit of CPU scheduling within a process (lightweight). Multiple threads belonging to the same process share the process\'s code, data, and heap segments, while each maintains its own private stack, program counter, and registers.',
    category_slug: 'operating-systems',
    topic: 'Processes vs Threads',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Processes have independent address spaces; threads within the same process share code, data, and heap but have private stacks', is_correct: true },
      { label: 'B', content: 'Threads have independent virtual address spaces; processes share stack memory', is_correct: false },
      { label: 'C', content: 'Processes are scheduled by the CPU; threads are managed only by user space applications without OS awareness', is_correct: false },
      { label: 'D', content: 'Context switching between processes is faster than between threads', is_correct: false }
    ]
  },
  {
    statement: 'Which of the following conditions is NOT one of Coffman\'s four necessary conditions for Deadlock to occur?',
    explanation: 'The four necessary and sufficient Coffman conditions for deadlock:\n1. Mutual Exclusion (non-shareable resources)\n2. Hold and Wait (process holding resources while requesting more)\n3. No Preemption (resources cannot be forcibly confiscated)\n4. Circular Wait (circular chain of processes waiting for resources held by each other).\n"Preemption Allowed" would prevent deadlock, not cause it.',
    category_slug: 'operating-systems',
    topic: 'Coffman Deadlock Conditions',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Preemption Allowed', is_correct: true },
      { label: 'B', content: 'Mutual Exclusion', is_correct: false },
      { label: 'C', content: 'Hold and Wait', is_correct: false },
      { label: 'D', content: 'Circular Wait', is_correct: false }
    ]
  },
  {
    statement: 'What is "Belady\'s Anomaly" in operating systems virtual memory page replacement?',
    explanation: 'Belady\'s Anomaly is the counter-intuitive phenomenon where increasing the number of physical page frames allocated to a process results in an INCREASE (rather than decrease) in the number of page faults for certain access strings under the FIFO (First-In, First-Out) page replacement algorithm.',
    category_slug: 'operating-systems',
    topic: 'Page Replacement and Belady\'s Anomaly',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Under FIFO, allocating more page frames can increase the number of page faults', is_correct: true },
      { label: 'B', content: 'LRU page replacement causes memory thrashing in multi-core CPUs', is_correct: false },
      { label: 'C', content: 'Processes with high priority generate more page faults than low-priority processes', is_correct: false },
      { label: 'D', content: 'Disk seek time increases exponentially with cylinder count', is_correct: false }
    ]
  },
  {
    statement: 'How does the Banker\'s Algorithm in operating systems ensure deadlock avoidance?',
    explanation: 'The Banker\'s algorithm tests for safety before granting any resource allocation request by simulating allocation and verifying whether there exists at least one Safe Sequence where all processes can successfully complete with available resources.',
    category_slug: 'operating-systems',
    topic: 'Banker\'s Algorithm',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Checks if granting a resource request leaves the system in a Safe State having at least one safe execution sequence', is_correct: true },
      { label: 'B', content: 'Aborts the process holding the maximum resources upon any conflict', is_correct: false },
      { label: 'C', content: 'Enforces linear ordering on all resources to prevent circular wait statically', is_correct: false },
      { label: 'D', content: 'Allocates all requested resources upfront before process execution begins', is_correct: false }
    ]
  },
  {
    statement: 'What is the purpose of the Translation Lookaside Buffer (TLB) in paging memory management?',
    explanation: 'The TLB is a high-speed associative hardware cache in the CPU\'s Memory Management Unit (MMU) that stores recent Virtual-to-Physical page table translations, avoiding the need to access main memory twice for every memory reference.',
    category_slug: 'operating-systems',
    topic: 'Paging and TLB',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'A hardware cache in the MMU storing recent virtual-to-physical address mappings to accelerate memory lookups', is_correct: true },
      { label: 'B', content: 'A disk buffer that holds swapped-out virtual memory pages', is_correct: false },
      { label: 'C', content: 'A register that stores interrupt vectors', is_correct: false },
      { label: 'D', content: 'A queue of ready processes in CPU scheduling', is_correct: false }
    ]
  },
  {
    statement: 'What is "Thrashing" in virtual memory systems and what causes it?',
    explanation: 'Thrashing occurs when a computer spends more time swapping virtual memory pages into and out of disk than executing user instructions. It happens when the sum of the working sets of all active processes exceeds the total available physical RAM.',
    category_slug: 'operating-systems',
    topic: 'Virtual Memory Thrashing',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'When the system spends more time handling page faults and swapping than executing instructions, caused by insufficient physical RAM for working sets', is_correct: true },
      { label: 'B', content: 'Excessive CPU context switching caused by high thread count', is_correct: false },
      { label: 'C', content: 'Disk head vibration during high I/O throughput', is_correct: false },
      { label: 'D', content: 'Corrupted partition tables in secondary storage', is_correct: false }
    ]
  },
  {
    statement: 'Which CPU scheduling algorithm provides the theoretical minimum average waiting time for a given set of stationary processes?',
    explanation: 'Shortest Job First (SJF) / Shortest Remaining Time First (SRTF) is provably optimal in terms of minimizing average waiting time because scheduling shorter jobs ahead of longer jobs moves them out of the wait queue fastest.',
    category_slug: 'operating-systems',
    topic: 'CPU Scheduling Algorithms',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Shortest Job First (SJF) / SRTF', is_correct: true },
      { label: 'B', content: 'First-Come, First-Served (FCFS)', is_correct: false },
      { label: 'C', content: 'Round Robin (RR)', is_correct: false },
      { label: 'D', content: 'Priority Scheduling without aging', is_correct: false }
    ]
  },
  {
    statement: 'What is the "Convoy Effect" in CPU scheduling?',
    explanation: 'The Convoy Effect occurs under FCFS scheduling when a CPU-bound process with a huge burst time monopolizes the CPU, causing all short I/O-bound processes to queue up behind it, leading to poor CPU and device utilization.',
    category_slug: 'operating-systems',
    topic: 'Convoy Effect in FCFS',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Short processes waiting in queue behind a long CPU-intensive process under FCFS scheduling', is_correct: true },
      { label: 'B', content: 'Multiple CPUs executing instructions in synchronized lockstep', is_correct: false },
      { label: 'C', content: 'Network packets arriving in batches across switches', is_correct: false },
      { label: 'D', content: 'Simultaneous thread synchronization on a barrier', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between a Binary Semaphore and a Mutex?',
    explanation: 'A Mutex is an ownership-based locking mechanism: only the thread that acquired the mutex lock is permitted to unlock it (supports priority inheritance).\nA Binary Semaphore is a signaling mechanism with values 0 and 1: any thread can signal (`V()`) to wake up another thread waiting (`P()`), and it has no concept of thread ownership.',
    category_slug: 'operating-systems',
    topic: 'Semaphores vs Mutexes',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Mutex has ownership (only locking thread can release it); Binary Semaphore is a signaling mechanism with no ownership restriction', is_correct: true },
      { label: 'B', content: 'Mutex allows multiple threads; Semaphore allows only one', is_correct: false },
      { label: 'C', content: 'Semaphores cannot be used across different processes', is_correct: false },
      { label: 'D', content: 'Mutexes run in user space; Semaphores run on the GPU', is_correct: false }
    ]
  },
  {
    statement: 'What is "Priority Inversion" and how is it resolved in real-time operating systems?',
    explanation: 'Priority Inversion occurs when a low-priority process holds a lock needed by a high-priority process, but is preempted by a medium-priority process, indirectly starving the high-priority process.\nIt is resolved using Priority Inheritance: the low-priority process temporarily inherits the high priority of the waiting process until it releases the shared lock.',
    category_slug: 'operating-systems',
    topic: 'Priority Inversion and Inheritance',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'A high-priority task is blocked by a medium-priority task preempting a low-priority task holding a lock; resolved using Priority Inheritance', is_correct: true },
      { label: 'B', content: 'The CPU scheduler reverses thread priorities during power-saving mode', is_correct: false },
      { label: 'C', content: 'Threads with identical priority deadlocking on a socket', is_correct: false },
      { label: 'D', content: 'Elevating all user space processes to root privileges', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between Internal and External Fragmentation in memory management?',
    explanation: '- Internal Fragmentation occurs in fixed-size partition/paging systems when allocated memory space is slightly larger than requested (wasted memory inside allocated partition).\n- External Fragmentation occurs in dynamic variable-partition systems when total free memory exists to satisfy a request, but it is split into non-contiguous blocks too small to fit the process.',
    category_slug: 'operating-systems',
    topic: 'Memory Fragmentation',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Internal fragmentation is unused space within allocated fixed blocks; external fragmentation is free memory split into non-contiguous fragments', is_correct: true },
      { label: 'B', content: 'Internal is on disk; external is in RAM', is_correct: false },
      { label: 'C', content: 'External fragmentation occurs only with paging', is_correct: false },
      { label: 'D', content: 'Internal fragmentation can be eliminated by defragmentation software', is_correct: false }
    ]
  },
  {
    statement: 'What sequence of operations occurs during a Page Fault in an operating system?',
    explanation: '1. Hardware trap to OS kernel.\n2. Verify if memory access was valid (abort if segmentation fault).\n3. Find a free physical frame in RAM (or run page replacement to evict a victim page).\n4. Schedule disk I/O to read page from backing store into frame.\n5. Update page table and TLB.\n6. Restart the faulting CPU instruction.',
    category_slug: 'operating-systems',
    topic: 'Page Fault Handling Sequence',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Trap to OS -> Check validity -> Find frame (or evict) -> Fetch page from disk -> Update page table -> Restart instruction', is_correct: true },
      { label: 'B', content: 'Terminate process immediately -> Clear swap -> Reboot kernel', is_correct: false },
      { label: 'C', content: 'Allocate swap space -> Invert page table -> Notify user application', is_correct: false },
      { label: 'D', content: 'Write entire RAM contents to disk -> Clear cache -> Resume', is_correct: false }
    ]
  },
  {
    statement: 'In disk scheduling, how does the SCAN (Elevator) algorithm operate?',
    explanation: 'The SCAN algorithm moves the disk arm in one direction, servicing all pending requests along the path until it reaches the end cylinder of the disk, then reverses direction and services requests in the opposite direction (like an elevator).',
    category_slug: 'operating-systems',
    topic: 'Disk Scheduling Algorithms',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Services requests moving in one direction to the end of disk, then reverses direction servicing requests on return path', is_correct: true },
      { label: 'B', content: 'Services the request closest to the current head position regardless of direction (SSTF)', is_correct: false },
      { label: 'C', content: 'Jumps directly to the start of disk without servicing on return (C-SCAN)', is_correct: false },
      { label: 'D', content: 'Services requests strictly in order of arrival', is_correct: false }
    ]
  },
  {
    statement: 'What is an "Inode" in Unix/Linux file systems?',
    explanation: 'An inode (index node) is a data structure on disk that stores all metadata about a regular file or directory (file size, permissions, owner, timestamps, and direct/indirect disk block pointers), EXCLUDING the file name and actual data contents.',
    category_slug: 'operating-systems',
    topic: 'File Systems and Inodes',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'A data structure storing file metadata (permissions, owner, size, block pointers) excluding the filename and content', is_correct: true },
      { label: 'B', content: 'The root directory of a Linux file system', is_correct: false },
      { label: 'C', content: 'A hardware register on the hard drive controller', is_correct: false },
      { label: 'D', content: 'A special file that stores user passwords', is_correct: false }
    ]
  },
  {
    statement: 'What is the role of the `fork()` system call in Unix-like operating systems?',
    explanation: '`fork()` creates a new child process as an exact duplicate of the calling parent process, copying the parent\'s address space (optimized using Copy-On-Write). It returns 0 in the child process and the child\'s PID in the parent process.',
    category_slug: 'operating-systems',
    topic: 'Process Creation fork()',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Creates an exact child duplicate process, returning 0 in the child and child PID in the parent', is_correct: true },
      { label: 'B', content: 'Terminates the current process and reboots the system', is_correct: false },
      { label: 'C', content: 'Loads a new binary executable file into memory', is_correct: false },
      { label: 'D', content: 'Splits execution across two physical CPU cores simultaneously', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Zombie Process" in Unix/Linux operating systems?',
    explanation: 'A zombie process is a process that has completed execution (called `exit()`), but its entry remains in the process table because its parent process has not yet executed `wait()` or `waitpid()` to read its exit status.',
    category_slug: 'operating-systems',
    topic: 'Zombie and Orphan Processes',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'A terminated process whose exit status has not yet been collected by its parent via wait()', is_correct: true },
      { label: 'B', content: 'A running process whose parent process was killed (Orphan)', is_correct: false },
      { label: 'C', content: 'A process consuming 100% CPU in an infinite loop', is_correct: false },
      { label: 'D', content: 'A process that has been swapped out entirely to disk', is_correct: false }
    ]
  },
  {
    statement: 'What is "Copy-On-Write" (COW) optimization during process creation?',
    explanation: 'When `fork()` is called, parent and child initially share the exact same physical memory pages marked as read-only. A private physical copy of a page is only duplicated when either process attempts to write to that page, drastically accelerating process creation.',
    category_slug: 'operating-systems',
    topic: 'Copy-On-Write',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Parent and child share read-only pages until either process modifies a page, at which point only that page is copied', is_correct: true },
      { label: 'B', content: 'All file writes are duplicated to two hard drives simultaneously', is_correct: false },
      { label: 'C', content: 'Memory is cleared to zero before every write operation', is_correct: false },
      { label: 'D', content: 'Data is written directly to disk bypassing OS page cache', is_correct: false }
    ]
  },
  {
    statement: 'What is Peterson\'s Algorithm in process synchronization?',
    explanation: 'Peterson\'s Algorithm is a classic software-based solution to the Critical Section problem for two concurrent processes using two shared variables: `boolean flag[2]` and `int turn`. It provably satisfies Mutual Exclusion, Progress, and Bounded Waiting.',
    category_slug: 'operating-systems',
    topic: 'Peterson\'s Algorithm',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'A software algorithm using flag array and turn variable that guarantees mutual exclusion, progress, and bounded waiting for 2 processes', is_correct: true },
      { label: 'B', content: 'A hardware atomic test-and-set instruction', is_correct: false },
      { label: 'C', content: 'A deadlock avoidance algorithm for distributed systems', is_correct: false },
      { label: 'D', content: 'A page replacement algorithm using a FIFO queue', is_correct: false }
    ]
  },
  {
    statement: 'What is the role of the Memory Management Unit (MMU) in computer architecture?',
    explanation: 'The MMU is a hardware component in the CPU that translates virtual (logical) memory addresses issued by user programs into physical RAM addresses using page tables, and enforces memory protection privileges.',
    category_slug: 'operating-systems',
    topic: 'MMU Hardware Translation',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Translates virtual memory addresses generated by the CPU into physical RAM addresses and enforces protection', is_correct: true },
      { label: 'B', content: 'Allocates heap memory for C programs', is_correct: false },
      { label: 'C', content: 'Cleans up dead memory in background using garbage collection', is_correct: false },
      { label: 'D', content: 'Compresses files on solid-state drives', is_correct: false }
    ]
  },
  {
    statement: 'Which RAID configuration provides disk striping with distributed parity, allowing recovery from any single disk failure?',
    explanation: 'RAID 5 stripes data and block-level parity across 3 or more physical drives. If any single drive fails, its contents can be reconstructed dynamically from the distributed parity on the remaining drives.',
    category_slug: 'operating-systems',
    topic: 'RAID Storage Architectures',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'RAID 5 (Striping with distributed parity)', is_correct: true },
      { label: 'B', content: 'RAID 0 (Pure striping without parity)', is_correct: false },
      { label: 'C', content: 'RAID 1 (Pure mirroring)', is_correct: false },
      { label: 'D', content: 'JBOD (Just a Bunch of Disks)', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Context Switch" and what overhead does it impose on CPU utilization?',
    explanation: 'A context switch is the process of saving the execution state (registers, program counter, stack pointer, page table base) of the currently running process/thread and restoring the saved state of another ready process/thread. It consumes CPU cycles without executing useful application work and invalidates CPU caches/TLBs.',
    category_slug: 'operating-systems',
    topic: 'Context Switching Overhead',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Saving current process state and restoring another process state, consuming CPU cycles without executing program instructions', is_correct: true },
      { label: 'B', content: 'Switching power supply between motherboard and GPU', is_correct: false },
      { label: 'C', content: 'Changing display resolutions on graphics cards', is_correct: false },
      { label: 'D', content: 'Migrating code from 32-bit to 64-bit architecture', is_correct: false }
    ]
  },
  {
    statement: 'In the Readers-Writers synchronization problem, what does a "Reader-Preference" solution cause?',
    explanation: 'In Reader-Preference, as long as at least one reader is reading, subsequent readers are allowed to enter immediately. This can cause Writer Starvation if a continuous stream of readers arrives.',
    category_slug: 'operating-systems',
    topic: 'Classical Synchronization Problems',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Writer Starvation, as writers wait indefinitely while continuous readers arrive', is_correct: true },
      { label: 'B', content: 'Deadlock between readers and the operating system kernel', is_correct: false },
      { label: 'C', content: 'Reader Starvation, as writers monopolize access', is_correct: false },
      { label: 'D', content: 'Corrupted database file allocations', is_correct: false }
    ]
  },
  {
    statement: 'What is the working principle of the "Clock" (Second-Chance) page replacement algorithm?',
    explanation: 'The Clock algorithm arranges page frames in a circular queue with a hand pointing to the next frame. Each page has a reference bit. When replacing a page: if reference bit is 1, it resets it to 0 and advances hand (giving it a second chance); if reference bit is 0, that page is chosen for eviction.',
    category_slug: 'operating-systems',
    topic: 'Clock Page Replacement',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Circular queue examining reference bits: clears 1 to 0 (second chance), evicts first frame with bit 0', is_correct: true },
      { label: 'B', content: 'Evicts pages based on the system real-time clock timestamp strictly', is_correct: false },
      { label: 'C', content: 'Periodically clears all page tables every 10 milliseconds', is_correct: false },
      { label: 'D', content: 'Calculates the future access times using machine learning', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Spinlock" and when is it preferred over a sleeping mutex?',
    explanation: 'A spinlock is a lock where a waiting thread repeatedly polls in a tight loop ("busy waits") checking if the lock is available. It avoids thread sleeping, context switching, and wake-up overhead, making it preferred in multi-core kernel code where locks are held for extremely short durations.',
    category_slug: 'operating-systems',
    topic: 'Spinlocks vs Sleeping Locks',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'A lock that busy-waits in a loop; preferred on multi-core systems when lock hold duration is shorter than context-switch overhead', is_correct: true },
      { label: 'B', content: 'A lock used exclusively on single-core microcontrollers to save battery', is_correct: false },
      { label: 'C', content: 'A lock that rotates through threads in round-robin sequence', is_correct: false },
      { label: 'D', content: 'A lock that cannot be released once acquired', is_correct: false }
    ]
  },
  {
    statement: 'What is the role of the Swap Space on disk in operating systems?',
    explanation: 'Swap space is a dedicated disk partition or file used as an extension of physical RAM. When physical memory is saturated, inactive or dirty pages are paged out to swap space, freeing up physical RAM for active processes.',
    category_slug: 'operating-systems',
    topic: 'Swap Space and Paging',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Disk space used as an extension of physical RAM to hold inactive memory pages', is_correct: true },
      { label: 'B', content: 'A backup partition storing OS installer images', is_correct: false },
      { label: 'C', content: 'A temporary buffer used only during system reboots', is_correct: false },
      { label: 'D', content: 'A hardware register on memory chips', is_correct: false }
    ]
  },
  {
    statement: 'In multi-level paging on a 32-bit architecture with 4 KB page size, why is multi-level paging beneficial over single-level page tables?',
    explanation: 'A single-level page table requires 1 million entries (4 MB) per process in contiguous RAM, even if the process uses only 100 KB. Multi-level paging allocates second-level page tables on-demand only for address spaces in active use, saving massive amounts of RAM.',
    category_slug: 'operating-systems',
    topic: 'Multi-Level Paging',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Avoids allocating contiguous memory for unused address ranges, saving substantial physical memory for sparse address spaces', is_correct: true },
      { label: 'B', content: 'Reduces the number of memory accesses required per lookup to 0', is_correct: false },
      { label: 'C', content: 'Eliminates the need for the Translation Lookaside Buffer (TLB)', is_correct: false },
      { label: 'D', content: 'Allows processes to share private stack segments', is_correct: false }
    ]
  },
  {
    statement: 'What is the "Direct Memory Access" (DMA) controller and how does it optimize I/O data transfer?',
    explanation: 'DMA is a specialized hardware controller that transfers data directly between high-speed I/O devices (disk, network NIC) and physical RAM without continuously routing data through the CPU. The CPU initiates the transfer and is interrupted only once when the entire block transfer completes.',
    category_slug: 'operating-systems',
    topic: 'Direct Memory Access (DMA)',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Transfers data blocks directly between I/O devices and RAM without CPU intervention, interrupting CPU only upon completion', is_correct: true },
      { label: 'B', content: 'Allows user space programs to bypass kernel access controls', is_correct: false },
      { label: 'C', content: 'Overclocks RAM speed during gaming workloads', is_correct: false },
      { label: 'D', content: 'Maps hard drive sectors directly to CPU cache L1', is_correct: false }
    ]
  },
  {
    statement: 'What is an "Orphan Process" in Unix/Linux and what happens to it?',
    explanation: 'An orphan process is a running process whose parent process terminates before the child. In Unix, orphan processes are automatically adopted by the root system process (`init` or `systemd`, PID 1), which periodically invokes `wait()` to collect their termination statuses.',
    category_slug: 'operating-systems',
    topic: 'Orphan Process Adoption',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'A process whose parent terminated, automatically adopted by init/systemd (PID 1)', is_correct: true },
      { label: 'B', content: 'A process that runs without any executable binary file', is_correct: false },
      { label: 'C', content: 'A process that is killed immediately upon parent termination', is_correct: false },
      { label: 'D', content: 'A process with no assigned PID', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between Preemptive and Non-Preemptive CPU scheduling?',
    explanation: '- Preemptive: The OS scheduler can forcibly interrupt and move a currently running process from CPU to Ready queue when a higher priority process arrives or a time slice expires.\n- Non-Preemptive: Once the CPU is allocated to a process, it keeps the CPU until it terminates or voluntarily yields to wait for I/O.',
    category_slug: 'operating-systems',
    topic: 'Preemptive vs Non-Preemptive Scheduling',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Preemptive allows interrupting running processes; Non-preemptive runs until process yields or terminates', is_correct: true },
      { label: 'B', content: 'Non-preemptive allows time slicing; Preemptive does not', is_correct: false },
      { label: 'C', content: 'Preemptive scheduling cannot cause race conditions', is_correct: false },
      { label: 'D', content: 'Non-preemptive is used in modern multi-core operating systems', is_correct: false }
    ]
  },
  {
    statement: 'What does a "Pipe" system call (`pipe()`) provide in Unix Inter-Process Communication (IPC)?',
    explanation: '`pipe()` creates a unidirectional (simplex) byte-stream communication channel between related processes (e.g. parent and child), accessed via two file descriptors: `fd[0]` for reading and `fd[1]` for writing, managed as a circular FIFO buffer in kernel memory.',
    category_slug: 'operating-systems',
    topic: 'Unix Pipes IPC',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'A unidirectional byte-stream IPC channel managed in kernel memory with read and write file descriptors', is_correct: true },
      { label: 'B', content: 'A bidirectional network socket across remote servers', is_correct: false },
      { label: 'C', content: 'A shared memory segment mapped to GPU VRAM', is_correct: false },
      { label: 'D', content: 'A physical hardware bus connecting CPU to RAM', is_correct: false }
    ]
  },

  // ==========================================
  // COMPUTER NETWORKS (30 QUESTIONS)
  // ==========================================
  {
    statement: 'Which layer of the OSI 7-layer model is responsible for End-to-End delivery, error recovery, flow control, and port addressing?',
    explanation: 'The Transport Layer (Layer 4) provides end-to-end communication between application processes on different hosts, using port numbers for addressing, sequence/acknowledgement numbers for reliability, and sliding window for flow control (e.g. TCP and UDP).',
    category_slug: 'computer-networks',
    topic: 'OSI Model Layers',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Transport Layer (Layer 4)', is_correct: true },
      { label: 'B', content: 'Network Layer (Layer 3)', is_correct: false },
      { label: 'C', content: 'Data Link Layer (Layer 2)', is_correct: false },
      { label: 'D', content: 'Session Layer (Layer 5)', is_correct: false }
    ]
  },
  {
    statement: 'What packet sequence completes the standard TCP 3-Way Handshake connection establishment?',
    explanation: '1. Client sends SYN (Synchronize sequence number: seq=x).\n2. Server responds with SYN-ACK (seq=y, ack=x+1).\n3. Client sends ACK (seq=x+1, ack=y+1).\nConnection is then ESTABLISHED.',
    category_slug: 'computer-networks',
    topic: 'TCP 3-Way Handshake',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'SYN -> SYN-ACK -> ACK', is_correct: true },
      { label: 'B', content: 'ACK -> SYN -> ACK', is_correct: false },
      { label: 'C', content: 'SYN -> ACK -> DATA', is_correct: false },
      { label: 'D', content: 'HELLO -> CHALLENGE -> CONNECT', is_correct: false }
    ]
  },
  {
    statement: 'Given the CIDR subnet `192.168.1.0/26`, how many usable host IP addresses are available?',
    explanation: 'Subnet mask `/26` leaves 32 - 26 = 6 host bits.\nTotal IP addresses = 2^6 = 64.\nUsable host IPs = Total - 2 (subtract Network ID `192.168.1.0` and Broadcast address `192.168.1.63`) = 64 - 2 = 62 usable addresses.',
    category_slug: 'computer-networks',
    topic: 'Subnetting and CIDR',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '62', is_correct: true },
      { label: 'B', content: '64', is_correct: false },
      { label: 'C', content: '30', is_correct: false },
      { label: 'D', content: '126', is_correct: false }
    ]
  },
  {
    statement: 'What is the purpose of the Address Resolution Protocol (ARP) in computer networks?',
    explanation: 'ARP translates a known 32-bit Logical IP Address (Network Layer) into a 48-bit Physical MAC Address (Data Link Layer) on a local broadcast network domain.',
    category_slug: 'computer-networks',
    topic: 'ARP Protocol',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Resolves an IP address into its corresponding physical MAC address on a local area network', is_correct: true },
      { label: 'B', content: 'Resolves a domain name into an IP address', is_correct: false },
      { label: 'C', content: 'Translates private IP addresses to public IP addresses (NAT)', is_correct: false },
      { label: 'D', content: 'Encrypts Ethernet frames across VPN tunnels', is_correct: false }
    ]
  },
  {
    statement: 'What is the key difference between TCP (Transmission Control Protocol) and UDP (User Datagram Protocol)?',
    explanation: 'TCP is a connection-oriented, reliable protocol providing ordered byte stream delivery, error recovery via retransmissions, flow control, and congestion control.\nUDP is a connectionless, unreliable datagram protocol providing minimal overhead and fast transmission without acknowledgments, ordering, or flow control (ideal for DNS, VoIP, gaming).',
    category_slug: 'computer-networks',
    topic: 'TCP vs UDP',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'TCP is connection-oriented, reliable, and ordered; UDP is connectionless, unreliable, and lightweight', is_correct: true },
      { label: 'B', content: 'UDP guarantees packet delivery; TCP does not', is_correct: false },
      { label: 'C', content: 'TCP operates at layer 3; UDP operates at layer 4', is_correct: false },
      { label: 'D', content: 'UDP uses a 3-way handshake before sending packets', is_correct: false }
    ]
  },
  {
    statement: 'How does the TCP Congestion Control algorithm respond to packet loss signaled by 3 duplicate ACKs (Fast Retransmit)?',
    explanation: 'When 3 duplicate ACKs arrive, TCP infers that packets are still reaching the receiver (mild congestion). It performs Fast Retransmit (retransmits missing segment immediately without waiting for RTO timer), sets `ssthresh = cwnd / 2`, sets `cwnd = ssthresh + 3`, and enters Fast Recovery (additive increase) rather than dropping to 1 MSS.',
    category_slug: 'computer-networks',
    topic: 'TCP Congestion Control',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Performs Fast Retransmit, cuts ssthresh to cwnd / 2, and enters Fast Recovery without dropping cwnd to 1', is_correct: true },
      { label: 'B', content: 'Resets cwnd to 1 MSS and re-enters Slow Start phase immediately', is_correct: false },
      { label: 'C', content: 'Closes the TCP connection with a RST packet', is_correct: false },
      { label: 'D', content: 'Doubles the window size and ignores packet loss', is_correct: false }
    ]
  },
  {
    statement: 'What is the "Count to Infinity" problem in Distance Vector routing protocols (like RIP) and how is it mitigated?',
    explanation: 'When a link breaks, neighboring routers slowly increment routing metric values to each other in a routing loop, counting up to infinity (16 in RIP). It is mitigated using Split Horizon (never advertise a route back out the interface it was learned from) and Poison Reverse (advertising unreachable routes with metric infinity).',
    category_slug: 'computer-networks',
    topic: 'Routing Protocols and Distance Vector',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Routing loops incrementing hop counts endlessly after link failure; mitigated using Split Horizon with Poison Reverse', is_correct: true },
      { label: 'B', content: 'Memory overflow on BGP border gateway routers', is_correct: false },
      { label: 'C', content: 'Packet flood during broadcast storms on Ethernet switches', is_correct: false },
      { label: 'D', content: 'Exhaustion of IPv4 addresses worldwide', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between Recursive and Iterative DNS resolution?',
    explanation: '- Recursive: The local DNS resolver queries the Root server, which responds with TLD server, which answers with authoritative server, returning the final IP directly to the client.\n- Iterative: The DNS server queried provides the best referral address it has ("I don\'t know, ask this other server at IP X"), and the client/resolver makes the next query itself.',
    category_slug: 'computer-networks',
    topic: 'DNS Resolution Architecture',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'In recursive DNS, the server handles the entire query chain on client behalf; in iterative DNS, referrals are returned and client queries the next server', is_correct: true },
      { label: 'B', content: 'Recursive DNS uses TCP; iterative DNS uses UDP', is_correct: false },
      { label: 'C', content: 'Iterative DNS is deprecated in IPv6', is_correct: false },
      { label: 'D', content: 'Recursive DNS only resolves .com domains', is_correct: false }
    ]
  },
  {
    statement: 'What is Network Address Translation (NAT) and why is it extensively used in IPv4 networks?',
    explanation: 'NAT maps private (RFC 1918) unroutable IP addresses (e.g., 192.168.x.x, 10.x.x.x) within a local area network to a single public IP address using unique port numbers (NAPT / PAT), conserving public IPv4 address space and providing security.',
    category_slug: 'computer-networks',
    topic: 'NAT and Port Forwarding',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Maps multiple private LAN IP addresses to a single public IP address using port numbers, conserving IPv4 addresses', is_correct: true },
      { label: 'B', content: 'Encrypts HTTP traffic into HTTPS automatically', is_correct: false },
      { label: 'C', content: 'Converts IPv4 packets into IPv6 packets at hardware wire speed', is_correct: false },
      { label: 'D', content: 'Compresses HTML web files before transmission', is_correct: false }
    ]
  },
  {
    statement: 'In the Data Link Layer, what error detection algorithm uses polynomial division with a generator polynomial?',
    explanation: 'Cyclic Redundancy Check (CRC) treats binary data as a polynomial, divides it by a pre-determined Generator Polynomial using modulo-2 arithmetic, and appends the remainder (checksum) to the frame. The receiver detects burst errors if the remainder upon re-division is non-zero.',
    category_slug: 'computer-networks',
    topic: 'Cyclic Redundancy Check (CRC)',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Cyclic Redundancy Check (CRC)', is_correct: true },
      { label: 'B', content: 'Single Bit Parity Check', is_correct: false },
      { label: 'C', content: 'Internet Checksum (One\'s Complement)', is_correct: false },
      { label: 'D', content: 'Hamming Distance Code', is_correct: false }
    ]
  },
  {
    statement: 'What is the primary architectural improvement of HTTP/2 over HTTP/1.1?',
    explanation: 'HTTP/2 introduces a binary framing layer with true Request/Response Multiplexing over a single shared TCP connection (eliminating Head-of-Line blocking at application layer), Header Compression via HPACK, and Server Push.',
    category_slug: 'computer-networks',
    topic: 'HTTP/1.1 vs HTTP/2',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Multiplexing multiple requests/responses over a single TCP connection, HPACK header compression, and binary framing', is_correct: true },
      { label: 'B', content: 'Replaces TCP entirely with UDP datagrams', is_correct: false },
      { label: 'C', content: 'Eliminates all encryption requirements to boost throughput', is_correct: false },
      { label: 'D', content: 'Forces all web pages to be served as static HTML', is_correct: false }
    ]
  },
  {
    statement: 'What transport protocol does HTTP/3 utilize instead of standard TCP, and what problem does it eliminate?',
    explanation: 'HTTP/3 uses QUIC (Quick UDP Internet Connections) built on top of UDP. It eliminates TCP transport-layer Head-of-Line (HoL) blocking (where a single lost packet stalled all concurrent multiplexed streams) and provides 0-RTT connection establishment.',
    category_slug: 'computer-networks',
    topic: 'HTTP/3 and QUIC',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'QUIC protocol over UDP, eliminating transport-layer Head-of-Line blocking and enabling 0-RTT handshakes', is_correct: true },
      { label: 'B', content: 'SCTP over IPv6, eliminating IP fragmentation', is_correct: false },
      { label: 'C', content: 'Raw Ethernet frames over optical fiber', is_correct: false },
      { label: 'D', content: 'WebSockets over TLS 1.3', is_correct: false }
    ]
  },
  {
    statement: 'What does the Time-To-Live (TTL) field in an IPv4 packet header accomplish?',
    explanation: 'TTL is an 8-bit integer decremented by 1 at every router hop. If TTL reaches 0, the router drops the packet and sends an ICMP "Time Exceeded" message back to source, preventing loops from circulating packets indefinitely.',
    category_slug: 'computer-networks',
    topic: 'IPv4 Header TTL',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Prevents packets from looping endlessly in routing loops by decrementing at every hop and discarding at 0', is_correct: true },
      { label: 'B', content: 'Measures total millisecond latency from source to destination', is_correct: false },
      { label: 'C', content: 'Enforces a strict cache expiration timer on HTTP cookies', is_correct: false },
      { label: 'D', content: 'Calculates the data encryption key lifetime', is_correct: false }
    ]
  },
  {
    statement: 'How does the `traceroute` utility identify every intermediate router between source and destination?',
    explanation: '`traceroute` sends packets (UDP, ICMP, or TCP) with incrementally increasing TTL values (TTL=1, TTL=2, TTL=3...). Each intermediate router decrements TTL to 0, drops the packet, and responds with an ICMP "Time Exceeded" message, revealing the router\'s IP address and latency.',
    category_slug: 'computer-networks',
    topic: 'Traceroute and ICMP',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Sends packets with incrementing TTL values (1, 2, 3...) and records the IP addresses from returning ICMP Time Exceeded packets', is_correct: true },
      { label: 'B', content: 'Queries the central ICANN router registry', is_correct: false },
      { label: 'C', content: 'Inspects BGP routing tables directly via SSH', is_correct: false },
      { label: 'D', content: 'Uses GPS satellite positioning on packet headers', is_correct: false }
    ]
  },
  {
    statement: 'What is the role of CSMA/CD (Carrier Sense Multiple Access with Collision Detection) in classic Ethernet (IEEE 802.3)?',
    explanation: 'Stations listen to the shared medium before transmitting ("Carrier Sense"). If medium is idle, they transmit; if two stations transmit simultaneously, they detect a voltage collision spike, send a jam signal, and back off for a random exponential time period before retrying.',
    category_slug: 'computer-networks',
    topic: 'CSMA/CD Media Access',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Listens before transmitting, detects collisions, sends jam signal, and executes Exponential Backoff before retransmitting', is_correct: true },
      { label: 'B', content: 'Avoids collisions entirely using token ring rotation', is_correct: false },
      { label: 'C', content: 'Allocates dedicated frequencies using FDMA', is_correct: false },
      { label: 'D', content: 'Compresses Ethernet headers using gzip', is_correct: false }
    ]
  },
  {
    statement: 'What is the purpose of the 4-way FIN teardown handshake in TCP connection termination?',
    explanation: 'Because TCP connections are full-duplex (independent data flow in both directions), each direction must be closed independently:\n1. Client sends FIN.\n2. Server responds with ACK (half-close: server can still send data).\n3. Server sends FIN.\n4. Client responds with ACK and enters TIME_WAIT.',
    category_slug: 'computer-networks',
    topic: 'TCP Connection Teardown',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Gracefully closes both directions of full-duplex communication independently with FIN and ACK packets', is_correct: true },
      { label: 'B', content: 'Verifies that no hackers are eavesdropping on the socket', is_correct: false },
      { label: 'C', content: 'Cleans up client operating system page tables', is_correct: false },
      { label: 'D', content: 'Forces router queues to dump unread packets', is_correct: false }
    ]
  },
  {
    statement: 'Why does a TCP client enter the `TIME_WAIT` state for 2 * MSL (Maximum Segment Lifetime) after sending the final ACK?',
    explanation: '1. To ensure the final ACK reaches the server; if the ACK is lost, the server retransmits FIN, and client in TIME_WAIT can resend ACK.\n2. To allow all duplicate or delayed stray packets belonging to the old connection to expire in the network, preventing corruption of future connections reusing the same port pair.',
    category_slug: 'computer-networks',
    topic: 'TIME_WAIT State',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Ensures the final ACK was received and allows delayed stray packets in the network to die out before reusing port pair', is_correct: true },
      { label: 'B', content: 'Waits for user to click disconnect on the browser', is_correct: false },
      { label: 'C', content: 'Saves battery power on mobile wireless adapters', is_correct: false },
      { label: 'D', content: 'Allows the server to bill client for data downloaded', is_correct: false }
    ]
  },
  {
    statement: 'In public key cryptography (asymmetric encryption), how is message confidentiality and digital signature achieved?',
    explanation: '- Confidentiality: Sender encrypts message using the Receiver\'s Public Key (only Receiver\'s Private Key can decrypt).\n- Digital Signature (Authenticity/Non-repudiation): Sender encrypts a hash digest of the message using the Sender\'s Private Key (anyone with Sender\'s Public Key can verify).',
    category_slug: 'computer-networks',
    topic: 'Asymmetric Cryptography and Signatures',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Confidentiality encrypts with receiver\'s public key; Digital signature encrypts with sender\'s private key', is_correct: true },
      { label: 'B', content: 'Both use the same symmetric pre-shared secret key', is_correct: false },
      { label: 'C', content: 'Confidentiality uses private key; Signature uses public key', is_correct: false },
      { label: 'D', content: 'Asymmetric encryption cannot guarantee non-repudiation', is_correct: false }
    ]
  },
  {
    statement: 'What is the role of the Dynamic Host Configuration Protocol (DHCP) and what is its DORA process?',
    explanation: 'DHCP automatically assigns dynamic IP addresses, default gateways, and DNS server IPs to network hosts using four steps:\n1. Discover (Client broadcasts DHCPDISCOVER)\n2. Offer (Server broadcasts DHCPOFFER)\n3. Request (Client requests DHDCPREQUEST)\n4. Acknowledge (Server confirms DHCPACK).',
    category_slug: 'computer-networks',
    topic: 'DHCP Protocol DORA',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Automatically configures IP addresses via Discover, Offer, Request, and Acknowledge (DORA)', is_correct: true },
      { label: 'B', content: 'Translates domain names to IP addresses', is_correct: false },
      { label: 'C', content: 'Routes packets across autonomous systems via BGP', is_correct: false },
      { label: 'D', content: 'Filters incoming malware packets at firewall boundaries', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between Link-State Routing (OSPF) and Distance-Vector Routing (RIP)?',
    explanation: '- Link-State (OSPF): Every router floods link-state advertisements (LSAs) so all routers construct a complete map (topology graph) of the network, running Dijkstra\'s algorithm to compute shortest paths.\n- Distance-Vector (RIP): Routers share their routing tables only with immediate neighbors ("routing by rumor"), without full network visibility.',
    category_slug: 'computer-networks',
    topic: 'OSPF vs RIP Routing',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Link-state builds a complete topology graph and runs Dijkstra; Distance-vector shares routing tables only with neighbors', is_correct: true },
      { label: 'B', content: 'Distance-vector uses bandwidth; Link-state uses hop count strictly', is_correct: false },
      { label: 'C', content: 'RIP converges faster than OSPF in massive enterprise backbones', is_correct: false },
      { label: 'D', content: 'Link-state protocols are vulnerable to count-to-infinity loops', is_correct: false }
    ]
  },
  {
    statement: 'What is the size of an IPv4 address versus an IPv6 address in bits?',
    explanation: 'An IPv4 address is 32 bits (4 bytes) long (providing ~4.3 billion addresses).\nAn IPv6 address is 128 bits (16 bytes) long (providing ~3.4 x 10^38 unique addresses).',
    category_slug: 'computer-networks',
    topic: 'IPv4 vs IPv6 Addressing',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'IPv4 is 32 bits; IPv6 is 128 bits', is_correct: true },
      { label: 'B', content: 'IPv4 is 64 bits; IPv6 is 128 bits', is_correct: false },
      { label: 'C', content: 'IPv4 is 32 bits; IPv6 is 64 bits', is_correct: false },
      { label: 'D', content: 'Both are 64 bits', is_correct: false }
    ]
  },
  {
    statement: 'What is a "SYN Flood" attack and how does "SYN Cookies" mitigate it?',
    explanation: 'In a SYN flood, an attacker sends thousands of TCP SYN requests with spoofed IPs without sending final ACKs, exhausting the server\'s half-open connection backlog table.\nSYN Cookies mitigates this by not allocating any state in the backlog table upon receiving a SYN; instead, it encodes connection parameters into the initial sequence number (cookie) in the SYN-ACK, reconstructing connection state only when client returns valid ACK.',
    category_slug: 'computer-networks',
    topic: 'SYN Flood and SYN Cookies',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Floods half-open TCP connections; mitigated by encoding connection state in the initial SYN-ACK sequence number (SYN Cookies)', is_correct: true },
      { label: 'B', content: 'Floods DNS servers with UDP packets; mitigated by dropping all UDP', is_correct: false },
      { label: 'C', content: 'Injects malicious SQL queries through HTTP POST headers', is_correct: false },
      { label: 'D', content: 'Crashes routers using corrupt BGP packets', is_correct: false }
    ]
  },
  {
    statement: 'What is the function of the "Border Gateway Protocol" (BGP) in the global Internet?',
    explanation: 'BGP is the de-facto exterior gateway routing protocol (Path Vector) of the Internet. It exchanges reachability information between distinct Autonomous Systems (ASes) operated by ISPs, universities, and enterprise backbones based on policy and shortest AS path.',
    category_slug: 'computer-networks',
    topic: 'BGP and Autonomous Systems',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'The exterior path-vector protocol that routes traffic between distinct Autonomous Systems (AS) across the global Internet', is_correct: true },
      { label: 'B', content: 'Assigns IP addresses to home Wi-Fi routers', is_correct: false },
      { label: 'C', content: 'Resolves MAC addresses inside local VLAN switches', is_correct: false },
      { label: 'D', content: 'Encodes video streams in real-time', is_correct: false }
    ]
  },
  {
    statement: 'In sliding window protocols, what is the difference between Go-Back-N and Selective Repeat?',
    explanation: '- Go-Back-N: Receiver accepts packets only in strict sequential order (discards out-of-order packets); on error/loss, sender retransmits all packets starting from the lost packet N.\n- Selective Repeat: Receiver maintains a buffer and selectively accepts out-of-order packets; sender retransmits ONLY the specific packet that was lost/damaged.',
    category_slug: 'computer-networks',
    topic: 'Sliding Window Protocols',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Go-Back-N retransmits all packets from lost packet N; Selective Repeat buffers out-of-order packets and retransmits only the lost packet', is_correct: true },
      { label: 'B', content: 'Go-Back-N uses a window of size 1; Selective Repeat uses size infinity', is_correct: false },
      { label: 'C', content: 'Selective Repeat requires no receiver buffer', is_correct: false },
      { label: 'D', content: 'Go-Back-N is connectionless; Selective Repeat is connection-oriented', is_correct: false }
    ]
  },
  {
    statement: 'What is the standard port number for DNS queries over UDP/TCP?',
    explanation: 'DNS (Domain Name System) operates by default on port 53 (using UDP for standard queries under 512 bytes, and TCP for zone transfers or responses exceeding 512 bytes).',
    category_slug: 'computer-networks',
    topic: 'Standard Well-Known Ports',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Port 53', is_correct: true },
      { label: 'B', content: 'Port 80', is_correct: false },
      { label: 'C', content: 'Port 443', is_correct: false },
      { label: 'D', content: 'Port 22', is_correct: false }
    ]
  },
  {
    statement: 'What is the function of the "Nagle\'s Algorithm" in TCP sockets?',
    explanation: 'Nagle\'s algorithm prevents "Small Packet Problem" (telnet typing character-by-character creating huge 40-byte header overhead for 1 byte of payload) by delaying sending small packets until either a full MSS (Maximum Segment Size) of data accumulates, or all previously sent data has been acknowledged.',
    category_slug: 'computer-networks',
    topic: 'Nagle\'s Algorithm',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Combines small outgoing data buffers into full segments before sending to reduce packet header overhead', is_correct: true },
      { label: 'B', content: 'Disables flow control to maximize streaming bandwidth', is_correct: false },
      { label: 'C', content: 'Encrypts TCP headers against deep packet inspection', is_correct: false },
      { label: 'D', content: 'Limits the maximum number of open sockets per thread', is_correct: false }
    ]
  },
  {
    statement: 'What is a "VLAN" (Virtual Local Area Network) and how does it isolate traffic on an Ethernet switch?',
    explanation: 'A VLAN partitions a physical switch into multiple isolated broadcast domains at Layer 2 (IEEE 802.1Q tagging). Broadcasts and unicast traffic within one VLAN cannot cross into another VLAN without passing through a Layer 3 router.',
    category_slug: 'computer-networks',
    topic: 'VLANs and Layer 2 Isolation',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Partitions a physical switch into distinct logical Layer 2 broadcast domains using 802.1Q tags', is_correct: true },
      { label: 'B', content: 'A virtual private network encrypted over the Internet', is_correct: false },
      { label: 'C', content: 'A software simulation of an optical fiber cable', is_correct: false },
      { label: 'D', content: 'A Wi-Fi network that requires no password', is_correct: false }
    ]
  },
  {
    statement: 'What is "Silly Window Syndrome" in TCP and how is it resolved?',
    explanation: 'Silly Window Syndrome occurs when either the sender generates data in tiny 1-byte increments or the receiver advertises tiny buffer spaces (1 byte window), causing massive network overhead.\nResolved by: 1) Clark\'s Solution on receiver (do not advertise window until at least 1 MSS or 50% buffer is free), 2) Nagle\'s algorithm on sender.',
    category_slug: 'computer-networks',
    topic: 'Silly Window Syndrome',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Exchange of tiny 1-byte window sizes and packets; resolved by Clark\'s solution on receiver and Nagle\'s algorithm on sender', is_correct: true },
      { label: 'B', content: 'Infinite loop in window sliding causing buffer overflow', is_correct: false },
      { label: 'C', content: 'Browser window freezing during heavy JavaScript rendering', is_correct: false },
      { label: 'D', content: 'Router buffer bloat causing latency spike', is_correct: false }
    ]
  },
  {
    statement: 'What does the "Maximum Transmission Unit" (MTU) represent in computer networking?',
    explanation: 'MTU is the maximum size (in bytes) of a single physical packet or frame that can be transmitted across a network interface without fragmentation (standard Ethernet MTU is 1500 bytes).',
    category_slug: 'computer-networks',
    topic: 'MTU and Packet Sizing',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'The largest packet size that can be transmitted over a physical network medium without fragmentation (standard 1500 bytes on Ethernet)', is_correct: true },
      { label: 'B', content: 'The maximum download speed achievable by an ISP connection', is_correct: false },
      { label: 'C', content: 'The number of simultaneous TCP connections a server can handle', is_correct: false },
      { label: 'D', content: 'The memory size of a network interface card buffer', is_correct: false }
    ]
  },
  {
    statement: 'What does the "HTTPS" protocol add on top of standard HTTP?',
    explanation: 'HTTPS transmits standard HTTP requests and responses over an encrypted Transport Layer Security (TLS/SSL) session, providing Data Confidentiality (symmetric encryption), Data Integrity (message authentication codes), and Server Authentication (X.509 digital certificates).',
    category_slug: 'computer-networks',
    topic: 'HTTPS and TLS/SSL',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Layer of TLS/SSL encryption providing confidentiality, integrity, and server authentication via digital certificates', is_correct: true },
      { label: 'B', content: 'Faster compression algorithm for image downloads', is_correct: false },
      { label: 'C', content: 'A protocol that eliminates DNS lookups', is_correct: false },
      { label: 'D', content: 'A proprietary protocol created by Google for Chrome', is_correct: false }
    ]
  }
];
