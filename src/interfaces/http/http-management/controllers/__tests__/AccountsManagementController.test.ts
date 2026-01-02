import { Request, Response } from 'express'
import { AccountsManagementController } from '../AccountsManagementController'
import { CreateUserAccount } from '../../../../../application/user/endpoints/CreateUserAccount'
import { DeleteUserAccount } from '../../../../../application/user/endpoints/DeleteUserAccount'
import { UpdateUserAccount } from '../../../../../application/user/endpoints/UpdateUserAccount'
import { ListTenantAccounts } from '../../../../../application/user/endpoints/ListTenantAccounts'
import { AddTenantMembership } from '../../../../../application/user/endpoints/AddTenantMembership'
import { RemoveTenantMembership } from '../../../../../application/user/endpoints/RemoveTenantMembership'

describe('AccountsManagementController', () => {
  let controller: AccountsManagementController
  let mockCreateUserAccount: jest.Mocked<CreateUserAccount>
  let mockDeleteUserAccount: jest.Mocked<DeleteUserAccount>
  let mockUpdateUserAccount: jest.Mocked<UpdateUserAccount>
  let mockListTenantAccounts: jest.Mocked<ListTenantAccounts>
  let mockAddTenantMembership: jest.Mocked<AddTenantMembership>
  let mockRemoveTenantMembership: jest.Mocked<RemoveTenantMembership>
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let responseJson: jest.Mock
  let responseStatus: jest.Mock

  beforeEach(() => {
    mockCreateUserAccount = {
      execute: jest.fn().mockResolvedValue({
        accountId: 'account-123',
        email: 'user@example.com',
        tenantId: 'test-tenant',
        role: 'user'
      })
    } as any

    mockDeleteUserAccount = {
      execute: jest.fn().mockResolvedValue(undefined)
    } as any

    mockUpdateUserAccount = {
      execute: jest.fn().mockResolvedValue(undefined)
    } as any

    mockListTenantAccounts = {
      execute: jest.fn().mockResolvedValue({
        accounts: [
          {
            accountId: 'account-1',
            email: 'user1@example.com',
            role: 'user',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z'
          }
        ],
        total: 1
      })
    } as any

    mockAddTenantMembership = {
      execute: jest.fn().mockResolvedValue(undefined)
    } as any

    mockRemoveTenantMembership = {
      execute: jest.fn().mockResolvedValue(undefined)
    } as any

    controller = new AccountsManagementController(
      mockCreateUserAccount,
      mockDeleteUserAccount,
      mockUpdateUserAccount,
      mockListTenantAccounts,
      mockAddTenantMembership,
      mockRemoveTenantMembership
    )

    responseJson = jest.fn()
    responseStatus = jest.fn().mockReturnValue({ json: responseJson })

    mockRequest = {
      params: { tenantId: 'test-tenant' },
      body: {}
    }

    mockResponse = {
      status: responseStatus,
      json: responseJson
    }
  })

  describe('create', () => {
    it('should create account successfully', async () => {
      ;(mockRequest as any).tenantId = 'test-tenant'
      mockRequest.body = {
        autoGeneratePassword: false,
        email: 'user@example.com',
        password: 'password123',
        role: 'user'
      }

      await controller.create(mockRequest as Request, mockResponse as Response)

      expect(mockCreateUserAccount.execute).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
        tenantId: 'test-tenant',
        role: 'user',
        autoGeneratePassword: false
      })
      expect(responseStatus).toHaveBeenCalledWith(201)
      expect(responseJson).toHaveBeenCalledWith({
        accountId: 'account-123',
        email: 'user@example.com',
        tenantId: 'test-tenant',
        role: 'user'
      })
    })

    it('should return 403 when tenant mismatch', async () => {
      ;(mockRequest as any).tenantId = 'different-tenant'
      mockRequest.body = { email: 'user@example.com' }

      await controller.create(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(403)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Tenant mismatch - authenticated tenant does not match URL parameter'
      })
    })

    it('should return 400 when email is missing', async () => {
      ;(mockRequest as any).tenantId = 'test-tenant'
      mockRequest.body = {}

      await controller.create(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'email is required'
      })
    })
  })

  describe('list', () => {
    it('should list accounts successfully', async () => {
      ;(mockRequest as any).tenantId = 'test-tenant'

      await controller.list(mockRequest as Request, mockResponse as Response)

      expect(mockListTenantAccounts.execute).toHaveBeenCalledWith({
        tenantId: 'test-tenant'
      })
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith({
        accounts: expect.any(Array),
        total: 1
      })
    })
  })

  describe('delete', () => {
    it('should delete account successfully', async () => {
      ;(mockRequest as any).tenantId = 'test-tenant'
      mockRequest.params = { ...mockRequest.params, accountId: 'account-123' }

      await controller.delete(mockRequest as Request, mockResponse as Response)

      expect(mockDeleteUserAccount.execute).toHaveBeenCalledWith({
        accountId: 'account-123',
        tenantId: 'test-tenant'
      })
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith({ status: 'deleted' })
    })
  })

  describe('update', () => {
    it('should update account successfully', async () => {
      ;(mockRequest as any).tenantId = 'test-tenant'
      mockRequest.params = { ...mockRequest.params, accountId: 'account-123' }
      mockRequest.body = { password: 'new-password' }

      await controller.update(mockRequest as Request, mockResponse as Response)

      expect(mockUpdateUserAccount.execute).toHaveBeenCalledWith({
        accountId: 'account-123',
        password: 'new-password'
      })
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith({ status: 'updated' })
    })
  })
})

