import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Place } from '../types';
import { SearchBar } from './SearchBar';

const paris: Place = {
  id: '2988507',
  name: 'Paris',
  latitude: 48.85341,
  longitude: 2.3488,
  country: 'France',
  admin1: 'Île-de-France',
};

const london: Place = {
  id: '2643743',
  name: 'London',
  latitude: 51.50853,
  longitude: -0.12574,
  country: 'United Kingdom',
  admin1: 'England',
};

function setup(results: Place[] = [paris, london]) {
  const searchFn = vi.fn().mockResolvedValue(results);
  const onSelect = vi.fn();
  const user = userEvent.setup();
  render(<SearchBar onSelect={onSelect} searchFn={searchFn} debounceMs={0} />);
  const input = screen.getByRole('combobox', { name: /search for a city/i });
  return { user, input, searchFn, onSelect };
}

describe('SearchBar', () => {
  it('has an accessible name and starts empty', () => {
    const { input } = setup();
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not search for queries shorter than two characters', async () => {
    const { user, input, searchFn } = setup();
    await user.type(input, 'P');
    await new Promise((r) => setTimeout(r, 20));
    expect(searchFn).not.toHaveBeenCalled();
  });

  it('debounces typing into a single search and shows suggestions', async () => {
    const { user, input, searchFn } = setup();
    await user.type(input, 'Paris');

    await waitFor(() => expect(searchFn).toHaveBeenLastCalledWith('Paris'));
    expect(await screen.findByRole('option', { name: /paris/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /london/i })).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('2 results');
  });

  it('selects a suggestion with the mouse and clears the input', async () => {
    const { user, input, onSelect } = setup();
    await user.type(input, 'Par');
    await user.click(await screen.findByRole('option', { name: /paris/i }));

    expect(onSelect).toHaveBeenCalledWith(paris);
    expect(input).toHaveValue('');
  });

  it('supports keyboard navigation with arrows, Enter and Escape', async () => {
    const { user, input, onSelect } = setup();
    await user.type(input, 'Lon');
    await screen.findByRole('option', { name: /paris/i });

    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByRole('option', { name: /london/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(london);
  });

  it('closes the suggestion list on Escape and then clears the query', async () => {
    const { user, input } = setup();
    await user.type(input, 'Par');
    await screen.findByRole('option', { name: /paris/i });

    await user.keyboard('{Escape}');
    expect(input).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard('{Escape}');
    expect(input).toHaveValue('');
  });

  it('tells the user when no city matches', async () => {
    const { user, input } = setup([]);
    await user.type(input, 'Zzyzx');
    expect(await screen.findByText(/no cities found for “zzyzx”/i)).toBeInTheDocument();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('shows an alert when the request fails', async () => {
    const searchFn = vi.fn().mockRejectedValue(new Error('Could not reach the weather service.'));
    const user = userEvent.setup();
    render(<SearchBar onSelect={vi.fn()} searchFn={searchFn} debounceMs={0} />);
    await user.type(screen.getByRole('combobox'), 'Par');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not reach the weather service.',
    );
  });
});
