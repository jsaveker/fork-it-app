import { useEffect, useState } from 'react'
import { Box, Button, TextField, List, ListItem, IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { createSession, getOptions, addOption, updateOption, deleteOption } from '../services/optionsApi'

interface Option { id: string; name: string }

export default function LunchOptions() {
  const [options, setOptions] = useState<Option[]>([])
  const [newName, setNewName] = useState('')
  const [link, setLink] = useState('')
  const [editing, setEditing] = useState<{id:string,name:string}|null>(null)

  const load = async () => {
    setOptions(await getOptions())
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!newName) return
    await addOption(newName)
    setNewName('')
    load()
  }

  const handleUpdate = async () => {
    if (!editing) return
    await updateOption(editing.id, editing.name)
    setEditing(null)
    load()
  }

  const handleDelete = async (id: string) => {
    await deleteOption(id)
    load()
  }

  const startSession = async () => {
    const session = await createSession()
    setLink(`${window.location.origin}/vote/${session.id}`)
  }

  return (
    <Box sx={{ p:2 }}>
      <Box sx={{ display:'flex', gap:1, mb:2 }}>
        {editing ? (
          <>
            <TextField value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} />
            <Button onClick={handleUpdate}>Save</Button>
            <Button onClick={()=>setEditing(null)}>Cancel</Button>
          </>
        ) : (
          <>
            <TextField value={newName} onChange={e=>setNewName(e.target.value)} label="Add option" />
            <Button onClick={handleAdd}>Add</Button>
          </>
        )}
      </Box>
      <List>
        {options.map(o => (
          <ListItem key={o.id} secondaryAction={
            <>
              <IconButton edge="end" onClick={()=>setEditing(o)}><EditIcon /></IconButton>
              <IconButton edge="end" onClick={()=>handleDelete(o.id)}><DeleteIcon /></IconButton>
            </>
          }>
            {o.name}
          </ListItem>
        ))}
      </List>
      <Button variant="contained" onClick={startSession}>Create Voting Link</Button>
      {link && <Box sx={{ mt:2 }}><a href={link}>{link}</a></Box>}
    </Box>
  )
}
