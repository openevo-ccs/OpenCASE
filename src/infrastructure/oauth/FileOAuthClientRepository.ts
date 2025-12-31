import fs from 'node:fs/promises';
import path from 'node:path';
import { OAuthClientRepository } from '../../application/oauth/ports/OAuthClientRepository';
import { OAuthClient } from '../../domain/oauth/entities/OAuthClient';

export interface FileOAuthClientRepositoryConfig {
  clientsFile: string;
}

interface ClientData {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  grantTypes: string[];
  scopes?: string[];
  active: boolean;
}

export class FileOAuthClientRepository implements OAuthClientRepository {
  private clients = new Map<string, OAuthClient>();

  constructor(private readonly cfg: FileOAuthClientRepositoryConfig) {}

  async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.cfg.clientsFile, 'utf8');
      const clientsData: ClientData[] = JSON.parse(data);

      for (const clientData of clientsData) {
        const client = OAuthClient.create({
          clientId: clientData.clientId,
          clientSecret: clientData.clientSecret,
          tenantId: clientData.tenantId,
          grantTypes: clientData.grantTypes,
          scopes: clientData.scopes,
          active: clientData.active
        });
        this.clients.set(client.clientId, client);
      }

      // Ensure demo-client exists, add it if missing
      if (!this.clients.has('demo-client')) {
        await this.ensureDemoClient(clientsData);
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, create default clients
        await this.createDefaultClients();
      } else {
        throw error;
      }
    }
  }

  private async createDefaultClients(): Promise<void> {
    const defaultClients: ClientData[] = [
      {
        clientId: 'demo-client',
        clientSecret: 'demo-secret',
        tenantId: 'demo',
        grantTypes: ['client_credentials'],
        scopes: ['case.read', 'case.write'],
        active: true
      }
    ];

    // Ensure directory exists
    const dir = path.dirname(this.cfg.clientsFile);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(
      this.cfg.clientsFile,
      JSON.stringify(defaultClients, null, 2),
      'utf8'
    );

    // Load the default clients
    for (const clientData of defaultClients) {
      const client = OAuthClient.create({
        clientId: clientData.clientId,
        clientSecret: clientData.clientSecret,
        tenantId: clientData.tenantId,
        grantTypes: clientData.grantTypes,
        scopes: clientData.scopes,
        active: clientData.active
      });
      this.clients.set(client.clientId, client);
    }
  }

  private async ensureDemoClient(existingClients: ClientData[]): Promise<void> {
    const demoClient: ClientData = {
      clientId: 'demo-client',
      clientSecret: 'demo-secret',
      tenantId: 'demo',
      grantTypes: ['client_credentials'],
      scopes: ['case.read', 'case.write'],
      active: true
    };

    // Add demo client to existing clients
    const updatedClients = [...existingClients, demoClient];

    // Ensure directory exists
    const dir = path.dirname(this.cfg.clientsFile);
    await fs.mkdir(dir, { recursive: true });

    // Save updated clients
    await fs.writeFile(
      this.cfg.clientsFile,
      JSON.stringify(updatedClients, null, 2),
      'utf8'
    );

    // Add to in-memory map
    const client = OAuthClient.create({
      clientId: demoClient.clientId,
      clientSecret: demoClient.clientSecret,
      tenantId: demoClient.tenantId,
      grantTypes: demoClient.grantTypes,
      scopes: demoClient.scopes,
      active: demoClient.active
    });
    this.clients.set(client.clientId, client);
  }

  async findByClientId(clientId: string): Promise<OAuthClient | null> {
    return this.clients.get(clientId) ?? null;
  }
}


