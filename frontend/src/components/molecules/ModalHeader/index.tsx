interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

export function ModalHeader({ title, onClose }: ModalHeaderProps) {
  return (
    <div className="modal-header">
      <h2 className="modal-header__title">{title}</h2>
      <button type="button" className="modal-header__close" onClick={onClose} aria-label="Cerrar">
        ×
      </button>
    </div>
  );
}
