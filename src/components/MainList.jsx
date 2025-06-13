import React, { useState, useRef, useCallback } from 'react'
import { useEffect } from 'react'
import { GripVertical } from 'lucide-react'
import { Reorder, motion, AnimatePresence } from 'framer-motion'
import { updateListItems, updateListName } from '@/utils/list-utils'

function generateId() {
  return crypto.randomUUID();
}

function getItemsFromListData(list_data) {
  const item_list = list_data.map((item) => {
    return {
      text: item.item_data?.text,
      id: item.item_metadata?.item_id,
      done: false
    }
  }
  )
  return item_list
}

export default function MainList(props) {
  const [items, setItems] = useState(getItemsFromListData(props.list.list_data))
  const [showNewItem, setShowNewItem] = useState(false)
  const [title, setTitle] = useState(props.list?.list_name)
  const [editingTitle, setEditingTitle] = useState(false)
  const titleInputRef = useRef(null)
  const newItemIdRef = useRef(null)

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [editingTitle])

  useEffect(() => {
    if (newItemIdRef.current) {
      const newInput = document.getElementById(`input-${newItemIdRef.current}`)
      if (newInput) newInput.focus()
      newItemIdRef.current = null
    }
  }, [items])

  function dbUpdateWith(updatedItems) {
    updateListItems(updatedItems, props.list)
  }

  function dbUpdateListName(listName) {
    updateListName(listName, props.list)
  }

  const handleAddItem = () => {
    const newItem = { id: generateId(), text: '', done: false }
    newItemIdRef.current = newItem.id
    const updated = [...items, newItem]
    setItems(updated)
    dbUpdateWith(updated)
    setShowNewItem(true)
  }

  const updateItem = (id, newText) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, text: newText } : item
      )
      return updated
    })
  }

  const finalizeEdit = () => {
    dbUpdateWith(items)
  }

  const deleteItem = (id) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id)
      dbUpdateWith(updated)
      return updated
    })
  }

  const toggleItem = (id) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item)

      dbUpdateWith(updated)
      return updated;
    })
  }

  const handleKeyDown = (e, index, item) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const newItem = { id: generateId(), text: '', done: false }
      newItemIdRef.current = newItem.id
      const newItems = [...items]
      newItems.splice(index + 1, 0, newItem)
      setItems(newItems)
      dbUpdateWith(newItems)
    } else if (e.key === 'Backspace' && item.text === '') {
      e.preventDefault()
      if (items.length === 1) {
        const newItems = []
        setItems(newItems)
        dbUpdateWith(newItems)
        setShowNewItem(false)
      } else {
        const newItems = [...items]
        newItems.splice(index, 1)
        setItems(newItems)
        dbUpdateWith(newItems)
        const prevInput = document.getElementById(
          `input-${items[index - 1]?.id}`
        )
        if (prevInput) prevInput.focus()
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prevInput = document.getElementById(`input-${items[index - 1]?.id}`)
      if (prevInput) prevInput.focus()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextInput = document.getElementById(`input-${items[index + 1]?.id}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleBlur = useCallback(() => {
    return () => finalizeEdit()
  }, [items])

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <div>
        {editingTitle ? (
          <textarea
            ref={titleInputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              setEditingTitle(false)
              
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                setEditingTitle(false)
                dbUpdateListName(e.target.value)
              }
            }}
            className="w-full text-2xl font-semibold resize-none overflow-hidden"
            rows={1}
          />
        ) : (
          <h2
            onDoubleClick={() => setEditingTitle(true)}
          >
            {title}
          </h2>
        )}
      </div>
      <Reorder.Group as="div" axis="y" values={items} onReorder={(newItems) => {
        setItems(newItems)
        dbUpdateWith(newItems)
      }} className="list-none">
        <AnimatePresence>
          {items.map((item, index) => (
            <Reorder.Item
              as='div'
              key={item.id}
              value={item}
              className="flex items-center space-x-3 py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                onClick={() => toggleItem(item.id)}
                className={`h-5 w-5 rounded-full border-2 flex-shrink-0 mt-1 ${item.done ? 'bg-gray-400 border-gray-400' : 'border-gray-400'
                  }`}
              >
                {item.done ? '✅' : ''}
              </button>
              <textarea
                id={`input-${item.id}`}
                value={item.text}
                onChange={(e) => updateItem(item.id, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index, item)}
                onBlur={handleBlur(item.id)}
                className={`w-full text-lg outline-none bg-transparent border-none ${item.done ? 'text-gray-400 line-through' : 'text-black'
                  }`}
                autoFocus={index === items.length - 1 && showNewItem}
              />
              <GripVertical className="cursor-move text-gray-400" size={16} />
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
      <div>
        <button
          onClick={handleAddItem}>
          + New Item
        </button>
      </div>
    </div>
  )
}
