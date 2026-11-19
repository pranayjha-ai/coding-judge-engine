import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Play, RotateCcw, Send } from "lucide-react"
import { ProblemDifficulty } from "@/components/problem-difficulty"
import { Button } from "@/components/ui/button"
import type { Difficulty } from "@/data/problems"
import { apiFetch } from "@/lib/api"

type ProblemApiResponse = {
  problem: {
    id: number | string
    title: string
    difficulty: string
    description: string
  }
  starter_code: string | null
  examples: {
    input: string
    output: string
    explanation?: string | null
  }[]
}

type WorkspaceProblem = {
  id: number | string
  title: string
  difficulty: Difficulty
  description: string
  starterCode: string
  examples: {
    input: string
    output: string
    explanation?: string
  }[]
}

const defaultStarterCode = `class Solution {
    public void solve() {
        // Write your solution here.
    }
}`

function toDifficulty(value: string): Difficulty {
  switch (value.toUpperCase()) {
    case "EASY":
      return "Easy"
    case "MEDIUM":
      return "Medium"
    case "HARD":
      return "Hard"
    default:
      throw new Error("The problem has an unsupported difficulty.")
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isProblemExample(value: unknown): value is ProblemApiResponse["examples"][number] {
  if (!isRecord(value)) return false

  return (
    typeof value.input === "string" &&
    typeof value.output === "string" &&
    (value.explanation === undefined ||
      value.explanation === null ||
      typeof value.explanation === "string")
  )
}

function isProblemApiResponse(value: unknown): value is ProblemApiResponse {
  if (!isRecord(value) || !isRecord(value.problem) || !Array.isArray(value.examples)) {
    return false
  }

  return (
    (typeof value.problem.id === "number" || typeof value.problem.id === "string") &&
    typeof value.problem.title === "string" &&
    typeof value.problem.difficulty === "string" &&
    typeof value.problem.description === "string" &&
    (typeof value.starter_code === "string" || value.starter_code === null) &&
    value.examples.every(isProblemExample)
  )
}

export function WorkspacePage() {
  const { problemId } = useParams()
  const [problem, setProblem] = useState<WorkspaceProblem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [code, setCode] = useState(defaultStarterCode)
  const [result, setResult] = useState("")

  useEffect(() => {
    const controller = new AbortController()

    async function fetchProblem() {
      setLoading(true)
      setError("")
      if (!problemId) {
        setError("Problem ID is missing.")
        setLoading(false)
        return
      }

      

      try {
        const response = await apiFetch(
          `/api/problems/${encodeURIComponent(problemId)}`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error(`Failed to load problem (HTTP ${response.status}).`)
        }

        const data: unknown = await response.json()
        if (!isProblemApiResponse(data)) {
          throw new Error("The server returned an invalid problem response.")
        }

        const starterCode = data.starter_code?.trim()
          ? data.starter_code
          : defaultStarterCode

        setProblem({
          id: data.problem.id,
          title: data.problem.title,
          difficulty: toDifficulty(data.problem.difficulty),
          description: data.problem.description,
          starterCode,
          examples: data.examples.map((example) => ({
            input: example.input,
            output: example.output,
            explanation: example.explanation ?? undefined,
          })),
        })
        setCode(starterCode)
      } catch (error) {
        if (controller.signal.aborted) return

        console.error("Failed to fetch problem:", error)
        setError(
          error instanceof Error ? error.message : "Failed to load problem.",
        )
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void fetchProblem()
    return () => controller.abort()
  }, [problemId])

  function runCode() {
    if (!code.trim()) {
      setResult("Please enter your code first.")
      return
    }

    setResult("Execution is not connected yet. We'll connect the backend next.")
  }

  function resetCode() {
    setCode(problem?.starterCode ?? defaultStarterCode)
    setResult("")
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground" role="status">
        Loading problem...
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3 p-6" role="alert">
        <h1 className="text-lg font-semibold">Unable to load problem</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Link
          to="/problems"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Back to problems
        </Link>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="p-6 text-sm text-muted-foreground" role="status">
        Problem not found.
      </div>
    )
  }

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-2">
      <section className="space-y-5 border-b p-5 lg:border-r lg:border-b-0">
        <div>
          <Link
            to="/problems"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to Problems
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold">
              {problem.id}. {problem.title}
            </h1>
            <ProblemDifficulty difficulty={problem.difficulty} />
          </div>
        </div>

        <div className="space-y-2 text-sm leading-7">
          <h2 className="font-semibold">Description</h2>
          <p>{problem.description}</p>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold">Examples</h2>

          {problem.examples.map((example, index) => (
            <div
              key={`${example.input}-${index}`}
              className="rounded-lg border bg-muted/30 p-3 text-sm"
            >
              <p className="mb-2 font-medium">Example {index + 1}</p>
              <p className="font-mono text-xs">Input: {example.input}</p>
              <p className="font-mono text-xs">Output: {example.output}</p>

              {example.explanation && (
                <p className="mt-2 text-muted-foreground">
                  Explanation: {example.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="flex min-w-0 flex-col">
        <div className="flex h-12 items-center justify-between border-b px-4">
          <span className="text-sm font-medium">Java</span>

          <Button variant="ghost" size="sm" onClick={resetCode}>
            <RotateCcw className="mr-2 size-4" />
            Reset
          </Button>
        </div>

        <div className="min-h-[400px] flex-1 bg-[#101113] p-4">
          <textarea
            aria-label="Java code editor"
            spellCheck={false}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="h-full min-h-[380px] w-full resize-none bg-transparent font-mono text-sm leading-6 text-zinc-200 outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t p-4">
          <Button variant="outline" onClick={runCode}>
            <Play className="mr-2 size-4" />
            Run
          </Button>

          <Button onClick={runCode}>
            <Send className="mr-2 size-4" />
            Submit
          </Button>
        </div>

        <div className="min-h-28 border-t p-4">
          <h2 className="mb-2 text-sm font-semibold">Result</h2>

          {result ? (
            <p className="text-sm text-muted-foreground">{result}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Run your code to see the result here.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
