// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../src/components/ui/select'

// The ui/select wrapper forwards Base UI's exact callback semantics: a picked
// item yields its string value, and the wrapper never swallows events.

function renderSelect(spy: (v: string | null) => void) {
  return render(
    <Select value="alpha" onValueChange={spy}>
      <SelectTrigger>
        <SelectValue placeholder="pick one" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="alpha">Alpha</SelectItem>
        <SelectItem value="beta">Beta</SelectItem>
      </SelectContent>
    </Select>,
  )
}

describe('ui/select', () => {
  test('renders a single-select listbox trigger', () => {
    const spy = vi.fn()
    const { getByRole, unmount } = renderSelect(spy)
    const trigger = getByRole('combobox')
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    unmount()
    cleanup()
  })

  test('picking an item forwards its string value to the handler', () => {
    const spy = vi.fn()
    const { getByRole, getAllByRole, getByText, unmount } = renderSelect(spy)
    const trigger = getByRole('combobox')
    fireEvent.pointerDown(trigger)
    fireEvent.click(trigger)
    const beta = getByText('Beta')
    const option = beta.closest('[role="option"]') ?? beta
    fireEvent.pointerDown(option)
    fireEvent.click(option)
    if (spy.mock.calls.length === 0) {
      const portals = [...document.querySelectorAll('[data-base-ui-portal], body > div')].map(d => (d as HTMLElement).getAttribute('role') + ':' + (d as HTMLElement).className.slice(0, 40))
      console.error('DEBUG:', document.body.innerHTML.slice(0, 1800))
      // Base UI may commit the selection on pointerup — complete the press.
      fireEvent.pointerUp(option)
      fireEvent.click(option)
    }
    expect(spy).toHaveBeenCalled()
    expect(spy.mock.calls[0][0]).toBe('beta')
    unmount()
    cleanup()
  })

  test('the wrapper does not call the handler on its own (no fabricated events)', () => {
    const spy = vi.fn()
    const { getAllByRole, unmount } = renderSelect(spy)
    const triggers = getAllByRole('combobox', { hidden: true })
    for (const t of triggers) fireEvent.click(t)
    expect(spy).not.toHaveBeenCalled()
    unmount()
    cleanup()
  })
})
