/**
 * Link Data structure as defined in CASE v1p1 specification
 * Used for URI references that require title, identifier, and uri
 */
export interface LinkData {
  title: string
  identifier: string
  uri: string
  targetType?: string // v1.1 addition
}

export class LinkDataHelper {
  /**
   * Creates a link data object from a URI string
   * If full link data is provided, uses it; otherwise constructs from URI
   */
  static fromURI(uri: string, identifier?: string, title?: string): LinkData {
    return {
      title: title || identifier || uri,
      identifier: identifier || this.extractIdFromURI(uri),
      uri
    }
  }

  /**
   * Creates link data from an object (handles both full link data and simple URI strings)
   */
  static fromRaw(raw: string | LinkData | undefined): LinkData | undefined {
    if (!raw) return undefined
    if (typeof raw === 'string') {
      return this.fromURI(raw)
    }
    if (raw.title && raw.identifier && raw.uri) {
      return raw as LinkData
    }
    return undefined
  }

  /**
   * Extracts an identifier from a URI (last segment or UUID pattern)
   */
  static extractIdFromURI(uri: string): string {
    // Try to extract UUID or last path segment
    const uuidMatch = uri.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
    if (uuidMatch) return uuidMatch[0]
    
    const segments = uri.split('/').filter(s => s)
    return segments[segments.length - 1] || uri
  }

  /**
   * Creates link data for a CFDocument reference
   */
  static forDocument(uri: string, identifier: string, title: string): LinkData {
    return { title, identifier, uri }
  }

  /**
   * Creates link data for a CFItem reference
   */
  static forItem(uri: string, identifier: string, title?: string): LinkData {
    return { title: title || identifier, identifier, uri }
  }
}

