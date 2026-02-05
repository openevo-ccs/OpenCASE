import type { CFPackage } from '@/domain/case/types'
import type { Framework } from '@/domain/framework/model/types'
import { normalizeCasePackageResponse } from '../mappers/case/normalizeCasePackage'
import { mapCaseSnapshotToDomainFramework } from '../mappers/case/caseToDomainFramework'

/**
 * Application service that orchestrates loading a CASE package and mapping it to the domain Framework.
 *
 * This service handles CASE v1p0/v1p1 version differences through the normalization layer,
 * ensuring the UI layer receives a clean domain Framework regardless of the source format.
 */
export class FrameworkLoader {
  /**
   * Load a Framework from a raw CASE CFPackage response.
   *
   * This is the primary entry point for converting CASE data to the domain model.
   * It handles version differences (v1p0 vs v1p1) transparently.
   *
   * @param cfPackage - The raw CFPackage from the CASE API (v1p0 or v1p1 format)
   * @returns The domain Framework, or null if the package cannot be parsed
   */
  loadFromCfPackage(cfPackage: CFPackage): Framework | null {
    // Step 1: Normalize the raw CASE response to a version-agnostic snapshot
    const snapshot = normalizeCasePackageResponse(cfPackage)
    if (!snapshot) {
      return null
    }

    // Step 2: Map the snapshot to the domain Framework
    return mapCaseSnapshotToDomainFramework(snapshot)
  }

  /**
   * Load a Framework from a raw API response (handles wrapped responses).
   *
   * Some API responses wrap the CFPackage in a container object: `{ CFPackage: {...} }`.
   * This method handles both wrapped and unwrapped formats.
   *
   * @param response - The raw API response (may be CFPackage or { CFPackage: ... })
   * @returns The domain Framework, or null if the response cannot be parsed
   */
  loadFromApiResponse(response: unknown): Framework | null {
    // The normalizeCasePackageResponse already handles unwrapping
    const snapshot = normalizeCasePackageResponse(response)
    if (!snapshot) {
      return null
    }

    return mapCaseSnapshotToDomainFramework(snapshot)
  }
}

/**
 * Convenience function to load a Framework from a CFPackage without instantiating the service.
 */
export function loadFrameworkFromCfPackage(cfPackage: CFPackage): Framework | null {
  const loader = new FrameworkLoader()
  return loader.loadFromCfPackage(cfPackage)
}

/**
 * Convenience function to load a Framework from a raw API response.
 */
export function loadFrameworkFromApiResponse(response: unknown): Framework | null {
  const loader = new FrameworkLoader()
  return loader.loadFromApiResponse(response)
}
