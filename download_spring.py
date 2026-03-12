import urllib.request
import zipfile
import os
import sys

url = "https://start.spring.io/starter.zip?type=maven-project&language=java&baseDir=tms-backend&groupId=com.tms&artifactId=backend&name=tms-backend&description=Transport+Management+System&packageName=com.tms.backend&packaging=jar&javaVersion=17&dependencies=web,data-jpa,mysql,security,validation,lombok,devtools"
zip_path = "tms.zip"

headers = {'User-Agent': 'Mozilla/5.0'}
req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req) as response, open(zip_path, 'wb') as out_file:
        out_file.write(response.read())
except urllib.error.HTTPError as e:
 print(f"HTTP Error: {e.code}")
    print(e.read().decode())
    sys.exit(1)

with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    zip_ref.extractall(".")

os.remove(zip_path)
print("Done extracting to tms-backend/")
