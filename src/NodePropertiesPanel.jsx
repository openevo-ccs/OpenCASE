import { useEffect, useMemo, useState } from 'react';

export default function NodePropertiesPanel({ node, onClose, onChangeNode }) {
  const [labelDraft, setLabelDraft] = useState('');

  useEffect(() => {
    setLabelDraft(node?.data?.label ?? '');
  }, [node?.id]); // reset when switching nodes

  useEffect(() => {
    if (!node) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [node, onClose]);

  const rows = useMemo(() => {
    if (!node) return [];
    return [
      ['id', node.id],
      ['type', node.type ?? 'default'],
      ['parentId', node.data?.parentId ?? '—'],
    ];
  }, [node]);

  const isOpen = Boolean(node);

  return (
    <>
      <aside className={`properties-panel ${isOpen ? 'open' : ''}`} aria-label="Node properties">
        <div className="properties-panel__header">
          <div className="properties-panel__title">Properties</div>
          <button type="button" className="properties-panel__close" onClick={() => onClose?.()}>
            Close
          </button>
        </div>

        {node ? (
          <div className="properties-panel__content">
            <div className="properties-panel__section">
              {rows.map(([k, v]) => (
                <div key={k} className="properties-panel__row">
                  <div className="properties-panel__key">{k}</div>
                  <div className="properties-panel__value">{String(v)}</div>
                </div>
              ))}
            </div>

            <div className="properties-panel__section">
              <label className="properties-panel__label" htmlFor="node-label">
                Label
              </label>
              <input
                id="node-label"
                className="properties-panel__input"
                value={labelDraft}
                onChange={(e) => {
                  const next = e.target.value;
                  setLabelDraft(next);
                  onChangeNode?.(node.id, { label: next });
                }}
              />
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}

