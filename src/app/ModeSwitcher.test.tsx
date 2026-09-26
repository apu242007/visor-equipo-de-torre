// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DEFAULT_MODE, useModeStore } from '@/stores/modeStore'
import { ModeSwitcher } from './ModeSwitcher'

afterEach(() => {
  cleanup()
  useModeStore.setState({ mode: DEFAULT_MODE })
})

const LABELS = ['EXPLORE', 'OPERATION', 'QHSE', 'TRAINING']

describe('ModeSwitcher', () => {
  it('es un grupo accesible con cuatro botones y sin roles tab huérfanos', () => {
    render(<ModeSwitcher />)
    expect(screen.getByRole('group', { name: 'Modo de trabajo' })).toBeTruthy()
    expect(screen.queryAllByRole('tab')).toHaveLength(0)
    for (const label of LABELS) {
      expect(screen.getByRole('button', { name: label })).toBeTruthy()
    }
  })

  it('marca el modo activo con aria-pressed y cambia el store al elegir otro', () => {
    render(<ModeSwitcher />)
    expect(screen.getByRole('button', { name: 'EXPLORE' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
    fireEvent.click(screen.getByRole('button', { name: 'QHSE' }))
    expect(useModeStore.getState().mode).toBe('qhse')
    expect(screen.getByRole('button', { name: 'QHSE' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'EXPLORE' }).getAttribute('aria-pressed')).toBe(
      'false',
    )
  })
})
