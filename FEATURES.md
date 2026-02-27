# Promptium Features

## Prompt Library

- Save prompts from popup, side panel, or in-page toolbar
- Edit prompts from the library workflow
- Tag system with custom user-defined tags
- Filter by tags and search terms
- Structured categorization support for organized retrieval

## Prompt Enhancement

- Improve prompts before saving or injecting
- One-click optimization with style modes (general, coding, study, creative)
- Direct inject to the active LLM chat after improvement

## Curated Templates

- Built-in expert templates for common tasks
- Expandable template architecture via `utils/templates.js`

## Semantic Search

- Transformers.js powered embedding search
- Relevance-based ranking from cosine similarity
- Vector similarity comparison for semantically related prompts
- Efficient indexing strategy using cached embeddings in extension storage

## Chat Export

- Select specific message ranges using in-page checkboxes
- Multi-format export: Markdown, PDF, JSON, Plain Text
- Custom header/footer style controls through export preferences and metadata toggles

## Settings

- API key management for Gemini-based prompt improvement
- Model selection behavior through style presets and AI readiness state
- Feature toggles for semantic search, duplicate detection, and auto-tagging

## Additional UX Improvements

- Action-oriented empty states with primary CTAs
- Actionable error states with retry paths and guidance
- Side panel hash routing (`#prompts`, `#settings`, etc.)
- Updated onboarding with feature grouping and launch actions
