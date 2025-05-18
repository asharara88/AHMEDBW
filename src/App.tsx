import { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'

interface Todo {
  id: string;
  title: string;
  created_at: string;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  // Check for user session on load
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user || null)
    }
    
    getSession()
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Fetch todos when user changes
  useEffect(() => {
    async function getTodos() {
      try {
        setLoading(true)
        setError(null)
        
        // If no user, use demo user ID
        const userId = user?.id || '00000000-0000-0000-0000-000000000000'
        
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
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
  }, [user])

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTodo.trim()) return
    
    try {
      setLoading(true)
      
      // If no user, use demo user ID
      const userId = user?.id || '00000000-0000-0000-0000-000000000000'
      
      const { data, error } = await supabase
        .from('todos')
        .insert([{ title: newTodo, user_id: userId }])
        .select()
      
      if (error) {
        throw error
      }
      
      if (data) {
        setTodos([...data, ...todos])
        setNewTodo('')
      }
    } catch (error) {
      console.error('Error adding todo:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while adding todo')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while deleting todo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      
      <form onSubmit={handleAddTodo} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newTodo.trim() || loading}
            className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>
      
      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      {loading && <p className="text-gray-500">Loading todos...</p>}
      
      {!loading && todos.length === 0 ? (
        <p className="text-gray-500">No todos found. Add some!</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
              <span>{todo.title}</span>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App