import requests
import json

url = "http://localhost:7777/api/v1/pos/status/eyJhbGciOiJIUzI1NiJ9.eyJpcEFkZHJlc3MiOiIwOjA6MDowOjA6MDowOjEiLCJtX0lkIjoxMDAwMjcsInR4bl9pZCI6Im9zRzE2ZkdhbHdmT25BOWIiLCJzYW5kYm94TW9kZSI6dHJ1ZSwiaWF0IjoxNzMwNzMxOTUxLCJleHAiOjE3MzA3MzU1NTF9.wv3F0YDN-Fe87t6RfeBiHOfJU81t5VoqHsCRQYnfI-8"

payload = json.dumps({
  "publicApiKey": "Cxdhpfa1PXOEpSC4OolJ6P46Yg4a5tBvtEcKnejOj0",
  "secretKey": "bvmUXhOGYodJY9l9qJtCBXlQZYdKz7TbyMlfPF9HaQ"
})
headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer AztlQdnChLPRTC6HWcivlaKfusDkXiV29bU3MnHalQ'
}

response = requests.request("GET", url, headers=headers, data=payload)

print(response.text)
