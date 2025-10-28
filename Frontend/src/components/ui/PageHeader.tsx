import React from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  className?: string
}

export function PageHeader({ title, description, className = "" }: PageHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <h1 className="text-4xl font-bold text-gray-900 mb-1">{title}</h1>
      {description && (
        <p className="text-lg text-gray-600">{description}</p>
      )}
    </div>
  )
}

