import { getSupabase } from '../config/database';
import logger from '../utils/logger';

export interface DatasetInput {
  name: string;
  source?: string;
  company?: string;
  department?: string;
  subject?: string;
  visibility?: string;
  batch?: string;
  description?: string;
  tags?: string[];
  uploaderId?: string;
}

export class DatasetService {
  static async createDataset(input: DatasetInput) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('datasets')
      .insert({
        name: input.name,
        source: input.source || 'Admin Upload',
        company: input.company || null,
        department: input.department || null,
        subject: input.subject || null,
        visibility: input.visibility || 'private',
        batch: input.batch || null,
        description: input.description || null,
        tags: input.tags || [],
        uploader_id: input.uploaderId || null,
        status: 'uploaded',
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create dataset', { error: error.message });
      throw new Error(error.message);
    }

    return data;
  }

  static async listDatasets() {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('datasets')
      .select('*, dataset_files(*)')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  }

  static async addDatasetFile(datasetId: string, fileName: string, fileSize: number, fileType: string, storagePath: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('dataset_files')
      .insert({
        dataset_id: datasetId,
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType,
        storage_path: storagePath,
        ocr_status: ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'image'].some(ext => fileType.toLowerCase().includes(ext)) ? 'pending' : 'skipped',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
