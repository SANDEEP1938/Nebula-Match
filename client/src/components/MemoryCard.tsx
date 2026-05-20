import type { Card } from '../types/index';

interface MemoryCardProps {
  card: Card;
  onClick: () => void;
  disabled: boolean;
}

const MemoryCard = ({ card, onClick, disabled }: MemoryCardProps) => {
  const className = [
    'memory-card',
    card.flipped || card.matched ? 'flipped' : '',
    card.matched ? 'matched' : '',
    disabled ? 'disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label={card.matched || card.flipped ? card.symbol : 'Hidden card'}
    >
      <div className="card-inner">
        <div className="card-face card-back">?</div>
        <div className="card-face card-front">{card.symbol}</div>
      </div>
    </button>
  );
};

export default MemoryCard;
