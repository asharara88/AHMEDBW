// pages/stack.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Supplement {
  id: string;
  name: string;
  goal: string;
  mechanism: string;
  dosage: string;
  evidence_summary: string;
  source_link: string;
}

const goals = ['All', 'Sleep', 'Muscle', 'Stress'];

export default function StackPage() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [goal, setGoal] = useState<string>('All');

  useEffect(() => {
    const fetchSupplements = async () => {
      let query = supabase.from('supplements').select('*');
      if (goal !== 'All') {
        query = query.ilike('goal', `%${goal}%`);
      }
      const { error } = await query;
      if (!error && data) {
        setSupplements(data as Supplement[]);
      }
    };

    fetchSupplements();
  }, [goal]);

  return (
    <div className="container mx-auto space-y-4 p-4">
      <h2 className="mb-2 text-2xl font-bold">Your Personalized Stack</h2>

      <div>
        <label className="mb-1 block text-sm font-medium">Filter by goal:</label>
        <select
          onChange={(e) => setGoal(e.target.value)}
          value={goal}
          aria-label="Filter supplements by goal"
          className="mt-1 w-full max-w-xs rounded-lg border border-[hsl(var(--color-border))] bg-background p-2"
        >
          {goals.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {supplements.map((s) => (
          <div
            key={s.id}
            className="rounded-lg border border-[hsl(var(--color-border))] bg-background p-4 shadow-sm"
          >
            <h3 className="mb-1 text-xl font-semibold">{s.name}</h3>
            <p className="text-sm">
              <strong>Goal:</strong> {s.goal}
            </p>
            <p className="text-sm">
              <strong>Mechanism:</strong> {s.mechanism}
            </p>
            <p className="text-sm">
              <strong>Dosage:</strong> {s.dosage}
            </p>
            <p className="text-sm">
              <strong>Evidence:</strong> {s.evidence_summary}
            </p>
            <a
              href={s.source_link}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-primary underline"
            >
              View Study ↗
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
