export type Difficulty = "Easy" | "Medium" | "Hard"

export type ProblemExample = {
  input: string
  output: string
  explanation?: string
}

export type Problem = {
  id: number
  title: string
  difficulty: Difficulty
  acceptance: number
  tags: string[]
  description: string
  examples: ProblemExample[]
  constraints: string[]
}

export const problems: Problem[] = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    acceptance: 54.2,
    tags: ["Array", "Hash Table"],
    description:
      "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume each input has exactly one solution, and you may not use the same element twice.",
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "nums[0] + nums[1] == 9, so we return [0, 1].",
      },
      {
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10⁴",
      "-10⁹ <= nums[i] <= 10⁹",
      "-10⁹ <= target <= 10⁹",
      "Only one valid answer exists.",
    ],
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    acceptance: 41.8,
    tags: ["String", "Stack"],
    description:
      "Given a string containing only the characters '(', ')', '{', '}', '[' and ']', determine whether the input string is valid. Every opening bracket must be closed by the same type of bracket in the correct order.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "([)]"', output: "false" },
    ],
    constraints: ["1 <= s.length <= 10⁴", "s consists of brackets only."],
  },
  {
    id: 3,
    title: "Merge Intervals",
    difficulty: "Medium",
    acceptance: 47.1,
    tags: ["Array", "Sorting"],
    description:
      "Given an array of intervals where intervals[i] = [startᵢ, endᵢ], merge all overlapping intervals and return an array of the non-overlapping intervals.",
    examples: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
      },
    ],
    constraints: [
      "1 <= intervals.length <= 10⁴",
      "intervals[i].length == 2",
      "Intervals are sorted by start in the returned result.",
    ],
  },
  {
    id: 4,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    acceptance: 52.6,
    tags: ["Array", "Dynamic Programming"],
    description:
      "You are given an array prices where prices[i] is the price of a stock on day i. Choose one day to buy and a later day to sell. Return the maximum profit, or 0 if no profit is possible.",
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5" },
      { input: "prices = [7,6,4,3,1]", output: "0" },
    ],
    constraints: ["1 <= prices.length <= 10⁵", "0 <= prices[i] <= 10⁴"],
  },
  {
    id: 5,
    title: "Product of Array Except Self",
    difficulty: "Medium",
    acceptance: 66.3,
    tags: ["Array", "Prefix Sum"],
    description:
      "Given an integer array nums, return an array answer where answer[i] equals the product of every element of nums except nums[i]. Solve it without using division and in O(n) time.",
    examples: [
      {
        input: "nums = [1,2,3,4]",
        output: "[24,12,8,6]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10⁵",
      "The product of any prefix or suffix fits in a 32-bit integer.",
    ],
  },
  {
    id: 6,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    acceptance: 36.9,
    tags: ["String", "Sliding Window"],
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
    examples: [
      { input: 's = "abcabcbb"', output: "3" },
      { input: 's = "bbbbb"', output: "1" },
    ],
    constraints: ["0 <= s.length <= 5 * 10⁴"],
  },
  {
    id: 7,
    title: "Trapping Rain Water",
    difficulty: "Hard",
    acceptance: 63.5,
    tags: ["Array", "Two Pointers"],
    description:
      "Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.",
    examples: [
      {
        input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        output: "6",
      },
    ],
    constraints: ["n == height.length", "1 <= n <= 2 * 10⁴"],
  },
  {
    id: 8,
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    acceptance: 70.2,
    tags: ["Tree", "Breadth-First Search"],
    description:
      "Given the root of a binary tree, return the level order traversal of its nodes' values, from left to right at each level.",
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" },
    ],
    constraints: ["The number of nodes is in the range [0, 2000]."],
  },
]

export function getProblem(id: string | undefined): Problem {
  const requestedId = Number(id)
  return problems.find((problem) => problem.id === requestedId) ?? problems[0]
}
