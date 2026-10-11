import { useEffect, useState, type FormEvent } from "react"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useTodos } from "@/hooks/use-todos"
import { cn } from "@/lib/utils"

const FILTERS = ["all", "active", "done"] as const
type Filter = (typeof FILTERS)[number]

// The filter lives in the URL (?filter=active) so a page state can be linked to directly.
function readFilter(): Filter {
  const value = new URLSearchParams(window.location.search).get("filter")
  return FILTERS.includes(value as Filter) ? (value as Filter) : "all"
}

function App() {
  const { todos, add, toggle, remove, clearDone } = useTodos()
  const [title, setTitle] = useState("")
  const [filter, setFilter] = useState<Filter>(readFilter)

  useEffect(() => {
    const onPop = () => setFilter(readFilter())
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  function changeFilter(next: Filter) {
    const url = new URL(window.location.href)
    if (next === "all") url.searchParams.delete("filter")
    else url.searchParams.set("filter", next)
    window.history.pushState(null, "", url)
    setFilter(next)
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    add(trimmed)
    setTitle("")
  }

  const left = todos.filter((todo) => !todo.done).length
  const doneCount = todos.length - left
  const visible = todos.filter((todo) =>
    filter === "all" ? true : filter === "done" ? todo.done : !todo.done
  )

  return (
    <main className="mx-auto flex min-h-svh max-w-lg flex-col px-4 py-10 sm:py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Todos</CardTitle>
          <CardDescription>
            {todos.length === 0
              ? "Nothing here yet."
              : `${left} of ${todos.length} left`}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              aria-label="New todo"
              placeholder="What needs doing?"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Button type="submit" disabled={!title.trim()}>
              Add
            </Button>
          </form>

          <nav aria-label="Filter todos" className="flex gap-1">
            {FILTERS.map((name) => (
              <Button
                key={name}
                size="sm"
                variant={filter === name ? "secondary" : "ghost"}
                aria-pressed={filter === name}
                onClick={() => changeFilter(name)}
                className="capitalize"
              >
                {name}
              </Button>
            ))}
          </nav>

          {visible.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              {todos.length === 0
                ? "Add your first todo above."
                : filter === "done"
                  ? "Nothing finished yet."
                  : "All done."}
            </p>
          ) : (
            <ul className="divide-y rounded-md border">
              {visible.map((todo) => (
                <li key={todo.id} className="flex items-center gap-3 px-3 py-2">
                  <Checkbox
                    id={`todo-${todo.id}`}
                    checked={todo.done}
                    onCheckedChange={() => toggle(todo.id)}
                  />
                  <label
                    htmlFor={`todo-${todo.id}`}
                    className={cn(
                      "flex-1 text-sm break-words",
                      todo.done && "text-muted-foreground line-through"
                    )}
                  >
                    {todo.title}
                  </label>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Delete ${todo.title}`}
                    onClick={() => remove(todo.id)}
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>

        {doneCount > 0 && (
          <CardFooter className="justify-end">
            <Button variant="outline" size="sm" onClick={clearDone}>
              Clear {doneCount} done
            </Button>
          </CardFooter>
        )}
      </Card>
    </main>
  )
}

export default App
