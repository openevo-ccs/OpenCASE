import { ListTenants } from '../ListTenants'
import fs from 'node:fs/promises'
import path from 'node:path'

jest.mock('node:fs/promises')

describe('ListTenants', () => {
  let listTenants: ListTenants

  beforeEach(() => {
    listTenants = new ListTenants()
    jest.clearAllMocks()
  })

  describe('execute', () => {
    const baseDataDir = '/test/data'

    it('should list all tenants', async () => {
      const mockTenants = [
        { name: 'tenant1', isDirectory: () => true },
        { name: 'tenant2', isDirectory: () => true },
        { name: 'tenant3', isDirectory: () => true }
      ]

      ;(fs.readdir as jest.Mock).mockResolvedValue(mockTenants)
      ;(fs.access as jest.Mock).mockResolvedValue(undefined)

      const result = await listTenants.execute({ baseDataDir })

      expect(fs.readdir).toHaveBeenCalledWith(
        path.join(baseDataDir, 'tenants'),
        { withFileTypes: true }
      )
      expect(result.tenants).toHaveLength(3)
      expect(result.total).toBe(3)
      expect(result.tenants[0].tenantId).toBe('tenant1')
      expect(result.tenants[0].hasFrameworks).toBe(true)
    })

    it('should return empty array when tenants directory does not exist', async () => {
      const error = new Error('ENOENT')
      ;(error as any).code = 'ENOENT'
      ;(fs.readdir as jest.Mock).mockRejectedValue(error)

      const result = await listTenants.execute({ baseDataDir })

      expect(result.tenants).toEqual([])
      expect(result.total).toBe(0)
    })

    it('should filter out non-directory entries', async () => {
      const mockEntries = [
        { name: 'tenant1', isDirectory: () => true },
        { name: 'file.txt', isDirectory: () => false },
        { name: 'tenant2', isDirectory: () => true }
      ]

      ;(fs.readdir as jest.Mock).mockResolvedValue(mockEntries)
      ;(fs.access as jest.Mock).mockResolvedValue(undefined)

      const result = await listTenants.execute({ baseDataDir })

      expect(result.tenants).toHaveLength(2)
      expect(result.tenants.map(t => t.tenantId)).toEqual(['tenant1', 'tenant2'])
    })

    it('should detect tenants with frameworks', async () => {
      const mockTenants = [
        { name: 'tenant-with-frameworks', isDirectory: () => true },
        { name: 'tenant-empty', isDirectory: () => true }
      ]

      ;(fs.readdir as jest.Mock).mockResolvedValue(mockTenants)
      
      // Mock fs.access calls - Since tenants are processed in parallel with Promise.all,
      // and each tenant checks both v1p1 and v1p0 in parallel, the mock calls can interleave.
      // We need to mock based on the path being accessed.
      // tenant-with-frameworks: v1p1 exists -> hasFrameworks = true
      // tenant-empty: both v1p1 and v1p0 don't exist -> hasFrameworks = false
      const error = new Error('ENOENT')
      ;(error as any).code = 'ENOENT'
      
      ;(fs.access as jest.Mock).mockImplementation((path: string) => {
        // tenant-with-frameworks v1p1 exists
        if (path.includes('tenant-with-frameworks') && path.includes('v1p1')) {
          return Promise.resolve(undefined)
        }
        // All other paths don't exist
        return Promise.reject(error)
      })

      const result = await listTenants.execute({ baseDataDir })

      expect(result.tenants[0].hasFrameworks).toBe(true)
      expect(result.tenants[1].hasFrameworks).toBe(false)
    })

    it('should handle errors when checking framework directories', async () => {
      const mockTenants = [
        { name: 'tenant1', isDirectory: () => true }
      ]

      ;(fs.readdir as jest.Mock).mockResolvedValue(mockTenants)
      ;(fs.access as jest.Mock).mockRejectedValue(new Error('Permission denied'))

      const result = await listTenants.execute({ baseDataDir })

      // Should still return tenant but with hasFrameworks = false due to error
      expect(result.tenants).toHaveLength(1)
      expect(result.tenants[0].hasFrameworks).toBe(false)
    })

    it('should propagate non-ENOENT errors', async () => {
      const error = new Error('Permission denied')
      ;(fs.readdir as jest.Mock).mockRejectedValue(error)

      await expect(
        listTenants.execute({ baseDataDir })
      ).rejects.toThrow('Permission denied')
    })
  })
})

