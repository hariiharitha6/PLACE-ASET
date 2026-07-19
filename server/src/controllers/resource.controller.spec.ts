import { expect } from 'chai';
import {
  listResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  downloadResource
} from './resource.controller';
import { ResourceService } from '../services/resource.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('Resource Controller Unit Tests', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let resStatus: number;
  let resJson: any;

  beforeEach(() => {
    resStatus = 200;
    resJson = null;
    mockRes = {
      status: (code: number) => { resStatus = code; return mockRes as Response; },
      json: (data: any) => { resJson = data; return mockRes as Response; },
    };
  });

  it('listResources should return 200 on success', async () => {
    const original = ResourceService.searchResources;
    ResourceService.searchResources = async () => ({
      resources: [], total: 0, page: 1, limit: 12, totalPages: 0
    });
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' },
      query: {}
    };
    await listResources(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    ResourceService.searchResources = original;
  });

  it('getResource should return 200 on success', async () => {
    const original = ResourceService.getResource;
    ResourceService.getResource = async () => ({ id: 'r1', title: 'Guide' } as any);
    mockReq = { params: { id: 'r1' } };
    await getResource(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.data.title).to.equal('Guide');
    ResourceService.getResource = original;
  });

  it('createResource should return 201 on success', async () => {
    const original = ResourceService.createResource;
    ResourceService.createResource = async () => ({ id: 'r1', title: 'Guide' } as any);
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'admin', collegeId: 'c1' },
      body: { title: 'Guide', file_url: 'http://example.com' }
    };
    await createResource(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    ResourceService.createResource = original;
  });

  it('updateResource should return 200 on success', async () => {
    const original = ResourceService.updateResource;
    ResourceService.updateResource = async () => ({ id: 'r1', title: 'Updated' } as any);
    mockReq = {
      params: { id: 'r1' },
      body: { title: 'Updated' }
    };
    await updateResource(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.data.title).to.equal('Updated');
    ResourceService.updateResource = original;
  });

  it('deleteResource should return 200 on success', async () => {
    const original = ResourceService.deleteResource;
    ResourceService.deleteResource = async () => ({ deleted: true });
    mockReq = { params: { id: 'r1' } };
    await deleteResource(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    ResourceService.deleteResource = original;
  });

  it('downloadResource should return 200 on success', async () => {
    const original = ResourceService.recordDownload;
    ResourceService.recordDownload = async () => ({ downloaded: true });
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' },
      params: { id: 'r1' }
    };
    await downloadResource(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    ResourceService.recordDownload = original;
  });
});
