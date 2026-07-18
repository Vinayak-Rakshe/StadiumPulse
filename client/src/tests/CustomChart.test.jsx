import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomChart from '../components/CustomChart';

describe('CustomChart Component', () => {
  const mockData = [
    {
      _id: '1',
      name: 'Gate 1',
      type: 'Gate',
      capacity: 1000,
      currentOccupancy: 300,
      density: 30
    },
    {
      _id: '2',
      name: 'Zone B',
      type: 'Zone',
      capacity: 2000,
      currentOccupancy: 1800,
      density: 90
    }
  ];

  it('renders without crashing', () => {
    render(<CustomChart data={mockData} />);
    
    // Check if the container element with role 'img' is present
    const chartImg = screen.getByRole('img');
    expect(chartImg).toBeInTheDocument();
  });

  it('contains the screen-reader accessible alternative table', () => {
    render(<CustomChart data={mockData} />);
    
    // Check if the visually hidden table exists in DOM with accessibility contents
    const heading = screen.getByRole('heading', { level: 3, name: /live zone density table/i });
    expect(heading).toBeInTheDocument();

    // Verify cell contents are outputted
    expect(screen.getByText('Gate 1')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('Zone B')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });
});
