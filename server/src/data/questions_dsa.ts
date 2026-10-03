import { SeedQuestion } from './questions_aptitude';

export const DSA_QUESTIONS: SeedQuestion[] = [
  // ==========================================
  // ARRAYS & TWO POINTERS (10 QUESTIONS)
  // ==========================================
  {
    statement: 'Given an array of integers sorted in non-decreasing order and a target value, which approach achieves O(N) time and O(1) auxiliary space to find two numbers that sum up to the target?',
    explanation: 'Using the Two Pointer technique with left pointer at index 0 and right pointer at index N-1:\n- If sum == target, solution is found.\n- If sum < target, increment left pointer to increase sum.\n- If sum > target, decrement right pointer to decrease sum.\nThis checks each element at most once in O(N) time and uses O(1) space.',
    category_slug: 'dsa',
    topic: 'Two Pointers',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Two Pointers initialized at both ends of the sorted array', is_correct: true },
      { label: 'B', content: 'Nested loops checking all pairs (O(N^2))', is_correct: false },
      { label: 'C', content: 'Hash Map approach with O(N) auxiliary space', is_correct: false },
      { label: 'D', content: 'Binary search on every prefix sum', is_correct: false }
    ]
  },
  {
    statement: 'What is Kadane\'s algorithm used for and what is its optimal time complexity?',
    explanation: 'Kadane\'s algorithm is used to find the maximum sum contiguous sub-array in a 1D numeric array. It iterates through the array while maintaining the current subarray sum (`max_ending_here = max(arr[i], max_ending_here + arr[i])`) and overall maximum (`max_so_far = max(max_so_far, max_ending_here)`), running in optimal O(N) time and O(1) space.',
    category_slug: 'dsa',
    topic: 'Arrays and Kadane\'s Algorithm',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Maximum subarray sum in O(N) time and O(1) space', is_correct: true },
      { label: 'B', content: 'Finding the longest palindromic substring in O(N log N)', is_correct: false },
      { label: 'C', content: 'Finding the median of two sorted arrays in O(log(M+N))', is_correct: false },
      { label: 'D', content: 'Topological sort of directed graphs in O(V+E)', is_correct: false }
    ]
  },
  {
    statement: 'In the Dutch National Flag algorithm (Three-way partitioning for sorting an array of 0s, 1s, and 2s), how many pointers are used and what is the time complexity?',
    explanation: 'Dijkstra\'s Dutch National Flag algorithm maintains three pointers: `low`, `mid`, and `high`.\nElements < pivot (0s) are swapped with `low`, elements > pivot (2s) swapped with `high`, and 1s remain in middle. It processes the array in a single pass in O(N) time and O(1) auxiliary space.',
    category_slug: 'dsa',
    topic: 'Three-Way Partitioning',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '3 pointers (low, mid, high) in O(N) time and O(1) space', is_correct: true },
      { label: 'B', content: '2 pointers in O(N log N) time', is_correct: false },
      { label: 'C', content: '4 pointers in O(N^2) time', is_correct: false },
      { label: 'D', content: '1 pointer with recursive divide-and-conquer', is_correct: false }
    ]
  },
  {
    statement: 'Given an array of size N containing numbers from 1 to N with exactly one duplicate and one missing number, what is the best mathematical approach to find both in O(N) time and O(1) space?',
    explanation: 'Using sum and sum-of-squares formulas:\nSum(1..N) - Sum(arr) = M - D (where M is missing, D is duplicate).\nSumSq(1..N) - SumSq(arr) = M^2 - D^2 = (M - D)(M + D).\nDividing gives M + D, enabling linear system solution for M and D in O(N) time and O(1) space without modifying the array.',
    category_slug: 'dsa',
    topic: 'Arrays Math Tricks',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Using Sum and Sum of Squares difference equations', is_correct: true },
      { label: 'B', content: 'Sorting the array with QuickSort', is_correct: false },
      { label: 'C', content: 'Hash set with O(N) extra memory', is_correct: false },
      { label: 'D', content: 'Depth First Search traversal', is_correct: false }
    ]
  },
  {
    statement: 'What is the optimal time complexity of the "Trapping Rain Water" problem using the Two Pointer approach?',
    explanation: 'By maintaining `left_max` and `right_max` heights from both ends and moving the pointer with the smaller bounding wall inward, water trapped above each bar is computed in O(N) time with O(1) extra space.',
    category_slug: 'dsa',
    topic: 'Two Pointers Trapping Rainwater',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'O(N) time and O(1) space', is_correct: true },
      { label: 'B', content: 'O(N^2) time and O(1) space', is_correct: false },
      { label: 'C', content: 'O(N log N) time and O(N) space', is_correct: false },
      { label: 'D', content: 'O(2^N) exponential time', is_correct: false }
    ]
  },
  {
    statement: 'Which technique is optimal to find the longest substring without repeating characters?',
    explanation: 'The Sliding Window technique using two pointers (left and right) along with a hash set or frequency index array to track the last seen position of characters achieves O(N) time and O(min(N, alphabet_size)) space.',
    category_slug: 'dsa',
    topic: 'Sliding Window',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Sliding Window with a hash map of last seen indices', is_correct: true },
      { label: 'B', content: 'Brute force checking all substrings in O(N^3)', is_correct: false },
      { label: 'C', content: 'Binary search on string length in O(N^2 log N)', is_correct: false },
      { label: 'D', content: 'Floyd-Warshall algorithm', is_correct: false }
    ]
  },
  {
    statement: 'In the Boyer-Moore Majority Voting Algorithm, what is the minimum condition required for an element to be guaranteed as the majority element?',
    explanation: 'The Boyer-Moore voting algorithm finds an element that appears strictly more than N/2 times (majority) in an array in O(N) time and O(1) space. A second verification pass confirms the candidate element appears > N/2 times.',
    category_slug: 'dsa',
    topic: 'Boyer-Moore Voting',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'It must appear strictly more than N/2 times', is_correct: true },
      { label: 'B', content: 'It must appear more than N/3 times', is_correct: false },
      { label: 'C', content: 'The array must be sorted in ascending order', is_correct: false },
      { label: 'D', content: 'All array elements must be positive integers', is_correct: false }
    ]
  },
  {
    statement: 'What is the time complexity of rotating an array of size N to the right by K steps using the three-reversal method?',
    explanation: 'The 3-step reversal algorithm:\n1. Reverse entire array (0 to N-1).\n2. Reverse first K elements (0 to K-1).\n3. Reverse remaining N-K elements (K to N-1).\nEach element is visited twice, resulting in O(N) time complexity and O(1) auxiliary space.',
    category_slug: 'dsa',
    topic: 'Array Rotation',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'O(N) time and O(1) auxiliary space', is_correct: true },
      { label: 'B', content: 'O(N * K) time and O(1) space', is_correct: false },
      { label: 'C', content: 'O(N) time and O(N) space', is_correct: false },
      { label: 'D', content: 'O(N log N) time', is_correct: false }
    ]
  },
  {
    statement: 'How do you find the maximum product subarray in an integer array that contains negative numbers and zeros?',
    explanation: 'Because multiplying two negative numbers yields a positive product, at each index we must track both the current maximum product and the current minimum product: `cur_max = max(num, num * prev_max, num * prev_min)` and `cur_min = min(num, num * prev_max, num * prev_min)`. This runs in O(N) time and O(1) space.',
    category_slug: 'dsa',
    topic: 'Dynamic Programming Arrays',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Dynamic programming tracking both running maximum and running minimum at each position', is_correct: true },
      { label: 'B', content: 'Kadane algorithm without any modification', is_correct: false },
      { label: 'C', content: 'Two pointer approach from both ends', is_correct: false },
      { label: 'D', content: 'Sorting the array and taking first and last elements', is_correct: false }
    ]
  },
  {
    statement: 'Given an array of intervals [start, end], how do you efficiently merge all overlapping intervals?',
    explanation: '1. Sort intervals by start time: O(N log N).\n2. Iterate through sorted intervals; if current interval\'s start <= previous interval\'s end, merge them by updating end = max(prev.end, cur.end).\nTotal time = O(N log N) sorting + O(N) linear sweep.',
    category_slug: 'dsa',
    topic: 'Intervals',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Sort by start times in O(N log N), then merge in a single linear pass', is_correct: true },
      { label: 'B', content: 'Compare all pairs in O(N^2) without sorting', is_correct: false },
      { label: 'C', content: 'Binary search tree insertion in O(N^2)', is_correct: false },
      { label: 'D', content: 'Matrix exponentiation', is_correct: false }
    ]
  },

  // ==========================================
  // LINKED LISTS, STACKS & QUEUES (10 QUESTIONS)
  // ==========================================
  {
    statement: 'Which algorithm detects a cycle in a singly linked list in O(N) time and O(1) space?',
    explanation: 'Floyd\'s Cycle-Finding Algorithm (Tortoise and Hare) uses two pointers: slow moves 1 step, fast moves 2 steps. If a cycle exists, fast will eventually meet slow. If fast reaches NULL, there is no cycle. Time is O(N) and space is O(1).',
    category_slug: 'dsa',
    topic: 'Linked List Cycle Detection',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Floyd\'s Tortoise and Hare (Slow & Fast Pointers)', is_correct: true },
      { label: 'B', content: 'Dijkstra\'s Shortest Path Algorithm', is_correct: false },
      { label: 'C', content: 'Hash Table storing node references', is_correct: false },
      { label: 'D', content: 'Binary Search', is_correct: false }
    ]
  },
  {
    statement: 'How do you find the starting node of a cycle in a linked list after slow and fast pointers meet?',
    explanation: 'According to Floyd\'s theorem, after slow and fast meet, reset one pointer to the list head and keep the other at the meeting point. Advance both pointers one step at a time at equal speed; the node where they collide is the starting node of the cycle.',
    category_slug: 'dsa',
    topic: 'Cycle Detection Head',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Reset one pointer to head, keep other at collision point, advance both by 1 step until they meet', is_correct: true },
      { label: 'B', content: 'Advance fast by 3 steps and slow by 2 steps', is_correct: false },
      { label: 'C', content: 'Reverse the linked list and count nodes', is_correct: false },
      { label: 'D', content: 'Count the total nodes and divide by 2', is_correct: false }
    ]
  },
  {
    statement: 'What is the optimal data structure to solve the "Next Greater Element" problem for an array of size N in O(N) time?',
    explanation: 'A Monotonic Stack (decreasing stack). While traversing elements, we pop elements from the stack that are smaller than the current element and record the current element as their next greater element. Every element is pushed and popped at most once, yielding O(N) time.',
    category_slug: 'dsa',
    topic: 'Monotonic Stack',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Monotonic Stack', is_correct: true },
      { label: 'B', content: 'Max Heap', is_correct: false },
      { label: 'C', content: 'Binary Search Tree', is_correct: false },
      { label: 'D', content: 'Circular Queue', is_correct: false }
    ]
  },
  {
    statement: 'How can a Queue be implemented using two Stacks S1 and S2 with amortized O(1) operations?',
    explanation: '- `enqueue(x)`: push onto S1 (O(1)).\n- `dequeue()`: if S2 is empty, pop all elements from S1 and push to S2 (reversing order). Then pop from S2.\nEach element is pushed twice and popped twice across its lifecycle, giving amortized O(1) time per operation.',
    category_slug: 'dsa',
    topic: 'Stacks and Queues',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Push to S1 on enqueue; pop from S2 on dequeue, transferring from S1 to S2 only when S2 is empty', is_correct: true },
      { label: 'B', content: 'Transfer all elements back and forth on every single push and pop', is_correct: false },
      { label: 'C', content: 'Sort the stacks using recursion before every dequeue', is_correct: false },
      { label: 'D', content: 'Cannot be done in amortized O(1)', is_correct: false }
    ]
  },
  {
    statement: 'What is the time complexity of reversing a singly linked list iteratively?',
    explanation: 'Using three pointers (`prev = NULL`, `curr = head`, `next = NULL`), in a single pass we update `curr->next = prev`, advancing pointers until `curr` is NULL. This requires O(N) time and O(1) auxiliary space.',
    category_slug: 'dsa',
    topic: 'Linked List Reversal',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'O(N) time and O(1) space', is_correct: true },
      { label: 'B', content: 'O(N^2) time and O(1) space', is_correct: false },
      { label: 'C', content: 'O(N) time and O(N) space', is_correct: false },
      { label: 'D', content: 'O(log N) time', is_correct: false }
    ]
  },
  {
    statement: 'In an LRU (Least Recently Used) Cache implementation requiring O(1) `get()` and O(1) `put()` operations, which combination of data structures is used?',
    explanation: 'A Hash Map combined with a Doubly Linked List.\n- Hash Map stores `key -> node_pointer` for O(1) lookup.\n- Doubly Linked List maintains access order with O(1) node removal and O(1) insertion at head/tail.',
    category_slug: 'dsa',
    topic: 'LRU Cache Design',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Hash Map + Doubly Linked List', is_correct: true },
      { label: 'B', content: 'Binary Search Tree + Queue', is_correct: false },
      { label: 'C', content: 'Priority Queue (Heap) + Array', is_correct: false },
      { label: 'D', content: 'Singly Linked List + Stack', is_correct: false }
    ]
  },
  {
    statement: 'How do you find the middle node of a singly linked list in a single traversal pass?',
    explanation: 'Two pointers: slow moves 1 step and fast moves 2 steps. When fast reaches the end (`fast == NULL || fast->next == NULL`), slow points exactly to the middle node.',
    category_slug: 'dsa',
    topic: 'Slow and Fast Pointers',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Move slow pointer 1 step and fast pointer 2 steps simultaneously', is_correct: true },
      { label: 'B', content: 'Count nodes in first pass, then traverse half in second pass', is_correct: false },
      { label: 'C', content: 'Store node addresses in a circular buffer', is_correct: false },
      { label: 'D', content: 'Reverse the linked list halfway', is_correct: false }
    ]
  },
  {
    statement: 'In the "Largest Rectangle in Histogram" problem, which approach computes the area in O(N) time?',
    explanation: 'Using a Monotonic Increasing Stack of bar indices. When a smaller bar is encountered, we pop bars from the stack; each popped bar is treated as the smallest bar in a rectangle whose width extends between the current index and the stack\'s new top bar. This visits each bar at most twice, yielding O(N) time.',
    category_slug: 'dsa',
    topic: 'Monotonic Stack Histogram',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Monotonic increasing stack storing bar indices in O(N) time', is_correct: true },
      { label: 'B', content: 'Brute force expansion from each bar in O(N^2)', is_correct: false },
      { label: 'C', content: 'Divide and conquer in O(N^2) worst case', is_correct: false },
      { label: 'D', content: 'Topological sort in O(V + E)', is_correct: false }
    ]
  },
  {
    statement: 'What is the optimal approach to merge K sorted linked lists having a total of N nodes?',
    explanation: 'Using a Min-Heap (Priority Queue) of size K containing the current head node of each of the K lists. Extracting min and inserting its next node takes O(log K) per node, leading to optimal O(N log K) time and O(K) space.',
    category_slug: 'dsa',
    topic: 'Heaps and Merging',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Min-Heap of size K in O(N log K) time', is_correct: true },
      { label: 'B', content: 'Merge lists one by one in O(K * N) time', is_correct: false },
      { label: 'C', content: 'Collect all values in an array and sort in O(N log N) with O(N) extra memory', is_correct: false },
      { label: 'D', content: 'Linear search across K lists in O(K * N)', is_correct: false }
    ]
  },
  {
    statement: 'How is a circular queue implemented using an array of size N to differentiate between a full and an empty queue without an extra counter variable?',
    explanation: 'By sacrificing one array position: the queue is empty when `front == rear`. The queue is full when `(rear + 1) % N == front`. Thus an array of size N holds at most N - 1 elements.',
    category_slug: 'dsa',
    topic: 'Circular Queue',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Leaving one slot empty: full when (rear + 1) % N == front, empty when front == rear', is_correct: true },
      { label: 'B', content: 'Full when rear == front + 1, empty when rear == -1', is_correct: false },
      { label: 'C', content: 'Shifting all elements left on every dequeue', is_correct: false },
      { label: 'D', content: 'Setting rear pointer to NULL when full', is_correct: false }
    ]
  },

  // ==========================================
  // TREES & BINARY SEARCH TREES (10 QUESTIONS)
  // ==========================================
  {
    statement: 'What is the relationship between the in-order traversal of a valid Binary Search Tree (BST) and its elements?',
    explanation: 'In-order traversal visits nodes in the order Left -> Root -> Right. Because every node in the left subtree is strictly less than root, and every node in right subtree is greater, the in-order traversal always produces elements in strictly monotonically ascending (sorted) order.',
    category_slug: 'dsa',
    topic: 'BST Properties',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'In-order traversal always produces elements in sorted ascending order', is_correct: true },
      { label: 'B', content: 'In-order traversal produces elements in descending order', is_correct: false },
      { label: 'C', content: 'In-order traversal visits leaves before the root', is_correct: false },
      { label: 'D', content: 'In-order traversal is identical to level-order BFS', is_correct: false }
    ]
  },
  {
    statement: 'What is the maximum number of nodes in a binary tree of height H (where a single root node has height 1)?',
    explanation: 'At each level i (from 1 to H), the maximum number of nodes is 2^(i - 1).\nSum = 2^0 + 2^1 + 2^2 + ... + 2^(H - 1) = 2^H - 1 nodes.',
    category_slug: 'dsa',
    topic: 'Binary Tree Theory',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '2^H - 1', is_correct: true },
      { label: 'B', content: '2^(H - 1)', is_correct: false },
      { label: 'C', content: '2^H + 1', is_correct: false },
      { label: 'D', content: '2^(H + 1)', is_correct: false }
    ]
  },
  {
    statement: 'In an AVL tree, what is the valid range of balance factors for every node?',
    explanation: 'An AVL tree is a strictly self-balancing binary search tree where the balance factor of every node (defined as height(left_subtree) - height(right_subtree)) must strictly be within {-1, 0, +1}. If the balance factor deviates outside this range, tree rotations (LL, RR, LR, RL) rebalance the node.',
    category_slug: 'dsa',
    topic: 'AVL Trees Balance Factor',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '-1, 0, or +1', is_correct: true },
      { label: 'B', content: '-2 to +2', is_correct: false },
      { label: 'C', content: '0 only', is_correct: false },
      { label: 'D', content: 'Any non-negative integer', is_correct: false }
    ]
  },
  {
    statement: 'How do you find the Lowest Common Ancestor (LCA) of two nodes P and Q in a Binary Search Tree (BST) in O(H) time?',
    explanation: 'Start at root:\n- If both P and Q are smaller than root (`P.val < root.val && Q.val < root.val`), LCA lies in left subtree.\n- If both are greater than root, LCA lies in right subtree.\n- If P and Q split on opposite sides of root (or one matches root), the current root is the LCA.',
    category_slug: 'dsa',
    topic: 'BST Lowest Common Ancestor',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Walk down from root: the first node where P and Q split across different sides is the LCA', is_correct: true },
      { label: 'B', content: 'Run Dijkstra\'s algorithm between P and Q', is_correct: false },
      { label: 'C', content: 'In-order traversal storing nodes in a doubly linked list', is_correct: false },
      { label: 'D', content: 'Level order traversal checking leaves', is_correct: false }
    ]
  },
  {
    statement: 'What is Morris Traversal and what is its main advantage over standard recursive or iterative tree traversals?',
    explanation: 'Morris Traversal performs tree traversal in O(N) time and O(1) auxiliary space (no stack or recursion) by creating temporary "threaded" back-pointers from the in-order predecessor\'s right child to the current node and removing them after visiting.',
    category_slug: 'dsa',
    topic: 'Threaded Binary Trees and Morris Traversal',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Traverses binary trees in O(N) time using O(1) auxiliary space via temporary threaded pointers', is_correct: true },
      { label: 'B', content: 'Parallelizes traversal across multiple threads on a GPU', is_correct: false },
      { label: 'C', content: 'Sorts nodes using binary search', is_correct: false },
      { label: 'D', content: 'Performs tree compression into an array', is_correct: false }
    ]
  },
  {
    statement: 'How do you determine if a binary tree is symmetric (mirror reflection of itself)?',
    explanation: 'Recursively verify two subtrees T1 and T2: both must be NULL, or both non-NULL with `T1.val == T2.val`, and `isMirror(T1.left, T2.right)` AND `isMirror(T1.right, T2.left)`.',
    category_slug: 'dsa',
    topic: 'Binary Tree Symmetry',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Recursively verify T1.val == T2.val, T1.left mirrors T2.right, and T1.right mirrors T2.left', is_correct: true },
      { label: 'B', content: 'Check if in-order traversal is a palindrome', is_correct: false },
      { label: 'C', content: 'Verify number of nodes is an even number', is_correct: false },
      { label: 'D', content: 'Check if height is a power of 2', is_correct: false }
    ]
  },
  {
    statement: 'What is the diameter of a binary tree?',
    explanation: 'The diameter of a binary tree is the length of the longest path between any two nodes in the tree. This path may or may not pass through the root node. It is computed in O(N) time during post-order traversal by tracking `max(diameter, left_height + right_height)`.',
    category_slug: 'dsa',
    topic: 'Tree Diameter',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'The length of the longest path between any two nodes in the tree', is_correct: true },
      { label: 'B', content: 'The total number of leaf nodes in the tree', is_correct: false },
      { label: 'C', content: 'The depth of the root node', is_correct: false },
      { label: 'D', content: 'The maximum width of any level in BFS', is_correct: false }
    ]
  },
  {
    statement: 'Which pair of tree traversals is sufficient to reconstruct a unique binary tree?',
    explanation: 'A unique binary tree can be constructed if and only if one of the traversals is **In-order**, paired with either **Pre-order** or **Post-order** (because In-order identifies left vs right subtrees, while Pre/Post identifies root nodes).',
    category_slug: 'dsa',
    topic: 'Tree Reconstruction',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'In-order and Pre-order (or In-order and Post-order)', is_correct: true },
      { label: 'B', content: 'Pre-order and Post-order', is_correct: false },
      { label: 'C', content: 'Level-order and Pre-order without in-order', is_correct: false },
      { label: 'D', content: 'Pre-order and Depth-first order', is_correct: false }
    ]
  },
  {
    statement: 'In a Red-Black Tree, what is the maximum possible height of a tree containing N nodes?',
    explanation: 'By the Red-Black Tree invariants (no two consecutive red nodes, equal black-height along all root-to-leaf paths), the longest path is at most twice the shortest path. The maximum height is guaranteed to be at most 2 * log2(N + 1).',
    category_slug: 'dsa',
    topic: 'Red-Black Trees',
    difficulty: 'hard',
    options: [
      { label: 'A', content: '2 * log2(N + 1)', is_correct: true },
      { label: 'B', content: 'log2(N)', is_correct: false },
      { label: 'C', content: 'N / 2', is_correct: false },
      { label: 'D', content: 'N', is_correct: false }
    ]
  },
  {
    statement: 'What is the time complexity of deleting a node from a Binary Search Tree with N nodes in the worst case?',
    explanation: 'In a skewed BST (degenerated into a linked list), the height is O(N). Finding the node and its in-order predecessor/successor requires traversing down the skew, taking O(N) time in the worst case (compared to O(log N) in a balanced BST).',
    category_slug: 'dsa',
    topic: 'BST Deletion Complexity',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'O(N) for a skewed tree; O(log N) for a balanced tree', is_correct: true },
      { label: 'B', content: 'O(1) in all cases', is_correct: false },
      { label: 'C', content: 'O(N log N) strictly', is_correct: false },
      { label: 'D', content: 'O(N^2)', is_correct: false }
    ]
  },

  // ==========================================
  // GRAPHS, SORTING & SEARCHING (10 QUESTIONS)
  // ==========================================
  {
    statement: 'What is the time and space complexity of Breadth-First Search (BFS) on an adjacency-list graph with V vertices and E edges?',
    explanation: 'BFS visits every vertex once and explores each outgoing edge once via a FIFO queue, giving O(V + E) time complexity. The queue and visited set store at most V vertices, giving O(V) auxiliary space.',
    category_slug: 'dsa',
    topic: 'Graph BFS',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'O(V + E) time and O(V) space', is_correct: true },
      { label: 'B', content: 'O(V * E) time and O(E) space', is_correct: false },
      { label: 'C', content: 'O(V^2) time and O(1) space', is_correct: false },
      { label: 'D', content: 'O(E log V) time and O(V + E) space', is_correct: false }
    ]
  },
  {
    statement: 'Which algorithm finds Single-Source Shortest Paths in a directed graph with non-negative edge weights in O((V + E) log V) time?',
    explanation: 'Dijkstra\'s algorithm using a Min-Priority Queue (Fibonacci or Binary Min-Heap) processes vertices by greedy minimum distance in O((V + E) log V) time. Note: it fails with negative edge weights.',
    category_slug: 'dsa',
    topic: 'Dijkstra\'s Algorithm',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Dijkstra\'s Algorithm using a min-heap', is_correct: true },
      { label: 'B', content: 'Bellman-Ford Algorithm', is_correct: false },
      { label: 'C', content: 'Floyd-Warshall Algorithm', is_correct: false },
      { label: 'D', content: 'Kruskal\'s Algorithm', is_correct: false }
    ]
  },
  {
    statement: 'Which algorithm detects negative weight cycles in a directed weighted graph and what is its time complexity?',
    explanation: 'The Bellman-Ford algorithm relaxes all E edges V - 1 times in O(V * E) time. If any edge can still be relaxed in an additional V-th iteration, a negative weight cycle exists.',
    category_slug: 'dsa',
    topic: 'Bellman-Ford Algorithm',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Bellman-Ford Algorithm in O(V * E) time', is_correct: true },
      { label: 'B', content: 'Dijkstra\'s Algorithm in O((V+E) log V)', is_correct: false },
      { label: 'C', content: 'Prim\'s Algorithm in O(E log V)', is_correct: false },
      { label: 'D', content: 'Kahn\'s Algorithm in O(V + E)', is_correct: false }
    ]
  },
  {
    statement: 'What is Kahn\'s Algorithm used for and what data structure does it maintain?',
    explanation: 'Kahn\'s algorithm computes the Topological Ordering of a Directed Acyclic Graph (DAG) using a queue of vertices with in-degree 0. If the output ordering contains fewer than V vertices, the graph contains a cycle.',
    category_slug: 'dsa',
    topic: 'Topological Sort',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Topological sorting using in-degree array and a queue of zero in-degree vertices', is_correct: true },
      { label: 'B', content: 'Minimum spanning tree using a disjoint set union', is_correct: false },
      { label: 'C', content: 'Bipartite graph coloring using DFS', is_correct: false },
      { label: 'D', content: 'Maximum bipartite matching', is_correct: false }
    ]
  },
  {
    statement: 'How does Kruskal\'s Algorithm construct a Minimum Spanning Tree (MST) and what data structure optimizes it?',
    explanation: 'Kruskal\'s algorithm sorts all edges by weight in ascending order and greedily adds edges that do not form a cycle, using Disjoint Set Union (DSU / Union-Find) with path compression and union by rank in O(E log E) time.',
    category_slug: 'dsa',
    topic: 'Minimum Spanning Tree Kruskal',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Sorts edges and greedily adds non-cycle edges using Disjoint Set Union (DSU)', is_correct: true },
      { label: 'B', content: 'Grows a cut from a single root vertex using priority queue', is_correct: false },
      { label: 'C', content: 'Relaxes all edges V times', is_correct: false },
      { label: 'D', content: 'Dynamic programming matrix multiplication', is_correct: false }
    ]
  },
  {
    statement: 'What is a Disjoint Set Union (DSU) with Path Compression and Union by Rank complexity for M operations on N elements?',
    explanation: 'With both Path Compression and Union by Rank/Size, the amortized time complexity per operation is O(alpha(N)), where alpha is the Inverse Ackermann function. Since alpha(N) <= 4 for all practical values of N, it runs in nearly constant time O(1) amortized.',
    category_slug: 'dsa',
    topic: 'Disjoint Set Union Complexity',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'O(alpha(N)) amortized nearly O(1) per operation using Inverse Ackermann function', is_correct: true },
      { label: 'B', content: 'O(log N) strictly per operation', is_correct: false },
      { label: 'C', content: 'O(N) linear per operation', is_correct: false },
      { label: 'D', content: 'O(N log N) total', is_correct: false }
    ]
  },
  {
    statement: 'Why is QuickSort preferred over MergeSort for arrays, while MergeSort is preferred for Linked Lists?',
    explanation: 'For arrays, QuickSort operates in-place with O(1) extra space and exhibits superior CPU cache locality.\nFor linked lists, MergeSort does not require random access (which linked lists lack) and can merge nodes in O(1) extra space without copying elements.',
    category_slug: 'dsa',
    topic: 'Sorting Comparisons',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'QuickSort is in-place with excellent CPU cache locality for arrays; MergeSort handles sequential access in linked lists without extra space', is_correct: true },
      { label: 'B', content: 'QuickSort has O(log N) worst case time complexity', is_correct: false },
      { label: 'C', content: 'MergeSort cannot be implemented recursively', is_correct: false },
      { label: 'D', content: 'QuickSort is stable while MergeSort is unstable', is_correct: false }
    ]
  },
  {
    statement: 'What is the worst-case time complexity of QuickSelect to find the K-th smallest element, and how can it be made worst-case O(N)?',
    explanation: 'Standard QuickSelect with naive pivot has O(N) average time but degrades to O(N^2) worst-case. Using the Median of Medians algorithm to choose the pivot guarantees worst-case O(N) time complexity.',
    category_slug: 'dsa',
    topic: 'QuickSelect',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Standard is O(N^2) worst case; Median of Medians guarantees worst case O(N)', is_correct: true },
      { label: 'B', content: 'Standard is O(N log N); Heap guarantees O(N)', is_correct: false },
      { label: 'C', content: 'Standard is always O(1)', is_correct: false },
      { label: 'D', content: 'QuickSelect requires sorting the entire array first', is_correct: false }
    ]
  },
  {
    statement: 'What is the condition to apply Binary Search on an answer space (Binary Search on Answer)?',
    explanation: 'Binary Search on Answer requires a Monotonic Predicate function P(x): if P(x) is true, then P(y) is true for all y >= x (or vice-versa). This allows halving the search space at each iteration.',
    category_slug: 'dsa',
    topic: 'Binary Search on Answer',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'The validity function P(x) must be monotonic across the search domain', is_correct: true },
      { label: 'B', content: 'The input numbers must all be prime numbers', is_correct: false },
      { label: 'C', content: 'The answer must be an integer power of two', is_correct: false },
      { label: 'D', content: 'The search space must contain at most 1024 elements', is_correct: false }
    ]
  },
  {
    statement: 'What is the time complexity of building a Binary Heap of N elements from an unsorted array using Floyd\'s `buildHeap` algorithm?',
    explanation: 'Floyd\'s algorithm applies `siftDown` (heapify) starting from the last non-leaf node (index N/2) up to the root. Because nodes at lower levels require fewer shifts, the mathematical summation sum(h / 2^h) converges to O(N), rather than O(N log N).',
    category_slug: 'dsa',
    topic: 'Heap Construction Complexity',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'O(N) linear time', is_correct: true },
      { label: 'B', content: 'O(N log N) time', is_correct: false },
      { label: 'C', content: 'O(N^2) time', is_correct: false },
      { label: 'D', content: 'O(log N) time', is_correct: false }
    ]
  },

  // ==========================================
  // DYNAMIC PROGRAMMING (10 QUESTIONS)
  // ==========================================
  {
    statement: 'What two fundamental properties must a problem exhibit for Dynamic Programming to be applicable?',
    explanation: '1. Overlapping Subproblems: smaller subproblems are solved repeatedly.\n2. Optimal Substructure: the optimal solution to the overall problem can be constructed from optimal solutions to its subproblems.',
    category_slug: 'dsa',
    topic: 'Dynamic Programming Foundations',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Optimal Substructure and Overlapping Subproblems', is_correct: true },
      { label: 'B', content: 'Greedy Choice Property and Independence', is_correct: false },
      { label: 'C', content: 'Divide and conquer without overlapping states', is_correct: false },
      { label: 'D', content: 'Linear ordering and sorted keys', is_correct: false }
    ]
  },
  {
    statement: 'In the 0/1 Knapsack problem with N items and maximum weight capacity W, what is the time and space complexity of the standard 2D DP solution?',
    explanation: 'The state `dp[i][w]` represents maximum value using a subset of first `i` items with weight capacity `w`. There are N * W states, each taking O(1) transition, giving O(N * W) pseudo-polynomial time and O(N * W) space (which can be space-optimized to O(W) using 1D rolling array).',
    category_slug: 'dsa',
    topic: '0/1 Knapsack',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'O(N * W) time and O(N * W) space (optimizable to O(W) space)', is_correct: true },
      { label: 'B', content: 'O(2^N) time and O(N) space', is_correct: false },
      { label: 'C', content: 'O(N log W) time and O(1) space', is_correct: false },
      { label: 'D', content: 'O(N^2) time and O(W) space', is_correct: false }
    ]
  },
  {
    statement: 'What is the optimal time complexity to find the Longest Increasing Subsequence (LIS) of an array of size N?',
    explanation: 'While standard DP takes O(N^2), the Patience Sorting / Binary Search approach maintains an array `tails` where `tails[i]` stores the smallest tail of all increasing subsequences of length i+1. Using binary search (`std::lower_bound`), it solves LIS in O(N log N) time and O(N) space.',
    category_slug: 'dsa',
    topic: 'Longest Increasing Subsequence',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'O(N log N) using binary search / patience sorting', is_correct: true },
      { label: 'B', content: 'O(N) using sliding window', is_correct: false },
      { label: 'C', content: 'O(N^2) as the best possible lower bound', is_correct: false },
      { label: 'D', content: 'O(2^N) recursive', is_correct: false }
    ]
  },
  {
    statement: 'In the Edit Distance (Levenshtein Distance) problem between two strings of lengths M and N, what are the allowed operations and the DP recurrence relation?',
    explanation: 'Allowed operations: Insert, Delete, Replace.\nRecurrence: If chars match, `dp[i][j] = dp[i-1][j-1]`.\nIf chars differ: `dp[i][j] = 1 + min(dp[i-1][j] (delete), dp[i][j-1] (insert), dp[i-1][j-1] (replace))`.\nTime complexity is O(M * N).',
    category_slug: 'dsa',
    topic: 'Edit Distance',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '1 + min(insert, delete, replace) in O(M * N) time', is_correct: true },
      { label: 'B', content: 'Bit manipulation in O(M + N)', is_correct: false },
      { label: 'C', content: 'Longest common prefix subtraction in O(min(M, N))', is_correct: false },
      { label: 'D', content: 'Greedy match in O(max(M, N))', is_correct: false }
    ]
  },
  {
    statement: 'What is the difference between Top-Down with Memoization and Bottom-Up Tabulation in Dynamic Programming?',
    explanation: 'Top-Down with Memoization uses recursion starting from the original problem and caches results in a hash map/array to avoid recomputation, incurring call stack overhead.\nBottom-Up Tabulation iteratively fills a DP table starting from the base cases up to the target state, eliminating recursion stack overhead.',
    category_slug: 'dsa',
    topic: 'Memoization vs Tabulation',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Top-Down is recursive with caching; Bottom-Up is iterative starting from base cases', is_correct: true },
      { label: 'B', content: 'Top-Down is O(N); Bottom-Up is O(N^2)', is_correct: false },
      { label: 'C', content: 'Bottom-Up uses recursion while Top-Down uses loops', is_correct: false },
      { label: 'D', content: 'Top-Down requires exponential space', is_correct: false }
    ]
  },
  {
    statement: 'In the Matrix Chain Multiplication problem for N matrices, what is the time complexity of the dynamic programming solution?',
    explanation: 'For N matrices, computing optimal parenthesis involves checking subchains of lengths 2 to N with an inner loop testing split points k between i and j. Total states = O(N^2), each state takes O(N) loop, leading to O(N^3) time and O(N^2) space.',
    category_slug: 'dsa',
    topic: 'Matrix Chain Multiplication',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'O(N^3) time and O(N^2) space', is_correct: true },
      { label: 'B', content: 'O(N^2) time and O(N) space', is_correct: false },
      { label: 'C', content: 'O(N log N) time and O(N) space', is_correct: false },
      { label: 'D', content: 'O(2^N) time', is_correct: false }
    ]
  },
  {
    statement: 'What is the space-optimized solution for the "Climbing Stairs" (or Fibonacci) problem where you can climb 1 or 2 steps?',
    explanation: '`dp[i] = dp[i-1] + dp[i-2]`. Since each state only depends on the previous two states, we only need to keep two variables (`prev1`, `prev2`) instead of an entire array, achieving O(N) time and O(1) space.',
    category_slug: 'dsa',
    topic: 'DP State Space Optimization',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'O(N) time and O(1) auxiliary space using two variables', is_correct: true },
      { label: 'B', content: 'O(N) time and O(N) space using a hash table', is_correct: false },
      { label: 'C', content: 'O(2^N) brute force recursion', is_correct: false },
      { label: 'D', content: 'O(N^2) matrix table', is_correct: false }
    ]
  },
  {
    statement: 'In the Coin Change Problem (minimum coins to make change for amount V with coins of denominations C1..Ck), what is the time complexity?',
    explanation: 'Using state `dp[v]` = minimum coins to make amount `v`:\n`dp[v] = min(dp[v - coin] + 1)` for each coin in denominations.\nTotal states = V, each checking K coins, giving O(V * K) time and O(V) space.',
    category_slug: 'dsa',
    topic: 'Coin Change DP',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'O(V * K) time and O(V) space', is_correct: true },
      { label: 'B', content: 'O(2^K) exponential time', is_correct: false },
      { label: 'C', content: 'O(V^2) time and O(1) space', is_correct: false },
      { label: 'D', content: 'O(K log K) greedy time', is_correct: false }
    ]
  },
  {
    statement: 'Why does the Greedy algorithm fail for the general Coin Change Problem with denominations {1, 3, 4} for target amount 6?',
    explanation: 'Greedy picks largest coin first: 4 + 1 + 1 = 3 coins.\nOptimal DP picks: 3 + 3 = 2 coins.\nBecause denominations do not form a canonical coin system, greedy does not guarantee optimal substructure across choices.',
    category_slug: 'dsa',
    topic: 'Greedy vs DP Choice',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Greedy chooses {4, 1, 1} (3 coins), whereas the optimal choice is {3, 3} (2 coins)', is_correct: true },
      { label: 'B', content: 'Greedy algorithm crashes with a division by zero', is_correct: false },
      { label: 'C', content: 'Greedy produces no valid solution at all', is_correct: false },
      { label: 'D', content: 'DP cannot solve coin change problems with even target values', is_correct: false }
    ]
  },
  {
    statement: 'What is the time complexity of computing the Longest Common Subsequence (LCS) between two strings of lengths M and N?',
    explanation: 'State `dp[i][j]` represents LCS of prefixes `s1[0..i-1]` and `s2[0..j-1]`. If `s1[i-1] == s2[j-1]`, `dp[i][j] = 1 + dp[i-1][j-1]`; else `max(dp[i-1][j], dp[i][j-1])`. Filling the M * N matrix takes O(M * N) time and O(M * N) space (optimizable to O(min(M, N)) space).',
    category_slug: 'dsa',
    topic: 'Longest Common Subsequence',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'O(M * N) time and O(min(M, N)) space', is_correct: true },
      { label: 'B', content: 'O(M + N) time and O(1) space', is_correct: false },
      { label: 'C', content: 'O(2^(M+N)) time', is_correct: false },
      { label: 'D', content: 'O(M log N) time', is_correct: false }
    ]
  }
];
