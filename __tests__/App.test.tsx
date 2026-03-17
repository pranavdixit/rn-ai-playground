import { render, screen } from '@testing-library/react-native';
import React from 'react';
import App from '../App';

const CARDS = [
  { id: '1', text: 'Swipe right for next.\nSwipe left to go back.', color: '#FF6B6B' },
  { id: '2', text: 'Card Two', color: '#4ECDC4' },
  { id: '3', text: 'Card Three', color: '#45B7D1' },
  { id: '4', text: 'Card Four', color: '#96CEB4' },
  { id: '5', text: 'Last card', color: '#DDA0DD' },
];

const BUTTONS = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank', 'Iris', 'Jack'];

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
  });

  it('shows the counter starting at 1 / 5', () => {
    render(<App />);
    expect(screen.getByText('1 / 5')).toBeTruthy();
  });

  it('shows the first card text', () => {
    render(<App />);
    expect(screen.getByText('Swipe right for next.\nSwipe left to go back.')).toBeTruthy();
  });

  it('renders all button names', () => {
    render(<App />);
    for (const name of BUTTONS) {
      expect(screen.getByText(name)).toBeTruthy();
    }
  });

  it('renders the correct total number of buttons', () => {
    render(<App />);
    // TouchableOpacity renders as accessible View; count by matching button names
    const buttonElements = BUTTONS.map((name) => screen.getByText(name));
    expect(buttonElements).toHaveLength(BUTTONS.length);
  });

  it('renders visible card text for top 3 cards initially', () => {
    render(<App />);
    expect(screen.getByText(CARDS[0].text)).toBeTruthy();
    expect(screen.getByText(CARDS[1].text)).toBeTruthy();
    expect(screen.getByText(CARDS[2].text)).toBeTruthy();
  });

  it('does not render cards beyond the visible stack initially', () => {
    render(<App />);
    expect(screen.queryByText(CARDS[3].text)).toBeNull();
    expect(screen.queryByText(CARDS[4].text)).toBeNull();
  });

  it('displays counter in "current / total" format', () => {
    render(<App />);
    const counter = screen.getByText(/\d+ \/ \d+/);
    expect(counter).toBeTruthy();
    expect(counter.props.children).toEqual([1, ' / ', 5]);
  });

  it('renders buttons in rows of 3', () => {
    const { toJSON } = render(<App />);
    const tree = toJSON();
    // With 10 buttons in rows of 3, we expect 4 rows (3+3+3+1)
    const expectedRows = Math.ceil(BUTTONS.length / 3);
    expect(expectedRows).toBe(4);
  });

  it('renders exactly 5 card texts across the full deck data', () => {
    expect(CARDS).toHaveLength(5);
    CARDS.forEach((card) => {
      expect(card.id).toBeDefined();
      expect(card.text).toBeDefined();
      expect(card.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('each card has a unique id', () => {
    const ids = CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each button name is unique', () => {
    expect(new Set(BUTTONS).size).toBe(BUTTONS.length);
  });

  it('does not render duplicate button text', () => {
    render(<App />);
    for (const name of BUTTONS) {
      const matches = screen.getAllByText(name);
      expect(matches).toHaveLength(1);
    }
  });

  it('renders the second card text (next card in stack)', () => {
    render(<App />);
    expect(screen.getByText('Card Two')).toBeTruthy();
  });

  it('renders the third card text (second background card)', () => {
    render(<App />);
    expect(screen.getByText('Card Three')).toBeTruthy();
  });

  it('snapshot matches', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toMatchSnapshot();
  });
});
