import { useEffect, useState } from "react"

export type Todo = {
  id: string
  title: string
  done: boolean
}

const STORAGE_KEY = "react-todo:todos"

function load(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Todo[]) : []
  } catch {
    return []
  }
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch {
      // Storage can be unavailable in private windows. The list still works for the session.
    }
  }, [todos])

  function add(title: string) {
    setTodos((list) => [...list, { id: crypto.randomUUID(), title, done: false }])
  }

  function toggle(id: string) {
    setTodos((list) =>
      list.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
    )
  }

  function remove(id: string) {
    setTodos((list) => list.filter((todo) => todo.id !== id))
  }

  function clearDone() {
    setTodos((list) => list.filter((todo) => !todo.done))
  }

  return { todos, add, toggle, remove, clearDone }
}
