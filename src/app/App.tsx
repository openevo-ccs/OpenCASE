import { EditorProvider } from '@/ui/editor/state/EditorContext'
import EditorCanvas from '@/ui/editor/EditorCanvas'

export default function App() {
  return (
    <EditorProvider>
      <EditorCanvas />
    </EditorProvider>
  )
}

