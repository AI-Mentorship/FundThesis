import React from 'react'

interface ESGCardProps {
  letter: string
  title: string
  description: string
  color?: string
}

export const ESGCard: React.FC<ESGCardProps> = ({ letter, title, description, color }) => {
  return (
    <div className="border rounded-xl shadow-sm hover:shadow-md transition p-6 bg-white">
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 ${color} font-bold text-lg`}>
          {letter}
        </div>
        <h3 className="ml-4 text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
