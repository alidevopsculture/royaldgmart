'use client'

import { Plus, X } from "lucide-react"
import { useState, Dispatch, SetStateAction } from "react"
import { Button } from "../ui/button"

interface SizeSelectionProps {
  selectedSizes: string[]
  setSelectedSizes: Dispatch<SetStateAction<string[]>>
}

export default function SizeSelection({ selectedSizes, setSelectedSizes }: SizeSelectionProps) {
  const [availableSizes] = useState(['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'])

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size))
    } else {
      setSelectedSizes([...selectedSizes, size])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {availableSizes.map((size) => (
        <Button
          key={size}
          type="button"
          variant={selectedSizes.includes(size) ? "default" : "outline"}
          size="sm"
          onClick={() => toggleSize(size)}
          className={`${selectedSizes.includes(size) ? 'bg-blue-600 text-white' : ''}`}
        >
          {size}
        </Button>
      ))}
    </div>
  )
}