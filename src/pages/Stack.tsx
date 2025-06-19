// pages/stack.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function StackPage() {
  const [supplements, setSupplements] = useState([] as any[]);
  const [goal, setGoal] = useState('All');

  useEffect(() => {
    const fetchSupplements = async () => {
      let query = supabase.from('supplements').select('*');
      if (goal !== 'All') query = query.ilike('goal', `%${goal}%`);
      const { data, error } = await query;
      if (!error) setSupplements(data as any[]);
    };
    fetchSupplements();
  }, [goal]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-2">Your Personalized Stack</h2>

      <label className="block text-sm font-medium mb-1">Filter by goal:</label>
      <select
        onChange={(e) => setGoal(e.target.value)}
        value={goal}
        className="p-2 border rounded"
      >
        <option value="All">All</option>
        <option value="Sleep">Sleep</option>
        <option value="Muscle">Muscle</option>
        <option value="Stress">Stress</option>
      </select>

      {supplements.map((s) => (
        <div key={s.id} className="border p-4 rounded shadow">
          <h3 className="text-xl font-semibold">{s.name}</h3>
          <p><strong>Goal:</strong> {s.goal}</p>
          <p><strong>Mechanism:</strong> {s.mechanism}</p>
          <p><strong>Dosage:</strong> {s.dosage}</p>
          <p><strong>Evidence:</strong> {s.evidence_summary}</p>
          <a href={s.source_link} className="text-blue-600 underline" target="_blank" rel="noreferrer">
            View Study ↗
          </a>
        </div>
      ))}
    </div>
  );
}
