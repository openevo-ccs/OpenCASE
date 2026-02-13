import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/ui/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/shared/components/ui/dialog'
import { Input } from '@/ui/shared/components/ui/input'
import { Label } from '@/ui/shared/components/ui/label'
import { TrashIcon, ClipboardDocumentIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/outline'
import type { CaseApiClient, ApiKeySummary } from '@/infrastructure/caseApi/CaseApiClient'

// ── Clipboard helper ─────────────────────────────────────────────

function CopyButton({ text }: Readonly<{ text: string }>) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(() => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  return (
    <button
      type="button"
      onClick={copy}
      className="ml-1 inline-flex shrink-0 items-center rounded p-1 text-gray-400 hover:text-gray-600"
      title="Copy to clipboard"
    >
      {copied
        ? <CheckIcon className="h-4 w-4 text-green-500" />
        : <ClipboardDocumentIcon className="h-4 w-4" />}
    </button>
  )
}

// ── Main dialog ──────────────────────────────────────────────────

export default function ApiKeysDialog({
  open,
  onClose,
  api,
  tenantId,
  tokenEndpoint,
}: Readonly<{
  open: boolean
  onClose: () => void
  api: CaseApiClient
  tenantId: string
  /** Keycloak token endpoint URL shown as a usage hint. */
  tokenEndpoint: string
}>) {
  // ── State ────────────────────────────────────────────────────
  const [keys, setKeys] = useState<ApiKeySummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create form
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  // Newly created secret (shown once)
  const [created, setCreated] = useState<{ clientId: string; clientSecret: string } | null>(null)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<ApiKeySummary | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ── Load keys ────────────────────────────────────────────────
  const loadKeys = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.listApiKeys({ tenantId })
      setKeys(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [api, tenantId])

  useEffect(() => {
    if (open) void loadKeys()
  }, [open, loadKeys])

  // ── Create ───────────────────────────────────────────────────
  const handleCreate = useCallback(async () => {
    setCreating(true)
    setError(null)
    try {
      const result = await api.createApiKey({ tenantId, description: description.trim() })
      setCreated({ clientId: result.clientId, clientSecret: result.clientSecret })
      setDescription('')
      // Refresh the list in the background
      void loadKeys()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setCreating(false)
    }
  }, [api, tenantId, description, loadKeys])

  // ── Delete ───────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setError(null)
    try {
      await api.deleteApiKey({ tenantId, keyId: deleteTarget.id })
      setDeleteTarget(null)
      void loadKeys()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setDeleting(false)
    }
  }, [api, tenantId, deleteTarget, loadKeys])

  // ── Reset transient state when dialog closes ─────────────────
  const handleClose = useCallback(() => {
    setCreated(null)
    setDeleteTarget(null)
    setDescription('')
    setError(null)
    onClose()
  }, [onClose])

  return (
    <>
      {/* ── Main API Keys dialog ──────────────────────────────── */}
      <Dialog open={open && !deleteTarget} onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>API Keys</DialogTitle>
            <DialogDescription>
              Create client credentials so external systems can consume your CASE frameworks
              via the Provider API using OAuth2 <code className="text-xs">client_credentials</code> grant.
            </DialogDescription>
          </DialogHeader>

          {/* Error banner */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* ── Newly created secret (shown once) ──────────── */}
          {created && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="mb-3 text-sm font-medium text-green-800">
                API key created — copy the secret now, it will not be shown again.
              </p>

              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-gray-500">Client ID</span>
                  <div className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1.5 font-mono text-xs text-gray-800">
                    <span className="flex-1 select-all break-all">{created.clientId}</span>
                    <CopyButton text={created.clientId} />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-gray-500">Client Secret</span>
                  <div className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1.5 font-mono text-xs text-gray-800">
                    <span className="flex-1 select-all break-all">{created.clientSecret}</span>
                    <CopyButton text={created.clientSecret} />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-gray-500">Token Endpoint</span>
                  <div className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1.5 font-mono text-xs text-gray-800">
                    <span className="flex-1 select-all break-all">{tokenEndpoint}</span>
                    <CopyButton text={tokenEndpoint} />
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setCreated(null)}
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* ── Existing keys list ─────────────────────────── */}
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {loading && keys.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400">Loading...</p>
            )}

            {!loading && keys.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400">
                No API keys yet. Create one below.
              </p>
            )}

            {keys.map((k) => (
              <div
                key={k.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs text-gray-700">{k.clientId}</p>
                  {k.description && (
                    <p className="mt-0.5 text-xs text-gray-400">{k.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  title="Delete API key"
                  onClick={() => setDeleteTarget(k)}
                  className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:text-red-500"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* ── Create form ────────────────────────────────── */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="grid gap-2">
              <Label htmlFor="apikey_desc" className="text-xs font-medium text-gray-600">
                Description (optional)
              </Label>
              <Input
                id="apikey_desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. LMS integration, analytics pipeline"
                className="text-sm"
              />
            </div>
            <Button
              size="sm"
              className="mt-3"
              disabled={creating}
              onClick={() => void handleCreate()}
            >
              <PlusIcon className="h-4 w-4" aria-hidden />
              {creating ? 'Creating...' : 'Create API Key'}
            </Button>
          </div>

          {/* ── Usage hint ─────────────────────────────────── */}
          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer select-none font-medium hover:text-gray-600">
              How to use an API key
            </summary>
            <div className="mt-2 space-y-2 rounded border border-gray-100 bg-gray-50 p-3 font-mono leading-relaxed">
              <p className="font-sans text-gray-500">
                Request an access token using the <code>client_credentials</code> grant:
              </p>
              <pre className="overflow-x-auto whitespace-pre-wrap text-[11px] text-gray-600">{
                `curl -X POST ${tokenEndpoint} \\\n` +
                '  -d grant_type=client_credentials \\\n' +
                '  -d client_id=YOUR_CLIENT_ID \\\n' +
                '  -d client_secret=YOUR_CLIENT_SECRET'
              }</pre>
              <p className="font-sans text-gray-500">
                Then use the token as a Bearer header on CASE API requests.
              </p>
            </div>
          </details>

          <DialogFooter>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation dialog ────────────────────────── */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the API key{' '}
              <code className="text-xs">{deleteTarget?.clientId}</code>?
              Any external system using this key will immediately lose access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
