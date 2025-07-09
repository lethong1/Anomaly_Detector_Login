#!/bin/bash

# Token từ brute force attack
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Thay bằng token thật

echo "🔓 HACKER CURL ACCESS"
echo "===================="

# Test dashboard
echo "📊 Testing Dashboard API..."
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:8000/api/dashboard/

echo -e "\n\n👥 Testing Users API..."
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:8000/api/users/

echo -e "\n\n🚨 Testing Suspicious Logs API..."
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:8000/api/suspicious-logs/

echo -e "\n\n🔒 Testing Blocked IPs API..."
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:8000/api/blocked-ips/

echo -e "\n\n✅ HACKER CÓ THỂ TRUY CẬP TẤT CẢ API VỚI TOKEN!" 