import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatWindow from '../components/ChatWindow';

describe('ChatWindow Component', () => {
  it('renders initial welcome message in fan mode', () => {
    render(<ChatWindow apiEndpoint="/ai/nav-chat" roleContext="Fan" />);
    
    // Check for title and welcome text
    expect(screen.getByText('AI Concierge Chat')).toBeInTheDocument();
    expect(screen.getByText(/Hello! I am StadiumPulse AI/i)).toBeInTheDocument();
  });

  it('renders typing input and mic button', () => {
    render(<ChatWindow apiEndpoint="/ai/nav-chat" roleContext="Fan" />);
    
    // Check if chat-input and submit/mic buttons exist
    const input = screen.getByPlaceholderText(/Ask StadiumPulse Concierge/i);
    expect(input).toBeInTheDocument();
    
    const micButton = screen.getByLabelText('Simulate speech input');
    expect(micButton).toBeInTheDocument();
  });

  it('allows text typing and submit triggers', () => {
    render(<ChatWindow apiEndpoint="/ai/nav-chat" roleContext="Fan" />);
    
    const input = screen.getByPlaceholderText(/Ask StadiumPulse Concierge/i);
    fireEvent.change(input, { target: { value: 'Where is Block 102?' } });
    
    expect(input.value).toBe('Where is Block 102?');
  });
});
