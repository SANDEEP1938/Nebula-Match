interface WinModalProps {
  score: number;
  moves: number;
  timeSeconds: number;
  onPlayAgain: () => void;
  submitting: boolean;
}

const WinModal = ({ score, moves, timeSeconds, onPlayAgain, submitting }: WinModalProps) => (
  <div className="win-overlay" role="dialog" aria-modal="true">
    <div className="win-panel panel">
      <h2>Mission Complete</h2>
      <p>
        Score: <strong>{score}</strong> · Moves: {moves} · Time: {timeSeconds}s
      </p>
      <div className="win-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onPlayAgain}
          disabled={submitting}
        >
          {submitting ? 'Saving...' : 'Play Again'}
        </button>
      </div>
    </div>
  </div>
);

export default WinModal;
