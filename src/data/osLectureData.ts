import { LessonAnalysis, Hotspot } from '../types';

export const OS_WHITEBOARD_HOTSPOTS: Hotspot[] = [
  {
    id: 'thrashing-graph',
    title: 'Thrashing & CPU Utilization Curve',
    x: 10,
    y: 28,
    width: 25,
    height: 38,
    shortDesc: 'CPU Utilization initially rises with Degree of Multiprogramming, then plummets to near zero once thrashing begins.',
    color: '#ef4444',
  },
  {
    id: 'working-set-def',
    title: 'Working Set Model & Window (Δ)',
    x: 35,
    y: 12,
    width: 32,
    height: 32,
    shortDesc: 'Δ denotes the sliding window size in page references. WS(t) is the set of unique pages referenced in the last Δ accesses.',
    color: '#3b82f6',
  },
  {
    id: 'demand-formula',
    title: 'Total Demand Invariant: D = ∑ WSS_i',
    x: 67,
    y: 28,
    width: 22,
    height: 25,
    shortDesc: 'If total frame demand D exceeds available physical memory frames m (D > m), thrashing occurs. The OS must suspend a process.',
    color: '#eab308',
  },
  {
    id: 'pff-graph',
    title: 'Page Fault Frequency (PFF) Strategy',
    x: 58,
    y: 48,
    width: 28,
    height: 38,
    shortDesc: 'Monitors each process\'s page fault rate against Upper and Lower bounds to dynamically adjust allocated frames.',
    color: '#10b981',
  },
  {
    id: 'algorithms-preview',
    title: 'Optimal & LRU Page Replacement',
    x: 88,
    y: 15,
    width: 11,
    height: 60,
    shortDesc: 'Theoretical Belady Optimal vs practical Least Recently Used (LRU) frame allocation stacks on the right chalkboard.',
    color: '#a855f7',
  },
];

