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

const goals = ['All', 'Muscle', 'Sleep', 'Stress'];

export default function StackPage() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchSupplements = async () => {
      const { data, error } = await supabase
        .from('supplements')
        .select('*');
      if (error) {
        console.error('Error fetching supplements', error);
      } else {
        setSupplements(data);
      }
    };
    fetchSupplements();
  }, []);

  const filtered = filter === 'All'
    ? supplements
    : supplements.filter((s) => s.goal?.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Supplement Stack</h1>
      <select
        className="mb-4 rounded border p-2"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        {goals.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((s) => (
          <div key={s.id} className="rounded border p-4 shadow">
            <h2 className="text-lg font-semibold">{s.name}</h2>
            <p className="text-sm text-gray-600">Goal: {s.goal}</p>
            <p className="text-sm">Mechanism: {s.mechanism}</p>
            <p className="text-sm">Dosage: {s.dosage}</p>
            <p className="text-sm">{s.evidence_summary}</p>
            <a href={s.source_link} className="text-primary underline" target="_blank" rel="noopener noreferrer">
              Source
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
