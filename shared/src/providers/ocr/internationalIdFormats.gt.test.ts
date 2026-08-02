import { describe, it, expect } from 'vitest'
import { getCountryFormat, validateIdNumber } from './internationalIdFormats.js'

// NOTE: all ID numbers below are SYNTHETIC — never real specimen data.

describe('GT (Guatemala) country format', () => {
  it('returns a national_id format with the DPI/CUI shape', () => {
    const format = getCountryFormat('GT', 'national_id')
    expect(format).not.toBeNull()
    expect(format?.date_format).toBe('DMY')
    // Verified against a real specimen: the DPI's back carries a TD1-style MRZ.
    expect(format?.has_mrz).toBe(true)
  })

  it('returns a passport format with MRZ', () => {
    const format = getCountryFormat('GT', 'passport')
    expect(format).not.toBeNull()
    expect(format?.has_mrz).toBe(true)
  })

  it('returns a drivers_license format without MRZ', () => {
    const format = getCountryFormat('GT', 'drivers_license')
    expect(format).not.toBeNull()
    expect(format?.has_mrz).toBe(false)
  })

  it('returns null for an unregistered document type', () => {
    expect(getCountryFormat('GT', 'not_a_real_type')).toBeNull()
  })

  it('validates a synthetic 13-digit CUI, grouped with spaces', () => {
    expect(validateIdNumber('GT', 'national_id', '1234 56789 0123')).toBe(true)
  })

  it('validates a synthetic 13-digit CUI with no spaces', () => {
    expect(validateIdNumber('GT', 'national_id', '1234567890123')).toBe(true)
  })

  it('rejects malformed CUI numbers', () => {
    expect(validateIdNumber('GT', 'national_id', '123 45678 9012')).toBe(false) // wrong grouping (3-5-4)
    expect(validateIdNumber('GT', 'national_id', '1234-56789-0123')).toBe(false) // hyphens, not spaces
    expect(validateIdNumber('GT', 'national_id', '12345678901')).toBe(false) // only 11 digits
    expect(validateIdNumber('GT', 'national_id', '')).toBe(false)
  })

  it('accepts a loosely-formatted synthetic driver license number', () => {
    expect(validateIdNumber('GT', 'drivers_license', 'GT-123456')).toBe(true)
  })
})
