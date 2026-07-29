# Backend Setup Guide - POST IMPROVEMENTS

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment
```bash
# Copy and fill in your configuration
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/kcca_ims
JWT_SECRET=your-very-secret-key
FRONTEND_URL=http://localhost:5173
```

### 3. Create PostgreSQL Database
```bash
# Option A: Using psql
createdb kcca_ims

# Option B: If using PostgreSQL Docker
docker run --name kcca-postgres -e POSTGRES_PASSWORD=postgres -d postgres:15
```

### 4. Run Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start at `http://localhost:5000`

### 5. Access Documentation
```
API Documentation: http://localhost:5000/api-docs
Health Check:      http://localhost:5000/api/health
```

## Key Features Available

### ✅ PostgreSQL Database
- Automatic schema initialization
- Demo user seeding
- Foreign key relationships
- Indexes for query optimization

### ✅ Error Handling
- Global error middleware
- Validation error messages
- Async error catching
- Detailed error logging

### ✅ Request Logging
- HTTP request/response logging
- Response time tracking
- IP address and user agent capture
- Separate error logs

### ✅ Rate Limiting
- Auth endpoints: 5 requests/15 minutes
- General API: 100 requests/15 minutes
- Rate limit headers in responses
- Automatic cleanup of old entries

### ✅ Input Validation
- Zod schema validation
- Type-safe endpoints
- Detailed validation errors
- All endpoints covered

### ✅ API Documentation
- Swagger UI at /api-docs
- OpenAPI 3.0 specification
- Interactive endpoint testing
- Complete request/response schemas

### ✅ Security
- Helmet.js HTTP headers
- GZIP compression
- CORS configuration
- Rate limiting

### ✅ Testing
- Jest configuration
- Auth component tests
- Validator schema tests
- Integration test setup

## Demo Users

```
Role: Applicant
Email: applicant@kcca.go.ug
Password: password123

Role: HR Officer
Email: hr@kcca.go.ug
Password: password123

Role: Admin
Email: admin@kcca.go.ug
Password: password123
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Specific Test File
```bash
npm test -- auth.test.js
```

## Environment Variables

See `.env.example` for complete list. Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment (development/production) |
| `PORT` | `5000` | Server port |
| `DATABASE_URL` | (required) | PostgreSQL connection string |
| `JWT_SECRET` | (required) | JWT signing secret |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL for CORS |

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432

Solution: 
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in .env
3. Verify database exists: psql -U postgres -c "SELECT 1"
```

### Rate Limit Exceeded
```
Status: 429
Message: "Too many requests. Please try again later."

Solution:
Wait for 15 minutes or adjust RATE_LIMIT_WINDOW_MS in .env
```

### Validation Errors
```
Status: 400
Check the "errors" array in response for specific field issues

Example:
{
  "errors": [
    {"path": "email", "message": "Invalid email address"}
  ]
}
```

### Tests Failing
```
1. Ensure PostgreSQL is running
2. Check database connection: DATABASE_URL must be valid
3. Clear node_modules and reinstall: rm -rf node_modules && npm install
4. Run with verbose output: npm test -- --verbose
```

## File Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      (NEW - PostgreSQL setup)
│   │   ├── logger.js        (NEW - Logging)
│   │   └── swagger.js       (NEW - API Docs)
│   ├── middleware/
│   │   ├── errorHandler.js  (NEW - Error handling)
│   │   ├── requestLogger.js (NEW - Request logging)
│   │   └── rateLimit.js     (NEW - Rate limiting)
│   ├── validators/
│   │   ├── schemas.js       (NEW - Zod schemas)
│   │   └── validate.js      (NEW - Validation middleware)
│   ├── controllers/
│   ├── routes/
│   ├── __tests__/           (NEW - Test files)
│   ├── app.js               (UPDATED)
│   └── server.js            (UPDATED)
├── logs/                    (NEW - Log files created at runtime)
├── jest.config.js           (NEW)
├── .env.example             (NEW)
├── IMPROVEMENTS.md          (NEW - Detailed documentation)
└── package.json             (UPDATED with new dependencies)
```

## Next Steps

1. **Update Controllers** - Modify existing controllers to use PostgreSQL queries instead of JSON file operations
2. **Add Authentication** - Implement JWT token verification middleware
3. **Add File Upload** - Setup file storage and validation
4. **Email Integration** - Configure Nodemailer for notifications
5. **Production Deployment** - Setup environment for production

## Documentation

- **IMPROVEMENTS.md** - Comprehensive documentation of all changes
- **OpenAPI Docs** - Available at http://localhost:5000/api-docs
- **`.env.example`** - All environment variables explained

## Support

For issues:
1. Check logs in `logs/` directory
2. Review IMPROVEMENTS.md for feature details
3. Run tests with `npm test -- --verbose`
4. Check PostgreSQL connection: `psql -U postgres -c "SELECT 1"`

---

**Last Updated:** July 29, 2026
**Backend Version:** 1.0.0
