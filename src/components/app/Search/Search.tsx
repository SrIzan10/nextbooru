'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search as SearchIcon } from 'lucide-react'

export default function Search(props: Props) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<{ tag: string, count: string }[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      const lastTag = input.split(' ').pop() || ''
      if (lastTag.length > 0) {
        try {
          const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(lastTag)}`)
          if (response.ok) {
            const data = await response.json()
            setSuggestions(data.slice(0, 5))
          } else {
            setSuggestions([])
          }
        } catch (error) {
          setSuggestions([])
        }
      } else {
        setSuggestions([])
      }
      setSelectedIndex(-1)
    }

    fetchSuggestions()
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
      e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
      e.preventDefault()
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      const tags = input.split(' ').slice(0, -1)
      tags.push(suggestions[selectedIndex].tag)
      setInput(tags.join(' ') + ' ')
      setSuggestions([])
      e.preventDefault()
    } else if (e.key === 'Escape') {
      setSuggestions([])
    } else if (e.key === 'Enter') {
      props.onSearch(input)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    const tags = input.split(' ').slice(0, -1)
    tags.push(suggestion)
    setInput(tags.join(' ') + ' ')
    setSuggestions([])
    inputRef.current?.focus()
  }

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Enter tags..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pr-10 font-mono"
        />
        <Button 
          size="icon"
          className="absolute right-0 top-0 h-full"
          onClick={() => props.onSearch(input)}
        >
          <SearchIcon className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
      {suggestions.length > 0 && (
        <ul className="mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.tag}
              className={`px-4 py-2 cursor-pointer hover:bg-muted ${
                index === selectedIndex ? 'bg-muted' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion.tag)}
            >
              {suggestion.tag} ({suggestion.count})
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface Props {
  onSearch: (q: string) => void
}