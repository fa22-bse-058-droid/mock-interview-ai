ROUND_1_QUESTIONS = {
    "title": "Programming Fundamentals & OOP",
    "duration_minutes": 15,
    "categories": {
        "programming_fundamentals": [
            {
                "question": "What is the difference between compiled and interpreted languages? Give examples.",
                "keywords": ["compiler", "interpreter", "Python", "Java", "C++", "runtime", "bytecode"],
                "difficulty": "easy",
                "follow_up": "Which approach is better for performance?",
            },
            {
                "question": "Explain recursion with a real-world example.",
                "keywords": ["base case", "recursive case", "stack", "function calls itself", "factorial", "fibonacci"],
                "difficulty": "easy",
                "follow_up": "What are the risks of recursion?",
            },
            {
                "question": "What is time complexity? Explain Big O notation.",
                "keywords": ["O(n)", "O(1)", "O(log n)", "O(n²)", "worst case", "performance", "algorithm"],
                "difficulty": "medium",
                "follow_up": "What is the time complexity of binary search?",
            },
            {
                "question": "Explain the difference between stack and heap memory.",
                "keywords": ["stack", "heap", "memory", "allocation", "local variables", "dynamic", "garbage collection"],
                "difficulty": "medium",
                "follow_up": "What causes a stack overflow?",
            },
            {
                "question": "What are design patterns? Explain Singleton pattern.",
                "keywords": ["singleton", "instance", "design pattern", "creational", "one instance", "global"],
                "difficulty": "hard",
                "follow_up": "When would you NOT use Singleton?",
            },
        ],
        "oop": [
            {
                "question": "Explain the four pillars of OOP.",
                "keywords": ["encapsulation", "inheritance", "polymorphism", "abstraction", "class", "object"],
                "difficulty": "easy",
                "follow_up": "Which pillar is most important and why?",
            },
            {
                "question": "What is the difference between abstract class and interface?",
                "keywords": ["abstract", "interface", "implement", "extend", "methods", "concrete", "multiple inheritance"],
                "difficulty": "medium",
                "follow_up": "When would you use each?",
            },
            {
                "question": "Explain method overloading vs method overriding.",
                "keywords": ["overloading", "overriding", "compile time", "runtime", "parameters", "parent", "child"],
                "difficulty": "medium",
                "follow_up": "Which is an example of polymorphism?",
            },
            {
                "question": "What is SOLID principle?",
                "keywords": ["single responsibility", "open closed", "liskov", "interface segregation", "dependency inversion"],
                "difficulty": "hard",
                "follow_up": "Give an example of violating Single Responsibility",
            },
        ],
    },
}

ROUND_2_QUESTIONS = {
    "title": "Data Structures, Algorithms & Databases",
    "duration_minutes": 15,
    "categories": {
        "dsa": [
            {
                "question": "Explain the difference between Array and LinkedList.",
                "keywords": ["array", "linked list", "index", "pointer", "contiguous", "dynamic", "O(1)", "O(n)"],
                "difficulty": "easy",
                "follow_up": "When would you prefer LinkedList over Array?",
            },
            {
                "question": "Explain binary search tree and its operations.",
                "keywords": ["BST", "left", "right", "search", "insert", "delete", "O(log n)", "balanced"],
                "difficulty": "medium",
                "follow_up": "What happens when BST becomes unbalanced?",
            },
            {
                "question": "What is dynamic programming? Give an example.",
                "keywords": ["memoization", "subproblems", "optimal", "fibonacci", "knapsack", "overlapping", "tabulation"],
                "difficulty": "hard",
                "follow_up": "What is the difference between memoization and tabulation?",
            },
            {
                "question": "Explain graph traversal algorithms BFS and DFS.",
                "keywords": ["BFS", "DFS", "breadth", "depth", "queue", "stack", "visited", "shortest path"],
                "difficulty": "medium",
                "follow_up": "Which would you use to find shortest path?",
            },
            {
                "question": "What is a hash table and how does collision handling work?",
                "keywords": ["hash function", "collision", "chaining", "open addressing", "key", "value", "O(1)"],
                "difficulty": "medium",
                "follow_up": "What makes a good hash function?",
            },
        ],
        "databases": [
            {
                "question": "What is normalization? Explain 1NF, 2NF, 3NF.",
                "keywords": ["normalization", "1NF", "2NF", "3NF", "redundancy", "dependency", "atomic"],
                "difficulty": "medium",
                "follow_up": "When would you intentionally denormalize?",
            },
            {
                "question": "Explain ACID properties in databases.",
                "keywords": ["atomicity", "consistency", "isolation", "durability", "transaction", "commit", "rollback"],
                "difficulty": "medium",
                "follow_up": "What happens if isolation is violated?",
            },
            {
                "question": "What is the difference between SQL JOIN types?",
                "keywords": ["inner join", "left join", "right join", "full join", "cross join", "NULL", "matching"],
                "difficulty": "easy",
                "follow_up": "When would you use LEFT JOIN over INNER JOIN?",
            },
            {
                "question": "What are indexes in databases and when should you use them?",
                "keywords": ["index", "performance", "search", "B-tree", "clustered", "non-clustered", "overhead"],
                "difficulty": "medium",
                "follow_up": "Can too many indexes be harmful?",
            },
        ],
    },
}

ROUND_3_QUESTIONS = {
    "title": "Domain Knowledge & HR Round",
    "duration_minutes": 10,
    "categories": {
        "software_engineering": [
            {
                "question": "Explain Agile methodology and Scrum framework.",
                "keywords": ["agile", "scrum", "sprint", "backlog", "standup", "retrospective", "iterative"],
                "difficulty": "easy",
                "follow_up": "What is the role of a Scrum Master?",
            },
            {
                "question": "What is the difference between unit testing and integration testing?",
                "keywords": ["unit test", "integration", "mocking", "isolated", "components", "TDD", "coverage"],
                "difficulty": "medium",
                "follow_up": "What is Test Driven Development?",
            },
            {
                "question": "Explain REST API principles.",
                "keywords": ["stateless", "HTTP", "GET", "POST", "PUT", "DELETE", "endpoints", "JSON"],
                "difficulty": "easy",
                "follow_up": "What is the difference between REST and GraphQL?",
            },
        ],
        "hr": [
            {
                "question": "Tell me about yourself and your strongest technical skill.",
                "keywords": ["experience", "skills", "projects", "education", "passionate", "learn"],
                "difficulty": "easy",
                "follow_up": "Why did you choose software engineering?",
            },
            {
                "question": "Describe a situation where you had to debug a very difficult problem.",
                "keywords": ["problem", "debug", "solution", "steps", "learned", "tools", "fixed"],
                "difficulty": "medium",
                "follow_up": "What did you learn from that experience?",
            },
            {
                "question": "Where do you see yourself in 5 years?",
                "keywords": ["growth", "skills", "leadership", "senior", "contribute", "learn", "career"],
                "difficulty": "easy",
                "follow_up": "How are you working towards that goal now?",
            },
            {
                "question": "What is your greatest weakness as a developer?",
                "keywords": ["weakness", "improving", "learning", "working on", "challenge", "growth"],
                "difficulty": "medium",
                "follow_up": "What steps are you taking to improve?",
            },
        ],
    },
}
