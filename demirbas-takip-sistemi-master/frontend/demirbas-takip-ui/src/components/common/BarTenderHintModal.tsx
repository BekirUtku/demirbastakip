import { Modal, Button, Form } from 'react-bootstrap';
import { useState } from 'react';

interface Props {
  show: boolean;
  onClose: () => void;
}

export default function BarTenderHintModal({ show, onClose }: Props) {
  const [dontShow, setDontShow] = useState(false);

  const handleClose = () => {
    if (dontShow) localStorage.setItem('hideBarTenderHint', 'true');
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>BarTender ile Yazdirma</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>CSV dosyasi basariyla indirildi. Simdi:</p>
        <ol>
          <li>BarTender uygulamasini acin</li>
          <li>Daha once hazirlanmis <strong>demirbas_etiket.btw</strong> sablonunu acin</li>
          <li>Sablon CSV'yi otomatik olarak okuyacak ve etiketleri TSC yaziciya gonderecek</li>
          <li><strong>Print</strong> (Ctrl+P) ile yazdiriniz</li>
        </ol>
        <div className="alert alert-info mt-3 mb-0">
          <strong>Ipucu:</strong> BarTender sablonu CSV'yi her acilista yeniden okur.
          Indirilen son CSV her zaman gecerli olacaktir.
        </div>
        <Form.Check
          type="checkbox"
          label="Bu uyariyi bir daha gosterme"
          checked={dontShow}
          onChange={e => setDontShow(e.target.checked)}
          className="mt-3"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>Tamam</Button>
      </Modal.Footer>
    </Modal>
  );
}
