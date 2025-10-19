# Test Product Documents API
Write-Host "🔍 Testing Product Documents API..." -ForegroundColor Green

$productId = "17c448f9-91aa-4e53-870f-f5130810d719"

# 1. Test without authentication (should get 401)
Write-Host "`n1. Testing without auth (should get 401)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/products/$productId/documents" -Method GET
    Write-Host "❌ Should have gotten 401!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Got expected 401 Unauthorized" -ForegroundColor Green
    } else {
        Write-Host "❌ Got unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 2. Try to login and get token
Write-Host "`n2. Attempting login..." -ForegroundColor Yellow
$loginData = @{
    email = "test@example.com"
    password = "password"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/test-login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Login successful, got token" -ForegroundColor Green
    
    # 3. Test with authentication
    Write-Host "`n3. Testing with authentication..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $token"
        "Accept" = "application/json"
    }
    
    try {
        $documentsResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/products/$productId/documents" -Method GET -Headers $headers
        Write-Host "✅ Documents API working! Found $($documentsResponse.data.Count) documents" -ForegroundColor Green
        
        if ($documentsResponse.data.Count -gt 0) {
            Write-Host "   Sample documents:" -ForegroundColor Cyan
            $documentsResponse.data | Select-Object -First 3 | ForEach-Object {
                Write-Host "   - Title: $($_.title), Type: $($_.type)" -ForegroundColor Gray
            }
        }
        
    } catch {
        Write-Host "❌ Documents API failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        }
    }
    
    # 4. Test alerts API
    Write-Host "`n4. Testing alerts API..." -ForegroundColor Yellow
    try {
        $alertsResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/products/$productId/alerts" -Method GET -Headers $headers
        Write-Host "✅ Alerts API working! Found $($alertsResponse.data.Count) alerts" -ForegroundColor Green
    } catch {
        Write-Host "❌ Alerts API failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure Laravel server is running on port 8000" -ForegroundColor Yellow
}

Write-Host "`n🎉 Testing completed!" -ForegroundColor Green