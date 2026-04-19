import { Button } from './Button';
import { Modal } from './Modal';

export function ConfirmDialog({
  isOpen,
  title = 'Confirmar acción',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onClose
}) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose} size="sm">
      <div className="flex flex-col gap-5">
        <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
