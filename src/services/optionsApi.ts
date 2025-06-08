const API_BASE = import.meta.env.VITE_API_URL || 'https://api.fork-it.cc'

export async function getOptions() {
  const res = await fetch(`${API_BASE}/options`)
  return res.json()
}

export async function addOption(name: string) {
  const res = await fetch(`${API_BASE}/options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  })
  return res.json()
}

export async function updateOption(id: string, name: string) {
  const res = await fetch(`${API_BASE}/options/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  })
  return res.json()
}

export async function deleteOption(id: string) {
  const res = await fetch(`${API_BASE}/options/${id}`, { method: 'DELETE' })
  return res.json()
}

export async function createSession() {
  const res = await fetch(`${API_BASE}/sessions`, { method: 'POST' })
  return res.json()
}

export async function vote(sessionId: string, optionId: string, userId: string) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optionId, userId })
  })
  return res.json()
}

export async function getResults(sessionId: string) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/results`)
  return res.json()
}
