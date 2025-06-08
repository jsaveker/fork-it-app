import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { GroupSession } from '../types'

interface ResultsChartProps {
  session: GroupSession | null
}

export const ResultsChart: React.FC<ResultsChartProps> = ({ session }) => {
  if (!session || !session.restaurants) {
    return null
  }

  const data = session.restaurants.map(r => {
    const vote = session.votes?.find(v => v.restaurantId === r.id)
    return {
      name: r.name,
      upvotes: Array.isArray(vote?.upvotes) ? vote?.upvotes.length : 0,
      downvotes: Array.isArray(vote?.downvotes) ? vote?.downvotes.length : 0
    }
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={60} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="upvotes" fill="#4caf50" name="Upvotes" />
        <Bar dataKey="downvotes" fill="#f44336" name="Downvotes" />
      </BarChart>
    </ResponsiveContainer>
  )
}
