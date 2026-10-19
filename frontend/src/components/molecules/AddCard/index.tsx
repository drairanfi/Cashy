interface AddCardProps {
  title: string;
  hint: string;
  onClick: () => void;
}

export function AddCard({ title, hint, onClick }: AddCardProps) {
  return (
    <button type="button" className="add-card" onClick={onClick}>
      <span className="add-card__icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </span>
      <span className="add-card__texts">
        <span className="add-card__title">{title}</span>
        <span className="add-card__hint">{hint}</span>
      </span>
    </button>
  );
}
