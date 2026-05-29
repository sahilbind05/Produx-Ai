// ─── Smart AI Task Generator ──────────────────────────────────────────────
// Generates SPECIFIC topic-based tasks by:
//   1. Groq API (free) — if VITE_GROQ_API_KEY is set
//   2. Gemini API (free) — if VITE_GEMINI_API_KEY is set
//   3. Smart local engine — works with ZERO API keys, uses topic roadmaps

import { format, addDays } from "date-fns";

const GROQ_URL   = "/groq/openai/v1/chat/completions";
const GEMINI_URL = "/gemini/v1beta/models/gemini-1.5-flash:generateContent";

// ══════════════════════════════════════════════════════════════════════════
// TOPIC ROADMAPS — built-in knowledge base, no API needed
// ══════════════════════════════════════════════════════════════════════════
const ROADMAPS = {

  dsa: {
    keywords: ["dsa","data structure","algorithm","leetcode","competitive","coding interview"],
    topics: [
      { name: "Arrays & Strings",      tasks: ["Two pointers technique on sorted arrays","Sliding window — max sum subarray of size K","Prefix sum array — range query problems","Kadane's algorithm for maximum subarray"] },
      { name: "Linked Lists",          tasks: ["Implement singly linked list from scratch","Reverse a linked list — iterative & recursive","Detect cycle using Floyd's algorithm","Merge two sorted linked lists"] },
      { name: "Stacks & Queues",       tasks: ["Stack using arrays — push, pop, peek","Implement queue using two stacks","Monotonic stack — next greater element","Implement LRU cache with doubly linked list"] },
      { name: "Trees",                 tasks: ["Binary tree traversals — inorder, preorder, postorder","Level order traversal using BFS queue","Find height and diameter of binary tree","Lowest common ancestor (LCA) problem"] },
      { name: "Heaps & Priority Queue",tasks: ["Build min-heap and max-heap from scratch","Heap sort implementation","Find top K frequent elements","Merge K sorted arrays using min-heap"] },
      { name: "Graphs",                tasks: ["BFS traversal — shortest path in unweighted graph","DFS traversal — detect cycle in undirected graph","Topological sort — Kahn's algorithm","Dijkstra's shortest path algorithm"] },
      { name: "Dynamic Programming",   tasks: ["Fibonacci — memoization vs tabulation","0/1 Knapsack problem with DP table","Longest Common Subsequence (LCS)","Coin change problem — minimum coins"] },
      { name: "Sorting & Searching",   tasks: ["Merge sort — implementation and time complexity","Quick sort with pivot selection strategies","Binary search — find target in rotated sorted array","Count inversions using merge sort"] },
      { name: "Backtracking",          tasks: ["Generate all permutations of a string","N-Queens problem — place queens on NxN board","Sudoku solver using backtracking","Rat in a maze — find all paths"] },
    ],
  },

  python: {
    keywords: ["python","django","flask","fastapi","pandas","numpy","scipy","automation"],
    topics: [
      { name: "Python Basics",         tasks: ["Variables, data types — int, float, str, bool","Conditional statements and loops (for, while)","Functions — parameters, return values, default args","Lists, tuples, sets, and dictionaries"] },
      { name: "String & List Methods", tasks: ["String slicing, formatting and f-strings","List methods — append, pop, sort, reverse","Dictionary methods — keys, values, items, get","Set operations — union, intersection, difference"] },
      { name: "OOP in Python",         tasks: ["Create a class with __init__ and methods","Inheritance — extend base class behavior","Magic methods — __str__, __repr__, __len__","Decorators — @property, @staticmethod, @classmethod"] },
      { name: "File & Error Handling", tasks: ["Read and write text files with open()","Parse JSON files with json module","Handle exceptions — try, except, finally","Custom exception classes"] },
      { name: "Advanced Python",       tasks: ["List comprehensions and generator expressions","Lambda, map, filter, reduce","Context managers using 'with' statement","Regular expressions with re module"] },
      { name: "Libraries",             tasks: ["NumPy arrays — creation, indexing, math ops","Pandas DataFrame — read CSV, filter, groupby","Matplotlib — line chart, bar chart, scatter plot","Requests library — GET and POST API calls"] },
      { name: "Project",               tasks: ["Build a CLI task manager app","Web scraping with BeautifulSoup","REST API with FastAPI and Pydantic","Data analysis and visualization on a real dataset"] },
    ],
  },

  webdev: {
    keywords: ["web","html","css","javascript","react","vue","angular","node","frontend","backend","next","typescript"],
    topics: [
      { name: "HTML Fundamentals",     tasks: ["Semantic tags — header, main, section, footer","Forms — input types, labels, validation","Tables, lists, and multimedia elements","HTML5 APIs — canvas, local storage, geolocation"] },
      { name: "CSS Styling",           tasks: ["Box model — margin, border, padding, content","Flexbox — align items, justify content, flex-wrap","CSS Grid — grid-template-columns, grid-areas","Media queries for mobile-first responsive design"] },
      { name: "JavaScript Core",       tasks: ["Variables (var/let/const), functions, scope","Arrays — map, filter, reduce, find, some","DOM manipulation — querySelector, addEventListener","Fetch API — GET request and parse JSON response"] },
      { name: "JavaScript Advanced",   tasks: ["Promises — resolve, reject, .then(), .catch()","async/await with try-catch error handling","ES6+ — destructuring, spread, rest, optional chaining","Modules — import/export, named and default exports"] },
      { name: "React",                 tasks: ["Create React app, JSX syntax, component structure","useState hook — state management with events","useEffect hook — side effects and data fetching","Props — parent to child, callback for child to parent"] },
      { name: "React Advanced",        tasks: ["React Router — BrowserRouter, Routes, Link","Context API — createContext, Provider, useContext","Custom hooks — extract and reuse stateful logic","Optimize with useMemo, useCallback, React.memo"] },
      { name: "Backend",               tasks: ["Node.js basics — modules, fs, path, http","Express.js — routes, middleware, error handling","REST API — GET, POST, PUT, DELETE endpoints","Connect to MongoDB using Mongoose ODM"] },
    ],
  },

  java: {
    keywords: ["java","spring","spring boot","maven","gradle","jvm","android"],
    topics: [
      { name: "Java Basics",           tasks: ["Data types, operators, control flow (if/for/while)","Methods — parameters, return types, method overloading","Arrays and ArrayList — declaration, traversal","String methods — length, substring, contains, split"] },
      { name: "OOP Concepts",          tasks: ["Classes and objects — constructors, fields, methods","Inheritance — extends keyword, super(), method overriding","Abstract classes vs interfaces — when to use each","Encapsulation — private fields, public getters/setters"] },
      { name: "Collections",           tasks: ["ArrayList vs LinkedList — use cases and performance","HashMap — put, get, containsKey, entrySet iteration","HashSet — add, remove, contains, no duplicates","Iterator pattern and enhanced for-each loop"] },
      { name: "Exception Handling",    tasks: ["try-catch-finally block structure","Checked vs unchecked exceptions","Create custom exception classes","Multi-catch and try-with-resources"] },
      { name: "Java 8+ Features",      tasks: ["Lambda expressions — functional interfaces","Stream API — filter, map, collect, reduce","Optional class — avoid NullPointerException","Method references — static and instance"] },
    ],
  },

  ml: {
    keywords: ["machine learning","ml","deep learning","neural network","nlp","computer vision","data science","ai"],
    topics: [
      { name: "ML Fundamentals",       tasks: ["Supervised vs unsupervised vs reinforcement learning","Train/test split — 80/20 rule, stratified split","Bias-variance tradeoff — overfitting vs underfitting","Feature scaling — min-max normalization, standardization"] },
      { name: "Regression",            tasks: ["Linear regression — cost function and gradient descent","Polynomial regression — when linear is not enough","Ridge (L2) and Lasso (L1) regularization","Evaluate regression — MSE, RMSE, MAE, R²"] },
      { name: "Classification",        tasks: ["Logistic regression — sigmoid function, decision boundary","Decision tree — Gini impurity, information gain","Random forest — bagging, feature importance","Evaluate — confusion matrix, precision, recall, F1, ROC-AUC"] },
      { name: "Neural Networks",       tasks: ["Perceptron — weights, bias, activation functions","Build feedforward neural network with Keras","Backpropagation — chain rule, weight updates","Optimizer — SGD vs Adam, learning rate tuning"] },
      { name: "Deep Learning",         tasks: ["Convolutional Neural Network — conv, pool, flatten","Train image classifier on CIFAR-10 dataset","Transfer learning — fine-tune VGG16 / ResNet","Dropout, batch normalization, early stopping"] },
      { name: "Project",               tasks: ["House price prediction with linear regression","Sentiment analysis using Logistic Regression","Image classifier with CNN from scratch","Deploy ML model as a REST API with FastAPI"] },
    ],
  },

  fitness: {
    keywords: ["fitness","gym","workout","exercise","weight loss","muscle","strength","running","yoga","calisthenics"],
    topics: [
      { name: "Foundation",            tasks: ["Learn proper squat form — bodyweight 3x15","Push-up variations — standard, wide, diamond 3x12","Core workout — plank 3x45s, dead bug, bird-dog","Measure and record: weight, chest, waist, hips"] },
      { name: "Strength Training",     tasks: ["Barbell squat — 4 sets, progressive overload log","Bench press — 4x8 with 2-3 min rest","Deadlift — Romanian deadlift for hamstrings","Pull-ups or lat pulldown — 4x8 with band assist"] },
      { name: "Cardio & Conditioning", tasks: ["30-minute steady-state run at Zone 2 HR","HIIT — 8 rounds of 30s sprint / 30s walk","Jump rope — 10 min continuous session","Active recovery — 20 min brisk walk + stretching"] },
      { name: "Nutrition & Recovery",  tasks: ["Calculate TDEE and set calorie target","Track macros — protein 1.6-2.2g per kg bodyweight","Meal prep Sunday — 4 high-protein lunches","Sleep protocol — 7-9 hrs, no screen 1 hr before bed"] },
      { name: "Progressive Overload",  tasks: ["Increase bench press by 2.5kg this week","Add 1 rep to each compound lift","Deload week — reduce volume by 40%, keep intensity","Monthly assessment — photos + lifts + measurements"] },
    ],
  },

  language: {
    keywords: ["english","hindi","french","spanish","german","japanese","korean","ielts","toefl","language","speak","fluent","vocabulary","grammar"],
    topics: [
      { name: "Vocabulary",            tasks: ["Learn 20 new words using Anki — spaced repetition","Study word families — root, prefix, suffix patterns","Practice 10 idioms and phrasal verbs in sentences","Vocabulary in context — read a news article, note unknowns"] },
      { name: "Grammar",               tasks: ["Present perfect vs simple past — rules and practice","Conditionals — zero, first, second, third if-clauses","Passive voice — transform 10 active sentences","Articles (a/an/the) — rules and exception practice"] },
      { name: "Speaking & Listening",  tasks: ["Record yourself for 5 minutes — listen and note errors","Shadowing technique — repeat native speaker line by line","Watch a 10-min YouTube video, summarize in target language","Conversation practice with language exchange partner (iTalki)"] },
      { name: "Reading & Writing",     tasks: ["Read 2 news articles and summarize key points","Write a 200-word diary entry in target language","Practice formal email writing with set phrases","Read a short story — note grammar structures and new words"] },
    ],
  },

  finance: {
    keywords: ["finance","invest","stock","crypto","budget","money","saving","trading","mutual fund","sip","retirement"],
    topics: [
      { name: "Personal Finance",      tasks: ["Calculate net worth — list assets and liabilities","Create monthly budget using 50/30/20 rule","Audit subscriptions — cancel unused services","Build emergency fund plan — 3-6 months of expenses"] },
      { name: "Investing Basics",      tasks: ["Understand stocks, bonds, mutual funds, ETFs","Learn index fund investing — Nifty 50, S&P 500","Open a demat and trading account (Zerodha / Groww)","Simulate paper trading for 7 days without real money"] },
      { name: "Advanced Investing",    tasks: ["Study fundamental analysis — P/E, EPS, ROE ratios","Technical analysis basics — candlestick patterns, support/resistance","Understand SIP — compound interest calculator exercise","Tax-saving investments — ELSS, PPF, NPS, 80C deductions"] },
    ],
  },

  database: {
    keywords: ["sql","database","mysql","postgresql","mongodb","nosql","dbms"],
    topics: [
      { name: "SQL Basics",            tasks: ["CREATE TABLE with data types and constraints","INSERT, SELECT with WHERE, ORDER BY, LIMIT","UPDATE and DELETE — safe practices with WHERE clause","Aggregate functions — COUNT, SUM, AVG, MIN, MAX"] },
      { name: "Joins",                 tasks: ["INNER JOIN — combine rows from two tables","LEFT JOIN — include all rows from left table","Self join — employees and their managers example","Multiple joins — 3 tables, order-customer-product schema"] },
      { name: "Advanced SQL",          tasks: ["Subqueries — correlated and non-correlated","Window functions — ROW_NUMBER, RANK, LAG, LEAD","Indexes — clustered vs non-clustered, query optimization","Stored procedures and triggers — real-world example"] },
      { name: "Database Design",       tasks: ["ER diagram — entities, attributes, relationships","Normalization — 1NF, 2NF, 3NF with examples","Design schema for a library management system","Transactions — ACID properties, COMMIT, ROLLBACK"] },
    ],
  },
};

