**BASIC**

*Python & Coding*
1. Reverse a string/list, check if a string is a palindrome.
2. Count frequency of elements using a dict.
3. Remove duplicates from a list/string.
4. Find max/min in a list.
5. Merge two dictionaries.
6. Filter data (e.g., even numbers only).
7. Count letters, digits, and special characters in a string — know `isalpha()`, `isdigit()`, `isalnum()` cold.
8. Fix a buggy code snippet live.
9. What are `TypeError`, `ValueError`, `KeyError`, `AttributeError` — what triggers each?
10. List vs tuple — mutability, brackets, speed.
11. Sync vs async in Python — basic definition.
12. Flask vs FastAPI — at least the core difference (async-native vs sync).

*APIs & HTTP*
13. What is an API?
14. Difference between GET and POST.
15. Common HTTP status codes — 200, 400, 404, 429, 500.
16. How does request → response flow work?
17. What is JSON?
18. What is a webhook, at a basic level?

*Databases*
19. What is a table?
20. Difference between SQL and NoSQL.
21. Write a simple SELECT query.
22. What is a JOIN (basic idea)?
23. Why does indexing matter (basic idea)?
24. How do you read a dataframe in Pandas?
25. How do you filter data in Pandas / handle missing values?

*RAG Fundamentals*
26. What is RAG, and why not just use an LLM directly?
27. What's the difference between RAG and fine-tuning?
28. What is chunking, and why does it matter?
29. What breaks when chunks are too large versus too small?
30. Why parent-child chunking over fixed-size chunking?
31. What's the difference between keyword-based and semantic retrieval?
32. What are embeddings, and how does cosine similarity work?
33. Which embedding model do you use, and why?
34. Why Supabase/pgvector instead of a dedicated vector database like Pinecone?

*Archelon Architecture*
35. Walk me through Archelon's architecture end to end, from client request to streamed response.
36. What does your ingestion pipeline do, from file upload to a retrievable chunk?
37. Why SSE for streaming instead of WebSockets?
38. What is multi-tenancy, and at a basic level, how does Archelon separate tenants?
39. What is LangSmith, and what does it show you that plain logs don't?
40. What is a "trace," and what does one trace in Archelon contain?

---

**MEDIUM**

