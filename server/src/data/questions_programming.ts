import { SeedQuestion } from './questions_aptitude';

export const PROGRAMMING_QUESTIONS: SeedQuestion[] = [
  // ==========================================
  // C PROGRAMMING (10 QUESTIONS)
  // ==========================================
  {
    statement: 'What is the output of the following C code snippet?\n\n```c\n#include <stdio.h>\nint main() {\n    int arr[] = {10, 20, 30, 40, 50};\n    int *ptr = arr;\n    printf("%d, %d", *ptr++, *++ptr);\n    return 0;\n}\n```',
    explanation: 'In C, the order of evaluation of function arguments in printf() is unspecified by the ISO C standard (compiler-dependent, often right-to-left in cdecl ABI). However, modifying a variable and reading it multiple times without a sequence point causes undefined behavior in classic C. In standard placement interview settings testing pointer arithmetic: *ptr++ dereferences then increments ptr, while *++ptr increments ptr first then dereferences. If evaluated right-to-left: *++ptr advances to arr[1]=20, then *ptr++ evaluates arr[1]=20 and advances to arr[2]. Under strict C99/C11, this expression evokes undefined behavior due to unsequenced side effects on `ptr`.',
    category_slug: 'c-programming',
    topic: 'Pointers and Sequence Points',
    difficulty: 'hard',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: '10, 20', is_correct: false },
      { label: 'B', content: '20, 20', is_correct: false },
      { label: 'C', content: 'Undefined behavior due to unsequenced modifications of ptr', is_correct: true },
      { label: 'D', content: '10, 30', is_correct: false }
    ]
  },
  {
    statement: 'In C, what is the size of the following struct on a standard 64-bit architecture with default structure padding?\n\n```c\nstruct Example {\n    char a;\n    int b;\n    char c;\n};\n```',
    explanation: 'Due to data alignment requirements on modern 64-bit architectures:\n- `char a` takes 1 byte at offset 0.\n- To align `int b` (4 bytes) on a 4-byte boundary, 3 bytes of padding are added (offsets 1-3).\n- `int b` occupies bytes 4 to 7.\n- `char c` takes 1 byte at offset 8.\n- Total size so far = 9 bytes. Since the largest member is `int` (4 bytes), the total struct size must be a multiple of 4, adding 3 trailing padding bytes (offsets 9-11).\nTotal size = 12 bytes.',
    category_slug: 'c-programming',
    topic: 'Structure Padding and Alignment',
    difficulty: 'medium',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: '6 bytes', is_correct: false },
      { label: 'B', content: '8 bytes', is_correct: false },
      { label: 'C', content: '12 bytes', is_correct: true },
      { label: 'D', content: '16 bytes', is_correct: false }
    ]
  },
  {
    statement: 'What is the key difference between `malloc()` and `calloc()` in C standard library?',
    explanation: '`malloc(size_t size)` allocates an uninitialized block of raw memory of `size` bytes containing indeterminate values (garbage).\n`calloc(size_t num, size_t size)` allocates memory for an array of `num` objects of `size` bytes and initializes all bits in the allocated memory block to zero.',
    category_slug: 'c-programming',
    topic: 'Dynamic Memory Allocation',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'calloc() zeroes the allocated memory; malloc() leaves memory uninitialized (garbage values)', is_correct: true },
      { label: 'B', content: 'malloc() allocates on heap; calloc() allocates on stack', is_correct: false },
      { label: 'C', content: 'calloc() cannot be freed using free()', is_correct: false },
      { label: 'D', content: 'malloc() requires two parameters, calloc() requires one', is_correct: false }
    ]
  },
  {
    statement: 'What is the purpose of the `volatile` type qualifier in C?',
    explanation: 'The `volatile` keyword informs the compiler that a variable\'s value can be changed at any moment by something outside the code\'s control (such as hardware registers, ISRs, or concurrent threads). It prevents the compiler from applying caching or optimization that assumes the variable\'s value remains constant across instructions.',
    category_slug: 'c-programming',
    topic: 'Type Qualifiers',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'To make variables immutable across runtime execution', is_correct: false },
      { label: 'B', content: 'To prevent compiler optimization and force fetching from memory on every read/write', is_correct: true },
      { label: 'C', content: 'To store variables exclusively in CPU registers for rapid execution', is_correct: false },
      { label: 'D', content: 'To allocate variables dynamically on the thread stack', is_correct: false }
    ]
  },
  {
    statement: 'What does the following declaration mean in C?\n\n`int (*func[5])(char, float);`',
    explanation: 'Reading inside out using the spiral rule:\n`func` is an array of 5 elements.\n`*` indicates each element is a pointer.\n`(char, float)` indicates a function taking char and float arguments.\n`int` indicates the function returns an int.\nThus, `func` is an array of 5 pointers to functions taking (char, float) and returning int.',
    category_slug: 'c-programming',
    topic: 'Function Pointers and Declarations',
    difficulty: 'hard',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: 'A function returning an array of 5 integer pointers', is_correct: false },
      { label: 'B', content: 'An array of 5 function pointers, each pointing to a function that takes (char, float) and returns an int', is_correct: true },
      { label: 'C', content: 'A pointer to an array of 5 functions returning float', is_correct: false },
      { label: 'D', content: 'Syntax error in C standard declaration', is_correct: false }
    ]
  },
  {
    statement: 'What happens when you execute `free(ptr);` in C on an allocated pointer and then attempt `printf("%d", *ptr);`?',
    explanation: 'After `free(ptr)`, the memory block is deallocated and returned to the heap manager, but the pointer variable `ptr` retains the memory address. Dereferencing this "dangling pointer" results in Undefined Behavior, which may read stale data, crash with a segmentation fault, or corrupt memory.',
    category_slug: 'c-programming',
    topic: 'Dangling Pointers and Memory Safety',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'It prints 0 automatically', is_correct: false },
      { label: 'B', content: 'Undefined behavior due to accessing a dangling pointer', is_correct: true },
      { label: 'C', content: 'Compile-time error', is_correct: false },
      { label: 'D', content: 'The operating system automatically reallocates the memory', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the preprocessor macro expansion in C?\n\n```c\n#define SQUARE(x) x * x\nint a = SQUARE(2 + 3);\n```',
    explanation: 'C preprocessor performs textual substitution without evaluating operator precedence.\n`SQUARE(2 + 3)` expands textually to `2 + 3 * 2 + 3`.\nDue to multiplication having higher precedence than addition:\n`2 + (3 * 2) + 3` = `2 + 6 + 3` = `11` (instead of 25).\nTo prevent this, macros should always be parenthesized: `((x) * (x))`.',
    category_slug: 'c-programming',
    topic: 'Macros and Preprocessor',
    difficulty: 'medium',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: '25', is_correct: false },
      { label: 'B', content: '11', is_correct: true },
      { label: 'C', content: '13', is_correct: false },
      { label: 'D', content: 'Compilation error', is_correct: false }
    ]
  },
  {
    statement: 'What is the default storage class and initial value of a variable declared inside a function without any storage specifier?',
    explanation: 'A variable declared inside a function without a specifier defaults to the `auto` storage class.\nIts scope is local to the block, lifetime is limited to block execution, and its initial value is indeterminate (garbage value).',
    category_slug: 'c-programming',
    topic: 'Storage Classes',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'auto, initialized to garbage value', is_correct: true },
      { label: 'B', content: 'static, initialized to 0', is_correct: false },
      { label: 'C', content: 'register, initialized to 0', is_correct: false },
      { label: 'D', content: 'extern, initialized to NULL', is_correct: false }
    ]
  },
  {
    statement: 'Which operator cannot be overloaded in C++? (Contrast with C operators)',
    explanation: 'In C++, the following operators cannot be overloaded:\n1. `.` (Member access)\n2. `.*` (Pointer-to-member)\n3. `::` (Scope resolution)\n4. `?:` (Ternary conditional)\n5. `sizeof` (Size computation)',
    category_slug: 'c-programming',
    topic: 'Operators',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'sizeof and scope resolution (::)', is_correct: true },
      { label: 'B', content: 'Assignment (=)', is_correct: false },
      { label: 'C', content: 'Subscript ([])', is_correct: false },
      { label: 'D', content: 'Function call (())', is_correct: false }
    ]
  },
  {
    statement: 'In C, what is the output of `sizeof("Hello\\0World");` on a 32/64-bit machine?',
    explanation: 'A string literal has type `char[]` and includes all embedded characters plus the terminating null character `\\0`.\nCharacters: \'H\', \'e\', \'l\', \'l\', \'o\', \'\\0\', \'W\', \'o\', \'r\', \'l\', \'d\', \'\\0\' (trailing compiler null terminator).\nTotal bytes = 5 + 1 + 5 + 1 = 12 bytes.',
    category_slug: 'c-programming',
    topic: 'Strings and sizeof',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '5', is_correct: false },
      { label: 'B', content: '6', is_correct: false },
      { label: 'C', content: '11', is_correct: false },
      { label: 'D', content: '12', is_correct: true }
    ]
  },

  // ==========================================
  // C++ PROGRAMMING (10 QUESTIONS)
  // ==========================================
  {
    statement: 'Why must a base class have a `virtual` destructor in C++ when deleting derived class objects through a base class pointer?',
    explanation: 'If a derived class object is deleted through a base class pointer and the base class destructor is NOT virtual, the behavior is undefined according to the C++ standard. In practice, only the base class destructor will be invoked, leading to a resource/memory leak for any resources allocated by the derived class.',
    category_slug: 'cpp-programming',
    topic: 'Virtual Destructors and Polymorphism',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'To ensure the derived class destructor is called first, preventing resource leaks', is_correct: true },
      { label: 'B', content: 'To prevent instantiation of the base class', is_correct: false },
      { label: 'C', content: 'To force static binding at compile time', is_correct: false },
      { label: 'D', content: 'To enable automatic garbage collection in C++', is_correct: false }
    ]
  },
  {
    statement: 'What is the role of `std::move` in modern C++ (C++11 and later)?',
    explanation: '`std::move` does not move any bytes or allocate memory at runtime. It is purely a compile-time static cast that converts an lvalue expression into an rvalue reference (`T&&`), enabling the compiler to select move constructors or move assignment operators instead of deep copying.',
    category_slug: 'cpp-programming',
    topic: 'Move Semantics and Rvalue References',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'It physically transfers memory bytes from source to destination buffer', is_correct: false },
      { label: 'B', content: 'It unconditionally casts an expression to an rvalue reference, enabling move semantics', is_correct: true },
      { label: 'C', content: 'It deletes the source object and reallocates a new one', is_correct: false },
      { label: 'D', content: 'It synchronizes threads moving data between CPU caches', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between `std::unique_ptr` and `std::shared_ptr` in C++?',
    explanation: '`std::unique_ptr` represents exclusive ownership of a dynamic resource; it cannot be copied, only moved, incurring zero runtime overhead compared to a raw pointer.\n`std::shared_ptr` provides shared ownership via an atomic reference count control block; the resource is destroyed when the last owning shared_ptr goes out of scope.',
    category_slug: 'cpp-programming',
    topic: 'Smart Pointers and RAII',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'unique_ptr enforces exclusive single ownership; shared_ptr uses reference counting for shared ownership', is_correct: true },
      { label: 'B', content: 'shared_ptr is allocated on stack; unique_ptr on heap', is_correct: false },
      { label: 'C', content: 'unique_ptr can be freely copied to other threads without synchronization', is_correct: false },
      { label: 'D', content: 'shared_ptr cannot manage dynamically allocated arrays', is_correct: false }
    ]
  },
  {
    statement: 'What is the "Diamond Problem" in C++ multiple inheritance and how is it resolved?',
    explanation: 'The Diamond Problem occurs when two classes B and C inherit from a base class A, and a class D inherits from both B and C. Without intervention, D contains two separate copies of A\'s member variables, causing ambiguity and wasted memory.\nIt is resolved using `virtual inheritance` (`class B : virtual public A`), ensuring only a single shared instance of A exists in D.',
    category_slug: 'cpp-programming',
    topic: 'Virtual Inheritance',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Duplicate base class subobjects in multiple inheritance; resolved using virtual inheritance', is_correct: true },
      { label: 'B', content: 'Compiler deadlock during template instantiation; resolved using inline functions', is_correct: false },
      { label: 'C', content: 'Circular header inclusion; resolved using #pragma once', is_correct: false },
      { label: 'D', content: 'Ambiguous operator overloading; resolved using static_cast', is_correct: false }
    ]
  },
  {
    statement: 'What is the time complexity of searching an element in `std::map` vs `std::unordered_map` in C++ STL?',
    explanation: '`std::map` is typically implemented as a Red-Black Tree (Self-balancing BST), providing guaranteed O(log N) search, insertion, and deletion.\n`std::unordered_map` is implemented as a Hash Table, providing O(1) average time complexity for search, but degrading to O(N) in the worst case with excessive hash collisions.',
    category_slug: 'cpp-programming',
    topic: 'STL Containers Complexity',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'std::map is O(log N); std::unordered_map is O(1) average (O(N) worst case)', is_correct: true },
      { label: 'B', content: 'std::map is O(1); std::unordered_map is O(log N)', is_correct: false },
      { label: 'C', content: 'Both are strictly O(1) in all scenarios', is_correct: false },
      { label: 'D', content: 'Both are strictly O(log N)', is_correct: false }
    ]
  },
  {
    statement: 'What does the `explicit` keyword on a constructor signify in C++?',
    explanation: 'The `explicit` specifier prevents the compiler from using that constructor for implicit conversions and copy-initialization. It forces callers to use direct initialization, preventing unintended silent bugs.',
    category_slug: 'cpp-programming',
    topic: 'Constructors and Conversions',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Forces the constructor to be executed in a separate worker thread', is_correct: false },
      { label: 'B', content: 'Prevents implicit type conversions and copy-initialization from being performed by the compiler', is_correct: true },
      { label: 'C', content: 'Makes the constructor visible only to friend classes', is_correct: false },
      { label: 'D', content: 'Ensures the object is allocated strictly on the heap', is_correct: false }
    ]
  },
  {
    statement: 'What does RAII (Resource Acquisition Is Initialization) mean in C++ architecture?',
    explanation: 'RAII is a fundamental C++ idiom where resource management is tied to object lifetime: resources (heap memory, file handles, mutex locks, network sockets) are acquired in the constructor and automatically released in the destructor when the object leaves scope, guaranteeing exception safety.',
    category_slug: 'cpp-programming',
    topic: 'RAII and Exception Safety',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Resources are acquired during construction and deterministically released in the destructor upon scope exit', is_correct: true },
      { label: 'B', content: 'All variables must be initialized to NULL before usage', is_correct: false },
      { label: 'C', content: 'Memory is garbage collected automatically at random intervals', is_correct: false },
      { label: 'D', content: 'All initialization must be executed in the main() function', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Pure Virtual Function" in C++ and what is its consequence on a class?',
    explanation: 'A pure virtual function is a virtual function declared with `= 0` (e.g., `virtual void draw() = 0;`). Any class containing at least one pure virtual function becomes an `Abstract Class`, meaning it cannot be instantiated directly and derived classes must override all pure virtual functions to become concrete.',
    category_slug: 'cpp-programming',
    topic: 'Abstract Classes and Interfaces',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'A function with no arguments that makes the class abstract and uninstantiable directly', is_correct: true },
      { label: 'B', content: 'A function that cannot be overridden by derived classes', is_correct: false },
      { label: 'C', content: 'A static method that operates only on constant data members', is_correct: false },
      { label: 'D', content: 'A function that compiles directly to inline machine instructions', is_correct: false }
    ]
  },
  {
    statement: 'What is the purpose of `constexpr` in modern C++?',
    explanation: '`constexpr` indicates that the value of a variable, or the return value of a function, can be evaluated at compile time rather than runtime, enabling powerful compile-time calculations, array sizing, and zero-cost abstractions.',
    category_slug: 'cpp-programming',
    topic: 'Compile-Time Computation',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Enables functions and expressions to be evaluated deterministically at compile time', is_correct: true },
      { label: 'B', content: 'Locks variable memory to read-only hardware registers at runtime', is_correct: false },
      { label: 'C', content: 'Suppresses compiler warning messages', is_correct: false },
      { label: 'D', content: 'Prevents the function from throwing runtime exceptions', is_correct: false }
    ]
  },
  {
    statement: 'In C++, what is the difference between a pointer and a reference?',
    explanation: 'A reference is an alias for an existing object; it must be initialized when created, cannot be reseated to refer to another object, and cannot be null.\nA pointer is an independent variable storing a memory address; it can be uninitialized, reassigned, and set to `nullptr`.',
    category_slug: 'cpp-programming',
    topic: 'Pointers vs References',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'References cannot be null, must be initialized on declaration, and cannot be reseated to another object', is_correct: true },
      { label: 'B', content: 'Pointers do not occupy any memory space', is_correct: false },
      { label: 'C', content: 'References support pointer arithmetic (+ and -)', is_correct: false },
      { label: 'D', content: 'References can be deleted using delete keyword', is_correct: false }
    ]
  },

  // ==========================================
  // JAVA (10 QUESTIONS)
  // ==========================================
  {
    statement: 'In Java, why is it mandatory to override `hashCode()` whenever you override `equals()` in a class?',
    explanation: 'The contract between `equals()` and `hashCode()` states that if two objects are equal according to `equals(Object)`, they MUST produce the same integer `hashCode()`. Failing to adhere to this contract breaks hash-based collections (HashMap, HashSet, Hashtable), causing objects to be stored in the wrong buckets and rendering them unretrievable.',
    category_slug: 'java',
    topic: 'equals and hashCode Contract',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'To maintain the contract that equal objects must have identical hash codes for correct HashMap/HashSet behavior', is_correct: true },
      { label: 'B', content: 'To allow the garbage collector to identify circular references', is_correct: false },
      { label: 'C', content: 'To satisfy the compiler; code will not compile otherwise', is_correct: false },
      { label: 'D', content: 'To speed up primitive type comparisons', is_correct: false }
    ]
  },
  {
    statement: 'What is "Type Erasure" in Java Generics?',
    explanation: 'Java Generics were introduced in Java 5 with backward compatibility in mind. During compilation, the Java compiler enforces strict type checking and then "erases" all generic type parameters, replacing them with their raw type or upper bound (like `Object`) and inserting type casts where necessary. At runtime, the JVM has no knowledge of generic type arguments (e.g. `List<String>` and `List<Integer>` have the same class `List.class`).',
    category_slug: 'java',
    topic: 'Generics and Type Erasure',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Generic type parameters are stripped away during compilation and replaced by raw types/casts for backward compatibility', is_correct: true },
      { label: 'B', content: 'Automatic deletion of unused generic classes by JVM during class loading', is_correct: false },
      { label: 'C', content: 'Conversion of primitive types into boxed wrapper classes', is_correct: false },
      { label: 'D', content: 'Runtime casting of incompatible inheritance hierarchies', is_correct: false }
    ]
  },
  {
    statement: 'Why is `String` immutable in Java?',
    explanation: '`String` immutability provides several critical advantages:\n1. Security: prevents alteration of database connection strings, file paths, and network URLs.\n2. Thread safety: immutable strings can be safely shared across concurrent threads without synchronization.\n3. String Pool caching: saves heap memory by reusing string literals.\n4. HashCode caching: hashcode is computed once and cached, optimizing HashMap lookups.',
    category_slug: 'java',
    topic: 'Immutability and String Pool',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'For security, thread-safety, String Constant Pool caching, and reliable hashcode caching', is_correct: true },
      { label: 'B', content: 'Because primitive char arrays cannot be mutated in Java', is_correct: false },
      { label: 'C', content: 'To prevent developers from overriding methods in String subclasses', is_correct: false },
      { label: 'D', content: 'Because Java does not support pointers', is_correct: false }
    ]
  },
  {
    statement: 'What is the key difference between Checked and Unchecked Exceptions in Java?',
    explanation: 'Checked Exceptions (inheriting from `Exception` but not `RuntimeException`) represent recoverable conditions that a well-written application should anticipate; the compiler enforces handling via `try-catch` or `throws` declaration.\nUnchecked Exceptions (inheriting from `RuntimeException` or `Error`) represent programming bugs or fatal system issues (NullPointerException, ArrayIndexOutOfBoundsException) and are not checked at compile time.',
    category_slug: 'java',
    topic: 'Exception Hierarchy',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Checked exceptions are verified at compile-time and must be handled/declared; unchecked exceptions occur at runtime', is_correct: true },
      { label: 'B', content: 'Checked exceptions crash the JVM immediately; unchecked exceptions can be recovered', is_correct: false },
      { label: 'C', content: 'Checked exceptions inherit directly from Throwable; unchecked from Error', is_correct: false },
      { label: 'D', content: 'Only unchecked exceptions can use the finally block', is_correct: false }
    ]
  },
  {
    statement: 'How does Java Garbage Collection distinguish live objects from garbage in the heap?',
    explanation: 'Java GC uses Tracing / Reachability Analysis starting from GC Roots (active thread stack frames, static variables, JNI references). Any object in the heap that cannot be reached through a chain of references from any GC Root is deemed unreachable and marked for reclamation.',
    category_slug: 'java',
    topic: 'JVM Garbage Collection',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Reachability analysis tracing reference chains starting from GC Roots', is_correct: true },
      { label: 'B', content: 'Simple reference counting on every object header', is_correct: false },
      { label: 'C', content: 'Checking which objects have null values in all member fields', is_correct: false },
      { label: 'D', content: 'Timer-based deletion of objects older than 5 minutes', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between `final`, `finally`, and `finalize` in Java?',
    explanation: '- `final`: keyword used to declare constants, prevent method overriding, or prevent class inheritance.\n- `finally`: block in exception handling that executes regardless of whether an exception is thrown or caught.\n- `finalize`: protected method of `java.lang.Object` invoked by the garbage collector before reclaiming an object (deprecated in modern Java).',
    category_slug: 'java',
    topic: 'Core Language Keywords',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'final is a modifier; finally is a try-catch cleanup block; finalize is a deprecated Object method for pre-collection cleanup', is_correct: true },
      { label: 'B', content: 'All three are used strictly for thread synchronization', is_correct: false },
      { label: 'C', content: 'finally terminates JVM; finalize closes database connections; final makes code execute faster', is_correct: false },
      { label: 'D', content: 'final is for methods, finally for variables, finalize for classes', is_correct: false }
    ]
  },
  {
    statement: 'In Java, how does `HashMap` handle bucket collisions internally since Java 8?',
    explanation: 'Prior to Java 8, collisions were resolved exclusively using a singly linked list in each bucket (O(N) search).\nSince Java 8, when the number of elements in a bucket reaches `TREEIFY_THRESHOLD` (default 8) and total table capacity is at least 64, the linked list is converted into a balanced Red-Black Tree (`TreeNode`), improving worst-case search complexity from O(N) to O(log N).',
    category_slug: 'java',
    topic: 'Collections Internal Architecture',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Converts the bucket linked list into a balanced Red-Black tree when entries exceed 8, improving search from O(N) to O(log N)', is_correct: true },
      { label: 'B', content: 'Discards the duplicate element and throws ConcurrentModificationException', is_correct: false },
      { label: 'C', content: 'Double hashes using quadratic probing across adjacent buckets', is_correct: false },
      { label: 'D', content: 'Allocates a new separate HashMap and merges asynchronously', is_correct: false }
    ]
  },
  {
    statement: 'What is the function of the `volatile` keyword in Java multi-threading?',
    explanation: 'In Java, `volatile` guarantees visibility of changes to variables across threads. When a field is declared `volatile`, writes to it are immediately flushed to main memory, and reads are always fetched directly from main memory rather than local CPU thread cache, establishing a happens-before relationship.',
    category_slug: 'java',
    topic: 'Java Memory Model and Concurrency',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Guarantees visibility of variable updates across threads by bypassing thread CPU caches', is_correct: true },
      { label: 'B', content: 'Provides full atomic compound operations (like count++) without synchronization', is_correct: false },
      { label: 'C', content: 'Locks the entire enclosing class during read operations', is_correct: false },
      { label: 'D', content: 'Prevents garbage collection of the annotated variable', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between `Comparable` and `Comparator` interfaces in Java?',
    explanation: '`Comparable` (`compareTo(T o)`) defines the natural ordering of a class within the class itself (single sequence).\n`Comparator` (`compare(T o1, T o2)`) is implemented in external classes or lambda expressions to provide custom or multiple different sorting strategies without modifying the original class.',
    category_slug: 'java',
    topic: 'Sorting and Interfaces',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Comparable provides natural internal ordering; Comparator provides external custom ordering strategies', is_correct: true },
      { label: 'B', content: 'Comparable is for primitives; Comparator is for Objects', is_correct: false },
      { label: 'C', content: 'Comparator is thread-safe; Comparable is not', is_correct: false },
      { label: 'D', content: 'Comparable allows sorting in descending order only', is_correct: false }
    ]
  },
  {
    statement: 'What occurs when an unhandled exception is thrown inside a `Thread` in Java?',
    explanation: 'If an exception is unhandled within a Thread\'s `run()` method, the thread terminates abnormally. The JVM invokes the thread\'s `UncaughtExceptionHandler` (if configured) or prints a stack trace to System.err. Other threads in the JVM process continue executing normally.',
    category_slug: 'java',
    topic: 'Threading and Exceptions',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'The specific thread terminates, invokes UncaughtExceptionHandler, while other threads continue', is_correct: true },
      { label: 'B', content: 'The entire JVM process immediately exits with exit code 1', is_correct: false },
      { label: 'C', content: 'The exception is silently ignored and the thread restarts from beginning', is_correct: false },
      { label: 'D', content: 'The main thread freezes until the child thread is garbage collected', is_correct: false }
    ]
  },

  // ==========================================
  // PYTHON (10 QUESTIONS)
  // ==========================================
  {
    statement: 'What is the Global Interpreter Lock (GIL) in CPython and what is its consequence on CPU-bound multi-threading?',
    explanation: 'The GIL is a mutex that prevents multiple native threads from executing Python bytecode simultaneously within a single CPython process. While it simplifies memory management and C-extension integration, it prevents CPU-bound multi-threaded Python programs from utilizing multiple CPU cores concurrently. For CPU-bound parallelism, `multiprocessing` or native extensions must be used.',
    category_slug: 'python',
    topic: 'CPython GIL and Concurrency',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'A mutex that allows only one thread to execute Python bytecode at a time, limiting CPU-bound multi-threaded parallelism', is_correct: true },
      { label: 'B', content: 'A security mechanism that prevents unauthorized memory access between processes', is_correct: false },
      { label: 'C', content: 'A lock that serializes all network and disk I/O operations', is_correct: false },
      { label: 'D', content: 'A compiler flag that optimizes vector instructions', is_correct: false }
    ]
  },
  {
    statement: 'What is the pitfall of using mutable default arguments in Python functions, as demonstrated below?\n\n```python\ndef append_to(element, target=[]):\n    target.append(element)\n    return target\n```',
    explanation: 'In Python, default arguments are evaluated ONCE when the function definition is executed (at module load time), not every time the function is called. Therefore, the same list instance is reused across subsequent invocations where the argument is omitted, causing state to persist unexpectedly.\nThe idiomatic fix is: `def append_to(element, target=None): if target is None: target = []`.',
    category_slug: 'python',
    topic: 'Mutable Default Arguments',
    difficulty: 'medium',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: 'The default list is created once at function definition time and shared across subsequent calls, mutating across calls', is_correct: true },
      { label: 'B', content: 'It raises a TypeError at runtime because lists cannot be default parameters', is_correct: false },
      { label: 'C', content: 'It causes a memory leak because Python cannot garbage collect empty lists', is_correct: false },
      { label: 'D', content: 'The function will always return a list with exactly 1 element', is_correct: false }
    ]
  },
  {
    statement: 'What is the key difference between a Python Generator function (using `yield`) and a regular function returning a list?',
    explanation: 'A regular function computes all values upfront and stores them in memory before returning the complete list.\nA generator function produces values on demand one at a time using `yield`, maintaining its state between iterations. This lazy evaluation uses O(1) memory regardless of how many values are generated.',
    category_slug: 'python',
    topic: 'Generators and Iterators',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Generators evaluate lazily on-demand with O(1) memory footprint; list functions compute and store all elements in memory upfront', is_correct: true },
      { label: 'B', content: 'Generators execute on a separate operating system process', is_correct: false },
      { label: 'C', content: 'Generators can only yield integer values', is_correct: false },
      { label: 'D', content: 'List functions are always faster than generators for infinite streams', is_correct: false }
    ]
  },
  {
    statement: 'In Python, how is memory managed for objects and circular references?',
    explanation: 'CPython uses primary Reference Counting for immediate object destruction when the reference count drops to zero.\nTo resolve circular reference cycles (e.g. object A points to B and B points to A, where reference counts never hit zero), CPython includes a secondary cyclic garbage collector based on generational collection (Generations 0, 1, 2) that detects unreachable reference cycles.',
    category_slug: 'python',
    topic: 'Memory Management and Garbage Collection',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Reference counting as the primary mechanism, supplemented by a generational cyclic garbage collector for reference cycles', is_correct: true },
      { label: 'B', content: 'Purely manual free() commands like in C', is_correct: false },
      { label: 'C', content: 'Mark-and-sweep GC identical to Java without reference counts', is_correct: false },
      { label: 'D', content: 'Operating system page fault handlers', is_correct: false }
    ]
  },
  {
    statement: 'What is the output of the following Python snippet?\n\n```python\na = [1, 2, 3]\nb = a\nc = a[:]\na.append(4)\nprint(b, c)\n```',
    explanation: '`b = a` creates another reference to the same list object in memory, so mutating `a` also mutates `b`.\n`c = a[:]` creates a shallow copy of the list at that moment `[1, 2, 3]`.\nAfter `a.append(4)`, `b` evaluates to `[1, 2, 3, 4]`, while `c` remains `[1, 2, 3]`.',
    category_slug: 'python',
    topic: 'References and Slicing Copies',
    difficulty: 'easy',
    type: 'code_snippet_mcq',
    options: [
      { label: 'A', content: '[1, 2, 3, 4] [1, 2, 3]', is_correct: true },
      { label: 'B', content: '[1, 2, 3, 4] [1, 2, 3, 4]', is_correct: false },
      { label: 'C', content: '[1, 2, 3] [1, 2, 3]', is_correct: false },
      { label: 'D', content: '[1, 2, 3] [1, 2, 3, 4]', is_correct: false }
    ]
  },
  {
    statement: 'What is a Python Decorator and how does the `@decorator` syntax work?',
    explanation: 'A decorator is a callable that takes a function as input, extends or alters its behavior without modifying its source code, and returns a callable. The `@my_decorator` syntax is syntactic sugar for `my_func = my_decorator(my_func)`.',
    category_slug: 'python',
    topic: 'Decorators and Higher-Order Functions',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'A higher-order function that wraps and extends another function, syntactic sugar for func = decorator(func)', is_correct: true },
      { label: 'B', content: 'A design pattern that styles GUI components', is_correct: false },
      { label: 'C', content: 'A compiler directive that compiles code into C bytecode', is_correct: false },
      { label: 'D', content: 'A class that serializes objects to JSON', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between `is` and `==` in Python?',
    explanation: '`==` compares equality of values by invoking the `__eq__()` method.\n`is` tests identity—whether two references point to the exact same object in memory (`id(a) == id(b)`).',
    category_slug: 'python',
    topic: 'Identity vs Equality',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '== checks equality of contents; is checks object memory identity', is_correct: true },
      { label: 'B', content: 'is checks equality of contents; == checks object memory identity', is_correct: false },
      { label: 'C', content: 'is is used for strings; == is used for numbers', is_correct: false },
      { label: 'D', content: 'They are completely synonymous in Python 3', is_correct: false }
    ]
  },
  {
    statement: 'What are `*args` and `**kwargs` used for in Python function definitions?',
    explanation: '`*args` collects positional arguments into a `tuple`.\n`**kwargs` collects keyword (named) arguments into a `dict`.\nThey allow functions to accept an arbitrary, dynamic number of arguments.',
    category_slug: 'python',
    topic: 'Variable-Length Arguments',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '*args packs variable positional arguments into a tuple; **kwargs packs keyword arguments into a dictionary', is_correct: true },
      { label: 'B', content: '*args is for pointers; **kwargs is for pointer-to-pointers', is_correct: false },
      { label: 'C', content: '*args creates local threads; **kwargs creates global threads', is_correct: false },
      { label: 'D', content: '*args is mandatory for all recursive functions', is_correct: false }
    ]
  },
  {
    statement: 'What does the `__init__` vs `__new__` method do in Python class instantiation?',
    explanation: '`__new__` is the actual creator method that allocates and returns a new instance of the class (taking `cls` as first argument).\n`__init__` is the initializer method that customizes the newly created instance (taking `self` as first argument).\n`__new__` is called before `__init__`.',
    category_slug: 'python',
    topic: 'Object Creation and Dunder Methods',
    difficulty: 'hard',
    options: [
      { label: 'A', content: '__new__ creates and returns the instance object; __init__ initializes the created instance attributes', is_correct: true },
      { label: 'B', content: '__init__ allocates memory; __new__ is an optional destructor', is_correct: false },
      { label: 'C', content: '__new__ is called after __init__ completes', is_correct: false },
      { label: 'D', content: '__init__ is only for static classes', is_correct: false }
    ]
  },
  {
    statement: 'What is the time complexity of dictionary key lookup in Python under normal operations?',
    explanation: 'Python dictionaries are implemented using high-performance hash tables with open addressing and compact array storage, providing average O(1) time complexity for insertions, updates, and lookups.',
    category_slug: 'python',
    topic: 'Data Structures Complexity',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'O(1) average time complexity', is_correct: true },
      { label: 'B', content: 'O(log N)', is_correct: false },
      { label: 'C', content: 'O(N)', is_correct: false },
      { label: 'D', content: 'O(N log N)', is_correct: false }
    ]
  }
];
