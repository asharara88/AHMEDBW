import React, { useEffect, useState } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import type { Supplement } from '../../types/supplements';

const SupplementSelector: React.FC = () => {
  const { supabase } = useSupabase();
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSupplements() {
      const { data, error } = await supabase.from('supplements').select('*');
      if (error) {
        setError(error as Error);
      } else {
        setSupplements(data as Supplement[]);
      }
      setLoading(false);
    }

    fetchSupplements();
  }, [supabase]);

  if (loading) return <div>Loading supplements...</div>;
  if (error) return <div>Error fetching supplements.</div>;

  return (
    <div>
      {supplements.map((supp) => (
        <div key={supp.id} className="mb-4">
          <h3 className="font-bold">{supp.name}</h3>
          <p>{supp.description}</p>
          {supp.dosage && (
            <p>
              <strong>Dosage:</strong> {supp.dosage}
            </p>
          )}
          {supp.benefits && (
            <p>
              <strong>Benefits:</strong> {supp.benefits.join(', ')}
            </p>
          )}
          <button className="mt-2 rounded bg-primary px-3 py-1 text-white">
            Add to Stack
          </button>
        </div>
      ))}
    </div>
  );
};

export default SupplementSelector;