// ── Detect domain from goal text ──────────────────────────────────────────
function detectDomain(title, description) {
  const text = `${title} ${description || ""}`.toLowerCase();
  for (const [domain, config] of Object.entries(ROADMAPS)) {
    if (config.keywords.some((kw) => text.includes(kw))) return domain;
  }
  return null;
}

// ── Extract topics from description text ──────────────────────────────────
function extractTopicsFromDescription(text) {
  return text
    .replace(/[•\-*\n]/g, ",")
    .replace(/\band\b/gi, ",")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 3 && s.length < 80)
    .slice(0, 12);
}

// ── Build generic tasks for unknown domains ───────────────────────────────
function buildGenericTopics(goal) {
  const descTopics = goal.description
    ? extractTopicsFromDescription(goal.description)
    : [];

  if (descTopics.length >= 3) {
    // User gave specific topics — use them
    return descTopics.map((topic) => ({
      name: topic,
      tasks: [
        `Study ${topic} — read theory and take notes`,
        `Practice ${topic} with hands-on exercises`,
        `Solve 3 problems or examples related to ${topic}`,
        `Review ${topic} notes and summarize key points`,
      ],
    }));
  }

  // No description — build from title words
  const words = goal.title
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !["learn","study","build","create","days","week","month","from","with","using","and","the"].includes(w.toLowerCase()))
    .slice(0, 5);

  const phases = [
    { label: "Research & Planning",  suffix: "— understand concepts and create a plan"      },
    { label: "Core Learning",        suffix: "— deep dive into the main subject"             },
    { label: "Hands-on Practice",    suffix: "— build projects and solve practice problems"  },
    { label: "Review & Refinement",  suffix: "— consolidate knowledge and fill gaps"         },
  ];

  return phases.map(({ label, suffix }) => ({
    name: label,
    tasks: words.length > 0
      ? words.map((w) => `${label}: ${w} ${suffix}`)
      : [`${goal.title} — ${label.toLowerCase()}`],
  }));
}

