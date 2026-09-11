# PaperPilot

## AI Document Research Assistant

PaperPilot is an AI-powered document research assistant that allows users to upload PDF documents and ask questions about their contents. It uses Retrieval-Augmented Generation (RAG) to retrieve relevant document sections and generate grounded answers with page-referenced sources.

## Features

- PDF document upload and processing
- RAG-based question answering
- MongoDB Atlas Vector Search for semantic retrieval
- Keyword search for lexical matching
- Hybrid retrieval using Reciprocal Rank Fusion (RRF)
- Cross-Encoder reranking for improved context selection
- Page-aware document chunking
- Local embeddings using Ollama
- Local LLM inference using Ollama
- Asynchronous document processing with BullMQ
- Redis-backed response caching
- Server-Sent Events (SSE) for streaming responses
- AWS S3 object storage for uploaded PDFs
- JWT-based authentication
- User-level document authorization
- Redis-backed rate limiting
- PDF file type and size validation
- Conversation history for document-based questions

## Architecture

```text
                         ┌─────────────────────┐
                         │       Client        │
                         │    React / Vite     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Node.js / Express │
                         │       REST API      │
                         └──────────┬──────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
             MongoDB Atlas       Redis             AWS S3
             Metadata +          Cache              PDF Storage
             Vector Search
                  │
                  ▼
          ┌───────────────────┐
          │    BullMQ Queue   │
          │  Async Processing │
          └─────────┬─────────┘
                    │
                    ▼
          ┌───────────────────┐
          │ Document Worker   │
          │                   │
          │ PDF Extraction    │
          │ Chunking          │
          │ Embeddings        │
          └─────────┬─────────┘
                    │
                    ▼
          ┌───────────────────┐
          │    RAG Pipeline   │
          │                   │
          │ Vector Search     │
          │ Keyword Search    │
          │ Hybrid RRF        │
          │ Reranking         │
          └─────────┬─────────┘
                    │
                    ▼
          ┌───────────────────┐
          │      Ollama       │
          │                   │
          │ nomic-embed-text  │
          │ qwen2.5:7b        │
          └───────────────────┘
