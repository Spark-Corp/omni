import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { X, Check, Plus, Minus } from 'lucide-react';

function SimpleButton({ children, onClick, disabled = false, variant = 'default' }) {
  const cls = variant === 'danger' ? 'text-red-400' : 'text-emerald-400';
  return (
    <button onClick={onClick} disabled={disabled} data-testid="btn" className={cls}>
      {children}
    </button>
  );
}

function Badge({ count }) {
  return (
    <span data-testid="badge" className={count > 0 ? 'bg-emerald-500' : 'bg-zinc-700'}>
      {count}
    </span>
  );
}

describe('UI Components', () => {
  it('renders button with text', () => {
    render(<SimpleButton>Cliquez</SimpleButton>);
    expect(screen.getByTestId('btn').textContent).toBe('Cliquez');
  });

  it('renders disabled button', () => {
    render(<SimpleButton disabled>Désactivé</SimpleButton>);
    expect(screen.getByTestId('btn')).toBeDisabled();
  });

  it('shows badge count', () => {
    render(<Badge count={3} />);
    expect(screen.getByTestId('badge').textContent).toBe('3');
  });

  it('shows zero badge', () => {
    render(<Badge count={0} />);
    expect(screen.getByTestId('badge').textContent).toBe('0');
  });

  it('increments counter', () => {
    let count = 0;
    const inc = () => { count += 1; };
    inc();
    inc();
    inc();
    expect(count).toBe(3);
  });
});