// ── Smart local task generator (no API) ──────────────────────────────────
function smartLocalTasks(goal, daysLeft, taskCount) {
  const today   = new Date();
  const domain  = detectDomain(goal.title, goal.description);
  const roadmap = domain ? ROADMAPS[domain] : null;

  let topicList = roadmap ? roadmap.topics : buildGenericTopics(goal);

  // If user gave description with specific topics, overlay them
  if (goal.description && goal.description.trim().length > 30 && roadmap) {
    const descTopics = extractTopicsFromDescription(goal.description);
    if (descTopics.length >= 2) {
      // Prepend user-mentioned topics with tasks from roadmap
      const userTopics = descTopics.map((t, i) => ({
        name:  t,
        tasks: roadmap.topics[i % roadmap.topics.length]?.tasks || [
          `Study ${t} — concepts and theory`,
          `Practice ${t} with examples`,
          `Implement ${t} from scratch`,
          `Review ${t} and quiz yourself`,
        ],
      }));
      topicList = [...userTopics, ...roadmap.topics].slice(0, 12);
    }
  }

  const tasks  = [];
  const step   = Math.max(1, Math.floor(daysLeft / taskCount));
  let   offset = 0;
  let   tIdx   = 0;
  let   sIdx   = 0;

  while (tasks.length < taskCount) {
    if (tIdx >= topicList.length) tIdx = 0;
    const { name, tasks: subtasks } = topicList[tIdx];
    const taskTitle = subtasks[sIdx % subtasks.length];
    const pos       = tasks.length / taskCount;
    const priority  = pos < 0.2 ? "high" : pos > 0.8 ? "low" : "medium";

    tasks.push({
      title:            taskTitle,
      dueDate:          format(addDays(today, Math.min(offset, daysLeft - 1)), "yyyy-MM-dd"),
      priority,
      phase:            name,
      estimatedMinutes: 45,
      goalId:           goal.id || null,
      completed:        false,
      aiGenerated:      true,
    });

    offset += step;
    sIdx++;
    if (sIdx % subtasks.length === 0) { tIdx++; sIdx = 0; }
  }

  return tasks;
}

