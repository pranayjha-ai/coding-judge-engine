import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProblemDifficulty } from "@/components/problem-difficulty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { problems } from "@/data/problems";

const difficultyOptions = ["All", "Easy", "Medium", "Hard"] as const;
type DifficultyFilter = (typeof difficultyOptions)[number];

export function ProblemsPage() {
  const [searchParams] = useSearchParams();
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");

  const query = (searchParams.get("q") ?? "").trim().toLowerCase();

  const filteredProblems = useMemo(
    () =>
      problems.filter((problem) => {
        const matchesQuery =
          !query ||
          problem.title.toLowerCase().includes(query) ||
          String(problem.id).includes(query);

        const matchesDifficulty =
          difficulty === "All" || problem.difficulty === difficulty;

        return matchesQuery && matchesDifficulty;
      }),
    [difficulty, query],
  );

  function updateDifficulty(value: string | number | null) {
    if (difficultyOptions.some((item) => item === value)) {
      setDifficulty(value as DifficultyFilter);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Problems</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a problem to start coding.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={difficulty} onValueChange={updateDifficulty}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All difficulties</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm text-left">
          <thead className="border-b bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Difficulty</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredProblems.map((problem) => (
              <tr
                key={problem.id}
                className="border-b last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-4 text-muted-foreground">
                  {problem.id}
                </td>

                <td className="px-4 py-4 font-medium">{problem.title}</td>

                <td className="px-4 py-4">
                  <ProblemDifficulty difficulty={problem.difficulty} />
                </td>

                <td className="px-4 py-4 text-right">
                  <Link
                    to={`/problems/${problem.id}`}
                    className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Solve
                  </Link>
                </td>
              </tr>
            ))}

            {filteredProblems.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No problems found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filteredProblems.length} of {problems.length} problems
      </p>
    </div>
  );
}
