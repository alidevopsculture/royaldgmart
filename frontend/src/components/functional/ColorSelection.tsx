'use client'

import { Plus, X } from "lucide-react"
import { useState, Dispatch, SetStateAction } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

interface ColorOption {
  color: string
  combination_price: number
}

interface ColorSelectionProps {
  selectedColors: ColorOption[]
  setSelectedColors: Dispatch<SetStateAction<ColorOption[]>>
}

export default function ColorSelection({ selectedColors, setSelectedColors }: ColorSelectionProps) {
  const [newColor, setNewColor] = useState('')
  const [newPrice, setNewPrice] = useState(0)

  const addColor = () => {
    if (newColor.trim()) {
      setSelectedColors([...selectedColors, { color: newColor.trim(), combination_price: newPrice }])
      setNewColor('')
      setNewPrice(0)
    }
  }

  const removeColor = (index: number) => {
    setSelectedColors(selectedColors.filter((_, i) => i !== index))
  }

  const updateColorPrice = (index: number, price: number) => {
    const updated = [...selectedColors]
    updated[index].combination_price = price
    setSelectedColors(updated)
  }

  return (
    <div className="space-y-4">
      {/* Add new color */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            placeholder="Enter color (e.g., Red, #FF0000)"
          />
        </div>
        <div className="w-32">
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(Number(e.target.value))}
            placeholder="0"
          />
        </div>
        <Button type="button" onClick={addColor} size="sm">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Selected colors */}
      {selectedColors.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Colors</Label>
          {selectedColors.map((colorOption, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded">
              <div
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: colorOption.color.startsWith('#') ? colorOption.color : colorOption.color.toLowerCase() }}
              />
              <span className="flex-1">{colorOption.color}</span>
              <Input
                type="number"
                value={colorOption.combination_price}
                onChange={(e) => updateColorPrice(index, Number(e.target.value))}
                className="w-20"
                placeholder="Price"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeColor(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}