// ══════════════════════════════════════════════════════════════════════════
// FREE API GENERATORS
// ══════════════════════════════════════════════════════════════════════════

function buildPrompt(goal, daysLeft, taskCount) {
  const start    = format(new Date(), "yyyy-MM-dd");
  const end      = format(addDays(new Date(), daysLeft), "yyyy-MM-dd");
  return `You are an expert productivity coach and study planner.

Goal: "${goal.title}"
Category: ${goal.category || "general"}
Description: ${goal.description?.trim() || "Not provided."}
Timeline: ${daysLeft} days (${start} to ${end})
Tasks needed: ${taskCount}

Create ${taskCount} SPECIFIC daily tasks. Each title must name the exact topic, concept, chapter, or exercise.

BAD: "Work on goal Day 3" or "Core Execution — Learn Python"
GOOD: "Study Python dictionary methods — keys(), values(), items() with examples"
GOOD: "Implement binary search tree — insert and search operations in Java"

Output ONLY a raw JSON array with no markdown or explanation:
[{"title":"...","dueDate":"YYYY-MM-DD","priority":"high|medium|low","phase":"topic name","estimatedMinutes":45}]`;
}

async function tryGroq(prompt) {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key || key.includes("your_groq")) throw new Error("No valid Groq key");
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  return (await res.json()).choices[0].message.content;
}

