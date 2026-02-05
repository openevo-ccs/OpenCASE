import { Button } from '@/ui/shared/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/shared/components/ui/dialog'

export default function ConfirmLeaveDialog({
  open,
  onCancel,
  onLeave,
}: {
  open: boolean
  onCancel: () => void
  onLeave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => (v ? null : onCancel())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave without saving?</DialogTitle>
          <DialogDescription>
            You have unsaved changes. Later this will prompt you to save to the CASE server before leaving.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            Stay
          </Button>
          <Button variant="destructive" onClick={onLeave}>
            Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

