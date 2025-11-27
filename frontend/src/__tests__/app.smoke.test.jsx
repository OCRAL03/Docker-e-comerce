import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';

describe('App smoke', () => {
  it('renders with title', () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getByText('Proyecto')).toBeTruthy();
  });
});
