import { useState } from 'react';

interface TextInputBlockProps {
  id: string;
  label: string;
  placeholder: string;
  variable: string;
  onSubmit?: (value: string) => void;
}

const TextInputBlock = ({
  id,
  label,
  placeholder,
  variable,
  onSubmit
}: TextInputBlockProps) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && onSubmit) {
      onSubmit(value);
      setValue('');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <label htmlFor={id} className="block text-sm font-medium text-text-light">
          {label}
        </label>
        <div className="flex gap-2">
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            data-variable={variable}
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!value.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default TextInputBlock;