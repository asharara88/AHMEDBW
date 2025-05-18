import { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'

interface Todo {
  id: string;
  title: string;
  created_at: string;
}

function Page() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getTodos() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from('todos').select('*')
        
        if (error) {
          throw error
        }
        
        if (data) {
          setTodos(data)
        }
      } catch (error) {
        console.error('Error fetching todos:', error)
        setError(error instanceof Error ? error.message : 'An error occurred while fetching todos')
      } finally {
        setLoading(false)
      }
    }

    getTodos()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      
      {loading ? (
        <p>Loading todos...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : todos.length === 0 ? (
        <p>No todos found. Add some!</p>
      ) : (
        <ul className="list-disc pl-5">
          {todos.map((todo) => (
            <li key={todo.id} className="mb-2">{todo.title}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Page