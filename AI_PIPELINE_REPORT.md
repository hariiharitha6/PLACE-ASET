# AI Dataset Ingestion & Processing Pipeline Report

**Project Name:** PLACE@ASET — Enterprise Learning Management & Placement Assessment Platform  
**Target:** AI Processing Pipeline & Multi-Provider Router  
**Date:** July 22, 2026  

---

## 1. 19-Step Asynchronous Dataset Pipeline

The AI Processing Pipeline ([ai_processing_pipeline.service.ts](file:///c:/Users/harii/Downloads/PLACE@ASET/server/src/services/ai_processing_pipeline.service.ts)) processes uploaded dataset documents (CSV, XLSX, DOCX, PDF, TXT, ZIP, JSON, PNG, JPG) through 19 pipeline steps:
1. `INGESTION_RECEIVED`
2. `FORMAT_VALIDATED`
3. `OCR_EXTRACTED`
4. `TEXT_CLEANED`
5. `STRUCTURE_PARSED`
6. `VECTOR_EMBEDDING_GENERATED`
7. `DUPLICATE_SEARCH_PERFORMED`
8. `TOPIC_CLASSIFIED`
9. `DEPARTMENT_ASSIGNED`
10. `DIFFICULTY_PREDICTED`
11. `QUESTION_CANDIDATE_EXTRACTED`
12. `ANSWER_KEY_GENERATED`
13. `EXPLANATION_SYNTHESIZED`
14. `TAGS_GENERATED`
15. `REPOSITORY_TARGETED`
16. `QUALITY_SCORE_CALCULATED`
17. `DRAFT_RECORD_CREATED`
18. `APPROVAL_QUEUE_NOTIFIED`
19. `PIPELINE_COMPLETE`

---

## 2. Multi-Provider Router Matrix

Supported providers:
- **Gemini**: Primary model for high-throughput question extraction.
- **OpenAI**: Secondary model for complex code & explanation generation.
- **Claude**: Fallback model for natural language synthesis.
- **Azure OpenAI**: Enterprise endpoint fallback.
- **Ollama**: Local offline model option.
