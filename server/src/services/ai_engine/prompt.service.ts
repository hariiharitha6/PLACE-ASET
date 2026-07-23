import { getSupabase } from '../../config/database';
import logger from '../../utils/logger';

export class PromptService {
  static async getTemplates() {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('ai_prompt_templates').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
      return [
        {
          key: 'question_categorization',
          title: 'Question Categorization & Tagging',
          description: 'Classifies questions into subject, topic, subtopic, company, and difficulty',
          template_text: 'Analyze statement: {{statement}}',
          variables: ['statement'],
          version: 1,
        },
        {
          key: 'explanation_generation',
          title: 'Step-by-step Solution Generator',
          description: 'Generates detailed step-by-step explanations for technical questions',
          template_text: 'Explain solution for: {{statement}} with answer: {{correct_answer}}',
          variables: ['statement', 'correct_answer'],
          version: 1,
        },
        {
          key: 'question_generation',
          title: 'AI Question Generator',
          description: 'Generates synthetic exam and practice questions',
          template_text: 'Generate {{count}} questions for {{subject}} {{topic}} at {{difficulty}} difficulty.',
          variables: ['count', 'subject', 'topic', 'difficulty'],
          version: 1,
        },
      ];
    }
    return data;
  }

  static async updateTemplate(key: string, newTemplateText: string, newTitle?: string) {
    const supabase = getSupabase();
    const { data: current } = await supabase.from('ai_prompt_templates').select('*').eq('key', key).single();

    if (!current) {
      throw new Error(`Prompt template '${key}' not found.`);
    }

    const newVersion = (current.version || 1) + 1;
    const history = current.history || [];
    history.push({
      version: current.version,
      template_text: current.template_text,
      updated_at: new Date().toISOString(),
    });

    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .update({
        template_text: newTemplateText,
        title: newTitle || current.title,
        version: newVersion,
        history,
        updated_at: new Date().toISOString(),
      })
      .eq('key', key)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update prompt template', { key, error: error.message });
      throw new Error(error.message);
    }

    return data;
  }
}