*Python / Production Habits*
41. **Flask vs FastAPI — all 5 differences**: async-native vs sync, Pydantic auto-validation vs manual, auto-generated Swagger docs at `/docs` vs none, built-in dependency injection vs none, newer/faster vs older/minimal.
42. Explain async properly: server handles multiple requests concurrently instead of waiting; critical when every request involves a slow LLM call.
43. What does Pydantic actually do — validates data types and structure against a defined schema (be precise; don't say "no JSON wrappers" or "output never cracked").
44. Webhook, properly explained: push-based HTTP callback — System A POSTs to System B the instant an event happens, no polling.
45. **Webhook vs WebSocket** — webhook is a one-time callback; WebSocket is a persistent two-way connection (Supabase real-time uses this).
46. Failure handling beyond "status codes and console logs" — retry logic, exponential backoff, fallback responses, dead-letter queues, alerting.
47. Modular backend — separating routes, business logic, and DB operations into distinct files/modules; tie to Archelon's ingestion, retrieval, classification, and API-route modules.

*Retrieval Internals*
48. Which distance operator are you using in pgvector, and why?
49. Are you using an HNSW or IVF index, and how did you choose?
50. **Dense vs sparse retrieval** — dense uses embeddings for semantic similarity; sparse (BM25) uses exact keyword matching.
51. When does sparse retrieval outperform dense — exact product codes, acronyms, rare terms an embedding model underweights?
52. What is hybrid retrieval, and how would you combine dense + sparse scores (reciprocal rank fusion, weighted sum, etc.)?
53. Why does Archelon use pure dense retrieval, and what's the actual failure mode when a user searches an exact term or ID?
54. Walk me through your custom query rewriting / multi-query retrieval — how many rewritten queries fire, and how are results merged/deduped?
55. A retrieval pass returns more candidates than fit in context — how do you decide what makes the cut? Do you rerank? Why not just raise the similarity threshold instead?
56. Compare fixed-size, semantic, and parent-child chunking — why parent-child won for your document types.

*Multi-Tenancy*
57. How do you guarantee Tenant A's query never returns Tenant B's chunks — Row-Level Security or application-layer filtering?
58. Why pgvector with RLS over a separate database per tenant?
59. What's your rate-limiting and token-metering strategy per tenant?

*Evaluation & Observability*
60. How do you use RAGAs — which metrics, and what counts as "good enough"?
61. When a RAGAs score is bad, how do you tell retrieval failure from generation failure?
62. What does your system prompt say to keep the model grounded in context?
63. **Do you have LLM monitoring in production?** — never answer "I haven't used LangSmith" with nothing behind it; state what you do log (inputs, outputs, latency, errors) even if it's simpler than a dedicated tool.
64. In LangSmith, how do you distinguish a slow retrieval span from a slow generation span?
65. What metrics do you track per tenant (tokens, latency, error rate) — is there alerting, or do you only look after something breaks?

*Deployment & Infra*
66. Docker Compose — what do `services`, `volumes`, `ports`, `environment`, and `depends_on` each do?
67. Kubernetes — conceptual vocabulary only: Pod, Node, Cluster, Deployment, Service; the one-liner that it orchestrates containers across machines vs Docker running one container on one machine. Fine to be honest about no production experience, but give the concept first.
68. How would you fine-tune your embedding model on Archelon's actual client documents — what would the training data look like?
69. If a client's knowledge base changes daily, how does Archelon stay current — re-embed on update, or batch job?
70. When a client reports a wrong answer, do you have the trace to pull, or are you reconstructing what happened after the fact?

*Bugs You've Actually Hit — Know These Cold*
71. TXT ingestion wasn't parsed initially — what was the bug, how did you catch it?
72. Widget output cap wasn't enforced — what was the failure, what was the fix?
73. Pandas is for tabular data, not document loading — what do you actually use to parse PDFs/docs (PyPDF, python-docx, custom parser)?

*Project Explanation*
74. Explain one project deeply: problem, what you built, how it works, tools used, challenges, impact — have your numbers memorized exactly (10,000+ keys, 50 languages — not "10,020 and 1,050").
75. Give a crisp 30-second positioning line before expanding — don't jump between projects without a thread.

---

**ADVANCED**

*Retrieval Depth*
76. What is a cross-encoder reranker, and why can't it pre-compute representations the way a bi-encoder can?
77. If you added a reranker, which metric — MRR, MAP, or NDCG — would justify it, and why does it fit your query distribution better than the others?
78. If you added hybrid retrieval to Archelon today, what would need to change in your pgvector setup to support BM25 alongside vector search?
79. Justify your architectural choices, not just describe them — explicit feedback you've already received.

*Security & Isolation*
80. Beyond missing WHERE clauses, could embedding-space similarity ever surface one tenant's content in another's results even with filtering in place?
81. How do you audit that tenant context propagates correctly through the entire retrieval and orchestration chain, not just at the API boundary?
82. Could a malicious document uploaded by one tenant contain a prompt injection designed to leak another tenant's data or override your system prompt?
83. If a document is crafted to make the LLM ignore "answer only from context," what's your actual defense — system prompt alone, or output filtering too?
84. Your traces and prompts likely contain client data — how do you prevent LangSmith itself from becoming a cross-tenant leak vector?

*Scale & Production System Design*
85. **"How would you ingest and make 1 million PDFs searchable?"** — parallel/batched ingestion workers; a queue to decouple upload from processing; async chunking/embedding with status tracking; batch embedding calls instead of one-by-one; incremental/resumable ingestion so a failure at document 700,000 doesn't restart everything; storage cost and HNSW index-build time growing with corpus size; deduplication before embedding.
86. How do a chat API and an ingestion pipeline scale independently — why not just "add more of everything"?
87. Queuing, async processing, rate limiting, token budgets — mention explicitly for any "production-ready LLM workflow" question; a purely architectural answer with no concurrency was flagged as a real gap before.
88. At what tenant count or query volume does pgvector with RLS stop scaling gracefully — what forces a move to per-tenant collections or a dedicated vector store?
89. If traffic went up 10x tomorrow, what's the actual first thing that breaks, and how do you know that's the bottleneck rather than guessing?
90. What load balancer, Redis caching, or connection-pooling layer would you add next, and why (Supabase already handles pooling)?

*Evaluation Depth*
91. LLM-as-judge models are known to favor verbose, fluent answers regardless of correctness — how do you know your OpenAI-judge RAGAs scores aren't rewarding fluency over grounding?
92. How would you build a golden evaluation set to calibrate your judge against real human judgments, and how often would you refresh it to catch drift?
93. Even with the correct chunk retrieved, the model can still hallucinate — parametric memory, overgeneralization, or gap-filling. Which have you seen in Archelon, and how did you diagnose which one?

*Trade-offs / Reversibility*
94. Why pgvector over Pinecone — at what scale would you reconsider?
95. What's the weakest, least battle-tested part of Archelon right now, and how would you expose that in five minutes of questioning if you were the interviewer?
96. If you rebuilt Archelon today, what's the first architectural decision you'd reverse, and what would it cost to migrate live tenants?
97. What would it take to make a production incident fully replayable — prompt version, retrieved chunks, model version — versus what Archelon actually captures today?

---

The recurring theme across your real interview feedback isn't missing knowledge — it's specific phrasings that blank under pressure (Flask/FastAPI, webhook/websocket, Pydantic precision) and one habit worth breaking: answering a tool-name question literally ("I haven't used LangSmith") instead of bridging to what you actually do have. Worth rehearsing #41, #45, #63, and #74's exact numbers out loud a few times before your next round — those are the four that have already cost you points twice.