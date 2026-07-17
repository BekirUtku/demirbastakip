import { Modal, Button } from 'react-bootstrap';

interface Props {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmVariant?: string;
  loading?: boolean;
}

export default function ConfirmModal({
  show, title, message, onConfirm, onCancel,
  confirmText = 'ONAYLA', confirmVariant = 'danger', loading = false
}: Props) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title.toUpperCase()}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p style={{ margin: 0 }}>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          İPTAL
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
          {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
