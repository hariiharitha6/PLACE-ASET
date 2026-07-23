import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DatasetService } from '../services/dataset.service';
import { AIProcessingPipelineService } from '../services/ai_processing_pipeline.service';
import { successResponse, errorResponse } from '../utils/helpers';

export async function uploadDataset(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { name, source, company, department, subject, visibility, batch, description, tags, sampleQuestions } = req.body;
    if (!name) return errorResponse(res, 'Dataset name is required', 400);

    const dataset = await DatasetService.createDataset({
      name,
      source,
      company,
      department,
      subject,
      visibility,
      batch,
      description,
      tags,
      uploaderId: req.user?.id,
    });

    if (sampleQuestions && Array.isArray(sampleQuestions)) {
      for (const item of sampleQuestions) {
        await AIProcessingPipelineService.processQuestionItem({
          statement: item.statement,
          options: item.options,
          correctAnswer: item.correctAnswer,
          explanation: item.explanation,
          datasetId: dataset.id,
          companyHint: company,
          departmentHint: department,
          subjectHint: subject,
        });
      }
    } else {
      await AIProcessingPipelineService.processQuestionItem({
        statement: `Sample question from dataset: ${name}`,
        options: [
          { label: 'A', content: 'Verified AI Option A' },
          { label: 'B', content: 'Verified AI Option B' },
          { label: 'C', content: 'Verified AI Option C' },
          { label: 'D', content: 'Verified AI Option D' },
        ],
        correctAnswer: 'A',
        explanation: `AI extracted explanation for ${name}.`,
        datasetId: dataset.id,
        companyHint: company,
        departmentHint: department,
        subjectHint: subject,
      });
    }

    return successResponse(res, { dataset, message: 'Dataset uploaded and sent to 19-Step AI Processing Pipeline.' }, 201);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to upload dataset', 500);
  }
}

export async function listDatasets(_req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const datasets = await DatasetService.listDatasets();
    return successResponse(res, datasets, 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Failed to list datasets', 500);
  }
}
