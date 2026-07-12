window.__ARCHELON_INTERVIEW_QA__ = [
  {
    "question": "Reverse a string/list, check if a string is a palindrome.",
    "type": "Basic",
    "category": "Python & Coding",
    "tags": ["Python", "strings", "lists", "palindrome"],
    "answer": "**Direct answer**\n\nIn Python, slicing with a negative step is the clearest way to reverse a string or list. A palindrome reads the same forward and backward.\n\n```python\ndef reverse_string(text: str) -> str:\n    return text[::-1]\n\ndef reverse_list(items: list) -> list:\n    return items[::-1]\n\ndef is_palindrome(text: str) -> bool:\n    normalized = ''.join(ch.lower() for ch in text if ch.isalnum())\n    return normalized == normalized[::-1]\n```\n\nThe normalization makes `A man, a plan, a canal: Panama` pass by ignoring case, spaces, and punctuation. Reversing and comparing both take `O(n)` time, and slicing creates an `O(n)` copy. If the interviewer requires constant extra space, I would compare characters with two pointers instead."
  },
  {
    "question": "Count frequency of elements using a dict.",
    "type": "Basic",
    "category": "Python & Coding",
    "tags": ["Python", "dictionary", "frequency counting", "complexity"],
    "answer": "**Implementation**\n\n```python\ndef frequencies(items):\n    counts = {}\n    for item in items:\n        counts[item] = counts.get(item, 0) + 1\n    return counts\n```\n\n`dict.get(item, 0)` avoids a separate membership check. The loop is `O(n)` average time because dictionary lookup and assignment are `O(1)` on average, and space is `O(k)` for `k` unique elements. In production code I could also use `collections.Counter(items)`, but in an interview I would first show that I understand the dictionary approach. Archelon uses the related `defaultdict(list)` pattern for its in-memory rate-limit stores."
  },
  {
    "question": "Remove duplicates from a list/string.",
    "type": "Basic",
    "category": "Python & Coding",
    "tags": ["Python", "deduplication", "set", "order preservation"],
    "answer": "**Order-preserving solution**\n\n```python\ndef dedupe_list(items):\n    return list(dict.fromkeys(items))\n\ndef dedupe_string(text: str) -> str:\n    return ''.join(dict.fromkeys(text))\n```\n\nA plain `set(items)` removes duplicates but does not communicate an ordering guarantee, so I use `dict.fromkeys` when original order matters. Both approaches are `O(n)` average time and `O(k)` space for `k` unique values. For unhashable values such as nested lists, I would use a result list plus equality checks, or convert each value to a stable hashable representation when that conversion is valid for the domain."
  },
  {
    "question": "Find max/min in a list.",
    "type": "Basic",
    "category": "Python & Coding",
    "tags": ["Python", "min", "max", "complexity"],
    "answer": "**Direct answer**\n\n```python\ndef find_bounds(values):\n    if not values:\n        raise ValueError('values must not be empty')\n    return min(values), max(values)\n```\n\nEach built-in scans the list, so this is still `O(n)` time but performs two passes. If I need both values in one pass, I initialize both from the first element and update them together. That remains `O(n)` time and `O(1)` extra space. I handle the empty-list case explicitly because `min([])` and `max([])` raise `ValueError`, and an interviewer will often probe edge cases after the happy path."
  },
  {
    "question": "Merge two dictionaries.",
    "type": "Basic",
    "category": "Python & Coding",
    "tags": ["Python", "dictionary", "merge", "conflict resolution"],
    "answer": "**Implementation**\n\n```python\ndef merge(left: dict, right: dict) -> dict:\n    return left | right\n```\n\nFor Python 3.9 and later, the union operator is concise and returns a new dictionary. If both dictionaries contain the same key, the value from `right` wins. The equivalent older syntax is `{**left, **right}`. If overwriting is not acceptable, I would detect `left.keys() & right.keys()` first and either raise an error or apply a domain-specific merge rule. The important interview point is to state the collision behavior rather than silently assuming the keys are disjoint."
  },
  {
    "question": "Filter data (e.g., even numbers only).",
    "type": "Basic",
    "category": "Python & Coding",
    "tags": ["Python", "filtering", "list comprehension", "iterators"],
    "answer": "**Implementation**\n\n```python\ndef even_numbers(values):\n    return [value for value in values if value % 2 == 0]\n```\n\nA list comprehension is readable and returns a materialized list. It takes `O(n)` time and up to `O(n)` output space. For a large stream where I do not need every result in memory, I would use a generator expression instead: `(value for value in values if value % 2 == 0)`. I also clarify the expected input type because `% 2` assumes numeric values; mixed input should be validated rather than failing halfway through processing."
  },
  {
    "question": "Count letters, digits, and special characters in a string — know `isalpha()`, `isdigit()`, `isalnum()` cold.",
    "type": "Basic",
    "category": "Python & Coding",
    "tags": ["Python", "strings", "Unicode", "character classification"],
    "answer": "**Implementation**\n\n```python\ndef count_character_types(text: str) -> dict:\n    counts = {'letters': 0, 'digits': 0, 'special': 0}\n    for char in text:\n        if char.isalpha():\n            counts['letters'] += 1\n        elif char.isdigit():\n            counts['digits'] += 1\n        else:\n            counts['special'] += 1\n    return counts\n```\n\n`isalpha()` checks alphabetic Unicode characters, `isdigit()` checks digit characters, and `isalnum()` is true when a non-empty string contains only alphabetic or numeric characters. In this version, spaces count as special characters. If the requirement treats whitespace separately, I add `char.isspace()` before the final branch. The algorithm is `O(n)` time and `O(1)` extra space."
  },
  {
    "question": "Fix a buggy code snippet live.",
    "type": "Medium",
    "category": "Python & Coding",
    "tags": ["debugging", "Python", "testing", "communication"],
    "answer": "**How I handle it live**\n\nI first restate the intended behavior and reproduce the failure with the smallest input. Then I read the traceback from the final exception upward, inspect the values and types near that line, and separate syntax, runtime, and logic errors. I make the smallest justified change, rerun the failing case, and test one normal case plus edge cases such as empty input, `None`, duplicates, or boundary values.\n\nI also explain my reasoning aloud: what I expected, what the program actually did, and what evidence supports the fix. I avoid rewriting the whole function before understanding the failure because that can hide the original bug and introduce new ones. If external calls are involved, I isolate them with a mock or a fixed response so the test is deterministic."
  },
  {
    "question": "What are `TypeError`, `ValueError`, `KeyError`, `AttributeError` — what triggers each?",
    "type": "Basic",
    "category": "Python & Coding",
    "tags": ["Python", "exceptions", "debugging", "error handling"],
    "answer": "**The distinction is about what was wrong**\n\n- `TypeError`: the operation received an incompatible type, such as `'2' + 2`.\n- `ValueError`: the type is acceptable but the value is invalid, such as `int('abc')` or `min([])`.\n- `KeyError`: dictionary subscription requested a missing key, such as `user['phone']` when `phone` is absent.\n- `AttributeError`: an object does not have the requested attribute or method, such as `'text'.append('x')`.\n\nI catch these only when I can recover meaningfully. For example, `mapping.get('key')` can be appropriate for an optional key, but broad `except Exception` blocks can hide programming errors. Archelon explicitly raises `ValueError` for invalid messages, unsupported document formats, oversized parsed content, and missing Supabase configuration."
  },
  {
    "question": "List vs tuple — mutability, brackets, speed.",
    "type": "Basic",
    "category": "Python & Coding",
    "tags": ["Python", "list", "tuple", "mutability"],
    "answer": "**Core difference**\n\nA list is mutable and normally written with square brackets: `[1, 2, 3]`. I can append, remove, or replace elements. A tuple is immutable and normally written with parentheses: `(1, 2, 3)`. A one-item tuple needs a trailing comma: `(1,)`.\n\nTuples usually use less memory and can be slightly faster to create or iterate in CPython, but speed is not the main reason to choose them. I use a tuple when the collection represents a fixed record or should not change, and a list when items must be added, removed, or reordered. A tuple is hashable only when all of its elements are hashable, which can make it usable as a dictionary key; a list cannot be a dictionary key."
  },
  {
    "question": "Sync vs async in Python — basic definition.",
    "type": "Basic",
    "category": "Python & Coding",
    "tags": ["Python", "asyncio", "concurrency", "I/O"],
    "answer": "**Core difference**\n\nSynchronous code completes one operation before moving to the next. Asynchronous code can pause at an `await` while an I/O operation is waiting, allowing the event loop to run other tasks. This is concurrency, not automatically parallel CPU execution. It is most useful for network, database, and file I/O; CPU-heavy work should usually move to a worker process or thread.\n\n**In Archelon**\n\nFastAPI routes and pipeline functions use `async def`. Multi-query retrieval launches vector searches together with `asyncio.gather`, and `httpx.AsyncClient` waits non-blockingly for Mistral and Supabase HTTP calls. One caveat is that the Supabase Python client calls are synchronous even though many wrappers are declared async, so those calls can still block the event loop. Embedding updates explicitly use `asyncio.to_thread` to reduce that problem."
  },
  {
    "question": "Flask vs FastAPI — at least the core difference (async-native vs sync).",
    "type": "Basic",
    "category": "Python & Coding",
    "tags": ["Flask", "FastAPI", "ASGI", "web frameworks"],
    "answer": "**Simple comparison**\n\nFastAPI is built around the Asynchronous Server Gateway Interface and supports `async def`, type-driven validation through Pydantic, dependency injection, and generated OpenAPI documentation. Flask is a smaller Web Server Gateway Interface framework with a long-established extension ecosystem. Modern Flask can run async views, but each request still occupies one worker under its WSGI model, so it is not equivalent to an async-native ASGI stack.\n\n**Why Archelon uses FastAPI**\n\nArchelon spends much of each request waiting for embedding, retrieval, and language-model APIs. FastAPI fits that I/O-heavy workflow, provides Pydantic request validation, supports streaming responses, and exposes interactive API documentation automatically. The choice is about the workload and built-in API features, not a claim that Flask is always slow or unsuitable."
  },
  {
    "question": "What is an API?",
    "type": "Basic",
    "category": "APIs & HTTP",
    "tags": ["API", "HTTP", "contract", "integration"],
    "answer": "**Definition**\n\nAn Application Programming Interface is a contract that lets one software component request data or behavior from another without depending on its internal implementation. For a web API, that contract normally defines endpoints, HTTP methods, authentication, request fields, response fields, and error codes.\n\n**Archelon example**\n\nThe React frontend calls FastAPI endpoints such as `POST /api/chat/stream`, `POST /api/ingest`, and `GET /api/agents`. The public developer API and widget provide separate contracts for external clients. Pydantic validates incoming request bodies, JSON carries structured data, and Server-Sent Events carry streamed chat events. A good API boundary allows the frontend or widget to change independently as long as both sides preserve that contract."
  },
  {
    "question": "Difference between GET and POST.",
    "type": "Basic",
    "category": "APIs & HTTP",
    "tags": ["HTTP", "GET", "POST", "idempotency"],
    "answer": "**GET**\n\n`GET` retrieves a representation and should be safe: calling it should not intentionally change application state. It is normally cacheable and its parameters commonly appear in the URL.\n\n**POST**\n\n`POST` submits data for processing and commonly creates a resource or starts an operation. It is not idempotent by default, meaning repeating the request may create or trigger the action again. Its input normally goes in the request body.\n\nIn Archelon, `GET /api/agents` reads agents, while `POST /api/agents` creates one and `POST /api/chat/stream` starts generation. Authentication or usage timestamps may cause incidental writes during a GET, but the endpoint's intended semantics should still be retrieval. Sensitive credentials should be sent in headers, not query strings."
  },
  {
    "question": "Common HTTP status codes — 200, 400, 404, 429, 500.",
    "type": "Basic",
    "category": "APIs & HTTP",
    "tags": ["HTTP", "status codes", "errors", "rate limiting"],
    "answer": "**Common meanings**\n\n- `200 OK`: the request succeeded.\n- `400 Bad Request`: the client sent invalid data or violated a request rule.\n- `404 Not Found`: the requested resource does not exist, or the API intentionally does not reveal it.\n- `429 Too Many Requests`: the caller exceeded a rate limit; a mature API can include `Retry-After`.\n- `500 Internal Server Error`: an unexpected server-side failure occurred.\n\nArchelon uses `400` for invalid uploads and settings, `404` for missing agents or jobs, and `429` for in-memory rate limits. It also uses `401` for missing or invalid authentication, `403` for a valid key without access, and `402` for exhausted token balance. I avoid returning `500` for expected validation or authorization failures because clients need actionable status codes."
  },
  {
    "question": "How does request → response flow work?",
    "type": "Basic",
    "category": "APIs & HTTP",
    "tags": ["HTTP", "request", "response", "middleware"],
    "answer": "**Typical flow**\n\n1. A client resolves the server address and opens a network connection, normally protected by Transport Layer Security.\n2. It sends an HTTP request containing a method, path, headers, and optionally a body.\n3. The web server and framework run middleware, route matching, authentication, validation, and business logic.\n4. The application may call databases or external services.\n5. The server returns a status code, headers, and a response body; the client parses and renders it.\n\nIn Archelon, Uvicorn serves FastAPI, Cross-Origin Resource Sharing middleware handles browser access, Pydantic validates bodies, dependencies verify JSON Web Tokens, and routers call pipeline and Supabase modules. Standard endpoints return JSON. Chat streaming keeps the HTTP response open and sends multiple Server-Sent Event frames before the connection completes."
  },
  {
    "question": "What is JSON?",
    "type": "Basic",
    "category": "APIs & HTTP",
    "tags": ["JSON", "serialization", "API", "data format"],
    "answer": "**Definition**\n\nJavaScript Object Notation is a text format for structured data. It supports objects, arrays, strings, numbers, booleans, and `null`. It is language-independent even though its syntax resembles JavaScript objects.\n\n```json\n{\n  \"message\": \"What is RAG?\",\n  \"agent_id\": \"abc-123\",\n  \"stream\": true\n}\n```\n\nJSON is not the same as a Python dictionary: JSON requires double-quoted keys and strings, uses `true`, `false`, and `null`, and cannot directly represent objects such as datetimes or byte arrays without an agreed encoding. Archelon uses JSON for REST bodies, Supabase data, Mistral responses, and each Server-Sent Event payload."
  },
  {
    "question": "What is a webhook, at a basic level?",
    "type": "Basic",
    "category": "APIs & HTTP",
    "tags": ["webhook", "HTTP", "event-driven", "integration"],
    "answer": "**Definition**\n\nA webhook is a push-based HTTP callback. When an event happens in System A, it sends an HTTP request, usually `POST`, to a URL owned by System B. That avoids System B repeatedly polling for changes.\n\nA production webhook should authenticate the sender, verify a signature, handle retries, be idempotent, and return quickly before doing expensive work asynchronously. Archelon's `ChatView.jsx` sends resume-submission data to an n8n webhook. The repository shows the client-side POST, but it does not show the receiving n8n workflow, signature verification, retry policy, or durable delivery, so I would describe those as unverified rather than implemented."
  },
  {
    "question": "What is a table?",
    "type": "Basic",
    "category": "Databases",
    "tags": ["database", "table", "rows", "columns"],
    "answer": "**Definition**\n\nA table is a named relational structure made of rows and columns. Each column has a name and data type, while each row represents one record. Constraints such as primary keys, foreign keys, uniqueness, and non-null rules protect data integrity. Row order is not guaranteed unless a query uses `ORDER BY`.\n\nArchelon stores entities in Supabase PostgreSQL tables including `users`, `agents`, `documents`, `ingestion_jobs`, `parent_chunks`, `child_chunks`, `token_usage`, `widget_keys`, and `developer_api_keys`. The code shows how those tables are queried, but this repository does not include schema migrations, so exact database constraints and every column definition cannot be verified locally."
  },
  {
    "question": "Difference between SQL and NoSQL.",
    "type": "Basic",
    "category": "Databases",
    "tags": ["SQL", "NoSQL", "PostgreSQL", "data modeling"],
    "answer": "**SQL databases**\n\nRelational databases organize data into tables with defined relationships and are queried with Structured Query Language. They are strong when transactions, joins, constraints, and consistent schemas matter.\n\n**NoSQL databases**\n\nNoSQL is an umbrella term for document, key-value, wide-column, and graph databases. They often favor flexible records or access patterns designed for a specific scale and workload. NoSQL does not mean no schema or no consistency; those choices depend on the product.\n\nArchelon uses Supabase PostgreSQL because users, agents, documents, chunks, keys, and usage records have clear relationships. PostgreSQL also supports flexible JSON data and pgvector, so Archelon can keep relational metadata and embeddings together instead of operating a second database."
  },
  {
    "question": "Write a simple SELECT query.",
    "type": "Basic",
    "category": "Databases",
    "tags": ["SQL", "SELECT", "filtering", "sorting"],
    "answer": "**Example**\n\n```sql\nSELECT id, name, model\nFROM agents\nWHERE user_id = 'user-123'\n  AND is_active = TRUE\nORDER BY name ASC\nLIMIT 20;\n```\n\n`SELECT` chooses the columns, `FROM` identifies the table, `WHERE` filters rows, `ORDER BY` makes result order explicit, and `LIMIT` caps the result. In application code I would pass `user_id` as a parameter rather than building SQL with string concatenation, which prevents SQL injection and improves plan reuse. Archelon's Supabase client expresses the same operation through chained methods such as `.table('agents').select('*').eq('user_id', user_id)`."
  },
  {
    "question": "What is a JOIN (basic idea)?",
    "type": "Basic",
    "category": "Databases",
    "tags": ["SQL", "JOIN", "relationships", "foreign keys"],
    "answer": "**Definition**\n\nA join combines related rows from two or more tables using a matching condition. An `INNER JOIN` returns only matches, while a `LEFT JOIN` keeps every row from the left table and uses `NULL` where no right-side match exists.\n\n```sql\nSELECT d.filename, a.name AS agent_name\nFROM documents AS d\nJOIN agents AS a ON a.id = d.agent_id\nWHERE a.user_id = 'user-123';\n```\n\nIn Archelon, this relationship chain is central to tenant-aware retrieval: users own agents, agents own documents, documents own parent chunks, and parents own child chunks. The deployed vector-search SQL is not in the repository, so its exact joins must be verified in Supabase rather than inferred from local documentation."
  },
  {
    "question": "Why does indexing matter (basic idea)?",
    "type": "Basic",
    "category": "Databases",
    "tags": ["database", "index", "query performance", "trade-offs"],
    "answer": "**Core idea**\n\nA database index is an additional data structure that helps the database find matching rows without scanning the entire table. It can greatly improve filters, joins, sorting, and nearest-neighbor search when the query matches the index design.\n\nIndexes are not free. They consume storage, slow inserts and updates, and require the planner to choose an appropriate access path. I select indexes from actual query patterns and verify them with query plans rather than indexing every column. Archelon needs ordinary indexes on ownership and foreign-key paths, plus a pgvector index or exact vector scan for embeddings. The repository contains no migrations or index definitions, so the deployed vector-index type cannot be confirmed from code."
  },
  {
    "question": "How do you read a dataframe in Pandas?",
    "type": "Basic",
    "category": "Databases",
    "tags": ["Pandas", "DataFrame", "CSV", "data loading"],
    "answer": "**Common examples**\n\n```python\nimport pandas as pd\n\ndf = pd.read_csv('data.csv')\nexcel_df = pd.read_excel('data.xlsx', sheet_name='Sheet1')\njson_df = pd.read_json('data.json')\n```\n\nFor large files I specify `usecols`, `dtype`, `parse_dates`, or `chunksize` so Pandas does less guessing and uses less memory. I inspect `df.head()`, `df.info()`, and `df.dtypes` immediately after loading. Archelon does not use Pandas and it is not in `backend/requirements.txt`; document ingestion uses PyMuPDF for PDFs and `python-docx` for DOCX files because those formats require document-structure extraction, not tabular analysis."
  },
  {
    "question": "How do you filter data in Pandas / handle missing values?",
    "type": "Basic",
    "category": "Databases",
    "tags": ["Pandas", "filtering", "missing data", "data cleaning"],
    "answer": "**Filtering**\n\n```python\nadults = df.loc[df['age'].ge(18) & df['country'].eq('IN')].copy()\n```\n\nParentheses matter because each comparison produces a Boolean Series. `.copy()` is useful when I plan to modify the filtered result.\n\n**Missing values**\n\n```python\ndf['score'] = df['score'].fillna(df['score'].median())\ndf = df.dropna(subset=['user_id'])\nmissing_by_column = df.isna().sum()\n```\n\nI do not automatically fill every missing value. I first ask whether missing means unknown, not applicable, or bad input, then choose `dropna`, `fillna`, interpolation, or an explicit missing category. Archelon has no active Pandas pipeline, so this is general data-engineering knowledge rather than an implemented project feature."
  },
  {
    "question": "What is RAG, and why not just use an LLM directly?",
    "type": "Basic",
    "category": "RAG Fundamentals",
    "tags": ["RAG", "LLM", "grounding", "hallucination"],
    "answer": "**Core idea**\n\nRetrieval-Augmented Generation, or RAG, retrieves relevant information from an external knowledge base and places it in the language model's prompt. A standalone model can only rely on its prompt and parametric knowledge, which may be outdated, generic, or unaware of private client documents. RAG makes knowledge updateable at request time, supports source attribution, and reduces hallucination risk. It does not eliminate hallucinations because retrieval and generation can each fail.\n\n**In Archelon**\n\nDocuments are parsed into parent and child chunks, and child chunks are embedded with Mistral's `mistral-embed`. A query is rewritten into search phrases, embedded, and sent to a Supabase vector-search endpoint. The backend selects relevant parent sections, places them in a strict grounding prompt, and calls the configured Mistral or OpenAI model. Client knowledge can therefore change without retraining the language model whenever a document is added or removed."
  },
  {
    "question": "What's the difference between RAG and fine-tuning?",
    "type": "Medium",
    "category": "RAG Fundamentals",
    "tags": ["RAG", "fine-tuning", "knowledge", "model behavior"],
    "answer": "**RAG changes the model's input**\n\nRAG retrieves external information at inference time and inserts it into the prompt. It is a strong choice for changing facts, private documents, citations, and access-controlled knowledge. Its costs are retrieval latency, index maintenance, and the possibility of retrieving the wrong context.\n\n**Fine-tuning changes the model's parameters**\n\nFine-tuning trains a model on examples to change behavior, style, task performance, or output format. It is not a reliable replacement for a frequently changing factual database, and updating facts requires new training.\n\nArchelon implements RAG and does not contain a fine-tuning pipeline. A mature system could use both: RAG for tenant knowledge and fine-tuning for consistent task behavior or domain-specific response patterns. I would evaluate that combination rather than treating the two approaches as mutually exclusive."
  },
  {
    "question": "What is chunking, and why does it matter?",
    "type": "Basic",
    "category": "RAG Fundamentals",
    "tags": ["chunking", "retrieval", "embeddings", "context window"],
    "answer": "**Definition**\n\nChunking divides a document into smaller retrievable units before embedding and indexing it. The chunk is the unit whose meaning gets compressed into an embedding, so its boundaries and size directly affect retrieval precision, context completeness, storage, and prompt cost.\n\n**In Archelon**\n\n`backend/ingestion/chunker.py` preserves detected heading structure when building parent chunks of up to about 800 estimated tokens. It then creates sentence-level child chunks of up to about 150 estimated tokens. Child chunks are embedded for precise search; their parent sections are returned for generation context. The values are design parameters, not universally correct constants, and the repository has no benchmark comparing alternatives, so they should be tuned using representative questions and retrieval metrics."
  },
  {
    "question": "What breaks when chunks are too large versus too small?",
    "type": "Medium",
    "category": "RAG Fundamentals",
    "tags": ["chunking", "retrieval precision", "context", "trade-offs"],
    "answer": "**Chunks that are too large**\n\nA large chunk may mix several topics, so its embedding becomes less specific. Retrieval can return a broadly related section with the answer buried inside unrelated text. Large chunks also consume more context-window tokens and reduce how many independent sources fit in the prompt.\n\n**Chunks that are too small**\n\nA small chunk can lose headings, definitions, qualifiers, table context, or references such as 'it' and 'this policy'. Retrieval may find the exact sentence but leave the model without enough information to answer correctly. More chunks also increase embedding and index overhead.\n\nArchelon addresses this with small searchable children and larger generation parents. That reduces the precision-versus-context conflict, but parent boundaries can still split related material, and only evaluation can show whether 150/800-token targets are right for a specific corpus."
  },
  {
    "question": "Why parent-child chunking over fixed-size chunking?",
    "type": "Medium",
    "category": "RAG Fundamentals",
    "tags": ["chunking", "parent-child retrieval", "embeddings", "context"],
    "answer": "**Why this pattern**\n\nParent-child chunking separates search precision from generation context. A small child is easier to match against a focused question, while its larger parent preserves the surrounding explanation. Pure fixed-size chunks make one size serve both goals and can split a meaningful section at an arbitrary boundary.\n\n**How Archelon implements it**\n\n`backend/ingestion/chunker.py` creates section-aware parents of up to about 800 estimated tokens and sentence-level children of up to about 150. Only children receive embeddings. Retrieval returns both IDs, and the heuristic reranker deduplicates by `parent_id`, keeps the best child hit, and sends parent content to synthesis.\n\n**Honest limitation**\n\nThe repository contains no offline evaluation proving this beat fixed-size chunking. Token counts are also estimated as roughly four characters per token instead of using the embedding model's tokenizer. I would present the design rationale confidently while labeling the benchmark as future work."
  },
  {
    "question": "What's the difference between keyword-based and semantic retrieval?",
    "type": "Basic",
    "category": "RAG Fundamentals",
    "tags": ["keyword search", "semantic search", "BM25", "embeddings"],
    "answer": "**Keyword retrieval**\n\nKeyword or lexical retrieval matches terms in the query with terms in documents. Algorithms such as BM25 reward term overlap while accounting for term rarity and document length. This works well for exact identifiers, product codes, names, and uncommon terminology.\n\n**Semantic retrieval**\n\nSemantic retrieval embeds the query and documents as dense vectors and finds nearby meanings even when wording differs. It handles synonyms and paraphrases better, but can underweight an exact rare token.\n\nArchelon implements dense semantic retrieval with `mistral-embed`. No BM25, PostgreSQL full-text search, or hybrid fusion appears in the active code. That keeps the pipeline simple but creates a known weakness for exact IDs and rare terms."
  },
  {
    "question": "What are embeddings, and how does cosine similarity work?",
    "type": "Medium",
    "category": "RAG Fundamentals",
    "tags": ["embeddings", "cosine similarity", "vectors", "semantic search"],
    "answer": "**Embeddings**\n\nAn embedding is a numeric vector that represents semantic features of text. Texts with similar meanings should occupy nearby positions in the model's vector space. The vector itself is not a human-readable summary; it is useful through comparisons and downstream tasks.\n\n**Cosine similarity**\n\nCosine similarity compares the angle between vectors: `dot(a, b) / (||a|| * ||b||)`. A higher similarity means the vectors point in a more similar direction. pgvector's `<=>` operator returns cosine **distance**, normally `1 - similarity`, so lower is better.\n\nArchelon uses `mistral-embed` for both child chunks and queries. The Python reranker assumes a lower returned `score` is better. Local documentation says the Edge Function uses cosine distance, but its SQL is absent, so I can verify the scoring assumption and request path, not the deployed operator itself."
  },
  {
    "question": "Which embedding model do you use, and why?",
    "type": "Medium",
    "category": "RAG Fundamentals",
    "tags": ["Mistral Embed", "embeddings", "model selection", "evaluation"],
    "answer": "**What Archelon uses**\n\nArchelon uses Mistral's `mistral-embed` for both document child chunks and search queries. Mistral documents its default vectors as 1,024-dimensional. `backend/ingestion/embedding_service.py` calls the embeddings endpoint in batches, and `backend/pipeline/retrieval/vector_search.py` uses the same model for query vectors, which is essential because indexed and query embeddings must share one vector space.\n\n**Why I can defend the choice**\n\nIt gives one consistent embedding provider, supports batched inputs, and matches the project's Mistral-centered stack. However, the repository contains no benchmark showing it outperformed OpenAI, Cohere, BGE, or E5 on Archelon documents. My senior answer is that it was a pragmatic integration choice, while the production selection should be validated with Recall@k, Mean Reciprocal Rank, latency, language coverage, and cost on a golden query set."
  },
  {
    "question": "Why Supabase/pgvector instead of a dedicated vector database like Pinecone?",
    "type": "Medium",
    "category": "RAG Fundamentals",
    "tags": ["Supabase", "pgvector", "Pinecone", "architecture trade-offs"],
    "answer": "**Why pgvector fits Archelon now**\n\nArchelon already stores users, agents, documents, chunks, keys, and usage in Supabase PostgreSQL. pgvector keeps embeddings beside relational metadata, so tenant and agent filters can use the same ownership relationships without synchronizing a second database. It also reduces operational components and preserves normal SQL, transactions, backups, and joins.\n\n**Trade-off**\n\nA dedicated vector database such as Pinecone can offer managed sharding, vector-native filtering, and operational tooling at very large scale. PostgreSQL requires index tuning and can become constrained when vector volume, write rate, or filtered nearest-neighbor traffic outgrows one database architecture. The repository contains no scale benchmark comparing the two, so I would say pgvector was the simpler fit for the current product, with migration triggered by measured latency, recall, storage, or scaling limits rather than brand preference."
  },
  {
    "question": "Walk me through Archelon's architecture end to end, from client request to streamed response.",
    "type": "Medium",
    "category": "Archelon Architecture",
    "tags": ["architecture", "FastAPI", "SSE", "Supabase", "LangChain"],
    "answer": "**1. Client and API boundary**\n\nReact sends `POST /api/chat/stream` with a bearer JSON Web Token, message, and selected agent. FastAPI validates the token and body, applies an in-memory per-user rate limit, checks token balance, and resolves the configured generation model.\n\n**2. Query processing and retrieval**\n\nOne Mistral Small call classifies small talk, single intent, or multi-intent and creates search phrases. Small talk skips retrieval. Otherwise each phrase is embedded with `mistral-embed`; searches run concurrently through a Supabase Edge Function. FastAPI merges up to 15 matches per phrase, deduplicates by parent, sorts by distance, applies a `0.6` cutoff, a `0.05` score-gap stop, and a 1,500- or 3,000-token context budget.\n\n**3. Generation and streaming**\n\nThe synthesizer formats parent sections into a grounding prompt and streams the selected Mistral or OpenAI model through LangChain. FastAPI emits Server-Sent Event metadata, token, and completion events. `ChatView.jsx` reads the body stream and renders tokens incrementally. Usage and stage latency are stored in Supabase, with optional LangSmith spans. The Edge Function and index SQL are absent locally, and the internal chat route lacks a mandatory agent-ownership rejection before retrieval; both are important caveats."
  },
  {
    "question": "What does your ingestion pipeline do, from file upload to a retrievable chunk?",
    "type": "Medium",
    "category": "Archelon Architecture",
    "tags": ["ingestion", "parsing", "chunking", "embeddings"],
    "answer": "**Upload and job creation**\n\n`POST /api/ingest` verifies the JSON Web Token and agent ownership, checks token balance, sanitizes filenames, and enforces five files, 2 MB per file, and 6 MB total. It creates `documents` and `ingestion_jobs` rows, writes temporary files, and schedules FastAPI background tasks.\n\n**Processing**\n\nThe background pipeline records `parsing`, `chunking`, `saving`, `embedding`, `vectorizing`, and `done` states. PyMuPDF extracts PDF text and font metadata; `python-docx` extracts DOCX paragraphs and tables. Section-aware parents and sentence-level children are inserted in batches. Child text is batched through `mistral-embed`; embedding failures retry up to three attempts with 1- and 2-second backoff. Vectors are then written to `child_chunks`, and embedding usage is metered.\n\n**Known mismatch**\n\nThe upload route allows `.txt`, but `document_parser.py` supports only PDF and DOCX. TXT ingestion therefore reaches the background job and fails. I would state that as a current bug, not claim TXT support."
  },
  {
    "question": "Why SSE for streaming instead of WebSockets?",
    "type": "Medium",
    "category": "Archelon Architecture",
    "tags": ["SSE", "WebSocket", "streaming", "HTTP"],
    "answer": "**Why Server-Sent Events fit**\n\nAfter the client submits one chat request, Archelon mainly needs one-way server-to-client delivery of metadata and model tokens. Server-Sent Events use a normal HTTP response with `text/event-stream`, work naturally with FastAPI's `StreamingResponse`, and are easier to operate through common HTTP infrastructure than a persistent bidirectional protocol.\n\nWebSockets are better when both sides must send frequent real-time messages over the same long-lived connection, such as collaborative editing or multiplayer state. Archelon does not need that for token generation because the user's next message can be another HTTP request.\n\nThe frontend uses `fetch()` and `response.body.getReader()` rather than the browser `EventSource` API because the request is a POST with a JSON body and authorization header. The trade-off is that reconnection and event IDs are handled manually rather than obtained automatically from `EventSource`."
  },
  {
    "question": "What is multi-tenancy, and at a basic level, how does Archelon separate tenants?",
    "type": "Medium",
    "category": "Archelon Architecture",
    "tags": ["multi-tenancy", "authorization", "tenant isolation", "Supabase"],
    "answer": "**Definition**\n\nMulti-tenancy means one application serves multiple customers while keeping each customer's data and permissions isolated. Archelon uses a shared database and shared tables, not a separate database or schema per customer.\n\n**Current ownership chain**\n\nA user owns agents; agents own documents; documents own parent chunks; parents own child chunks. Management routes normally filter agents by both `id` and `user_id`. Widget keys are tied to one agent, developer keys are tied to one account, and vector-search requests include `agent_id`.\n\n**Important caveat**\n\nNo Row-Level Security policies or schema migrations are present locally, so database enforcement cannot be verified. The internal `/api/chat` routes also pass the body-supplied agent ID to retrieval without a mandatory ownership rejection. I would describe Archelon as application-filtered multi-tenancy with an identified defense-in-depth gap, not as guaranteed Row-Level Security isolation."
  },
  {
    "question": "What is LangSmith, and what does it show you that plain logs don't?",
    "type": "Medium",
    "category": "Archelon Architecture",
    "tags": ["LangSmith", "observability", "tracing", "LLM"],
    "answer": "**Concept**\n\nLangSmith is an observability and evaluation platform for language-model applications. Plain logs are usually independent text lines. A trace gives one request a hierarchy of timed runs, connecting orchestration, retrieval, and model calls with structured inputs, outputs, metadata, errors, and parent-child relationships. That makes it easier to see where latency or a wrong answer originated.\n\n**In Archelon**\n\n`backend/services/langsmith_tracing.py` enables tracing only when `LANGSMITH_TRACING` and `LANGSMITH_API_KEY` are configured. Chat routes create a root trace and child spans for intent analysis, retrieval, small talk, and synthesis. Secrets are removed by key name, long strings are truncated, and context previews contain IDs, filenames, scores, and token counts rather than full parent text. This integration is optional; the repository does not prove it is enabled in the deployed environment."
  },
  {
    "question": "What is a \"trace,\" and what does one trace in Archelon contain?",
    "type": "Medium",
    "category": "Archelon Architecture",
    "tags": ["trace", "spans", "LangSmith", "latency"],
    "answer": "**Definition**\n\nA trace represents one end-to-end request. It contains nested spans, where each span represents a stage with timing, inputs, outputs, metadata, and an error if one occurred.\n\n**Archelon trace structure**\n\nThe root run is named for the route, such as `internal_chat_stream`, and records the message, agent ID, session ID, route type, user ID, model, and whether streaming was used. Child runs include `intent_and_query`, `retrieval`, `synthesize` or `synthesize_stream`, and `smalltalk_response` when applicable. Retrieval outputs include result count plus a context preview with chunk IDs, filename, section, score, and parent token count. Root metadata records total latency, intent latency, retrieval latency, synthesis latency, and time to first token.\n\nTracing is best-effort: failures print an error and do not stop chat. It is not a fully replayable audit because prompt version, provider response IDs, exact model revision, and the complete retrieved text are not guaranteed in the trace."
  },
  {
    "question": "**Flask vs FastAPI — all 5 differences**: async-native vs sync, Pydantic auto-validation vs manual, auto-generated Swagger docs at `/docs` vs none, built-in dependency injection vs none, newer/faster vs older/minimal.",
    "type": "Medium",
    "category": "Python / Production Habits",
    "tags": ["FastAPI", "Flask", "Pydantic", "ASGI"],
    "answer": "**The five practical differences**\n\n1. **Concurrency model:** FastAPI is an Asynchronous Server Gateway Interface framework designed for sync and async handlers. Flask is traditionally a Web Server Gateway Interface framework; it supports async views, but one worker still handles one request-response cycle.\n2. **Validation:** FastAPI integrates Pydantic models and Python type hints for request parsing and validation. Flask leaves schema validation to application code or extensions.\n3. **API documentation:** FastAPI generates OpenAPI, Swagger UI at `/docs`, and ReDoc by default. Flask needs an extension or custom setup.\n4. **Dependency injection:** FastAPI has a built-in dependency system for authentication and shared request logic. Flask commonly uses decorators, request hooks, or extensions.\n5. **Philosophy and performance:** Flask is older, minimal, mature, and flexible. FastAPI is newer and can perform strongly on I/O-heavy APIs, but real performance depends on application code, workers, and downstream services.\n\nArchelon benefits from FastAPI's Pydantic bodies, `Depends(verify_token)`, async HTTP calls, and `StreamingResponse`. I would not claim Flask has no async support or is always slower; that would be technically inaccurate."
  },
  {
    "question": "Explain async properly: server handles multiple requests concurrently instead of waiting; critical when every request involves a slow LLM call.",
    "type": "Medium",
    "category": "Python / Production Habits",
    "tags": ["asyncio", "concurrency", "LLM latency", "I/O"],
    "answer": "**Interview explanation**\n\nAsync lets one worker make progress on other tasks while the current coroutine is waiting for I/O. When code reaches an `await` on an embedding, vector-search, or language-model request, control returns to the event loop. The thread is not blocked doing nothing, so it can serve other connections until the network operation completes. This improves concurrency and resource utilization; it does not make one provider call intrinsically faster and is not CPU parallelism.\n\nArchelon uses async FastAPI routes, `httpx.AsyncClient`, LangChain's `ainvoke` and `astream`, and `asyncio.gather` for multiple search phrases. The limitation is that many Supabase helper calls use a synchronous client inside async functions. Those calls can block the event loop, so a higher-scale version should use an async database path or consistently offload blocking operations."
  },
  {
    "question": "What does Pydantic actually do — validates data types and structure against a defined schema (be precise; don't say \"no JSON wrappers\" or \"output never cracked\").",
    "type": "Medium",
    "category": "Python / Production Habits",
    "tags": ["Pydantic", "validation", "schema", "FastAPI"],
    "answer": "**Precise answer**\n\nPydantic takes untrusted input and validates or parses it against a model defined with Python type annotations and validators. It checks required fields, nested structure, field types, constraints, and custom rules, then produces a typed model or a structured validation error. It can also generate JSON Schema, which FastAPI uses in OpenAPI documentation.\n\nIn Archelon, `ChatRequest`, `SignupRequest`, `CreateAgentRequest`, upload-setting models, and public chat models are Pydantic classes. `ChatRequest` also has a validator that trims messages, rejects empty input, and enforces 2,000 characters. Pydantic does not guarantee that downstream model output is valid, protect business authorization, or replace database constraints. Archelon's intent classifier still calls `json.loads` on language-model output and needs a fallback because that output can be malformed."
  },
  {
    "question": "Webhook, properly explained: push-based HTTP callback — System A POSTs to System B the instant an event happens, no polling.",
    "type": "Medium",
    "category": "Python / Production Habits",
    "tags": ["webhook", "HTTP callback", "event-driven", "idempotency"],
    "answer": "**Interview explanation**\n\nA webhook is a push-based HTTP callback. System B registers an endpoint, and when an event happens, System A sends an HTTP request, usually `POST`, containing the event. System B does not need to poll repeatedly. Because delivery can be duplicated, delayed, or reordered, the receiver should verify a signature, store an event ID, process idempotently, and return quickly; the sender should use bounded retries and a delivery log.\n\nArchelon's frontend sends resume-submission details to an n8n webhook. That proves the outbound callback, but the n8n workflow is outside this repository. I cannot verify signature validation, retries, idempotency, or dead-letter handling from the available code."
  },
  {
    "question": "**Webhook vs WebSocket** — webhook is a one-time callback; WebSocket is a persistent two-way connection (Supabase real-time uses this).",
    "type": "Medium",
    "category": "Python / Production Habits",
    "tags": ["webhook", "WebSocket", "real-time", "HTTP"],
    "answer": "**Webhook**\n\nA webhook is an event-triggered HTTP request from one system to another. Each delivery is a separate request-response exchange. It is suitable for events such as payment completion, deployment status, or a submitted form.\n\n**WebSocket**\n\nA WebSocket starts with a handshake and maintains a persistent bidirectional connection. Either side can send messages at any time, which fits chat presence, collaborative editing, games, or live subscriptions. It requires connection lifecycle, scaling, and backpressure decisions.\n\nArchelon's chat token stream uses neither a webhook nor a WebSocket; it uses Server-Sent Events over one HTTP response. The repository includes the Supabase client for database operations but does not show a Supabase Realtime subscription, so I would not claim Archelon currently uses Supabase's WebSocket-based realtime feature."
  },
  {
    "question": "Failure handling beyond \"status codes and console logs\" — retry logic, exponential backoff, fallback responses, dead-letter queues, alerting.",
    "type": "Advanced",
    "category": "Python / Production Habits",
    "tags": ["reliability", "retry", "backoff", "alerting"],
    "answer": "**What Archelon actually has**\n\nDocument embedding retries up to three attempts with 1- and 2-second exponential delays. Query embedding retries HTTP `429` up to three times. Ingestion records stage and error state, intent parsing falls back to the original query, small talk has a static fallback, synthesis returns a user-safe error, and tracing failures do not break chat. Timeouts are set on outbound HTTP clients.\n\n**Current gaps**\n\nThere is no durable queue, dead-letter queue, centralized retry policy with jitter, circuit breaker, automated alerting, or demonstrated replay mechanism. FastAPI background tasks live in the API process, so a process restart can lose in-flight work. `vector_search` catches broad errors and returns an empty list, which can turn an infrastructure failure into a misleading no-context answer.\n\nMy production design would classify retryable errors, use bounded exponential backoff with jitter, put ingestion on a durable queue, make jobs idempotent and resumable, dead-letter exhausted jobs, emit metrics, and alert on error rate, queue age, and provider latency."
  },
  {
    "question": "Modular backend — separating routes, business logic, and DB operations into distinct files/modules; tie to Archelon's ingestion, retrieval, classification, and API-route modules.",
    "type": "Medium",
    "category": "Python / Production Habits",
    "tags": ["modularity", "FastAPI", "separation of concerns", "architecture"],
    "answer": "**How Archelon is divided**\n\n- `backend/routers/` owns HTTP contracts, authentication dependencies, validation, and response streaming.\n- `backend/ingestion/` owns parsing, hierarchical chunking, embedding batches, and orchestration.\n- `backend/pipeline/` owns intent/query analysis, retrieval filtering, small talk, and synthesis.\n- `backend/db/` owns Supabase table operations and token usage.\n- `backend/services/` contains optional tracing and shared public-access logic.\n\nThis separation lets document parsing change without rewriting routes and lets retrieval be tested independently from the frontend. The boundaries are not perfect: chat orchestration is duplicated across internal, widget, and developer routes; synchronous Supabase operations appear behind async functions; and two public-access implementations coexist. A sensible next refactor would centralize one chat application service without inventing a large framework."
  },
  {
    "question": "Which distance operator are you using in pgvector, and why?",
    "type": "Advanced",
    "category": "Retrieval Internals",
    "tags": ["pgvector", "cosine distance", "vector search", "verification"],
    "answer": "**Verified versus documented**\n\npgvector defines `<=>` as cosine distance, where lower values are better and cosine similarity is `1 - distance`. Archelon's local architecture documentation says its SQL function uses `<=>`, and the Python reranker sorts `score` ascending with a `0.6` maximum, which is consistent with cosine distance.\n\nHowever, the Edge Function and SQL function are not in this repository. Therefore my exact answer is: the codebase is designed around cosine-distance semantics and documentation identifies `<=>`, but I would verify the deployed SQL before claiming it as independently proven.\n\nCosine is a reasonable choice because it compares vector direction rather than raw magnitude and is supported for `mistral-embed`. The metric must match both model behavior and index operator class; if an HNSW index is used, it should use `vector_cosine_ops`."
  },
  {
    "question": "Are you using an HNSW or IVF index, and how did you choose?",
    "type": "Advanced",
    "category": "Retrieval Internals",
    "tags": ["HNSW", "IVFFlat", "pgvector", "indexing"],
    "answer": "**Honest answer**\n\nI cannot verify either index from this repository. There are no database migrations, `CREATE INDEX` statements, Edge Function source, or captured query plans. Any claim that Archelon definitely uses Hierarchical Navigable Small World or Inverted File Flat would be speculation.\n\n**How I would choose**\n\npgvector's Hierarchical Navigable Small World index generally offers a stronger speed-recall trade-off and requires no training step, but it uses more memory and builds more slowly. Inverted File Flat builds faster and uses less memory, but needs representative data, a good list count, and probe tuning. For Archelon I would start with exact search at small scale, establish a recall baseline, then benchmark filtered HNSW and IVFFlat using real tenant distributions. I would choose from Recall@k, p95 latency, insert cost, memory, and filtered-result behavior, then record the deployed Data Definition Language in migrations."
  },
  {
    "question": "**Dense vs sparse retrieval** — dense uses embeddings for semantic similarity; sparse (BM25) uses exact keyword matching.",
    "type": "Medium",
    "category": "Retrieval Internals",
    "tags": ["dense retrieval", "sparse retrieval", "BM25", "embeddings"],
    "answer": "**Dense retrieval**\n\nDense retrieval converts text into mostly non-zero embedding vectors and compares semantic proximity. It can retrieve paraphrases even when query and document share few words, but it may blur exact rare tokens or domain identifiers.\n\n**Sparse retrieval**\n\nSparse lexical retrieval represents a large vocabulary where most term weights are zero. BM25 ranks documents from query-term matches while accounting for term frequency, rarity, and document length. It is strong for exact names, codes, and technical phrases but weaker for synonyms without shared terms.\n\nArchelon uses dense-only retrieval with `mistral-embed`. It does not implement BM25, PostgreSQL full-text search, or hybrid fusion. Calling its heuristic score filtering a sparse or hybrid reranker would be inaccurate."
  },
  {
    "question": "When does sparse retrieval outperform dense — exact product codes, acronyms, rare terms an embedding model underweights?",
    "type": "Medium",
    "category": "Retrieval Internals",
    "tags": ["sparse retrieval", "BM25", "exact match", "failure modes"],
    "answer": "**Where sparse retrieval is stronger**\n\nSparse retrieval often wins when the exact token is the meaning: product IDs, error codes, legal clause numbers, version strings, names, acronyms, quoted phrases, and rare technical terms. BM25 can strongly reward an uncommon exact match, while a dense embedding may map the query toward a broader concept and miss the identifier.\n\nDense retrieval is stronger when wording differs but meaning is similar. The right choice depends on the query distribution, which is why hybrid systems often run both. Archelon has no sparse path. A query such as `ERR_XJ-2049` can be semantically diluted by `mistral-embed`; query rewriting may even alter the exact token. I would preserve detected identifiers verbatim and add PostgreSQL full-text or BM25 retrieval before fusion."
  },
  {
    "question": "What is hybrid retrieval, and how would you combine dense + sparse scores (reciprocal rank fusion, weighted sum, etc.)?",
    "type": "Advanced",
    "category": "Retrieval Internals",
    "tags": ["hybrid retrieval", "RRF", "BM25", "score fusion"],
    "answer": "**Definition**\n\nHybrid retrieval runs complementary retrievers, commonly dense vector search plus sparse BM25, and combines their candidates. Dense search captures meaning; sparse search preserves exact lexical evidence.\n\n**Fusion choices**\n\nReciprocal Rank Fusion combines ranks rather than incompatible raw scores: each result receives roughly `1 / (k + rank)` from each list, and the values are summed. It is simple and avoids score normalization. A weighted sum can perform better when tuned on labeled data, but BM25 and cosine scores must first be normalized or calibrated. A second-stage cross-encoder can then rerank the fused candidate set.\n\nArchelon does not implement hybrid retrieval. I would add a PostgreSQL text-search vector and index, execute lexical and dense searches in parallel under the same trusted tenant filter, fuse by `parent_id`, tune on a golden set, and retain exact identifiers during query rewriting."
  },
  {
    "question": "Why does Archelon use pure dense retrieval, and what's the actual failure mode when a user searches an exact term or ID?",
    "type": "Advanced",
    "category": "Retrieval Internals",
    "tags": ["dense retrieval", "exact identifiers", "trade-offs", "Archelon"],
    "answer": "**Why the current design is dense-only**\n\nThe code shows one embedding model, one vector-search endpoint, and one distance-based filtering path. That is operationally simple and works for natural-language questions and paraphrases. The repository does not contain a benchmark or decision record proving dense-only retrieval was selected because it beat hybrid search, so I would describe simplicity and semantic coverage as the defensible reasons, not invent measured superiority.\n\n**Concrete failure mode**\n\nAn identifier such as `INV-00482`, an acronym, or an exact API error may not dominate a dense vector. The retriever can return conceptually related chunks that do not contain the literal token. The LLM query rewriter can also produce broader phrases, further weakening exact matching. Archelon then applies a distance threshold, but a threshold cannot retrieve a candidate that never ranked. The fix is an exact-token-preserving sparse path and hybrid fusion, evaluated on identifier-heavy queries."
  },
  {
    "question": "Walk me through your custom query rewriting / multi-query retrieval — how many rewritten queries fire, and how are results merged/deduped?",
    "type": "Advanced",
    "category": "Retrieval Internals",
    "tags": ["query rewriting", "multi-query retrieval", "deduplication", "reranking"],
    "answer": "**Query generation**\n\nOne Mistral Small call classifies the message and creates short search phrases. The prompt asks for one to three phrases for a single information need and at least one phrase per distinct topic for multi-intent. There is no runtime schema enforcing a maximum for multi-intent, so I would not claim a fixed number. On model or JSON failure, Archelon uses the original message as one fallback query.\n\n**Retrieval and merge**\n\nEach phrase is embedded and searched concurrently with `asyncio.gather`, requesting up to 15 child matches. Results are flattened, grouped by `parent_id`, and only the lowest-distance child hit for each parent is retained. Parents are sorted by distance and filtered by cutoff, score gap, minimum size, and context budget.\n\nThis is LLM query rewriting plus multi-query dense retrieval. It is not Hypothetical Document Embeddings and not Reciprocal Rank Fusion. Repeated hits do not add consensus weight, which is a limitation."
  },
  {
    "question": "A retrieval pass returns more candidates than fit in context — how do you decide what makes the cut? Do you rerank? Why not just raise the similarity threshold instead?",
    "type": "Advanced",
    "category": "Retrieval Internals",
    "tags": ["reranking", "context budget", "threshold", "retrieval"],
    "answer": "**What Archelon does**\n\nIts `reranker.py` is a heuristic selector, not a learned reranker. It deduplicates by parent, sorts ascending by distance, drops scores above `0.6`, skips parents under 20 tokens, stops when the score jumps by more than `0.05`, and stops before exceeding 1,500 tokens for single intent or 3,000 for multi-intent.\n\n**Why a threshold alone is insufficient**\n\nA global threshold does not control prompt size, adapts poorly across query difficulty, and cannot remove duplicate parents. Raising it can actually admit more weak candidates; lowering it may remove useful context. A token budget is a hard safety bound, while gap detection adapts to the local ranking.\n\nThe current function is better called filtering and budgeting than semantic reranking. A true cross-encoder would score each query-candidate pair using richer token interactions, but would add latency and needs evaluation to justify it."
  },
  {
    "question": "Compare fixed-size, semantic, and parent-child chunking — why parent-child won for your document types.",
    "type": "Advanced",
    "category": "Retrieval Internals",
    "tags": ["fixed-size chunking", "semantic chunking", "parent-child chunking", "documents"],
    "answer": "**Comparison**\n\n- **Fixed-size:** split by token or character count, often with overlap. It is deterministic and cheap but can cut through headings, sentences, tables, or one logical section.\n- **Semantic:** detect topic changes using embeddings or another model. It can create coherent units but adds processing cost, tuning, and variable boundaries.\n- **Parent-child:** retrieve small children for precision and return a linked larger section for context. It adds storage and lineage complexity but separates retrieval granularity from generation granularity.\n\nArchelon's PDFs and DOCX files contain headings, paragraphs, lists, code-like blocks, and tables. The parser classifies those structures, so section-aware parents plus sentence children reuse useful document signals. However, saying parent-child 'won' would overclaim: no comparative experiment exists in the repository. It was the implemented design choice; proving it won requires Recall@k and answer-quality evaluation against fixed and semantic baselines."
  },
  {
    "question": "How do you guarantee Tenant A's query never returns Tenant B's chunks — Row-Level Security or application-layer filtering?",
    "type": "Advanced",
    "category": "Multi-Tenancy",
    "tags": ["multi-tenancy", "RLS", "authorization", "security"],
    "answer": "**Honest answer**\n\nThe current repository does not prove an end-to-end guarantee. Archelon uses shared tables and application-layer ownership: user to agent, agent to document, document to parent, and parent to child. Management routes usually filter by `user_id`; widget keys are bound to an agent; developer keys are account-scoped; and vector requests carry `agent_id`.\n\nNo Row-Level Security policies, migrations, Edge Function source, or retrieval SQL are present, so database enforcement cannot be verified. More seriously, internal chat authenticates the user but does not reject a body-supplied `agent_id` that ownership lookup fails to find; it still passes that ID to vector search.\n\nI would fix this with defense in depth: authorize `(user_id, agent_id)` before orchestration, derive scope server-side, propagate it through retrieval, enforce PostgreSQL Row-Level Security on every ownership table, avoid a role that bypasses policies for tenant requests, and run negative cross-tenant integration tests."
  },
  {
    "question": "Why pgvector with RLS over a separate database per tenant?",
    "type": "Advanced",
    "category": "Multi-Tenancy",
    "tags": ["pgvector", "RLS", "multi-tenancy", "database architecture"],
    "answer": "**Trade-off**\n\nA shared PostgreSQL database with Row-Level Security can keep relational metadata and vectors together, apply one policy model, share connection pools and indexes, and avoid provisioning, migrating, monitoring, and backing up a database for every small tenant. It is usually more operationally efficient when tenants have similar schemas and moderate workloads.\n\nA database per tenant gives a stronger isolation boundary, independent scaling and backup, and simpler deletion or residency controls, but multiplies operational cost and complicates cross-tenant administration. Large or regulated tenants may justify it.\n\nFor Archelon, the shared pgvector model is visible, but the premise that Row-Level Security is active is unverified because no policies are in the repository. I would not say 'pgvector with RLS' as a current fact until inspecting Supabase. Today the defensible description is shared tables with application filters and a planned database policy layer."
  },
  {
    "question": "What's your rate-limiting and token-metering strategy per tenant?",
    "type": "Advanced",
    "category": "Multi-Tenancy",
    "tags": ["rate limiting", "token metering", "quota", "multi-tenancy"],
    "answer": "**Rate limits**\n\nInternal chat allows 20 requests per minute per user. Widget and developer routes apply 60 per minute per key plus 30 per minute and 500 per day per client IP in their active router code. These counters are Python dictionaries in process memory, so they reset on restart and are not shared across multiple Railway instances. They are protection for one process, not a distributed tenant guarantee.\n\n**Token metering**\n\nBefore chat or ingestion, Archelon reads `users.token_limit` and `tokens_used`; zero balance returns `402`. Embedding and query events are inserted into `token_usage`, and user totals are incremented. Query usage and chunk token counts are mostly estimated as characters divided by four rather than provider-reported counts. The increment is read-then-write, so concurrent requests can lose updates.\n\nFor production scale I would use Redis or an atomic database limiter, atomic quota reservation, provider usage where available, idempotency keys, and per-user plus per-agent metrics."
  },
  {
    "question": "How do you use RAGAs — which metrics, and what counts as \"good enough\"?",
    "type": "Advanced",
    "category": "Evaluation & Observability",
    "tags": ["RAGAs", "evaluation", "faithfulness", "retrieval metrics"],
    "answer": "**Current Archelon status**\n\nArchelon does not implement Retrieval-Augmented Generation Assessment, or RAGAs. There is no dependency, evaluation dataset, runner, threshold, or continuous evaluation job in the repository. I would say that directly rather than describe planned metrics as production evidence.\n\n**How I would use it**\n\nI would build a versioned set of questions, reference answers, and relevant source chunks. Context Precision measures whether retrieved context is relevant; Context Recall measures whether required evidence was retrieved; Faithfulness measures whether answer claims are supported by context; and Response Relevancy measures whether the answer addresses the question. I would also retain deterministic Recall@k, Mean Reciprocal Rank, latency, refusal accuracy, and human review.\n\nThere is no universal 'good enough' score. I would set per-use-case thresholds from a human-rated baseline, examine confidence intervals and failure slices, and block releases on statistically meaningful regression rather than chasing one aggregate number."
  },
  {
    "question": "When a RAGAs score is bad, how do you tell retrieval failure from generation failure?",
    "type": "Advanced",
    "category": "Evaluation & Observability",
    "tags": ["RAGAs", "retrieval failure", "generation failure", "diagnosis"],
    "answer": "**Separate the stages**\n\nI first check whether the required evidence appears in the retrieved context. Low Context Recall means needed evidence was missed; low Context Precision means too much retrieved material was irrelevant. Those point to parsing, chunking, query rewriting, embedding, search, filtering, or tenant-scope problems.\n\nIf the correct evidence was present but the answer contradicts it, adds unsupported claims, or ignores it, that is a generation problem. Faithfulness and human claim-level review are useful there. A response can also be faithful but irrelevant, which points to instruction following or synthesis.\n\nArchelon does not run RAGAs today. It does store selected context and stage latencies in `token_usage` and can emit LangSmith retrieval and synthesis spans. I would diagnose a captured request by replaying generation with fixed context, then replaying retrieval independently; changing one stage at a time prevents blaming the model for a retrieval miss."
  },
  {
    "question": "What does your system prompt say to keep the model grounded in context?",
    "type": "Advanced",
    "category": "Evaluation & Observability",
    "tags": ["system prompt", "grounding", "hallucination", "prompt engineering"],
    "answer": "**Archelon's grounding policy**\n\n`synthesizer.py` tells the model to answer only from the supplied context block. Every fact, number, metric, date, and claim must appear in or be directly inferable from that context. If information is missing, it must answer: `The documents don't contain that information.` It explicitly forbids inventing, estimating, pattern-completing from training data, or using uncertainty words to smuggle in unsupported claims.\n\nThe prompt formats each parent as `[section_name]` plus content separated by horizontal delimiters, includes agent instructions and optional search focus, and asks for three context-grounded follow-up questions after an `SQArchelon` marker.\n\nThis is a prompt-level control, not a security boundary. There is no claim-level output verifier, citation entailment check, or independent guard model in the repository, so malicious documents or model noncompliance can still defeat grounding."
  },
  {
    "question": "**Do you have LLM monitoring in production?** — never answer \"I haven't used LangSmith\" with nothing behind it; state what you do log (inputs, outputs, latency, errors) even if it's simpler than a dedicated tool.",
    "type": "Advanced",
    "category": "Evaluation & Observability",
    "tags": ["LLM monitoring", "LangSmith", "latency", "token usage"],
    "answer": "**What is implemented**\n\nArchelon persists each query's user message, generated response, model name, selected context chunks, estimated input and output tokens, total latency, time to first token, and intent, retrieval, and synthesis latency in the `token_usage` table. Ingestion stores job stages, progress metadata, duration, and errors.\n\nIt also has optional LangSmith tracing with root request runs and child intent, retrieval, small-talk, and synthesis spans. Tracing is enabled only when the required environment variables are present, and the repository does not prove production configuration.\n\n**What is missing**\n\nThere is no visible metrics backend, dashboard for p95/p99 latency and errors, automated alerting, service-level objectives, evaluation drift monitor, or provider-cost reconciliation. My honest answer is that structured request observability exists and LangSmith integration exists, but production monitoring maturity and deployment enablement are not demonstrated by code alone."
  },
  {
    "question": "In LangSmith, how do you distinguish a slow retrieval span from a slow generation span?",
    "type": "Advanced",
    "category": "Evaluation & Observability",
    "tags": ["LangSmith", "spans", "retrieval latency", "generation latency"],
    "answer": "**Span comparison**\n\nI inspect the trace timeline and compare child-run duration. The `retrieval` span wraps all vector searches plus merge and heuristic reranking. `synthesize` or `synthesize_stream` wraps prompt construction and the language-model call. The root metadata also records `retrieval_latency_ms`, `synthesis_latency_ms`, total latency, and for streams, `time_to_first_token_ms`.\n\nA slow retrieval span points toward query embedding, Supabase Edge Function latency, vector filtering, or multiple search phrases. A slow synthesis span points toward prompt size, model/provider latency, output length, or streaming. A high time to first token with normal retrieval narrows the issue toward generation startup.\n\nOne limitation is granularity: Archelon's retrieval span does not separately time query embedding versus Edge Function versus reranking, and synthesis does not expose provider queue time. I would add nested spans before making a precise bottleneck claim."
  },
  {
    "question": "What metrics do you track per tenant (tokens, latency, error rate) — is there alerting, or do you only look after something breaks?",
    "type": "Advanced",
    "category": "Evaluation & Observability",
    "tags": ["tenant metrics", "latency", "errors", "alerting"],
    "answer": "**Tracked today**\n\n`token_usage` records `user_id` and `agent_id`, event type, embedding tokens, query input/output token estimates, model, message, response, context chunks, total latency, time to first token, and intent/retrieval/synthesis latency. That supports per-user and per-agent usage and latency analysis. Ingestion jobs record status, metadata, duration, and an error string.\n\n**Not implemented**\n\nThere is no repository evidence of aggregated error-rate metrics, p95/p99 dashboards, alert rules, paging, anomaly detection, or service-level objectives. Some exceptions are printed, and query-usage insertion errors are swallowed after logging, so monitoring can itself lose data silently.\n\nMy next step would emit counters and histograms labeled by route, provider, model, and tenant-safe identifier; alert on sustained error rate, latency, queue age, quota anomalies, and ingestion failure; and avoid high-cardinality labels such as raw message text."
  },
  {
    "question": "Docker Compose — what do `services`, `volumes`, `ports`, `environment`, and `depends_on` each do?",
    "type": "Medium",
    "category": "Deployment & Infra",
    "tags": ["Docker Compose", "containers", "volumes", "networking"],
    "answer": "**Compose vocabulary**\n\n- `services` defines the application containers, their images or build instructions, commands, and configuration.\n- `volumes` mounts persistent named storage or host paths into containers.\n- `ports` publishes a container port to the host, for example `8000:8000`.\n- `environment` passes configuration values into a container; secrets should use an appropriate secret mechanism rather than committed plaintext.\n- `depends_on` expresses startup ordering and can wait for a health condition in long syntax, but simple ordering does not prove the dependency is ready for requests. The application still needs retries.\n\nArchelon contains no Dockerfile or Compose file. Backend deployment is represented only by a Railway `Procfile`, so this answer is conceptual and I would not claim Docker Compose experience from this repository."
  },
  {
    "question": "Kubernetes — conceptual vocabulary only: Pod, Node, Cluster, Deployment, Service; the one-liner that it orchestrates containers across machines vs Docker running one container on one machine. Fine to be honest about no production experience, but give the concept first.",
    "type": "Medium",
    "category": "Deployment & Infra",
    "tags": ["Kubernetes", "Pod", "Deployment", "Service"],
    "answer": "**One-line explanation**\n\nDocker packages and runs containers; Kubernetes orchestrates containerized workloads across a cluster of machines and continuously reconciles actual state with declared desired state.\n\n- **Pod:** the smallest deployable unit, containing one or more tightly coupled containers.\n- **Node:** a worker machine that runs Pods.\n- **Cluster:** the control plane plus its worker Nodes.\n- **Deployment:** declares and updates replicated stateless Pods, including rolling updates and replacement.\n- **Service:** provides a stable network endpoint in front of a changing set of Pods.\n\nArchelon has no Kubernetes manifests, Helm chart, or production Kubernetes evidence. It deploys FastAPI through a Railway `Procfile` and the frontend through Vercel configuration. I can explain Kubernetes architecture, but I would not present this project as Kubernetes production experience."
  },
  {
    "question": "How would you fine-tune your embedding model on Archelon's actual client documents — what would the training data look like?",
    "type": "Advanced",
    "category": "Deployment & Infra",
    "tags": ["embedding fine-tuning", "contrastive learning", "hard negatives", "evaluation"],
    "answer": "**Training examples**\n\nI would create query-positive-negative examples. A positive is the parent or child that contains the evidence for a real query. Negatives include random chunks and, more importantly, hard negatives: semantically similar chunks from the same tenant that do not answer the query. Production searches with human relevance labels are strongest; synthetic questions can bootstrap coverage but must be reviewed and split by document to prevent leakage.\n\nI would fine-tune an open embedding model with contrastive or ranking loss so queries move closer to positives and farther from negatives. Tenant data would require consent, isolation, redaction, retention rules, and a decision about a shared versus tenant-specific model.\n\nBefore training I would establish a frozen baseline and evaluate Recall@k, Mean Reciprocal Rank, Normalized Discounted Cumulative Gain, exact-ID slices, languages, latency, and cross-tenant safety. Archelon has no embedding fine-tuning pipeline today and Mistral's hosted model is called as an API."
  },
  {
    "question": "If a client's knowledge base changes daily, how does Archelon stay current — re-embed on update, or batch job?",
    "type": "Advanced",
    "category": "Deployment & Infra",
    "tags": ["freshness", "re-embedding", "incremental ingestion", "scheduling"],
    "answer": "**What Archelon supports now**\n\nA newly uploaded document is parsed, chunked, embedded, and becomes retrievable after its job reaches `done`. A document can be deleted. There is no update endpoint that versions an existing document, change-data-capture connector, scheduled sync, file hash, or recurring batch job in the repository. Therefore a daily-changing knowledge base stays current only if an external process or user uploads the new content and removes or replaces stale content.\n\n**Production design**\n\nI would ingest incrementally: compute a source ID and content hash, detect added/changed/deleted documents, version the document, re-embed only changed chunks, and atomically switch the active version after successful indexing. A queue would handle work with retries and idempotency; a scheduler or source webhook would trigger sync. Old and new versions should not both appear during transition, and freshness lag should be monitored."
  },
  {
    "question": "When a client reports a wrong answer, do you have the trace to pull, or are you reconstructing what happened after the fact?",
    "type": "Advanced",
    "category": "Deployment & Infra",
    "tags": ["incident diagnosis", "trace", "replay", "observability"],
    "answer": "**Current answer**\n\nIf LangSmith was enabled for that request, I can inspect the root trace and intent, retrieval, and synthesis spans. Independently, successful query logging attempts to store the message, response, selected context chunks, model name, token estimates, and stage latencies in `token_usage`. That is much better than reconstructing only from application logs.\n\nIt is still not guaranteed or fully replayable. LangSmith is optional, `insert_query_event` catches database errors and only prints them, and vector search can return an empty list after swallowing an exception. Neither store guarantees the exact system-prompt version, provider model revision, query embedding, full candidate set, index version, or random generation settings.\n\nSo I can often diagnose retrieval versus synthesis from captured context and timings, but exact replay is not assured. I would add immutable request IDs, versioned prompts/indexes, provider response metadata, durable events, and retention-aware replay tooling."
  },
  {
    "question": "TXT ingestion wasn't parsed initially — what was the bug, how did you catch it?",
    "type": "Medium",
    "category": "Bugs You've Actually Hit — Know These Cold",
    "tags": ["TXT ingestion", "bug", "validation mismatch", "testing"],
    "answer": "**What the bug is**\n\nThe upload contract and parser disagree. `backend/routers/ingest.py` includes `.txt` in `ALLOWED_EXTS` and tells users PDF, DOCX, and TXT are accepted. `backend/ingestion/document_parser.py` recognizes only `.pdf` and `.docx`; any other extension raises `ValueError`. Because ingestion runs in a background task, the upload can return a job successfully and fail later during parsing. Git history shows this mismatch existed when the ingestion pipeline was introduced.\n\n**Accuracy about the fix**\n\nIt is still present in the current code, and the repository contains no test showing how it was discovered. I would not say I fixed it. The correct fix is either implement a UTF-8 text extractor with encoding/error handling or remove `.txt` from API and UI validation. I would add an end-to-end test for every advertised extension and assert that the job reaches `done`, which catches contract-to-worker mismatches."
  },
  {
    "question": "Widget output cap wasn't enforced — what was the failure, what was the fix?",
    "type": "Medium",
    "category": "Bugs You've Actually Hit — Know These Cold",
    "tags": ["widget", "token limit", "bug", "configuration"],
    "answer": "**Failure**\n\nWidget settings store `max_output_tokens`, expose it through generate/update/status endpoints, and show a default of 500. But `_validate_public_request` in `backend/routers/embed.py` explicitly sets `max_output = None`, then passes that to `synthesize_stream`. The selected Mistral or OpenAI client therefore receives no widget-specific output cap. A client can believe the setting is enforced when it is only persisted and displayed.\n\n**Accuracy about the fix**\n\nThe active legacy widget route is still unfixed. Git history also shows `max_output = None` before and after the LangSmith change. An unused helper in `backend/services/public_api.py` correctly reads the stored value, but the route does not call it. The fix is to return `key_record.get('max_output_tokens')`, validate a safe range, pass it to the model, test both providers, and verify streamed output plus metering. I would not claim a completed fix until that test passes."
  },
  {
    "question": "Pandas is for tabular data, not document loading — what do you actually use to parse PDFs/docs (PyPDF, python-docx, custom parser)?",
    "type": "Medium",
    "category": "Bugs You've Actually Hit — Know These Cold",
    "tags": ["PyMuPDF", "python-docx", "document parsing", "Pandas"],
    "answer": "**Archelon's actual parsers**\n\nArchelon uses PyMuPDF, imported as `fitz`, for PDFs and `python-docx` for DOCX files. It does not use Pandas, PyPDF, or the installed `unstructured` package in the active parser.\n\nFor PDFs, the custom parser reads text blocks, lines, font sizes, bold flags, and page numbers, then infers title and heading levels from document-wide size frequency. For DOCX, it walks paragraphs and tables in body order, uses named styles plus font/bold/italic heuristics, converts tables to Markdown, and treats some single-column tables as code blocks.\n\nPandas is appropriate after data is already tabular. PDF and Word parsing must preserve layout and hierarchy, and scanned PDFs would additionally require Optical Character Recognition, which Archelon does not implement."
  },
  {
    "question": "Explain one project deeply: problem, what you built, how it works, tools used, challenges, impact — have your numbers memorized exactly (10,000+ keys, 50 languages — not \"10,020 and 1,050\").",
    "type": "Advanced",
    "category": "Project Explanation",
    "tags": ["project explanation", "Archelon", "impact", "interview story"],
    "answer": "**Archelon project answer**\n\nThe problem was that organizations need language models to answer from private, changing documents without retraining a model for every update. I built Archelon, a multi-tenant RAG platform where users create an agent, upload PDFs or DOCX files, chat with the knowledge base, and deploy the agent through a widget or developer API.\n\nThe backend is FastAPI on Railway, the frontend is React/Vite on Vercel, and Supabase PostgreSQL stores relational data, usage, and pgvector embeddings. Ingestion uses PyMuPDF and `python-docx`, creates 800-token parents and 150-token children, and embeds children with `mistral-embed`. Query processing rewrites one or more searches, runs dense retrieval, deduplicates by parent, budgets context, and streams a grounded Mistral or OpenAI answer over Server-Sent Events.\n\nThe hardest parts were balancing retrieval precision with context, keeping tenant scope through public and internal APIs, handling provider limits, and making streaming observable. I must not attach the question's `10,000+ keys` or `50 languages` figures to Archelon: neither is supported by this repository. Those numbers appear to belong to another project and require owner verification before interview use."
  },
  {
    "question": "Give a crisp 30-second positioning line before expanding — don't jump between projects without a thread.",
    "type": "Medium",
    "category": "Project Explanation",
    "tags": ["elevator pitch", "Archelon", "communication", "RAG"],
    "answer": "**30-second Archelon positioning**\n\nArchelon is a multi-tenant Retrieval-Augmented Generation platform that turns a client's PDFs and Word documents into a grounded, streamable AI assistant. I built the React interface and FastAPI backend, a hierarchical ingestion and dense-retrieval pipeline using Mistral embeddings and Supabase pgvector, model-selectable answer generation, usage controls, optional LangSmith tracing, and both widget and developer API deployment paths. The main engineering focus was balancing precise retrieval, enough generation context, tenant-aware access, and production latency.\n\nAfter that line, I expand in one thread: problem, ingestion, retrieval, generation, tenancy, observability, limitations, and impact. I avoid switching projects until the interviewer asks."
  },
  {
    "question": "What is a cross-encoder reranker, and why can't it pre-compute representations the way a bi-encoder can?",
    "type": "Advanced",
    "category": "Retrieval Depth",
    "tags": ["cross-encoder", "bi-encoder", "reranking", "transformers"],
    "answer": "**Bi-encoder**\n\nA bi-encoder encodes the query and each document independently. Document embeddings can be computed once and indexed; at query time only the query is encoded and compared cheaply against many documents. Archelon's `mistral-embed` retrieval follows this pattern.\n\n**Cross-encoder**\n\nA cross-encoder takes the query and one candidate together, for example `[query; document]`, and lets transformer attention model token-level interactions before producing one relevance score. Because the document's representation depends on the specific query, the final pair representation cannot be precomputed once for every future query. It is more accurate but much more expensive.\n\nThe standard architecture retrieves a small top-N set with a bi-encoder or BM25, then cross-encodes only those candidates. Archelon does not have one; its `reranker.py` is deterministic distance sorting, deduplication, gap filtering, and token budgeting."
  },
  {
    "question": "If you added a reranker, which metric — MRR, MAP, or NDCG — would justify it, and why does it fit your query distribution better than the others?",
    "type": "Advanced",
    "category": "Retrieval Depth",
    "tags": ["MRR", "MAP", "NDCG", "reranker evaluation"],
    "answer": "**Metric choice**\n\nI would choose Normalized Discounted Cumulative Gain at a small cutoff, such as NDCG@5, as the primary reranking metric. Archelon can use several parent sections in one answer, and relevance is graded: one section may contain direct evidence, another useful background, and another only partial context. NDCG rewards putting highly relevant sections early while still crediting multiple useful results.\n\nMean Reciprocal Rank focuses only on the first relevant result, which fits single-answer lookup better. Mean Average Precision handles multiple binary-relevant results but does not naturally express graded usefulness. I would still report Recall@k so a reranker is not blamed when first-stage retrieval never found the evidence.\n\nNo labeled Archelon query distribution exists in the repository, so this is a proposed metric choice. I would create graded judgments from real query types and justify the added latency only if NDCG and downstream answer quality improve without unacceptable p95 cost."
  },
  {
    "question": "If you added hybrid retrieval to Archelon today, what would need to change in your pgvector setup to support BM25 alongside vector search?",
    "type": "Advanced",
    "category": "Retrieval Depth",
    "tags": ["hybrid retrieval", "BM25", "PostgreSQL", "RRF"],
    "answer": "**Data and index changes**\n\nI would preserve searchable child text and add a lexical-search representation and index. Native PostgreSQL offers `tsvector` with a Generalized Inverted Index and ranking such as `ts_rank_cd`; true BM25 may require an extension or search service depending on the deployed Supabase capabilities. I would keep the existing vector column and cosine path.\n\n**Query path changes**\n\nThe trusted tenant or agent filter must be identical in both branches. For each rewritten query I would run dense and lexical searches in parallel, retrieve wider candidate sets, normalize identifiers, and fuse by child or parent ID using Reciprocal Rank Fusion. Then parent resolution, optional cross-encoding, deduplication, and context budgeting run on the fused list.\n\nI would add migrations, backfill the lexical index, preserve exact tokens in rewriting, and evaluate dense versus sparse versus hybrid on Recall@k, NDCG, latency, and identifier-heavy slices. Archelon's current Edge Function and SQL are absent locally, so that deployment surface must be inspected first."
  },
  {
    "question": "Justify your architectural choices, not just describe them — explicit feedback you've already received.",
    "type": "Advanced",
    "category": "Retrieval Depth",
    "tags": ["architecture decisions", "trade-offs", "feedback", "evidence"],
    "answer": "**How I justify the choices**\n\nParent-child retrieval separates precise matching from complete generation context. pgvector keeps vectors beside tenant and document relationships, reducing synchronization and operational components. FastAPI and Server-Sent Events fit an I/O-heavy, one-way token stream. LangChain is used narrowly as a common Mistral/OpenAI invocation and streaming adapter, while ingestion, retrieval, and metering remain custom. Dense-only retrieval reduced initial complexity but leaves exact-token gaps.\n\nA senior justification includes what would change the decision: hybrid search after identifier failures, a cross-encoder after measured NDCG gains, a durable queue when ingestion reliability or throughput demands it, and stronger data isolation immediately because the internal chat ownership check is incomplete.\n\nThe repository contains product-decision notes but no reliable artifact of external interviewer or client feedback tied to these choices. I would not invent 'feedback already received.' The owner should add real feedback and measured impact to this answer before using that phrase in an interview."
  },
  {
    "question": "Beyond missing WHERE clauses, could embedding-space similarity ever surface one tenant's content in another's results even with filtering in place?",
    "type": "Advanced",
    "category": "Security & Isolation",
    "tags": ["tenant isolation", "vector search", "filtering", "security"],
    "answer": "**Direct answer**\n\nIf a trusted tenant filter is correctly enforced inside the database query before rows are returned, vector similarity cannot override it. The nearest-neighbor operator ranks only eligible rows. Approximate indexes and post-filter behavior can reduce recall or return fewer matches, but they should not make a row that fails the authorization predicate visible.\n\nCross-tenant leakage still occurs through system design: trusting a client-supplied agent ID, applying a filter after results leave the database, a wrong join, a cache key missing tenant scope, a privileged service role bypassing Row-Level Security, insecure logs or traces, or a retrieval function that forgets the predicate. Timing and aggregate counts can also become side channels.\n\nArchelon passes `agent_id` to an external Edge Function whose SQL is absent, and internal chat does not enforce ownership first. Therefore the real risk is scope propagation and unverifiable database enforcement, not embeddings mysteriously crossing a correct security boundary."
  },
  {
    "question": "How do you audit that tenant context propagates correctly through the entire retrieval and orchestration chain, not just at the API boundary?",
    "type": "Advanced",
    "category": "Security & Isolation",
    "tags": ["tenant context", "authorization testing", "audit", "RLS"],
    "answer": "**Audit the complete data flow**\n\nI define one trusted tenant context at authentication, authorize the requested agent against it, and pass a typed server-side context through orchestration. I then verify every boundary: API route, agent lookup, query rewrite, retrieval call, database function, parent resolution, prompt assembly, usage event, trace, cache, and streamed response. Client-supplied tenant identifiers should never replace trusted scope.\n\n**Tests and evidence**\n\nI create two tenants with distinctive canary documents and run positive and negative integration tests for every route and key type. Tests call the actual Edge Function and database role, attempt guessed agent/document IDs, inspect returned chunks and traces, and fail if Tenant B's canary appears anywhere in Tenant A's response. Database-policy tests verify select, insert, update, and delete, including privileged-role behavior.\n\nArchelon lacks this test suite and local Row-Level Security policies. Its internal chat ownership gap demonstrates why route authentication alone is insufficient."
  },
  {
    "question": "Could a malicious document uploaded by one tenant contain a prompt injection designed to leak another tenant's data or override your system prompt?",
    "type": "Advanced",
    "category": "Security & Isolation",
    "tags": ["indirect prompt injection", "RAG poisoning", "tenant isolation", "security"],
    "answer": "**Yes, it can attempt indirect prompt injection**\n\nA document can contain text such as 'ignore previous instructions' because Archelon embeds and later inserts document content into the model prompt without classifying it as untrusted instructions. The model may follow that text and override answer behavior or reveal prompt material. Archelon's user-message substring wrapper does not scan uploaded documents.\n\nA document from Tenant A should not be able to leak Tenant B's data if retrieval and storage authorization are correct, because the model cannot reveal context it never receives. But Archelon's internal chat ownership check and database-policy verification are incomplete, so that isolation must be fixed independently. Injection can still leak Tenant A's accessible context, system prompt, or create harmful Markdown.\n\nDefenses include trusted tenant filtering, clear instruction/data separation, ingestion and retrieval-time scanning, least privilege, no powerful tools, output validation and safe Markdown rendering, provenance, and adversarial tests. A system prompt alone is not sufficient."
  },
  {
    "question": "If a document is crafted to make the LLM ignore \"answer only from context,\" what's your actual defense — system prompt alone, or output filtering too?",
    "type": "Advanced",
    "category": "Security & Isolation",
    "tags": ["prompt injection", "output filtering", "guardrails", "grounding"],
    "answer": "**Current Archelon defense**\n\nIt is mostly the system prompt. The prompt declares grounding rules absolute and wraps retrieved text in a context block. `sanitize_message` checks a short list of direct user phrases, but only prefixes the same content with `[User message]`; it does not reject it. Retrieved documents are not scanned, and there is no independent output filter, claim verifier, prompt-leak detector, citation entailment check, or guard model.\n\nTherefore the honest answer is that Archelon does not have a robust defense against indirect document injection.\n\n**Defense in depth I would add**\n\nTreat retrieved text as untrusted data, preserve clear structural separation, detect suspicious instructions during ingestion and before generation, restrict model capabilities, validate links and rendered Markdown, scan outputs for secrets and prompt leakage, verify factual claims against retrieved evidence, and red-team known attacks. None of these controls alone is perfect, so authorization must prevent the model from ever receiving data it is not allowed to expose."
  },
  {
    "question": "Your traces and prompts likely contain client data — how do you prevent LangSmith itself from becoming a cross-tenant leak vector?",
    "type": "Advanced",
    "category": "Security & Isolation",
    "tags": ["LangSmith", "privacy", "trace security", "data minimization"],
    "answer": "**What Archelon does now**\n\nThe tracing helper removes dictionary fields whose key names contain `authorization`, `api_key`, `token`, `password`, or `secret`, and truncates strings over 4,000 characters. Retrieval previews omit full parent content and include IDs, filename, section, score, and token count. Tracing is optional.\n\nThat is not complete tenant-data protection. Root inputs include user messages, outputs can include full answers, metadata includes user and agent identifiers, synthesis inputs include the message, and one default project name can contain every tenant. Key-name filtering does not detect personal data or secrets embedded in free text. The repository shows no LangSmith workspace access policy, retention, regional storage, per-tenant project, or deletion workflow.\n\nI would minimize content by default, pseudonymize identifiers, redact sensitive text with a real policy, restrict workspace roles, set retention and deletion controls, encrypt transport, audit access, document vendor data processing, and allow sensitive tenants to disable external tracing."
  },
  {
    "question": "**\"How would you ingest and make 1 million PDFs searchable?\"** — parallel/batched ingestion workers; a queue to decouple upload from processing; async chunking/embedding with status tracking; batch embedding calls instead of one-by-one; incremental/resumable ingestion so a failure at document 700,000 doesn't restart everything; storage cost and HNSW index-build time growing with corpus size; deduplication before embedding.",
    "type": "Advanced",
    "category": "Scale & Production System Design",
    "tags": ["large-scale ingestion", "queue", "workers", "million PDFs"],
    "answer": "**Architecture**\n\nI would make upload and processing separate services. Uploads land in object storage and create idempotent manifest records. A durable queue partitions work by document or page range; autoscaled workers parse, normalize, hash, chunk, and batch embeddings. Job state and checkpoints make every stage resumable, and exhausted jobs move to a dead-letter queue rather than restarting the collection.\n\n**Efficiency and correctness**\n\nI deduplicate files by content hash before parsing and chunks before embedding, respect provider batch and rate limits, version parsers and embeddings, and write chunks in bulk. I build or backfill vector and lexical indexes with controlled concurrency, monitor queue age, throughput, failures, embedding cost, storage, index memory, and Recall@k, then use blue-green index versions for safe cutover. HNSW build time and memory grow with vectors, so partitioning and index strategy must be benchmarked.\n\nArchelon today uses 2 MB files, FastAPI in-process background tasks, sequential embedding batches with a 1.1-second delay, and per-chunk vector updates. It is not a million-PDF architecture; the pipeline concepts are reusable, but the execution infrastructure must change."
  },
  {
    "question": "How do a chat API and an ingestion pipeline scale independently — why not just \"add more of everything\"?",
    "type": "Advanced",
    "category": "Scale & Production System Design",
    "tags": ["independent scaling", "chat API", "ingestion workers", "queues"],
    "answer": "**Different workload shapes**\n\nChat is latency-sensitive and mostly network I/O: query analysis, embedding, vector search, and streamed generation. It needs low p95 latency, connection capacity, provider concurrency, and enough instances for live traffic. Ingestion is throughput-oriented and bursty: parsing can be CPU and memory heavy, embeddings are batchable, and completion can take minutes.\n\nI would run stateless chat instances separately from queue-driven ingestion workers. They can have different autoscaling signals, instance sizes, concurrency, retry policy, and deployment cadence. The shared contracts are database state, object storage, embedding/index version, and tenant quota. Backpressure on ingestion should not starve chat, so provider limits and resource pools may also need separation.\n\nArchelon currently runs FastAPI background ingestion in the same process as chat. Adding identical API instances would duplicate in-memory limits and make background-job ownership fragile; decoupling is the first scaling step."
  },
  {
    "question": "Queuing, async processing, rate limiting, token budgets — mention explicitly for any \"production-ready LLM workflow\" question; a purely architectural answer with no concurrency was flagged as a real gap before.",
    "type": "Advanced",
    "category": "Scale & Production System Design",
    "tags": ["production LLM", "queueing", "rate limiting", "token budgets"],
    "answer": "**Production workflow answer**\n\nI separate synchronous user-facing work from asynchronous durable work. The chat path is async for provider I/O, applies per-tenant and global concurrency limits, reserves token quota atomically, uses request timeouts and cancellation, and streams results. Ingestion goes through a durable queue with idempotent jobs, bounded retries with jitter, checkpoints, dead-letter handling, and backpressure.\n\nRate limits protect by user, key, IP, provider, and system capacity. Token budgets exist at three levels: account quota, retrieval-context budget, and generation output cap. Observability tracks queue age, active concurrency, provider `429`s, tokens, cost, p95 latency, failures, and time to first token.\n\nArchelon has async HTTP, parallel multi-query search, in-memory rate limits, account balances, context budgets, retries, and job status. It lacks a durable queue, distributed limiter, atomic quota reservation, and consistently enforced widget output cap, so I would call it a production-oriented prototype rather than fully hardened workflow infrastructure."
  },
  {
    "question": "At what tenant count or query volume does pgvector with RLS stop scaling gracefully — what forces a move to per-tenant collections or a dedicated vector store?",
    "type": "Advanced",
    "category": "Scale & Production System Design",
    "tags": ["pgvector scaling", "RLS", "tenant count", "vector database"],
    "answer": "**There is no universal tenant threshold**\n\nThe limit depends on total vectors, dimensions, index memory, tenant-size skew, filter selectivity, query rate, update rate, hardware, and latency/recall targets. Ten thousand tiny tenants can be easier than ten very large tenants. I would watch p95/p99 query latency, Recall@k against exact search, rows visited, buffer hit rate, CPU, memory, index size, connection saturation, write amplification, and noisy-neighbor effects.\n\nA move becomes justified when filtered approximate search cannot meet both recall and latency, one tenant dominates resources, indexes no longer fit practical memory, maintenance blocks writes, regional or regulatory isolation is required, or sharding PostgreSQL becomes more complex than a vector-native service. Before migrating I would try indexes on filter columns, iterative scans, partitioning large tenants, replicas, and workload isolation.\n\nArchelon has no load test, vector count, query plan, or verified index in the repository, so naming a tenant number would be guessing."
  },
  {
    "question": "If traffic went up 10x tomorrow, what's the actual first thing that breaks, and how do you know that's the bottleneck rather than guessing?",
    "type": "Advanced",
    "category": "Scale & Production System Design",
    "tags": ["load testing", "bottleneck", "10x traffic", "capacity"],
    "answer": "**Likely risks, not a measured fact**\n\nThe strongest code-level candidates are provider rate limits and the single API process. Document embeddings are deliberately serialized with a 1.1-second delay, query embeddings share an external API, ingestion runs inside FastAPI, synchronous Supabase calls can block the event loop, and in-memory rate limits are neither shared nor persistent. More API replicas would weaken limits and cannot safely own durable background work.\n\nI would not claim which breaks first without evidence. I would replay representative chat and ingestion traffic separately and together, increasing concurrency while measuring time to first token, stage p95, event-loop lag, provider `429`s, Supabase latency and connections, CPU/memory, queue or job age, and error rate. Distributed traces identify the stage where latency bends upward.\n\nThe first remediation follows the measured saturation point, but durable ingestion workers, distributed rate limiting, and non-blocking database access are clear prerequisites before a 10x event."
  },
  {
    "question": "What load balancer, Redis caching, or connection-pooling layer would you add next, and why (Supabase already handles pooling)?",
    "type": "Advanced",
    "category": "Scale & Production System Design",
    "tags": ["Redis", "load balancing", "connection pooling", "caching"],
    "answer": "**My next addition would be Redis-backed coordination**\n\nRailway can route traffic to application instances and Supabase manages database connection infrastructure, so I would not add another database pool blindly. Archelon's immediate multi-instance problem is process-local state: user, key, and IP rate limits reset and diverge across instances. Redis can provide atomic distributed rate limits, short-lived idempotency locks, cancellation state, and possibly queue support.\n\nI would be conservative with answer caching because responses depend on tenant, agent instructions, model, document/index version, and query rewrite. Any cache key must include all of those or it risks stale or cross-tenant responses. Safer early caches are agent metadata and token balance with short expiry and explicit invalidation.\n\nI would add API replicas behind the platform load balancer after removing in-process job ownership. I would inspect Supabase pool mode, connection metrics, and the synchronous client behavior before adding a separate proxy such as PgBouncer."
  },
  {
    "question": "LLM-as-judge models are known to favor verbose, fluent answers regardless of correctness — how do you know your OpenAI-judge RAGAs scores aren't rewarding fluency over grounding?",
    "type": "Advanced",
    "category": "Evaluation Depth",
    "tags": ["LLM as judge", "verbosity bias", "RAGAs", "calibration"],
    "answer": "**First, correct the premise**\n\nArchelon has no RAGAs pipeline and no OpenAI judge in the repository, so there are no such scores to defend. OpenAI models are available for answer generation when selected, but that is different from evaluation.\n\n**How I would control judge bias**\n\nI would calibrate the judge against blinded human labels on a held-out set and use an evidence-first rubric: extract answer claims, require supporting context spans, and score unsupported claims rather than general writing quality. I would create counterfactual pairs where a fluent long answer is wrong and a concise answer is grounded, swap pair order to test position bias, cap or normalize answer length, measure repeated-run consistency, and compare a different model family or deterministic entailment metric.\n\nJudge scores would be one signal beside Context Recall, Recall@k, exact-match checks, refusal accuracy, and human review. I would report judge-human agreement and disagreement slices, not treat the judge as ground truth."
  },
  {
    "question": "How would you build a golden evaluation set to calibrate your judge against real human judgments, and how often would you refresh it to catch drift?",
    "type": "Advanced",
    "category": "Evaluation Depth",
    "tags": ["golden dataset", "human evaluation", "calibration", "drift"],
    "answer": "**Build the set**\n\nI would sample real, consented queries across tenants and document types, then add designed cases for exact IDs, paraphrases, multi-part questions, missing answers, conflicting documents, stale versions, prompt injection, and cross-tenant canaries. Domain reviewers label relevant chunks, required evidence, acceptable answer claims, refusal behavior, and graded relevance. Two reviewers score difficult cases independently, disagreements are adjudicated, and inter-rater agreement is recorded. Splits are made by document or tenant so near-duplicate content does not leak into calibration and test sets.\n\n**Use and refresh it**\n\nThe stable core runs on every prompt, model, chunker, embedding, index, or retrieval change. Production failures become regression cases after review. I would inspect drift continuously and refresh examples monthly or quarterly depending on traffic, immediately after major corpus or product changes, while keeping historical sets to detect regression. Sensitive text needs redaction, access control, retention, and versioning. Archelon has no golden set today."
  },
  {
    "question": "Even with the correct chunk retrieved, the model can still hallucinate — parametric memory, overgeneralization, or gap-filling. Which have you seen in Archelon, and how did you diagnose which one?",
    "type": "Advanced",
    "category": "Evaluation Depth",
    "tags": ["hallucination", "parametric memory", "gap filling", "diagnosis"],
    "answer": "**What I can verify**\n\nThe prompt is explicitly designed against all three behaviors: it forbids training-memory facts, unsupported inference, estimates, and pattern completion, and requires a fixed refusal when context is insufficient. But the repository contains no labeled incident log proving which failure was observed in production. I would not invent personal experience.\n\n**How I distinguish them**\n\nI freeze the exact retrieved context and replay generation. A claim absent from context but matching common world knowledge suggests parametric-memory intrusion. A claim that extends a supported statement beyond its scope suggests overgeneralization. A plausible value inserted where context has a missing field or partial sequence suggests gap-filling. I then run controlled variants: remove the relevant sentence, provide a contradictory synthetic context, and require claim-to-span citations.\n\nArchelon stores selected context and answers when logging succeeds, which supports this analysis, but it lacks an automated claim verifier and guaranteed replay metadata. Confirmed incidents should become golden regression tests."
  },
  {
    "question": "Why pgvector over Pinecone — at what scale would you reconsider?",
    "type": "Advanced",
    "category": "Trade-offs / Reversibility",
    "tags": ["pgvector", "Pinecone", "scaling", "migration"],
    "answer": "**Why pgvector**\n\nArchelon's ownership graph, documents, chunks, keys, and usage already live in Supabase PostgreSQL. pgvector keeps vector search beside relational filters, reduces synchronization failure between metadata and a separate vector service, and uses one backup, security, and operational model. That is a strong simplicity advantage at the current unmeasured scale.\n\n**When I would reconsider**\n\nNot at a fixed tenant count. I would reconsider when representative load tests show that filtered nearest-neighbor search misses Recall@k or p95 latency targets, indexes no longer fit practical memory, write and maintenance costs interfere with chat, one tenant creates noisy-neighbor problems, multi-region requirements dominate, or PostgreSQL sharding becomes more complex than a managed vector service.\n\nBefore migrating I would test exact versus approximate search, filtered HNSW, partitioning, replicas, and workload isolation. A migration needs dual writes, backfill, query shadowing, recall comparison, tenant-filter verification, gradual cutover, and rollback. The repository has no Pinecone benchmark, so I would not claim a measured crossover point."
  },
  {
    "question": "What's the weakest, least battle-tested part of Archelon right now, and how would you expose that in five minutes of questioning if you were the interviewer?",
    "type": "Advanced",
    "category": "Trade-offs / Reversibility",
    "tags": ["weakness", "tenant isolation", "testing", "architecture review"],
    "answer": "**Weakest area**\n\nTenant isolation and database contract verification are the weakest high-impact area. The repository has no migrations, Row-Level Security policies, Edge Function source, retrieval SQL, or cross-tenant tests. Internal chat authenticates a user but can pass a body-supplied agent ID to vector search even when ownership lookup fails. That is more serious than a retrieval-quality tuning issue because it affects confidentiality.\n\n**Five-minute interviewer probe**\n\nI would ask: Where is agent ownership rejected on `/api/chat/stream`? Which database role executes retrieval, and can it bypass Row-Level Security? Show the SQL that joins child chunks back to tenant ownership. Show a test where Tenant A queries Tenant B's known agent ID. Are traces, usage logs, caches, and document-status endpoints tenant-scoped? What happens if the Edge Function omits one predicate?\n\nThe next weak area is ingestion durability: in-process background tasks, no durable queue, and no resumable checkpoint. Both should be stated openly with a concrete hardening plan."
  },
  {
    "question": "If you rebuilt Archelon today, what's the first architectural decision you'd reverse, and what would it cost to migrate live tenants?",
    "type": "Advanced",
    "category": "Trade-offs / Reversibility",
    "tags": ["rebuild", "tenant context", "RLS", "migration"],
    "answer": "**Decision I would reverse**\n\nI would not let tenant scope remain an implicit chain of route-level filters and a client-supplied `agent_id`. I would make a typed, server-derived authorization context foundational and enforce the same ownership in PostgreSQL Row-Level Security and the retrieval function from day one. That creates defense in depth before adding more public surfaces.\n\n**Migration cost**\n\nThe data model already contains `user_id` on agents and agent-to-document-to-chunk lineage, so this is not a full data move. The work is to add versioned migrations and policies, rewrite the Edge Function and chat boundary, choose database roles that do not bypass policies, centralize authorization, update widget and developer-key paths, and add negative integration tests. I would deploy in phases: audit/backfill ownership, run policy checks in shadow mode, compare old and new retrieval, enable per route, then remove trusted client scope.\n\nLive risk is accidental denial or leakage during policy rollout, so rollback scripts, canary tenants, query monitoring, and a maintenance plan are required. After security, I would move ingestion to a durable queue."
  },
  {
    "question": "What would it take to make a production incident fully replayable — prompt version, retrieved chunks, model version — versus what Archelon actually captures today?",
    "type": "Advanced",
    "category": "Trade-offs / Reversibility",
    "tags": ["replayability", "incident response", "prompt versioning", "provenance"],
    "answer": "**What Archelon captures**\n\nWhen logging succeeds, `token_usage` stores user and agent IDs, message, response, selected context chunks, model name, token estimates, and total, first-token, intent, retrieval, and synthesis latency. Optional LangSmith traces add route and stage runs with search queries, result counts, context previews, outputs, and errors.\n\n**What full replay requires**\n\nI would assign an immutable request ID and persist the exact system and user prompt or a content-addressed prompt version; agent instructions; rewritten queries; full candidate lists, scores, chosen chunks, and source/version hashes; embedding model and index snapshot; generation provider, exact model revision, parameters, seed when supported, and provider response ID; code/build version; feature flags; tenant scope; and timestamps. External responses should be captured subject to privacy and retention rules.\n\nArchelon does not guarantee prompt version, exact model revision, all candidates, index version, provider metadata, or durable logging. Even with complete inputs, hosted models may not reproduce identical tokens, so replay should support exact historical inspection plus deterministic stage re-execution and comparison, not promise byte-identical output."
  }
]
