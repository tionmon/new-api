/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
export const INTERFACE_LANGUAGE_OPTIONS = [
  { code: 'zhCN', label: '简体中文' },
  { code: 'en', label: 'English' },
] as const

export type InterfaceLanguageCode =
  (typeof INTERFACE_LANGUAGE_OPTIONS)[number]['code']

export function normalizeInterfaceLanguage(value?: string | null): string {
  if (!value) return 'zhCN'

  const normalized = value.trim().replaceAll('_', '-').toLowerCase()
  if (normalized.startsWith('zh')) {
    return 'zhCN'
  }
  if (normalized.startsWith('en')) {
    return 'en'
  }

  return 'zhCN'
}

/**
 * Map a browser-detected locale onto the interface language codes this project
 * uses with i18next (`zhCN` / `en`).
 */
export function convertDetectedLanguage(value: string): string {
  const lower = value.trim().replaceAll('_', '-').toLowerCase()
  if (lower.startsWith('en')) return 'en'
  return 'zhCN'
}

/**
 * Convert an interface language code into a valid BCP-47 locale tag that the `Intl.*` APIs accept.
 */
export function toIntlLocale(value?: string | null): string | undefined {
  if (!value) return undefined
  if (value === 'zhCN' || value === 'zh-CN' || value === 'zh') {
    return 'zh-CN'
  }
  if (value === 'zhTW' || value === 'zh-TW') {
    return 'zh-TW'
  }
  if (value === 'en' || value.startsWith('en')) {
    return 'en-US'
  }
  try {
    return Intl.getCanonicalLocales(value)[0]
  } catch {
    return undefined
  }
}