export const OS_LECTURE_DATA: LessonAnalysis = {
  title: 'Operating Systems: Virtual Memory, Thrashing & Working Set Model',
  topicCategory: 'Operating Systems / Memory Management',
  conceptualSummary: `### What Is Thrashing?
In modern virtual memory systems, the operating system employs **Multiprogramming** to maximize CPU utilization. By keeping several processes in memory concurrently, the CPU can immediately switch to another process whenever one waits for I/O.

However, each process requires a certain working set of pages (its active *locality*) to execute instructions without interruption. As the OS increases the **Degree of Multiprogramming (DoM)**, physical memory becomes divided among too many processes. 

When a process is allocated fewer frames than its current locality demands:
1. It immediately triggers a **Page Fault**.
2. The page fault handler queues a disk read operation to swap in the requested page.
3. The CPU scheduler switches to another process—which also soon page-faults!
4. Soon, every process is waiting in the disk I/O paging device queue.
5. The CPU sits completely idle while disk activity is 100%. The OS scheduler notices low CPU utilization, mistakenly infers that the system is underutilized, and launches *even more* processes!

This catastrophic positive feedback loop is called **Thrashing**. CPU utilization plunges off a steep cliff to near zero.

---

### The Two Core Solutions on the Chalkboard

#### 1. The Working Set Model (Peter Denning, 1968)
The Working Set Model prevents thrashing before it happens by tracking the **Principle of Locality**. A program does not access its entire address space uniformly; at any phase $t$, it focuses on a small cluster of pages called its **locality**.
- The OS defines a parameter $\\Delta$ (**Working Set Window**), representing a fixed number of recent page references.
- At time $t$, the **Working Set** $WS(t)$ is the set of all distinct pages referenced in the last $\\Delta$ references.
- The **Working Set Size** $WSS_i = |WS_i(t)|$ is the number of frames process $i$ requires.
- The **Total Demand** $D = \\sum_{i} WSS_i$ must not exceed total physical frames $m$. If $D > m$, the OS suspends (swaps out) one process entirely so remaining processes have full working sets and run smoothly.

#### 2. Page Fault Frequency (PFF) Strategy
While the Working Set Model estimates demand by tracking reference strings, PFF directly observes actual hardware page faults per unit time:
- The OS sets an **Upper Bound** and a **Lower Bound** on the page fault rate.
- **Fault Rate > Upper Bound**: The process is starving for memory $\\implies$ allocate more frames to this process (or suspend a process if RAM is full).
- **Fault Rate < Lower Bound**: The process has excess frames that it doesn't need $\\implies$ strip/reclaim frames to give to others or save power.`,

  keyTakeaways: [
    'Thrashing occurs when total memory demand exceeds physical RAM (D > m), causing processes to spend more time paging than executing.',
    'CPU Utilization peaks at an optimal Degree of Multiprogramming and then collapses to near zero if thrashing begins.',
    'The Working Set Model defines WS(t) as the unique pages touched in the last Δ references; D = ∑ WSS_i must be ≤ m.',
    'PFF sets Upper and Lower bounds on page fault rate to dynamically add or reclaim frames per process.',
    'Choosing the window Δ is crucial: if Δ is too small it misses locality; if Δ → ∞ it encompasses the entire program footprint.',
  ],

  stepByStepBreakdown: [
    {
      title: '1. CPU Utilization vs. Degree of Multiprogramming',
      formulaOrCode: 'U_{CPU} = f(\\text{Degree of Multiprogramming})',
      explanation: `The curve on the left chalkboard depicts CPU Utilization on the vertical axis versus Degree of Multiprogramming (DoM, number of concurrent active processes) on the horizontal axis:
- **Phase 1 (Rising slope):** As DoM increases, more processes are ready in RAM. When one process waits for disk or network I/O, the CPU immediately context-switches to another ready process. CPU utilization rises steadily.
- **Phase 2 (The Peak):** The system reaches peak utilization where physical RAM is optimally packed with process working sets.
- **Phase 3 (Thrashing Cliff):** When DoM exceeds RAM capacity, processes lose their minimum page frames. The system spends almost 100% of time handling page faults on the swap disk. CPU utilization collapses precipitously toward 0%.`,
      ambiguitiesOrErrors: `Chalkboard Note: The instructor wrote "Δ ≠ ∞" or "Δ → ∞" next to the DoM curve. While related to virtual memory, the parameter Δ strictly belongs to the Working Set Model on the right. This is a common classroom board shorthand where the instructor transitions from explaining thrashing to the parameter tuning of the solution.`,
      practicalTip: 'In production systems (Linux/BSD), thrashing is detected via Memory Pressure Stall Information (PSI) or OOM (Out of Memory) heuristics.',
    },
    {
      title: '2. Working Set Window (Δ) & Set Evaluation',
      formulaOrCode: 'WS(t_k) = \\{ p \\in \\text{Pages} \\mid p \\text{ was referenced in time } [t_k - \\Delta + 1, t_k] \\}',
      explanation: `The instructor writes two page reference strings at time instances $t_1$ and $t_2$:
- **Instance 1 at $t_1$:** Reference stream: \`2 6 1 5 7 7 7 7 5 1\`
  - Written set on board: $WS(t_1) = \\{1, 2, 5, 6, 7\\}$
  - The working set size is $WSS(t_1) = |WS(t_1)| = 5$.
- **Instance 2 at $t_2$:** Reference stream: \`3 4 4 4 3 4 3 4 4 4\`
  - Written set on board: $WS(t_2) = \\{3, 4\\}$
  - The working set size is $WSS(t_2) = |WS(t_2)| = 2$.
  - Notice how tight locality in instance 2 dramatically shrinks memory demand from 5 frames down to 2 frames!`,
      ambiguitiesOrErrors: `CRITICAL TRANSCRIPTION / DRAWING AMBIGUITY ON CHALKBOARD:
Look closely at the chalk bracket over the first reference string:
The bracket is drawn over only the tail: \`5 7 7 7 7 5 1\` (or \`1 5 7 7 7 7 5 1\`). If the window Δ were only 6 or 7 elements long, the set would ONLY contain {1, 5, 7}!
For $WS(t_1)$ to contain {1, 2, 5, 6, 7}, the window Δ MUST be at least 10 references long (encompassing the 2 and 6 at the beginning).
The instructor drew the curly bracket too short or assumed Δ = 10 without drawing the bracket across all 10 digits!`,
      practicalTip: 'Always verify whether Δ is counted in virtual CPU instruction cycles or discrete memory page reference events.',
    },
    {
      title: '3. Total Demand Formula & Thrashing Invariant',
      formulaOrCode: 'D = \\sum_{i=1}^{n} WSS_i, \\quad \\text{where } WSS_i = |WS_i(t)|',
      explanation: `This formula calculates total system-wide memory frame demand:
- $WSS_i$: Working Set Size of process $i$ (number of distinct pages it needs right now).
- $D$: Total demand for frames across all $n$ active processes.
- $m$: Total number of available physical page frames in the machine's RAM.

**The Operating System Scheduling Decision:**
- **Case $D \\le m$:** The system is in a healthy state. Each process has enough physical frames to hold its entire working set. Page faults will only occur on cold start or phase transitions. The OS can even safely admit another process if $m - D \\ge WSS_{new}$.
- **Case $D > m$:** Demand exceeds supply. Thrashing is guaranteed to happen if all processes continue running concurrently.
- **The OS Action:** The OS mid-term scheduler must select a victim process and **suspend** it (roll its pages out to swap disk). This frees up frames and reduces $D$ until $D \\le m$. When more frames become free later, the suspended process is resumed.`,
      ambiguitiesOrErrors: `Transcription note: The chalkboard notes "D = ∑ WSS_i", "Sum of working set size of all process", and lists "D > m" and "D < m". In rigorous formal texts, it is written as D ≤ m for the safe state (equality is fine).`,
    },
    {
      title: '4. Page Fault Frequency (PFF) Strategy & Dual Thresholds',
      formulaOrCode: '\\text{Page Fault Rate } (PFR) = \\frac{\\text{Page Faults}}{\\Delta t}',
      explanation: `The bottom right graph displays Page Fault Frequency against frame allocation:
- **Vertical Axis:** Page Fault Rate (frequency of faults).
- **Horizontal Axis:** Number of frames allocated to the process ("more no. of frames").
- As a process receives more frames, its page fault rate drops asymptotically along the curve.

**Two Control Thresholds:**
1. **Upper Bound Threshold:**
   If $PFR > \\text{Upper Bound}$, the process is page-faulting too frequently. Its allocated frames do not cover its current locality.
   $\\implies$ The OS **allocates more frames** to this process. If no free frames exist in the system, the OS suspends another process.
2. **Lower Bound Threshold:**
   If $PFR < \\text{Lower Bound}$, the process is faulting very rarely, meaning it has more frames than it strictly needs.
   $\\implies$ The OS **deallocates / reclaims excess frames** from this process, freeing them for other processes or system caches.`,
      ambiguitiesOrErrors: `Chalkboard labeling omission: The vertical axis is not explicitly labeled with units; the instructor simply wrote "PFF" near the axis. The curve shows an inverse relationship between page fault rate and allocated frames.`,
    },
    {
      title: '5. Side Panels: Optimal & LRU Page Replacement',
      formulaOrCode: '\\text{OPT (Belady\'s)}: \\text{Replace page not needed for longest time in future} \\\\ \\text{LRU}: \\text{Replace page not used for longest time in past}',
      explanation: `On the far right chalkboard, partial columns for "optimal: 7, 0, 1, 2..." and "LRU: 7, 0, 1..." with 3-frame box stacks are visible.
- These are standard page replacement algorithms used *within* an allocated frame quota (local replacement) or globally.
- Belady's Optimal requires clairvoyant future knowledge (unachievable in general OS, used as a theoretical benchmark).
- LRU approximates optimal by exploiting temporal locality: pages used recently will likely be used again soon.`,
      ambiguitiesOrErrors: `The right board is partially cut off by the camera frame, but clearly connects local page replacement algorithms to the global thrashing problem.`,
    },
  ],

  practiceQuestions: [
    {
      id: 1,
      question: `A computer has m = 12 physical page frames available for user processes. The OS runs a Working Set algorithm with window size Δ = 6 page references. At time t, three processes have the following recent reference strings (oldest to newest, ending at t):

• Process 1: [4, 2, 4, 1, 2, 3]
• Process 2: [7, 8, 7, 7, 8, 7]
• Process 3: [1, 5, 6, 1, 6, 5]

Will the system experience thrashing under the Working Set Model?`,
      options: [
        'A) Yes, because total demand D = 14 frames, which exceeds m = 12.',
        'B) No, because total demand D = 9 frames, which is ≤ 12 frames, leaving 3 spare frames.',
        'C) Yes, because Process 1 alone requires 6 frames, causing starvation for Process 2 and 3.',
        'D) No, because Process 2 only needs 1 frame and Process 3 needs 2 frames.',
      ],
      correctIndex: 1,
      explanation: `Let's calculate the Working Set WS(t) and Working Set Size WSS = |WS(t)| for each process over the window of Δ = 6 references:

1. Process 1 references: {4, 2, 4, 1, 2, 3}
   Unique pages = {1, 2, 3, 4} → WSS₁ = 4 frames.

2. Process 2 references: {7, 8, 7, 7, 8, 7}
   Unique pages = {7, 8} → WSS₂ = 2 frames.

3. Process 3 references: {1, 5, 6, 1, 6, 5}
   Unique pages = {1, 5, 6} → WSS₃ = 3 frames.

Total frame demand:
D = ∑ WSSᵢ = 4 + 2 + 3 = 9 frames.

Since the total available physical frames m = 12, and D = 9 ≤ 12:
Total demand is strictly satisfied with 3 spare frames available. Therefore, the system will NOT experience thrashing!`,
    },
    {
      id: 2,
      question: `An operating system uses the Page Fault Frequency (PFF) memory allocation policy. Process P is currently exhibiting a page fault rate that exceeds the designated Upper Bound threshold. However, all physical memory frames in RAM are currently occupied (D = m). What action should the OS scheduler take?`,
      options: [
        'A) Immediately abort Process P and dump core to prevent kernel crash.',
        'B) Suspend (swap out) a victim process entirely, freeing its frames to satisfy Process P\'s locality needs.',
        'C) Increase the Degree of Multiprogramming to distribute page faults across additional CPU cores.',
        'D) Force Process P to reduce its Working Set Window Δ so that it requires fewer pages.',
      ],
      correctIndex: 1,
      explanation: `When a process's page fault rate exceeds the Upper Bound, it indicates that the process is thrashing or experiencing severe page starvation because its current allocated frames do not cover its active locality.

If no free frames exist in the global pool (RAM is full), the OS CANNOT allocate new frames without exceeding capacity.
- Increasing the Degree of Multiprogramming (option C) would worsen the crisis catastrophically.
- Reducing Δ or ignoring the demand (option D) does not solve the physical frame shortage.
- Aborting the process (option A) is unnecessarily destructive.

The correct canonical OS strategy is **Process Suspension**: The OS suspends a selected victim process (often lowest priority or longest waiting), writes its pages to swap space, and transfers its freed physical frames to Process P. This decreases the Degree of Multiprogramming, satisfies Process P's working set, drops its page fault rate below the Upper Bound, and prevents system-wide thrashing!`,
    },
  ],
};
