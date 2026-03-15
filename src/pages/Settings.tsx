import { useStudyStore } from '../store/useStudyStore'
import { supabase } from '../lib/supabase'
import { Download, Upload, Trash2, RefreshCw, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'


export default function Settings() {
  const { fetchLogs, logs } = useStudyStore()
  const { user, signOut } = useAuthStore()
  const [syncing, setSyncing] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup_sde_tracker_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      try {
        const data = JSON.parse(text)
        if (!Array.isArray(data)) throw new Error('Invalid format')

        setSyncing(true)
        // Upsert all records
        for (const entry of data) {
          const { id, ...rest } = entry
          if (id) {
            await supabase.from('study_log').upsert({ id, ...rest })
          }
        }
        await fetchLogs()
        setSyncing(false)
        alert('Restore complete!')
      } catch {
        alert('Invalid backup file format')
        setSyncing(false)
      }
    }
    input.click()
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset ALL data? This cannot be undone.')) return
    if (!confirm('This will delete the entire database. Type "RESET" mentally and click OK to confirm.')) return

    setSyncing(true)
    await supabase.from('study_log').delete().neq('id', 0)
    await fetchLogs()
    setSyncing(false)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
  }

  return (
    <div className="space-y-12 max-w-3xl pb-16">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Settings & Data Vault</h1>
        <p className="text-text-secondary mt-2 text-lg">Manage your tracker data and preferences</p>
      </div>

      {/* Account Management */}
      <div className="rounded-3xl bg-bg-card border border-border p-8 space-y-5 shadow-sm">
        <h3 className="text-xl font-bold text-text-primary">Account Management</h3>
        <div className="flex items-center gap-4 bg-bg-secondary/50 p-4 rounded-2xl border border-white/5">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-text-primary">{user?.email}</div>
            <div className="text-xs text-text-muted">Personal Study Vault</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-3 px-6 py-3 rounded-xl bg-danger/10 text-danger border border-danger/30 text-base font-bold hover:bg-danger/20 transition-all disabled:opacity-50"
        >
          <LogOut className={`w-5 h-5 ${signingOut ? 'animate-pulse' : ''}`} />
          {signingOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>

      {/* Sync Status */}
      <div className="rounded-3xl bg-bg-card border border-border p-8 space-y-5 shadow-sm">
        <h3 className="text-xl font-bold text-text-primary">Database Sync</h3>
        <div className="flex items-center gap-4 bg-bg-secondary/50 p-4 rounded-2xl border border-border/50">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
          </div>
          <span className="text-base font-bold text-text-primary">Connected to Database</span>
        </div>
        <p className="text-sm font-medium text-text-muted">{logs.length} total records stored remotely</p>
        <button
          onClick={async () => { setSyncing(true); await fetchLogs(); setSyncing(false) }}
          disabled={syncing}
          className="flex items-center gap-3 px-6 py-3 rounded-xl bg-bg-primary border border-border text-base font-bold text-text-secondary hover:text-white transition-all disabled:opacity-50 hover:bg-white/5"
        >
          <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing Now...' : 'Force Manual Sync'}
        </button>
      </div>

      {/* Export / Import */}
      <div className="rounded-3xl bg-bg-card border border-border p-8 space-y-5 shadow-sm">
        <h3 className="text-xl font-bold text-text-primary">Backup & Restore</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleExport}
            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-bg-primary border border-border text-base font-bold text-text-secondary hover:text-white transition-all hover:bg-white/5"
          >
            <Download className="w-5 h-5" />
            Export to JSON
          </button>
          <button
            onClick={handleImport}
            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-bg-primary border border-border text-base font-bold text-text-secondary hover:text-white transition-all hover:bg-white/5"
          >
            <Upload className="w-5 h-5" />
            Import from JSON
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-3xl bg-danger/5 border border-danger/20 p-8 space-y-5 shadow-sm shadow-danger/5 mt-8">
        <h3 className="text-xl font-bold text-danger">Danger Zone</h3>
        <p className="text-sm font-medium text-text-muted">Permanently delete all tracker data from Supabase. This action cannot be undone and will destroy your progress.</p>
        <button
          onClick={handleReset}
          className="flex items-center gap-3 px-6 py-3 rounded-xl bg-danger/10 text-danger border border-danger/30 text-base font-bold hover:bg-danger/20 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        >
          <Trash2 className="w-5 h-5" />
          Reset All Data
        </button>
      </div>
    </div>
  )
}