async function tryGemini(prompt) {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || key.includes("your_gemini")) throw new Error("No valid Gemini key");
  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1500, temperature: 0.7 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  return (await res.json()).candidates[0].content.parts[0].text;
}

function parseResponse(raw, goal) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const match   = cleaned.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON found");
  const arr = JSON.parse(match[0]);
  if (!Array.isArray(arr) || arr.length === 0) throw new Error("Empty result");
  return arr.map((t) => ({
    title:            String(t.title || "Task"),
    dueDate:          t.dueDate || format(new Date(), "yyyy-MM-dd"),
    priority:         ["high","medium","low"].includes(t.priority) ? t.priority : "medium",
    phase:            t.phase || "Study",
    estimatedMinutes: Number(t.estimatedMinutes) || 45,
    goalId:           goal.id || null,
    completed:        false,
    aiGenerated:      true,
  }));
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────
export async function generateAITasks(goal) {
  const today     = new Date();
  const deadline  = goal.targetDate ? new Date(goal.targetDate) : addDays(today, 30);
  const daysLeft  = Math.max(3, Math.ceil((deadline - today) / 86400000));
  const taskCount = Math.min(14, Math.max(5, Math.floor(daysLeft / 2)));
  const prompt    = buildPrompt(goal, daysLeft, taskCount);

  // 1. Try Groq (free — console.groq.com)
  try {
    const tasks = parseResponse(await tryGemini(prompt), goal);
    console.log(`✅ Gemini: ${tasks.length} AI tasks`);
    return tasks;
  } catch (e) { console.warn("Gemini:", e.message); }

  // 2. Try Gemini (free — aistudio.google.com)
  try {
    const tasks = parseResponse(await tryGroq(prompt), goal);
    console.log(`✅ Groq: ${tasks.length} AI tasks`);
    return tasks;
  } catch (e) { console.warn("Groq:", e.message); }
  

  // 3. Smart local engine — topic roadmaps, always works
  const tasks = smartLocalTasks(goal, daysLeft, taskCount);
  console.log(`✅ Local engine: ${tasks.length} topic tasks`);
  return tasks;
}