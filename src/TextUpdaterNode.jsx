import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ArrowLeftCircleIcon, ArrowRightCircleIcon, PlusIcon } from '@heroicons/react/24/solid';
 
function TextUpdaterNode({ id, data }) {
  const onChange = useCallback((evt) => {
    const nextValue = evt.target.value;
    console.log(nextValue);
  }, []);
 
  return (
    <div className="text-updater-node">
      <div className="text-updater-inline-toolbar nodrag nopan" role="toolbar" aria-label="Node actions">
        <button
          type="button"
          className="text-updater-inline-toolbar__btn"
          onClick={(e) => {
            e.stopPropagation();
            data?.onAddChild?.(id);
          }}
          aria-label="Add child node"
          title="Add child node"
        >
          <PlusIcon className="text-updater-inline-toolbar__icon" aria-hidden="true" />
        </button>
      </div>
      <div>
        <label htmlFor="text">Text:</label>
        <input id="text" name="text" onChange={onChange} className="nodrag" />
      </div>
      <Handle
        position={Position.Left}
        type="target"
        style={{
          background: 'none',
          border: 'none',
          width: '0.9em',
          height: '0.9em',
        }}
      >
        <ArrowLeftCircleIcon
          style={{
            pointerEvents: 'none',
            fontSize: '1em',
            left: 0,
            position: 'absolute',
          }}
        />
      </Handle>
      <Handle
        position={Position.Right}
        type="source"
        style={{
          background: 'none',
          border: 'none',
          width: '1em',
          height: '1em',
        }}
      >
        <ArrowRightCircleIcon
          style={{
            pointerEvents: 'none',
            fontSize: '1em',
            left: 0,
            position: 'absolute',
          }}
        />
      </Handle>
    </div>
  );
}
 
export default TextUpdaterNode;