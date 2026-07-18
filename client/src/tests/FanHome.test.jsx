import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FanHome from '../pages/FanHome';

// Mock API module
vi.mock('../utils/api', () => {
  return {
    default: {
      get: vi.fn().mockImplementation((url) => {
        if (url === '/crowd/zones') {
          return Promise.resolve({
            data: {
              success: true,
              data: [
                { _id: '1', name: 'Gate 1', type: 'Gate', accessibleFeatures: [] },
                { _id: '2', name: 'Block 101', type: 'SeatBlock', accessibleFeatures: [] }
              ]
            }
          });
        }
        if (url === '/crowd/matches') {
          return Promise.resolve({
            data: {
              success: true,
              data: [
                { _id: '1', teams: 'USA vs England', date: '2026-07-16', time: '20:00', status: 'Live' }
              ]
            }
          });
        }
        return Promise.resolve({ data: { success: true, data: [] } });
      }),
      post: vi.fn().mockResolvedValue({ data: { success: true, data: {} } })
    }
  };
});

describe('FanHome Page Component', () => {
  it('renders welcome banner and section headers', async () => {
    render(<FanHome />);
    
    // Check for main headline
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent(/FIFA World Cup 2026/i);

    // Check for matchday schedule header
    expect(screen.getByText('Live Matches & Schedule')).toBeInTheDocument();
    
    // Check for Stadium Router section
    expect(screen.getByText('Stadium Router')).toBeInTheDocument();
  });

  it('renders start and destination selectors', () => {
    render(<FanHome />);

    // Start location select field
    const startSelect = screen.getByLabelText(/Where are you\?/i);
    expect(startSelect).toBeInTheDocument();

    // Destination select field
    const endSelect = screen.getByLabelText(/Where is your ticket\?/i);
    expect(endSelect).toBeInTheDocument();
  });
});
