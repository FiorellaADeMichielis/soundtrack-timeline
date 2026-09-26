import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '../../stores/useAppStore';
import { DemoProfileSelector } from './DemoProfileSelector';

describe('DemoProfileSelector', () => {
  beforeEach(() => {
    useAppStore.getState().resetToDemo();
  });

  it('renderiza el selector con los 3 perfiles de demostración', () => {
    render(<DemoProfileSelector />);

    expect(
      screen.getByRole('navigation', { name: /selector de perfiles de demostración/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/post-punk & dark wave/i)).toBeInTheDocument();
    expect(screen.getByText(/synthwave & cyberpunk/i)).toBeInTheDocument();
    expect(screen.getByText(/indie folk & acústica orgánica/i)).toBeInTheDocument();
  });

  it('marca como activo (aria-pressed="true") el perfil inicial post-punk', () => {
    render(<DemoProfileSelector />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);

    const postPunkButton = buttons[0];
    const synthwaveButton = buttons[1];
    const indieFolkButton = buttons[2];

    expect(postPunkButton).toHaveAttribute('aria-pressed', 'true');
    expect(synthwaveButton).toHaveAttribute('aria-pressed', 'false');
    expect(indieFolkButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('permite cambiar a synthwave al hacer clic y actualiza el store y atributos ARIA', () => {
    render(<DemoProfileSelector />);

    const synthwaveButton = screen.getByRole('button', { name: /synthwave & cyberpunk/i });
    fireEvent.click(synthwaveButton);

    expect(useAppStore.getState().activeProfileId).toBe('synthwave');
    expect(useAppStore.getState().activeElement).toBe('aire');

    expect(synthwaveButton).toHaveAttribute('aria-pressed', 'true');
    const postPunkButton = screen.getByRole('button', { name: /post-punk & dark wave/i });
    expect(postPunkButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('permite cambiar a indie-folk al hacer clic', () => {
    render(<DemoProfileSelector />);

    const indieFolkButton = screen.getByRole('button', { name: /indie folk & acústica orgánica/i });
    fireEvent.click(indieFolkButton);

    expect(useAppStore.getState().activeProfileId).toBe('indie-folk');
    expect(useAppStore.getState().activeElement).toBe('tierra');
    expect(indieFolkButton).toHaveAttribute('aria-pressed', 'true');
  });
});
