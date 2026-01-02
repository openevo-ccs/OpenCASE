import { Request, Response } from 'express'
import { CreateUserAccount } from '../../../../application/user/endpoints/CreateUserAccount'
import { DeleteUserAccount } from '../../../../application/user/endpoints/DeleteUserAccount'
import { UpdateUserAccount } from '../../../../application/user/endpoints/UpdateUserAccount'
import { ListTenantAccounts } from '../../../../application/user/endpoints/ListTenantAccounts'
import { AddTenantMembership } from '../../../../application/user/endpoints/AddTenantMembership'
import { RemoveTenantMembership } from '../../../../application/user/endpoints/RemoveTenantMembership'

export class AccountsManagementController {
  constructor(
    private readonly createUserAccount: CreateUserAccount,
    private readonly deleteUserAccount: DeleteUserAccount,
    private readonly updateUserAccount: UpdateUserAccount,
    private readonly listTenantAccounts: ListTenantAccounts,
    private readonly addTenantMembership: AddTenantMembership,
    private readonly removeTenantMembership: RemoveTenantMembership
  ) {}

  create = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).tenantId ?? req.params.tenantId
      const urlTenantId = req.params.tenantId

      // Verify tenant from JWT matches URL parameter
      if (urlTenantId && urlTenantId !== tenantId) {
        return res.status(403).json({ error: 'Tenant mismatch - authenticated tenant does not match URL parameter' })
      }

      const email = req.body.email
      const password = req.body.password
      const role = req.body.role
      const autoGeneratePassword = req.body.autoGeneratePassword ?? false

      if (!email) {
        return res.status(400).json({ error: 'email is required' })
      }

      const result = await this.createUserAccount.execute({
        email,
        password,
        tenantId,
        role,
        autoGeneratePassword
      })

      res.status(201).json({
        accountId: result.accountId,
        email: result.email,
        password: result.password, // Only included if auto-generated
        tenantId: result.tenantId,
        role: result.role
      })
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        return res.status(409).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message || 'Create failed' })
    }
  }

  delete = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).tenantId ?? req.params.tenantId
      const urlTenantId = req.params.tenantId
      const accountId = req.params.accountId

      // Verify tenant from JWT matches URL parameter
      if (urlTenantId && urlTenantId !== tenantId) {
        return res.status(403).json({ error: 'Tenant mismatch - authenticated tenant does not match URL parameter' })
      }

      await this.deleteUserAccount.execute({
        accountId,
        tenantId // Only delete membership for this tenant
      })

      res.status(200).json({ status: 'deleted' })
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return res.status(404).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message || 'Delete failed' })
    }
  }

  update = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).tenantId ?? req.params.tenantId
      const urlTenantId = req.params.tenantId
      const accountId = req.params.accountId

      // Verify tenant from JWT matches URL parameter
      if (urlTenantId && urlTenantId !== tenantId) {
        return res.status(403).json({ error: 'Tenant mismatch - authenticated tenant does not match URL parameter' })
      }

      const password = req.body.password
      const status = req.body.status

      await this.updateUserAccount.execute({
        accountId,
        password,
        status
      })

      res.status(200).json({ status: 'updated' })
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return res.status(404).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message || 'Update failed' })
    }
  }

  list = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).tenantId ?? req.params.tenantId
      const urlTenantId = req.params.tenantId

      // Verify tenant from JWT matches URL parameter
      if (urlTenantId && urlTenantId !== tenantId) {
        return res.status(403).json({ error: 'Tenant mismatch - authenticated tenant does not match URL parameter' })
      }

      const result = await this.listTenantAccounts.execute({
        tenantId
      })

      res.status(200).json(result)
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'List failed' })
    }
  }

  addMembership = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).tenantId ?? req.params.tenantId
      const urlTenantId = req.params.tenantId
      const accountId = req.params.accountId
      const targetTenantId = req.body.tenantId
      const role = req.body.role

      // Verify tenant from JWT matches URL parameter
      if (urlTenantId && urlTenantId !== tenantId) {
        return res.status(403).json({ error: 'Tenant mismatch - authenticated tenant does not match URL parameter' })
      }

      if (!targetTenantId) {
        return res.status(400).json({ error: 'tenantId is required in request body' })
      }

      await this.addTenantMembership.execute({
        accountId,
        tenantId: targetTenantId,
        role
      })

      res.status(201).json({ status: 'membership added' })
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        return res.status(409).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message || 'Add membership failed' })
    }
  }

  removeMembership = async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).tenantId ?? req.params.tenantId
      const urlTenantId = req.params.tenantId
      const accountId = req.params.accountId
      const targetTenantId = req.params.targetTenantId

      // Verify tenant from JWT matches URL parameter
      if (urlTenantId && urlTenantId !== tenantId) {
        return res.status(403).json({ error: 'Tenant mismatch - authenticated tenant does not match URL parameter' })
      }

      await this.removeTenantMembership.execute({
        accountId,
        tenantId: targetTenantId
      })

      res.status(200).json({ status: 'membership removed' })
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return res.status(404).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message || 'Remove membership failed' })
    }
  }
}

