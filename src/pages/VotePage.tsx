import { useEffect, useState } from 'react'
import { Box, Button, List, ListItem, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import { getOptions, vote, getResults } from '../services/optionsApi'

interface Option { id: string; name: string }

export default function VotePage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [options, setOptions] = useState<Option[]>([])
  const [results, setResults] = useState<Record<string, number>>({})
  const [voted, setVoted] = useState(false)
  const userId = ((): string => {
    const existing = localStorage.getItem('voteUserId')
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem('voteUserId', id)
    return id
  })()

  useEffect(() => {
    getOptions().then(setOptions)
    const load = async () => {
      if (sessionId) setResults(await getResults(sessionId))
    }
    load()
    const int = setInterval(load, 5000)
    return () => clearInterval(int)
  }, [sessionId])

  const handleVote = async (optionId: string) => {
    if (!sessionId || voted) return
    const res = await vote(sessionId, optionId, userId)
    if (!('error' in res)) {
      setVoted(true)
      setResults(res.votes || {})
      localStorage.setItem('voted:' + sessionId, 'true')
    }
  }

  return (
    <Box sx={{ p:2 }}>
      <Typography variant="h6" gutterBottom>Vote for lunch</Typography>
      <List>
        {options.map(o => (
          <ListItem key={o.id}>
            <Button variant="outlined" onClick={()=>handleVote(o.id)} disabled={voted}>{o.name}</Button>
            <Box sx={{ ml:2 }}>{results[o.id] || 0}</Box>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
