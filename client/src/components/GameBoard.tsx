import type { Card } from '../types/index';
import MemoryCard from './MemoryCard';

interface GameBoardProps {
  cards: Card[];
  cols: number;
  onCardClick: (index: number) => void;
  lockBoard: boolean;
}

const GameBoard = ({ cards, cols, onCardClick, lockBoard }: GameBoardProps) => (
  <div
    className="game-board panel"
    style={{ gridTemplateColumns: `repeat(${cols}, minmax(72px, 110px))` }}
  >
    {cards.map((card, index) => (
      <MemoryCard
        key={card.id}
        card={card}
        disabled={lockBoard || card.matched}
        onClick={() => onCardClick(index)}
      />
    ))}
  </div>
);

export default GameBoard;
