import { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ColumnDefinition, ColumnState } from '../../types/columns';

interface Props {
  show: boolean;
  onHide: () => void;
  definitions: ColumnDefinition[];
  states: ColumnState[];
  onSave: (states: ColumnState[]) => void;
  onReset: () => void;
}

interface RowProps {
  state: ColumnState;
  definition: ColumnDefinition;
  onToggleVisible: (key: string) => void;
  onChangeWidth: (key: string, width: number) => void;
}

function SortableRow({ state, definition, onToggleVisible, onChangeWidth }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: state.key });

  const isSticky = definition.sticky === true;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#f0f9ff' : 'white',
  };

  return (
    <div ref={setNodeRef} style={style} className="d-flex align-items-center gap-2 p-2 border-bottom">
      <span
        style={{ cursor: isSticky ? 'not-allowed' : 'grab', fontSize: 18, color: '#94a3b8', userSelect: 'none', padding: '0 4px' }}
        title={isSticky ? 'Bu sütun sabittir' : 'Sürükleyerek sıralayın'}
        {...(isSticky ? {} : { ...attributes, ...listeners })}
      >≡</span>

      <Form.Check
        type="checkbox"
        id={`col-vis-${state.key}`}
        checked={state.visible}
        disabled={isSticky}
        onChange={() => onToggleVisible(state.key)}
      />

      <label
        htmlFor={`col-vis-${state.key}`}
        className="flex-grow-1 mb-0"
        style={{ cursor: isSticky ? 'default' : 'pointer', userSelect: 'none', fontSize: 13 }}
      >
        {definition.label}
        {definition.isDynamic && <small className="text-muted ms-2" style={{ fontSize: 11 }}>(Kategori sorusu)</small>}
        {isSticky && <small className="text-warning ms-2" style={{ fontSize: 11 }}>(Sabit)</small>}
      </label>

      <InputGroup size="sm" style={{ width: 140 }}>
        <Button variant="outline-secondary" style={{ padding: '0 8px' }}
          onClick={() => onChangeWidth(state.key, Math.max(definition.minWidth ?? 60, state.width - 20))}>−</Button>
        <Form.Control
          type="number" value={state.width}
          min={definition.minWidth ?? 60} max={600}
          style={{ textAlign: 'center' }}
          onChange={e => onChangeWidth(state.key, parseInt(e.target.value) || (definition.minWidth ?? 60))}
        />
        <InputGroup.Text style={{ padding: '0 6px', fontSize: 11 }}>px</InputGroup.Text>
        <Button variant="outline-secondary" style={{ padding: '0 8px' }}
          onClick={() => onChangeWidth(state.key, Math.min(600, state.width + 20))}>+</Button>
      </InputGroup>
    </div>
  );
}

export default function ColumnManager({ show, onHide, definitions, states, onSave, onReset }: Props) {
  const [draft, setDraft] = useState<ColumnState[]>(states);

  useEffect(() => {
    if (show) setDraft([...states].sort((a, b) => a.order - b.order));
  }, [show, states]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = draft.findIndex(d => d.key === active.id);
    const newIdx = draft.findIndex(d => d.key === over.id);
    const activeDef = definitions.find(d => d.key === active.id);
    const overDef = definitions.find(d => d.key === over.id);
    if (activeDef?.sticky || overDef?.sticky) return;
    setDraft(arrayMove(draft, oldIdx, newIdx).map((d, i) => ({ ...d, order: i })));
  };

  const toggleVisible = (key: string) => setDraft(d => d.map(s => s.key === key ? { ...s, visible: !s.visible } : s));
  const changeWidth = (key: string, width: number) => setDraft(d => d.map(s => s.key === key ? { ...s, width } : s));

  const handleSave = () => { onSave(draft); onHide(); };

  const handleReset = () => {
    if (window.confirm('Tüm sütun ayarları varsayılana dönecek. Emin misiniz?')) { onReset(); onHide(); }
  };

  const visibleCount = draft.filter(d => d.visible).length;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Sütunları Yönet</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '60vh' }}>
        <div className="alert alert-info py-2 mb-3" style={{ fontSize: 13 }}>
          <strong>{visibleCount}</strong> sütun görünür. Sıralamak için sürükleyin, genişliği ayarlayın.
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={draft.map(d => d.key)} strategy={verticalListSortingStrategy}>
            <div className="border rounded">
              {draft.map(state => {
                const def = definitions.find(d => d.key === state.key);
                if (!def) return null;
                return (
                  <SortableRow key={state.key} state={state} definition={def}
                    onToggleVisible={toggleVisible} onChangeWidth={changeWidth} />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="outline-danger" onClick={handleReset}>Varsayılana Dön</Button>
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={onHide}>İptal</Button>
          <Button variant="primary" onClick={handleSave}>Kaydet</Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
