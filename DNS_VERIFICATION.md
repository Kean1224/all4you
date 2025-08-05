# DNS Verification Commands

## Test DNS Resolution
```bash
# Test main domain
nslookup all4youauctions.co.za

# Test API subdomain  
nslookup api.all4youauctions.co.za

# Test WWW subdomain
nslookup www.all4youauctions.co.za
```

## Test SSL Certificates
```bash
# Test frontend SSL
curl -I https://all4youauctions.co.za

# Test backend SSL
curl -I https://api.all4youauctions.co.za

# Test API endpoint
curl https://api.all4youauctions.co.za/api/ping
```

## DNS Propagation Check
- Use online tools like:
  - https://dnschecker.org
  - https://www.whatsmydns.net

## Expected Results:
- `all4youauctions.co.za` → Frontend (200 OK)
- `api.all4youauctions.co.za` → Backend API (200 OK)
- Both should have valid SSL certificates
- CORS should allow frontend domain on backend
