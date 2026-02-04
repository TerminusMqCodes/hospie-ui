# Gyors Lokális Runner Beállítás

## 🚀 Egyszerű Lépések

### 1. **Bitbucket Workspace Settings**
```
1. Bitbucket.org > Workspace > Settings
2. Pipelines > Runners
3. "Add runner" gomb
4. Runner type: "Workspace runner"
5. Name: "Local Runner"
6. Labels: self.hosted, local
7. Másold ki a generált setup parancsot
```

### 2. **Runner Telepítés (Linux/macOS)**
```bash
# 1. Runner letöltése
curl -O https://product-downloads.atlassian.com/software/bitbucket/pipelines/atlassian-bitbucket-pipelines-runner/LATEST/atlassian-bitbucket-pipelines-runner-linux-amd64.tar.gz

# 2. Kicsomagolás
tar -xzf atlassian-bitbucket-pipelines-runner-linux-amd64.tar.gz

# 3. Futtatható jogok
chmod +x atlassian-bitbucket-pipelines-runner

# 4. A Bitbucket-ből másolt parancs futtatása
# (Ez hasonló lesz ehhez:)
./atlassian-bitbucket-pipelines-runner \
  --working-directory /home/user/.bitbucket-runner \
  --account-uuid {WORKSPACE_UUID} \
  --repository-uuid {REPO_UUID} \
  --runner-uuid {RUNNER_UUID} \
  --oauth-client-id {CLIENT_ID} \
  --oauth-client-secret {CLIENT_SECRET}
```

### 3. **Windows Telepítés**
```powershell
# 1. Töltsd le a Windows verziót:
# https://product-downloads.atlassian.com/software/bitbucket/pipelines/atlassian-bitbucket-pipelines-runner/LATEST/atlassian-bitbucket-pipelines-runner-windows-amd64.zip

# 2. Csomagold ki egy mappába (pl. C:\bitbucket-runner\)

# 3. PowerShell Admin módban:
cd C:\bitbucket-runner\

# 4. A Bitbucket-ből másolt parancs futtatása
.\atlassian-bitbucket-pipelines-runner.exe `
  --working-directory C:\bitbucket-runner `
  --account-uuid {WORKSPACE_UUID} `
  --repository-uuid {REPO_UUID} `
  --runner-uuid {RUNNER_UUID} `
  --oauth-client-id {CLIENT_ID} `
  --oauth-client-secret {CLIENT_SECRET}
```

### 4. **Docker Ellenőrzés**
```bash
# Docker telepítve van?
docker --version

# Ha nincs, telepítsd:
# Ubuntu: sudo apt install docker.io
# CentOS: sudo yum install docker
# Windows: Docker Desktop telepítése
# macOS: Docker Desktop telepítése

# User hozzáadása docker csoporthoz (Linux)
sudo usermod -aG docker $USER
# Újra bejelentkezés szükséges!
```

### 5. **Repository Beállítás**
```
1. Repository Settings > Pipelines > Settings
2. Enable Pipelines: ON
3. Repository variables:
   - SONAR_TOKEN: (SonarQube token)
   - SONAR_ORGANIZATION: (SonarQube org)
```

### 6. **Pipeline Tesztelés**
```bash
# Commit és push
git add .
git commit -m "Enable local runner"
git push

# Bitbucket Pipelines ellenőrzése
# Látni kell: "Running on self.hosted runner"
```

## 🔍 Gyors Ellenőrzés

### **Runner Fut?**
```bash
# Linux/macOS
ps aux | grep bitbucket-runner

# Windows
tasklist | findstr bitbucket-runner
```

### **Docker Működik?**
```bash
docker run hello-world
```

### **Pipeline Használja a Runner-t?**
```
Bitbucket > Repository > Pipelines > Latest build
Keress rá: "Running on self.hosted runner"
```

## ⚡ Gyors Hibaelhárítás

### **Runner Nem Indul**
```bash
# Jogosultságok ellenőrzése
ls -la atlassian-bitbucket-pipelines-runner

# Futtatható jogok hozzáadása
chmod +x atlassian-bitbucket-pipelines-runner
```

### **Docker Hiba**
```bash
# Docker service indítása
sudo systemctl start docker

# User jogosultság
sudo usermod -aG docker $USER
# ÚJRA BEJELENTKEZÉS SZÜKSÉGES!
```

### **OAuth Hiba**
```
1. Bitbucket Workspace > Settings > OAuth consumers
2. Új consumer létrehozása:
   - Name: "Runner OAuth"
   - Callback URL: http://localhost
   - Permissions: Repositories (Read, Write), Pipelines (Write)
3. Key és Secret másolása
4. Runner újraindítása új credentials-szel
```

## 🎯 Eredmény Ellenőrzése

### **Sikeres Beállítás Jelei:**
- ✅ Runner megjelenik a Workspace > Runners listában
- ✅ Pipeline fut és "self.hosted" runner-t használ
- ✅ Build idő javult (gyorsabb)
- ✅ Nincs memória limit hiba
- ✅ SonarQube analízis sikeresen fut

### **Pipeline Log Példa:**
```
✅ Running on self.hosted runner
✅ NODE_OPTIONS="--max-old-space-size=8192"
✅ SonarQube analysis completed successfully
✅ Build artifacts: dist/, dist-pwa/, dist-electron/
```

## 🚀 Következő Lépések

1. **Runner telepítése** (5-10 perc)
2. **Pipeline tesztelése** (1 commit)
3. **Teljesítmény élvezése** (nincs limit!)

---

**Időigény**: 10-15 perc  
**Nehézség**: Könnyű  
**Eredmény**: Korlátlan memória + gyors build-ek! 🎉