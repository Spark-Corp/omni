import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Simple TestButton component for testing
function TestButton({ children, onClick, disabled = false }) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      data-testid="test-button"
    >
      {children}
    </button>
  );
}

// Simple TestCard component for testing
function TestCard({ title, description }) {
  return (
    <div data-testid="test-card">
      <h2 data-testid="card-title">{title}</h2>
      <p data-testid="card-description">{description}</p>
    </div>
  );
}

// Simple TestInput component for testing
function TestInput({ value, onChange, placeholder }) {
  return (
    <input 
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      data-testid="test-input"
    />
  );
}

describe('Component Rendering Tests', () => {
  describe('TestButton', () => {
    it('should render button with children', () => {
      render(<TestButton>Click me</TestButton>);
      
      const button = screen.getByTestId('test-button');
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe('Click me');
    });

    it('should render enabled button by default', () => {
      render(<TestButton>Enabled</TestButton>);
      
      const button = screen.getByTestId('test-button');
      expect(button).not.toBeDisabled();
    });

    it('should render disabled button when disabled prop is true', () => {
      render(<TestButton disabled={true}>Disabled</TestButton>);
      
      const button = screen.getByTestId('test-button');
      expect(button).toBeDisabled();
    });

    it('should call onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(<TestButton onClick={handleClick}>Click me</TestButton>);
      
      screen.getByTestId('test-button').click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('TestCard', () => {
    it('should render card with title and description', () => {
      render(<TestCard title="Test Title" description="Test Description" />);
      
      expect(screen.getByTestId('test-card')).toBeInTheDocument();
      expect(screen.getByTestId('card-title').textContent).toBe('Test Title');
      expect(screen.getByTestId('card-description').textContent).toBe('Test Description');
    });

    it('should render without props gracefully', () => {
      render(<TestCard />);
      
      const card = screen.getByTestId('test-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByTestId('card-title').textContent).toBe('');
      expect(screen.getByTestId('card-description').textContent).toBe('');
    });
  });

  describe('TestInput', () => {
    it('should render input with placeholder', () => {
      render(<TestInput placeholder="Enter text..." />);
      
      const input = screen.getByTestId('test-input');
      expect(input).toBeInTheDocument();
      expect(input.placeholder).toBe('Enter text...');
    });

    it('should render with value', () => {
      render(<TestInput value="Test value" />);
      
      const input = screen.getByTestId('test-input');
      expect(input.value).toBe('Test value');
    });

    it('should call onChange when value changes', () => {
      const handleChange = vi.fn();
      render(<TestInput onChange={handleChange} />);
      
      const input = screen.getByTestId('test-input');
      input.value = 'new value';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      
      expect(handleChange).toHaveBeenCalled();
    });
  });
});

describe('Integration Tests', () => {
  it('should render multiple components together', () => {
    render(
      <>
        <TestButton>Submit</TestButton>
        <TestCard title="Card" description="Description" />
        <TestInput placeholder="Search..." />
      </>
    );

    expect(screen.getByTestId('test-button')).toBeInTheDocument();
    expect(screen.getByTestId('test-card')).toBeInTheDocument();
    expect(screen.getByTestId('test-input')).toBeInTheDocument();
  });
});