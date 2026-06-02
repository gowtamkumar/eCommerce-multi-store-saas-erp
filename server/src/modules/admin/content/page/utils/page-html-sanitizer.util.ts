const BLOCKED_TAGS = /<\s*\/?\s*(script|iframe|object|embed|form|link|meta|base|style)\b[^>]*>/gi
const EVENT_HANDLERS = /\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi
const JAVASCRIPT_URL = /(href|src|xlink:href)\s*=\s*["']?\s*javascript:/gi

/** Strip dangerous HTML patterns from user-authored page content. */
export function sanitizePageHtml(html: string | undefined | null): string {
  if (!html || typeof html !== 'string') return ''
  let out = html.replace(BLOCKED_TAGS, '')
  out = out.replace(EVENT_HANDLERS, '')
  out = out.replace(JAVASCRIPT_URL, '$1=""')
  return out
}

function sanitizeSettingsValue(key: string, value: unknown): unknown {
  if (typeof value === 'string') {
    if (
      key === 'html' ||
      key === 'content' ||
      key === 'text' ||
      key === 'answer' ||
      key === 'question'
    ) {
      return sanitizePageHtml(value)
    }
    return value
  }
  if (Array.isArray(value)) {
    return value.map((item) =>
      typeof item === 'object' && item !== null
        ? sanitizeSectionSettings(item as Record<string, unknown>)
        : item,
    )
  }
  if (value && typeof value === 'object') {
    return sanitizeSectionSettings(value as Record<string, unknown>)
  }
  return value
}

export function sanitizeSectionSettings(
  settings: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!settings || typeof settings !== 'object') return {}
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(settings)) {
    out[key] = sanitizeSettingsValue(key, val)
  }
  return out
}

export type PageSectionNode = {
  id?: string
  type?: string
  settings?: Record<string, unknown>
  styles?: Record<string, unknown>
  hidden?: boolean
  locked?: boolean
  visibility?: { desktop?: boolean; tablet?: boolean; mobile?: boolean }
  children?: PageSectionNode[]
}

const MAX_SECTIONS = 200
const MAX_DEPTH = 12

export function validateAndSanitizeSections(
  sections: PageSectionNode[] | undefined | null,
): PageSectionNode[] {
  if (!sections) return []
  if (!Array.isArray(sections)) {
    throw new Error('sections must be an array')
  }
  if (sections.length > MAX_SECTIONS) {
    throw new Error(`sections cannot exceed ${MAX_SECTIONS} items`)
  }

  const walk = (nodes: PageSectionNode[], depth: number): PageSectionNode[] => {
    if (depth > MAX_DEPTH) {
      throw new Error(`section tree cannot exceed depth ${MAX_DEPTH}`)
    }
    return nodes.map((node) => {
      const children = node.children?.length ? walk(node.children, depth + 1) : node.children
      return {
        ...node,
        settings: sanitizeSectionSettings(node.settings as Record<string, unknown>),
        children,
      }
    })
  }

  return walk(sections, 0)
}
