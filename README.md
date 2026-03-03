# Base44 App
# 🚀 AI-Powered RAG Chatbot (Built with Base44)

A fully functional, AI-driven application developed using the **Base44** app builder. This project implements a **Retrieval-Augmented Generation (RAG)** framework to provide context-aware responses based on custom data sources.

## 🛠️ Features
*   **Intelligent Retrieval**: Dynamically fetches relevant information from uploaded documents or databases.
*   **Contextual Generation**: Uses a Large Language Model (LLM) to synthesize answers grounded in retrieved data.
*   **Modern UI/UX**: A clean, responsive frontend built with React/Vite, exported from Base44.
*   **Real-time Interaction**: Integrated chat interface with session history management.

## 📐 RAG Framework Architecture

The following flowchart illustrates the data flow from a user query to the final generated response:

```mermaid
graph TD
    A[User Query] --> B{Retriever Engine}
    B -->|Search| C[(Vector Database)]
    C -->|Relevant Chunks| B
    B --> D[Prompt Augmenter]
    D -->|Query + Context| E[LLM / Generative AI]
    E --> F[Refined Response]
    F --> G[User Interface]
    
    subgraph Data Injection Pipeline
    H[Raw Documents] --> I[Text Chunker]
    I --> J[Embedding Model]
    J --> C
    end