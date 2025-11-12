import React from 'react'

interface IndexCardProps {
  color: string
  name: string
  description: string
  className?: string
}

export function IndexCard({ color, name, description, className = "" }: IndexCardProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <div>
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  )
}

