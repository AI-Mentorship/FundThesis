'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Difficulty = 'easy' | 'medium' | 'hard'

type Sandbox = {
  id: string
  name: string
  difficulty: Difficulty
  balance: number
  createdAt: string
}

const DIFFICULTY_BALANCE: Record<Difficulty, number> = {
  easy: 100000,
  medium: 50000,
  hard: 10000,
}

const STORAGE_KEY = 'enviro_sandboxes'

export default function EnviroPage() {
  const router = useRouter()

  const [sandboxes, setSandboxes] = useState<Sandbox[]>([])
  const [name, setName] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        setSandboxes(JSON.parse(raw))
      } else {
        // create a default sandbox if none exist
        const defaultSandbox: Sandbox = {
          id: 'default-' + Date.now(),
          name: 'Practice Sandbox',
          difficulty: 'easy',
          balance: DIFFICULTY_BALANCE.easy,
          createdAt: new Date().toISOString(),
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultSandbox]))
        setSandboxes([defaultSandbox])
      }
    } catch (e) {
      console.error('Failed to read sandboxes from localStorage', e)
    }
  }, [])

  const save = (items: Sandbox[]) => {
    setSandboxes(items)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }

  const createSandbox = () => {
    const id = Date.now().toString()
    const balance = DIFFICULTY_BALANCE[difficulty]
    const sb: Sandbox = { id, name: name || `Sandbox ${new Date().toLocaleString()}`, difficulty, balance, createdAt: new Date().toISOString() }
    const next = [sb, ...sandboxes]
    save(next)
    setName('')
    setDifficulty('easy')
    // Navigate directly into newly created sandbox
    router.push(`/enviro/enviro-dashboard?sandboxId=${encodeURIComponent(id)}`)
  }

  const openSandbox = (id: string) => {
    router.push(`/enviro/enviro-dashboard?sandboxId=${encodeURIComponent(id)}`)
  }

  const removeSandbox = (id: string) => {
    const filtered = sandboxes.filter(s => s.id !== id)
    save(filtered)
  }

  // typed-delete confirmation states for landing page
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('')
  const [selectedToDelete, setSelectedToDelete] = useState<Sandbox | null>(null)

  const promptDeleteSandbox = (id: string) => {
    const found = sandboxes.find(s => s.id === id) || null
    setSelectedToDelete(found)
    setDeleteConfirmText('')
    setShowDeleteConfirm(true)
  }

  const confirmDeleteSandbox = () => {
    if (!selectedToDelete) return
    const filtered = sandboxes.filter(s => s.id !== selectedToDelete.id)
    save(filtered)
    // also remove persisted portfolio for this sandbox
    try {
      const portRaw = localStorage.getItem('enviro_sandbox_portfolios')
      if (portRaw) {
        const map = JSON.parse(portRaw)
        delete map[selectedToDelete.id]
        localStorage.setItem('enviro_sandbox_portfolios', JSON.stringify(map))
      }
    } catch (e) {
      console.warn('failed to remove sandbox portfolio', e)
    }

    setShowDeleteConfirm(false)
    setSelectedToDelete(null)
    setDeleteConfirmText('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Sandboxes</h1>
        <p className="text-gray-600 mb-6">Create and manage playable sandboxes. Choose a difficulty to set the initial balance.</p>

        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold mb-4">Create new sandbox</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sandbox name (optional)"
              className="flex-1 border rounded px-3 py-2"
            />

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="border rounded px-3 py-2">
                <option value="easy">Easy (${DIFFICULTY_BALANCE.easy.toLocaleString()})</option>
                <option value="medium">Medium (${DIFFICULTY_BALANCE.medium.toLocaleString()})</option>
                <option value="hard">Hard (${DIFFICULTY_BALANCE.hard.toLocaleString()})</option>
              </select>
            </div>

            <div className="flex items-center">
              <button onClick={createSandbox} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded">
                Create & Open
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Your sandboxes</h2>
          <div className="space-y-4">
            {sandboxes.length === 0 && <p className="text-gray-500">No sandboxes yet.</p>}
            {sandboxes.map(sb => (
              <div key={sb.id} className="flex items-center justify-between bg-white p-4 rounded border">
                <div>
                  <div className="font-semibold">{sb.name}</div>
                  <div className="text-sm text-gray-500">{sb.difficulty} • ${sb.balance.toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openSandbox(sb.id)} className="bg-blue-600 text-white px-3 py-1 rounded">Open</button>
                    <button onClick={() => promptDeleteSandbox(sb.id)} className="bg-red-100 text-red-700 px-3 py-1 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setSelectedToDelete(null) }} />
          <div className="relative bg-white rounded-lg p-6 w-full max-w-md z-10">
            <h3 className="text-lg font-semibold mb-2">Confirm delete</h3>
            <p className="text-sm text-gray-600 mb-4">To permanently delete the sandbox <span className="font-medium">{selectedToDelete?.name}</span>, type <span className="font-mono">delete</span> below and press Confirm.</p>
            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type delete to confirm"
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setSelectedToDelete(null) }} className="px-3 py-2 rounded border">Cancel</button>
              <button
                onClick={() => { if (deleteConfirmText.trim().toLowerCase() === 'delete') { confirmDeleteSandbox() } }}
                disabled={deleteConfirmText.trim().toLowerCase() !== 'delete'}
                className={`px-3 py-2 rounded text-white ${deleteConfirmText.trim().toLowerCase() === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'}`}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}