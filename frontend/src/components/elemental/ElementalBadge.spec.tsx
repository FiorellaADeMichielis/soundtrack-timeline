import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ElementalBadge } from './ElementalBadge';

describe('ElementalBadge', () => {
  it('renderiza correctamente el arquetipo fuego con su nombre', () => {
    render(<ElementalBadge element="fuego" />);

    expect(screen.getByTestId('element-badge-fuego')).toBeInTheDocument();
    expect(screen.getByText(/arquetipo fuego/i)).toBeInTheDocument();
  });

  it('muestra el porcentaje de dominancia cuando se especifica', () => {
    render(<ElementalBadge element="aire" dominancePercentage={72.4} />);

    expect(screen.getByTestId('element-badge-aire')).toBeInTheDocument();
    expect(screen.getByText('72.4%')).toBeInTheDocument();
    expect(screen.getByText(/arquetipo aire/i)).toBeInTheDocument();
  });

  it('renderiza los otros arquetipos (tierra y agua)', () => {
    const { rerender } = render(<ElementalBadge element="tierra" />);
    expect(screen.getByText(/arquetipo tierra/i)).toBeInTheDocument();

    rerender(<ElementalBadge element="agua" />);
    expect(screen.getByText(/arquetipo agua/i)).toBeInTheDocument();
  });
});
