"use client"

import * as React from "react"

function legacyCopyToClipboard(value: string) {
  const textArea = document.createElement("textarea")
  textArea.value = value
  textArea.setAttribute("readonly", "")
  textArea.style.position = "fixed"
  textArea.style.opacity = "0"
  textArea.style.pointerEvents = "none"

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  textArea.setSelectionRange(0, value.length)

  let hasCopied = false
  try {
    hasCopied = document.execCommand("copy")
  } catch {
    hasCopied = false
  }

  document.body.removeChild(textArea)
  return hasCopied
}

export function useCopyToClipboard({
  timeout = 2000,
  onCopy,
}: {
  timeout?: number
  onCopy?: () => void
} = {}) {
  const [isCopied, setIsCopied] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [])

  const copyToClipboard = React.useCallback(
    async (value: string) => {
      if (typeof window === "undefined") {
        return false
      }

      if (!value) {
        return false
      }

      let hasCopied = false

      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(value)
          hasCopied = true
        } catch {
          hasCopied = legacyCopyToClipboard(value)
        }
      } else {
        hasCopied = legacyCopyToClipboard(value)
      }

      if (!hasCopied) {
        return false
      }

      setIsCopied(true)

      if (onCopy) {
        onCopy()
      }

      if (timeout !== 0) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          setIsCopied(false)
        }, timeout)
      }

      return true
    },
    [onCopy, timeout]
  )

  return { isCopied, copyToClipboard }
}
