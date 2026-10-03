import { SeedQuestion } from './questions_aptitude';

export const OOP_QUESTIONS: SeedQuestion[] = [
  // ==========================================
  // OBJECT ORIENTED PROGRAMMING (30 QUESTIONS)
  // ==========================================
  {
    statement: 'What is the core difference between Abstraction and Encapsulation in Object-Oriented Programming?',
    explanation: 'Abstraction is the process of hiding internal implementation complexities and exposing only the essential interface to the user ("WHAT" an object does).\nEncapsulation is the bundling of data and the methods that operate on that data into a single unit (class), while restricting direct access to internal state using access specifiers ("HOW" data is protected).',
    category_slug: 'oop-concepts',
    topic: 'Abstraction vs Encapsulation',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Abstraction hides internal implementation details exposing only interface; Encapsulation bundles data with methods and restricts access', is_correct: true },
      { label: 'B', content: 'Abstraction is data hiding; Encapsulation is interface hiding', is_correct: false },
      { label: 'C', content: 'Abstraction applies only to C++; Encapsulation applies only to Java', is_correct: false },
      { label: 'D', content: 'Encapsulation creates subclasses; Abstraction creates objects', is_correct: false }
    ]
  },
  {
    statement: 'Which SOLID principle states that "Software entities (classes, modules, functions) should be open for extension, but closed for modification"?',
    explanation: 'The Open/Closed Principle (OCP), formulated by Bertrand Meyer, states that the behavior of a module should be extendable without modifying its existing source code, typically achieved through abstraction, polymorphism, and interfaces.',
    category_slug: 'oop-concepts',
    topic: 'SOLID Principles - Open/Closed',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Open/Closed Principle (OCP)', is_correct: true },
      { label: 'B', content: 'Single Responsibility Principle (SRP)', is_correct: false },
      { label: 'C', content: 'Liskov Substitution Principle (LSP)', is_correct: false },
      { label: 'D', content: 'Dependency Inversion Principle (DIP)', is_correct: false }
    ]
  },
  {
    statement: 'What does the Liskov Substitution Principle (LSP) require in an object-oriented inheritance hierarchy?',
    explanation: 'LSP (formulated by Barbara Liskov) requires that objects of a superclass should be replaceable with objects of its subclasses without breaking application correctness, altering expected preconditions, or weakening postconditions.',
    category_slug: 'oop-concepts',
    topic: 'SOLID Principles - Liskov Substitution',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Subclasses must be substitutable for their base classes without breaking program correctness or invariants', is_correct: true },
      { label: 'B', content: 'Subclasses must override every method declared in the superclass', is_correct: false },
      { label: 'C', content: 'All subclasses must be declared final', is_correct: false },
      { label: 'D', content: 'Base classes must be declared abstract', is_correct: false }
    ]
  },
  {
    statement: 'What is the classic example demonstrating a violation of the Liskov Substitution Principle?',
    explanation: 'The "Square inherits from Rectangle" problem: A Rectangle allows width and height to be modified independently. If a Square inherits from Rectangle, setting width also mutates height to keep sides equal. Code expecting Rectangle behavior (`rect.setWidth(5); rect.setHeight(4); assert(rect.getArea() == 20);`) fails when given a Square, violating LSP.',
    category_slug: 'oop-concepts',
    topic: 'LSP Classic Violation',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Square inheriting from Rectangle where setting width modifies height', is_correct: true },
      { label: 'B', content: 'Circle inheriting from Shape', is_correct: false },
      { label: 'C', content: 'Dog inheriting from Animal', is_correct: false },
      { label: 'D', content: 'Car inheriting from Vehicle', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between Method Overloading (Compile-time Polymorphism) and Method Overriding (Runtime Polymorphism)?',
    explanation: '- Method Overloading occurs within the same class when methods share the same name with different parameter signatures (resolved at compile time by compiler static binding).\n- Method Overriding occurs across inheritance when a subclass provides a specific implementation of a method declared in its superclass with the identical signature (resolved at runtime via dynamic dispatch / vtable).',
    category_slug: 'oop-concepts',
    topic: 'Polymorphism',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Overloading has same method name with different parameters (compile-time); Overriding has identical signature in subclass (runtime)', is_correct: true },
      { label: 'B', content: 'Overloading requires inheritance; Overriding does not', is_correct: false },
      { label: 'C', content: 'Overriding occurs at compile time; Overloading occurs at runtime', is_correct: false },
      { label: 'D', content: 'Overloading can only return void; Overriding can return any type', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Virtual Method Table" (vtable) and how does dynamic dispatch work in C++ / object-oriented runtimes?',
    explanation: 'For any class containing virtual functions, the compiler creates a static array of function pointers called a `vtable`. Each object instance of that class contains a hidden pointer (`vptr`) pointing to the vtable. When a virtual method is invoked on a pointer/reference, the program dereferences the vptr and looks up the method address in the vtable at runtime.',
    category_slug: 'oop-concepts',
    topic: 'Virtual Tables (vtable) and Dynamic Dispatch',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'A table of function pointers per class used with an object vptr to resolve virtual method calls at runtime', is_correct: true },
      { label: 'B', content: 'A database table storing serialized object states', is_correct: false },
      { label: 'C', content: 'A compiler table that tracks unused private variables', is_correct: false },
      { label: 'D', content: 'A memory map used by the OS scheduler to manage threads', is_correct: false }
    ]
  },
  {
    statement: 'Which Gang of Four (GoF) Design Pattern ensures that a class has only one instance and provides a global access point to it?',
    explanation: 'The Singleton Pattern restricts class instantiation to a single object, typically implemented using a private constructor, a static private instance variable, and a public static getter method (`getInstance()`).',
    category_slug: 'oop-concepts',
    topic: 'Design Patterns - Creational',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Singleton Pattern', is_correct: true },
      { label: 'B', content: 'Factory Method Pattern', is_correct: false },
      { label: 'C', content: 'Prototype Pattern', is_correct: false },
      { label: 'D', content: 'Builder Pattern', is_correct: false }
    ]
  },
  {
    statement: 'How is thread-safe lazy initialization achieved in the Singleton Pattern in Java / C++ without excessive synchronization overhead?',
    explanation: 'Using the "Double-Checked Locking" pattern with a `volatile` instance variable, or the "Bill Pugh Singleton Design" using a private static inner helper class whose class loading is thread-safe and deferred until `getInstance()` is called.',
    category_slug: 'oop-concepts',
    topic: 'Singleton Thread Safety',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Double-Checked Locking with volatile keyword, or static inner holder class (Bill Pugh pattern)', is_correct: true },
      { label: 'B', content: 'Synchronizing the entire class on every single read operation', is_correct: false },
      { label: 'C', content: 'Allocating the singleton in a separate JVM process', is_correct: false },
      { label: 'D', content: 'Making all member variables public', is_correct: false }
    ]
  },
  {
    statement: 'Which design pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically?',
    explanation: 'The Observer Pattern (also known as Publish-Subscribe or Event-Listener) defines a subject maintaining a list of observer objects, notifying them automatically of any state changes by calling their update methods.',
    category_slug: 'oop-concepts',
    topic: 'Design Patterns - Behavioral',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Observer Pattern', is_correct: true },
      { label: 'B', content: 'Strategy Pattern', is_correct: false },
      { label: 'C', content: 'Command Pattern', is_correct: false },
      { label: 'D', content: 'State Pattern', is_correct: false }
    ]
  },
  {
    statement: 'Which design pattern converts the interface of a class into another interface clients expect, enabling classes with incompatible interfaces to work together?',
    explanation: 'The Adapter Pattern acts as a wrapper between two incompatible interfaces, translating calls from the client format into the expected callee format (like a power plug adapter).',
    category_slug: 'oop-concepts',
    topic: 'Design Patterns - Structural',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Adapter Pattern', is_correct: true },
      { label: 'B', content: 'Decorator Pattern', is_correct: false },
      { label: 'C', content: 'Facade Pattern', is_correct: false },
      { label: 'D', content: 'Proxy Pattern', is_correct: false }
    ]
  },
  {
    statement: 'What is the key difference between the Decorator Pattern and the Inheritance mechanism for extending functionality?',
    explanation: 'Inheritance extends class behavior statically at compile time and applies to all instances of the class. The Decorator Pattern wraps an object dynamically at runtime with decorator objects, allowing flexible composition of behaviors on individual instances without class explosion.',
    category_slug: 'oop-concepts',
    topic: 'Decorator Pattern vs Inheritance',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Decorator adds behaviors dynamically at runtime via composition; inheritance adds behaviors statically at compile time', is_correct: true },
      { label: 'B', content: 'Inheritance operates at runtime; Decorator operates at compile time', is_correct: false },
      { label: 'C', content: 'Decorator pattern can only be used with abstract classes', is_correct: false },
      { label: 'D', content: 'Inheritance prevents memory leaks; Decorator causes circular references', is_correct: false }
    ]
  },
  {
    statement: 'Which design pattern provides a unified, simplified high-level interface to a complex subsystem of classes?',
    explanation: 'The Facade Pattern defines a higher-level interface that makes a complex subsystem easier to use by masking the complexities of dozens of internal classes behind a simple unified API.',
    category_slug: 'oop-concepts',
    topic: 'Facade Pattern',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Facade Pattern', is_correct: true },
      { label: 'B', content: 'Proxy Pattern', is_correct: false },
      { label: 'C', content: 'Bridge Pattern', is_correct: false },
      { label: 'D', content: 'Composite Pattern', is_correct: false }
    ]
  },
  {
    statement: 'What is the Dependency Inversion Principle (DIP) in SOLID design?',
    explanation: 'DIP states two rules:\n1. High-level modules should not depend on low-level modules; both should depend on abstractions (interfaces).\n2. Abstractions should not depend on details; details (concrete implementations) should depend on abstractions.',
    category_slug: 'oop-concepts',
    topic: 'SOLID - Dependency Inversion',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'High-level modules and low-level modules should both depend on abstractions rather than concrete implementations', is_correct: true },
      { label: 'B', content: 'Classes must invert their inheritance order so subclasses precede parent classes', is_correct: false },
      { label: 'C', content: 'Dependencies must be declared as global static variables', is_correct: false },
      { label: 'D', content: 'Every function must return a pointer to its dependency', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between Composition and Aggregation in UML object relationships?',
    explanation: '- Composition ("Death Relationship", strong ownership): Part object cannot exist independently of the Whole (e.g., House and Rooms). If the Whole is destroyed, the Parts are destroyed.\n- Aggregation (weak ownership): Part object has an independent lifecycle from the Whole (e.g., Department and Teachers). If Department closes, Teachers still exist.',
    category_slug: 'oop-concepts',
    topic: 'Composition vs Aggregation',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Composition represents strong ownership where child lifecycle is tied to parent; Aggregation represents weak ownership with independent lifecycles', is_correct: true },
      { label: 'B', content: 'Aggregation is inheritance; Composition is polymorphism', is_correct: false },
      { label: 'C', content: 'Composition applies only to interfaces', is_correct: false },
      { label: 'D', content: 'They are completely synonymous terms', is_correct: false }
    ]
  },
  {
    statement: 'Why is "Composition over Inheritance" widely advocated in modern software engineering?',
    explanation: 'Inheritance creates a tight, fragile coupling to base class implementation details (white-box reuse) and does not allow changing behaviors at runtime. Composition achieves loose coupling (black-box reuse), allows swapping behaviors dynamically at runtime, and avoids rigid deep class hierarchies.',
    category_slug: 'oop-concepts',
    topic: 'Composition over Inheritance',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Composition provides loose coupling, dynamic behavior swapping at runtime, and avoids rigid deep inheritance hierarchies', is_correct: true },
      { label: 'B', content: 'Inheritance consumes 10x more CPU cycles than composition', is_correct: false },
      { label: 'C', content: 'Composition eliminates the need for constructors', is_correct: false },
      { label: 'D', content: 'Inheritance is forbidden in object-oriented programming', is_correct: false }
    ]
  },
  {
    statement: 'What is the Strategy Design Pattern?',
    explanation: 'The Strategy Pattern defines a family of interchangeable algorithms, encapsulates each one in a separate class, and makes them interchangeable at runtime. The client holds a reference to a Strategy interface and delegates execution to it.',
    category_slug: 'oop-concepts',
    topic: 'Strategy Pattern',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Encapsulates interchangeable algorithms inside separate strategy classes, allowing algorithm switching at runtime', is_correct: true },
      { label: 'B', content: 'Ensures only one strategy object exists in memory', is_correct: false },
      { label: 'C', content: 'Saves and restores historical object snapshots', is_correct: false },
      { label: 'D', content: 'Builds complex hierarchical tree structures', is_correct: false }
    ]
  },
  {
    statement: 'What is the Single Responsibility Principle (SRP) in SOLID design?',
    explanation: 'The Single Responsibility Principle states that a class should have one, and only one, reason to change. In other words, a class should encapsulate a single, focused piece of functionality or responsibility.',
    category_slug: 'oop-concepts',
    topic: 'SOLID - Single Responsibility',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'A class should have only one reason to change, encapsulating a single focused responsibility', is_correct: true },
      { label: 'B', content: 'A class must contain only a single public method', is_correct: false },
      { label: 'C', content: 'Only one developer is allowed to edit a class file', is_correct: false },
      { label: 'D', content: 'Every class must inherit from a single interface', is_correct: false }
    ]
  },
  {
    statement: 'What is the Interface Segregation Principle (ISP) in SOLID design?',
    explanation: 'The Interface Segregation Principle states that no client should be forced to depend on methods it does not use. Large, bloated "fat" interfaces should be split into smaller, cohesive, role-specific interfaces.',
    category_slug: 'oop-concepts',
    topic: 'SOLID - Interface Segregation',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Clients should not be forced to depend on interfaces containing methods they do not use (prefer small, role-specific interfaces)', is_correct: true },
      { label: 'B', content: 'Interfaces must be separated into different disk directories', is_correct: false },
      { label: 'C', content: 'Classes cannot implement more than one interface', is_correct: false },
      { label: 'D', content: 'Interfaces must not contain any method declarations', is_correct: false }
    ]
  },
  {
    statement: 'What does High Cohesion and Loose Coupling mean in software architecture?',
    explanation: '- High Cohesion: elements within a module or class belong closely together, collaborating to fulfill a single, well-defined purpose.\n- Loose Coupling: modules or classes have minimal, well-defined dependencies on each other via interfaces, so changes in one module do not ripple into others.',
    category_slug: 'oop-concepts',
    topic: 'Cohesion and Coupling',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'High cohesion means a module focuses on a single task; loose coupling means minimal interdependence between distinct modules', is_correct: true },
      { label: 'B', content: 'High cohesion means all code is in one file; loose coupling means using pointers', is_correct: false },
      { label: 'C', content: 'Loose coupling means classes cannot call each other', is_correct: false },
      { label: 'D', content: 'High cohesion and loose coupling are mutually exclusive', is_correct: false }
    ]
  },
  {
    statement: 'What is a "Shallow Copy" versus a "Deep Copy" of an object?',
    explanation: '- Shallow Copy: duplicates the primitive values of an object, but copies reference pointers to nested objects, meaning both copies share the exact same referenced child objects.\n- Deep Copy: recursively duplicates the object AND creates brand new copies of all referenced nested objects, achieving complete independent duplication.',
    category_slug: 'oop-concepts',
    topic: 'Object Cloning and Copying',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Shallow copy copies reference pointers so nested objects are shared; deep copy recursively duplicates all nested objects independently', is_correct: true },
      { label: 'B', content: 'Shallow copy is allocated on heap; deep copy on stack', is_correct: false },
      { label: 'C', content: 'Deep copy can only be performed in C++', is_correct: false },
      { label: 'D', content: 'Shallow copy encrypts object data', is_correct: false }
    ]
  },
  {
    statement: 'What is the Factory Method Pattern and how does it decouple object creation?',
    explanation: 'The Factory Method Pattern defines an interface for creating an object, but lets subclasses decide which concrete class to instantiate. The client code depends only on an abstract product interface, decoupling it from concrete product creation logic.',
    category_slug: 'oop-concepts',
    topic: 'Design Patterns - Factory Method',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Defines an interface for creating objects, delegating instantiation decisions to subclasses and decoupling client code', is_correct: true },
      { label: 'B', content: 'A method that writes code to disk', is_correct: false },
      { label: 'C', content: 'A constructor that cannot accept arguments', is_correct: false },
      { label: 'D', content: 'A pattern that serializes objects to databases', is_correct: false }
    ]
  },
  {
    statement: 'What is the Command Pattern in behavioral design patterns?',
    explanation: 'The Command Pattern encapsulates a request as a standalone object containing all information about the request (the action, receiver, and parameters). This decoupling enables parameterizing clients with different requests, queuing requests, logging them, and supporting undoable operations.',
    category_slug: 'oop-concepts',
    topic: 'Design Patterns - Command',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Encapsulates a request as an object, allowing parameterization, queuing, logging, and undo/redo operations', is_correct: true },
      { label: 'B', content: 'Executes shell commands on the host operating system', is_correct: false },
      { label: 'C', content: 'Parses CLI command flags into an array', is_correct: false },
      { label: 'D', content: 'Synchronizes network packets between server and client', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between an Abstract Class and an Interface in modern object-oriented languages (like Java 8+)?',
    explanation: 'An Abstract Class can have state (instance variables with constructors), non-static methods with implementation, and supports single inheritance.\nAn Interface defines a contract of capabilities, cannot have instance state (only public static final constants), supports multiple inheritance of type, and in modern languages can have `default` or `static` utility methods.',
    category_slug: 'oop-concepts',
    topic: 'Abstract Class vs Interface',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Abstract classes can maintain instance state and constructors (single inheritance); interfaces define capability contracts without instance state (multiple inheritance)', is_correct: true },
      { label: 'B', content: 'Interfaces can have private instance fields; abstract classes cannot', is_correct: false },
      { label: 'C', content: 'Abstract classes can be instantiated directly with new; interfaces cannot', is_correct: false },
      { label: 'D', content: 'They are completely identical since Java 8', is_correct: false }
    ]
  },
  {
    statement: 'In the Template Method Pattern, what is the role of "Hooks"?',
    explanation: 'The Template Method defines the skeleton of an algorithm in a base class method. A Hook is a method with a default (often empty) implementation in the base class that subclasses can optionally override to inject custom behavior into the algorithm without altering the overall execution template.',
    category_slug: 'oop-concepts',
    topic: 'Design Patterns - Template Method',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Optional placeholder methods in the base template with default behavior that subclasses can override', is_correct: true },
      { label: 'B', content: 'Hardware interrupts handled by the operating system', is_correct: false },
      { label: 'C', content: 'Git pre-commit hooks that format code', is_correct: false },
      { label: 'D', content: 'Database triggers executed before an insert', is_correct: false }
    ]
  },
  {
    statement: 'What problem does the Builder Design Pattern solve?',
    explanation: 'The Builder Pattern separates the construction of a complex object from its representation, avoiding the "Telescoping Constructor" anti-pattern (where a constructor has 10+ overloaded variations with confusing parameter orders) and allowing step-by-step object construction.',
    category_slug: 'oop-concepts',
    topic: 'Design Patterns - Builder',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Avoids telescoping constructors by enabling step-by-step construction of complex objects with readable method chaining', is_correct: true },
      { label: 'B', content: 'Compiles source code into binary executables', is_correct: false },
      { label: 'C', content: 'Automatically builds HTML web forms from database schemas', is_correct: false },
      { label: 'D', content: 'Generates UML class diagrams from code comments', is_correct: false }
    ]
  },
  {
    statement: 'What is the Proxy Design Pattern and what are its common applications?',
    explanation: 'The Proxy Pattern provides a surrogate or placeholder object that controls access to the real object. Common variants include: Remote Proxy (network RPC), Virtual Proxy (lazy loading expensive objects like high-res images), and Protection Proxy (role-based access control / permissions).',
    category_slug: 'oop-concepts',
    topic: 'Design Patterns - Proxy',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Provides a surrogate object that controls access to the target object (used for lazy loading, access control, and remote RPC)', is_correct: true },
      { label: 'B', content: 'A network reverse proxy like NGINX implemented in pure CSS', is_correct: false },
      { label: 'C', content: 'An object that translates database SQL queries into NoSQL JSON', is_correct: false },
      { label: 'D', content: 'A pattern that creates multiple instances of singletons', is_correct: false }
    ]
  },
  {
    statement: 'What is the "Law of Demeter" (Principle of Least Knowledge) in object-oriented design?',
    explanation: 'The Law of Demeter states that a method of an object should only call methods of: 1) the object itself, 2) its parameters, 3) objects it instantiates, 4) its direct member components. It discourages chaining calls through different objects (avoiding "train wrecks" like `a.getB().getC().getD().doSomething()`), reducing coupling.',
    category_slug: 'oop-concepts',
    topic: 'Law of Demeter',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'A module should only talk to its immediate collaborators and avoid reaching through objects (avoid a.getB().getC().doAction())', is_correct: true },
      { label: 'B', content: 'Every class must inherit from at most one base class', is_correct: false },
      { label: 'C', content: 'Functions should have no more than 3 parameters', is_correct: false },
      { label: 'D', content: 'All database queries must be filtered by primary key', is_correct: false }
    ]
  },
  {
    statement: 'What is the State Design Pattern?',
    explanation: 'The State Pattern allows an object to alter its behavior when its internal state changes, appearing as if the object changed its class. It replaces monolithic switch/case statements across methods by encapsulating state-specific behavior into separate State subclasses.',
    category_slug: 'oop-concepts',
    topic: 'Design Patterns - State',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Encapsulates state-specific behaviors into distinct state classes, avoiding bloated conditional switch statements', is_correct: true },
      { label: 'B', content: 'Maintains application session cookies across HTTP requests', is_correct: false },
      { label: 'C', content: 'Stores Redux state inside browser LocalStorage', is_correct: false },
      { label: 'D', content: 'A pattern that forces variables to be immutable', is_correct: false }
    ]
  },
  {
    statement: 'What is an "Immutable Object" and how is it constructed in OOP?',
    explanation: 'An immutable object\'s internal state cannot be modified after it is constructed. It is constructed by: 1) declaring all fields `private` and `final`, 2) providing no setter methods, 3) ensuring class cannot be subclassed (declared `final`), 4) making defensive deep copies of mutable components passed into constructor or returned by getters.',
    category_slug: 'oop-concepts',
    topic: 'Immutability in OOP',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'An object whose state cannot change after construction (private final fields, no setters, class final, defensive copies)', is_correct: true },
      { label: 'B', content: 'An object that is stored exclusively in read-only ROM memory', is_correct: false },
      { label: 'C', content: 'An object that cannot be instantiated more than once', is_correct: false },
      { label: 'D', content: 'An object that cannot be garbage collected', is_correct: false }
    ]
  },
  {
    statement: 'What is the Composite Design Pattern used for?',
    explanation: 'The Composite Pattern composes objects into tree structures to represent part-whole hierarchies. It enables client code to treat individual primitive objects and composite tree branches uniformly through a common Component interface.',
    category_slug: 'oop-concepts',
    topic: 'Design Patterns - Composite',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Composes objects into tree part-whole hierarchies, allowing clients to treat individual objects and collections uniformly', is_correct: true },
      { label: 'B', content: 'Merges two separate databases into a single unified database', is_correct: false },
      { label: 'C', content: 'Combines multiple primary keys into a composite key in SQL', is_correct: false },
      { label: 'D', content: 'A pattern for multi-threaded thread pools', is_correct: false }
    ]
  }
];
