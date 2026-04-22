# Backend Wizards — Stage 2: Intelligence Query Engine Assessment

## Overview
This is a RESTful API that enriches names using three external APIs (Genderize, Agify, Nationalize), stores the processed profiles in MongoDB, and provides advanced querying capabilities including filtering, sorting, pagination, and natural language search.

## Features Implemented
- Integration with Genderize, Agify, and Nationalize APIs
- Data processing and enrichment (age_group, best country, etc.)
- Idempotency (same name returns existing profile)
- UUID v7 for unique IDs
- Advanced filtering, sorting, and pagination
- Natural language query parsing
- Proper error handling (400, 422, 404, 502)
- Clean, consistent JSON responses
- MongoDB persistence with Mongoose

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- Axios (for external APIs)
- UUID v7

## API Endpoints

### 1. Create / Enrich Profile
**POST** `/api/profiles`
```json
{
  "name": "ella"
}
```

### 2. Get All Profiles
**GET** `/api/profiles`
Supports filtering, sorting, and pagination.

Query Parameters:
- `gender`: male/female
- `age_group`: child/teenager/adult/senior
- `country_id`: ISO country code
- `min_age`: minimum age
- `max_age`: maximum age
- `min_gender_probability`: minimum gender confidence
- `min_country_probability`: minimum country confidence
- `sort_by`: age/created_at/gender_probability (default: created_at)
- `order`: asc/desc (default: desc)
- `page`: page number (default: 1)
- `limit`: items per page (default: 10, max: 50)

Response:
```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 2026,
  "data": [...]
}
```

### 3. Get Profile by ID
**GET** `/api/profiles/:id`

### 4. Natural Language Search
**GET** `/api/profiles/search?q=<query>`
Parses plain English queries into filters with pagination.

### 5. Delete Profile
**DELETE** `/api/profiles/:id`

## Natural Language Parsing Approach

The natural language search uses a rule-based parser that tokenizes the input query and maps keywords to database filters. It does not use AI or LLMs.

### Supported Keywords and Mappings

#### Gender
- `male`, `males` → `gender = "male"`
- `female`, `females` → `gender = "female"`

#### Age Groups
- `child`, `children` → `age_group = "child"`
- `teenager`, `teenagers` → `age_group = "teenager"`
- `adult`, `adults` → `age_group = "adult"`
- `senior`, `seniors` → `age_group = "senior"`

#### Age Ranges
- `young` → `min_age = 16, max_age = 24`
- `above <number>` or `over <number>` → `min_age = <number>`
- `below <number>` or `under <number>` → `max_age = <number>`

#### Countries
- `from <country name>` → `country_id = <ISO code>`
Supported countries include Nigeria (NG), Kenya (KE), Angola (AO), etc. (full list in helpers.js)

#### Connectors
- `and` → combines multiple conditions

### Parsing Logic
1. Split query into lowercase words
2. Iterate through words, matching against known keywords
3. Build filter object based on matches
4. If any word doesn't match, return "Unable to interpret query"

### Examples
- "young males" → gender=male, min_age=16, max_age=24
- "females above 30" → gender=female, min_age=30
- "people from angola" → country_id=AO
- "adult males from kenya" → gender=male, age_group=adult, country_id=KE
- "male and female teenagers above 17" → age_group=teenager, min_age=17

### Limitations
- No support for complex boolean logic (OR, NOT)
- No fuzzy matching for country names
- No handling of typos or synonyms
- Queries must follow the exact keyword patterns
- No support for combined age ranges beyond min/max
- Limited to predefined country list
- Does not handle plural variations beyond listed ones
- No support for probability filters in natural language