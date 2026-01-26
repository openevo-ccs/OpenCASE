import { useCallback } from 'react'
import type { ChangeEvent } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { ArrowUpCircleIcon, ArrowDownCircleIcon, PlusIcon } from '@heroicons/react/24/solid'
import type { CaseItemNodeType } from '../types'

export default function CaseItemNode({ id, data }: NodeProps<CaseItemNodeType>) {
  // Defensive typing: React Flow's NodeProps typing can lag behind our node-data evolution.
  // Runtime `data` is shaped by `App.tsx` and always includes `cfItem` for CASE item nodes.
  const typedData = data as unknown as {
    cfItem?: { fullStatement?: string }
    onAddChild?: (_parentId: string) => void
    onUpdateItem?: (_nodeId: string, _patch: { fullStatement?: string; lastChangeDateTime?: string }) => void
  }

  const onChange = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    const nextValue = evt.target.value
    typedData?.onUpdateItem?.(id, { fullStatement: nextValue, lastChangeDateTime: new Date().toISOString() })
  }, [typedData, id])

  return (
    <div className="group relative border border-gray-600 rounded p-2">
      <div className=" nodrag nopan absolute right-[-25px] top-2 flex opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          type="button"
          className="grid h-[22px] w-[22px] place-items-center rounded-full border border-violet-700/90 bg-white/90 text-violet-700 shadow-sm hover:bg-violet-700/10 focus-visible:outline-2 focus-visible:outline-violet-700/50 focus-visible:outline-offset-2"
          onClick={(e) => {
            e.stopPropagation()
            typedData?.onAddChild?.(id)
          }}
          aria-label="Add child node"
          title="Add child node"
        >
          <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-1">
        <label htmlFor="text" className="block text-[11px] font-semibold text-slate-700">
          Text
        </label>
        <input
          id="text"
          name="text"
          onChange={onChange}
          value={typedData?.cfItem?.fullStatement ?? ''}
          className="nodrag w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus-visible:outline-2 focus-visible:outline-violet-700/40 focus-visible:outline-offset-2"
        />
      </div>

      <Handle
        position={Position.Top}
        type="target"
        style={{
          background: 'none',
          border: 'none',
          width: '0.9em',
          height: '0.9em',
        }}
      >
        <ArrowUpCircleIcon
          style={{
            pointerEvents: 'none',
            fontSize: '1em',
            left: 0,
            position: 'absolute',
          }}
        />
      </Handle>

      <Handle
        position={Position.Bottom}
        type="source"
        style={{
          background: 'none',
          border: 'none',
          width: '1em',
          height: '1em',
        }}
      >
        <ArrowDownCircleIcon
          style={{
            pointerEvents: 'none',
            fontSize: '1em',
            left: 0,
            position: 'absolute',
          }}
        />
      </Handle>
    </div>
  )
}

