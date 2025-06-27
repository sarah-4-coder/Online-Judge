// problemSeeder.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';
import TestCase from './models/TestCase.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const problems = [
  {
    name: "Add Two Numbers",
    code: "ADD_TWO",
    statement: "Given two integers, return their sum.",
    difficulty: "Easy",
    samples: [
      { input: "2 3", output: "5" }
    ],
    hidden: [
      { input: "10 15", output: "25" },
      { input: "-5 5", output: "0" }
    ]
  },
  {
    name: "Palindrome Checker",
    code: "PALIN",
    statement: "Check whether a string is a palindrome (case-insensitive).",
    difficulty: "Easy",
    samples: [
      { input: "racecar", output: "Yes" }
    ],
    hidden: [
      { input: "level", output: "Yes" },
      { input: "hello", output: "No" }
    ]
  },
  {
    name: "Find Max",
    code: "FIND_MAX",
    statement: "Given N integers, return the maximum.",
    difficulty: "Easy",
    samples: [
      { input: "3\n2 7 5", output: "7" }
    ],
    hidden: [
      { input: "5\n1 2 3 4 5", output: "5" },
      { input: "4\n-1 -2 -3 -4", output: "-1" }
    ]
  },
  {
    name: "Count Vowels",
    code: "COUNT_VOWELS",
    statement: "Given a string, count the number of vowels in it.",
    difficulty: "Easy",
    samples: [
      { input: "hello", output: "2" }
    ],
    hidden: [
      { input: "education", output: "5" },
      { input: "xyz", output: "0" }
    ]
  },
  {
    name: "Fibonacci Nth Term",
    code: "FIB_NTH",
    statement: "Given n, return the nth Fibonacci number (0-indexed).",
    difficulty: "Medium",
    samples: [
      { input: "5", output: "5" }
    ],
    hidden: [
      { input: "10", output: "55" },
      { input: "0", output: "0" }
    ]
  },
  {
    name: "Check Prime",
    code: "IS_PRIME",
    statement: "Given an integer n, return 'Yes' if it's prime, else 'No'.",
    difficulty: "Easy",
    samples: [
      { input: "7", output: "Yes" }
    ],
    hidden: [
      { input: "9", output: "No" },
      { input: "13", output: "Yes" }
    ]
  },
  {
    name: "Reverse a String",
    code: "REVERSE_STR",
    statement: "Given a string, return the reversed version.",
    difficulty: "Easy",
    samples: [
      { input: "abcd", output: "dcba" }
    ],
    hidden: [
      { input: "racecar", output: "racecar" },
      { input: "hello", output: "olleh" }
    ]
  },
  {
    name: "Missing Number",
    code: "MISSING_NUM",
    statement: "Given an array of size n containing numbers from 1 to n+1 with one missing, return the missing number.",
    difficulty: "Medium",
    samples: [
      { input: "4\n1 2 4 5", output: "3" }
    ],
    hidden: [
      { input: "5\n1 2 3 5 6", output: "4" },
      { input: "3\n2 3 4", output: "1" }
    ]
  },
  {
    name: "Sort Array",
    code: "SORT_ARRAY",
    statement: "Given an array, return the sorted version in ascending order.",
    difficulty: "Medium",
    samples: [
      { input: "5\n3 1 4 2 5", output: "1 2 3 4 5" }
    ],
    hidden: [
      { input: "3\n9 7 8", output: "7 8 9" },
      { input: "2\n5 1", output: "1 5" }
    ]
  },
  {
    name: "Valid Parentheses",
    code: "VALID_PAREN",
    statement: "Given a string containing '(', ')', determine if it is valid (balanced).",
    difficulty: "Medium",
    samples: [
      { input: "()()", output: "Yes" }
    ],
    hidden: [
      { input: "(()())", output: "Yes" },
      { input: "((())", output: "No" }
    ]
  }
];

const seedProblems = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');

    for (const prob of problems) {
      const createdProblem = await Problem.create({
        name: prob.name,
        code: prob.code,
        statement: prob.statement,
        difficulty: prob.difficulty
      });

      for (const sample of prob.samples) {
        await TestCase.create({
          problemId: createdProblem._id,
          input: sample.input,
          expectedOutput: sample.output,
          isSample: true
        });
      }

      for (const hidden of prob.hidden) {
        await TestCase.create({
          problemId: createdProblem._id,
          input: hidden.input,
          expectedOutput: hidden.output,
          isSample: false
        });
      }
    }

    console.log('Problems and test cases seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedProblems();
