import { describe, it, expect } from 'vitest'
import { getCountryFormat, validateIdNumber } from './internationalIdFormats.js'

// NOTE: all ID numbers below are SYNTHETIC — never real specimen data.

describe('DO (Dominican Republic) country format', () => {
  it('returns a national_id format with the cédula shape', () => {
    const format = getCountryFormat('DO', 'national_id')
    expect(format).not.toBeNull()
    expect(format?.date_format).toBe('DMY')
    expect(format?.has_mrz).toBe(false)
  })

  it('returns a passport format with MRZ', () => {
    const format = getCountryFormat('DO', 'passport')
    expect(format).not.toBeNull()
    expect(format?.has_mrz).toBe(true)
  })

  it('returns a drivers_license format without MRZ', () => {
    const format = getCountryFormat('DO', 'drivers_license')
    expect(format).not.toBeNull()
    expect(format?.has_mrz).toBe(false)
  })

  it('returns null for an unregistered document type', () => {
    expect(getCountryFormat('DO', 'not_a_real_type')).toBeNull()
  })

  it('validates a synthetic cédula number (000-0000000-0)', () => {
    expect(validateIdNumber('DO', 'national_id', '001-1234567-8')).toBe(true)
  })

  it('rejects malformed cédula numbers', () => {
    expect(validateIdNumber('DO', 'national_id', '0011234567-8')).toBe(false) // missing first hyphen
    expect(validateIdNumber('DO', 'national_id', '001-123456-8')).toBe(false) // only 6 digits in middle group
    expect(validateIdNumber('DO', 'national_id', '001-1234567-89')).toBe(false) // 2-digit check group
    expect(validateIdNumber('DO', 'national_id', '')).toBe(false)
  })

  it('validates a synthetic driver license number in the same shape as the cédula', () => {
    expect(validateIdNumber('DO', 'drivers_license', '001-1234567-8')).toBe(true)
  })
})
