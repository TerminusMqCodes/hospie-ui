# Lokális Bitbucket Runner Beállítás

## 🎯 Cél
A repository beállítása, hogy a lokális workspace runner-t használja a Bitbucket Pipelines helyett.

## 📋 Lépések

### 1. **Runner Telepítése és Konfigurálása**

#### **Runner Letöltése**
```bash
# Linux/macOS
curl -O https://product-downloads.atlassian.com/software/bitbucket/pipelines/atlassian-bitbucket-pipelines-runner/LATEST/atlassian-bitbucket-pipelines-runner-linux-amd64.tar.gz

# Windows
# Töltsd le a Windows verziót a Bitbucket dokumentációból
```

#### **Runner Telepítése**
```bash
# Kicsomagolás
tar -xzf atlassian-bitbucket-pipelines-runner-linux-amd64.tar.gz

# Futtatható jogok
chmod +x atlassian-bitbucket-pipelines-runner

# Telepítés (opcionális)
sudo mv atlassian-bitbucket-pipelines-runner /usr/local/bin/
```

### 2. **Workspace Runner Konfigurálás**

#### **Runner Inicializálás**
```bash
# Runner konfigurációs könyvtár létrehozása
mkdir -p ~/.bitbucket-runner

# Runner inicializálás
atlassian-bitbucket-pipelines-runner \
  --working-directory ~/.bitbucket-runner \
  --repository-uuid {REPOSITORY_UUID} \
  --runner-uuid {RUNNER_UUID} \
  --oauth-client-id {CLIENT_ID} \
  --oauth-client-secret {CLIENT_SECRET}
```

#### **Szükséges Adatok Megszerzése**

**Repository UUID:**
```bash
# Bitbucket repository URL-ből:
# https://bitbucket.org/workspace/repository
# Repository Settings > General > Repository UUID
```

**OAuth Credentials:**
1. **Bitbucket Settings** > **OAuth consumers**
2. **Add consumer** gomb
3. **Name**: "Local Runner"
4. **Callback URL**: `http://localhost`
5. **Permissions**: 
   - Repositories: Read, Write
   - Pipelines: Write
6. **Save** és másold ki a **Key** és **Secret**

### 3. **Bitbucket Workspace Beállítások**

#### **Workspace Settings**
1. **Bitbucket Workspace** > **Settings**
2. **Pipelines** > **Runners**
3. **Add runner** gomb
4. **Runner type**: "Workspace runner"
5. **Name**: "Local Development Runner"
6. **Labels**: `self.hosted`, `local`, `development`

#### **Runner Token Generálás**
```bash
# A Bitbucket UI-ban generált token használata
atlassian-bitbucket-pipelines-runner \
  --working-directory ~/.bitbucket-runner \
  --account-uuid {WORKSPACE_UUID} \
  --repository-uuid {REPOSITORY_UUID} \
  --runner-uuid {RUNNER_UUID} \
  --oauth-client-id {CLIENT_ID} \
  --oauth-client-secret {CLIENT_SECRET}
```

### 4. **Repository Konfiguráció**

#### **Pipeline Fájl Frissítése**
```yaml
# bitbucket-pipelines.yml
definitions:
  steps:
    - step: &build-step
        name: Build with Local Runner
        runs-on:
          - 'self.hosted'        # Lokális runner használata
          - 'local'              # Custom label
        script:
          - echo "Running on local runner"
          - npm ci
          - npm run build
```

#### **Repository Settings**
1. **Repository Settings** > **Pipelines** > **Settings**
2. **Enable Pipelines**: ON
3. **Repository variables** beállítása:
   - `SONAR_TOKEN`
   - `SONAR_ORGANIZATION`

### 5. **Runner Indítása**

#### **Manuális Indítás**
```bash
# Runner indítása
atlassian-bitbucket-pipelines-runner \
  --working-directory ~/.bitbucket-runner \
  --account-uuid {WORKSPACE_UUID} \
  --repository-uuid {REPOSITORY_UUID} \
  --runner-uuid {RUNNER_UUID} \
  --oauth-client-id {CLIENT_ID} \
  --oauth-client-secret {CLIENT_SECRET}
```

#### **Service-ként Futtatás (Linux)**
```bash
# Systemd service fájl létrehozása
sudo tee /etc/systemd/system/bitbucket-runner.service > /dev/null <<EOF
[Unit]
Description=Bitbucket Pipelines Runner
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/.bitbucket-runner
ExecStart=/usr/local/bin/atlassian-bitbucket-pipelines-runner \\
  --working-directory $HOME/.bitbucket-runner \\
  --account-uuid {WORKSPACE_UUID} \\
  --repository-uuid {REPOSITORY_UUID} \\
  --runner-uuid {RUNNER_UUID} \\
  --oauth-client-id {CLIENT_ID} \\
  --oauth-client-secret {CLIENT_SECRET}
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Service engedélyezése és indítása
sudo systemctl enable bitbucket-runner
sudo systemctl start bitbucket-runner
sudo systemctl status bitbucket-runner
```

### 6. **Docker Konfiguráció**

#### **Docker Telepítése**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io
sudo usermod -aG docker $USER

# CentOS/RHEL
sudo yum install docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

#### **Docker Compose (opcionális)**
```bash
# Docker Compose telepítése
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 7. **Tesztelés**

#### **Runner Státusz Ellenőrzése**
```bash
# Runner státusz
sudo systemctl status bitbucket-runner

# Runner logok
sudo journalctl -u bitbucket-runner -f
```

#### **Pipeline Tesztelés**
1. **Commit és push** a repository-ba
2. **Bitbucket Pipelines** ellenőrzése
3. **Runner használat** megerősítése

## 🔧 Hibaelhárítás

### **Gyakori Problémák**

#### **OAuth Hiba**
```bash
# OAuth credentials ellenőrzése
curl -X POST https://bitbucket.org/site/oauth2/access_token \
  -d grant_type=client_credentials \
  -u {CLIENT_ID}:{CLIENT_SECRET}
```

#### **Docker Jogosultság**
```bash
# Docker csoport ellenőrzése
groups $USER

# Docker újraindítása
sudo systemctl restart docker
```

#### **Runner Kapcsolat**
```bash
# Hálózati kapcsolat tesztelése
curl -I https://api.bitbucket.org/2.0/repositories

# DNS feloldás
nslookup api.bitbucket.org
```

### **Debug Módok**

#### **Verbose Logging**
```bash
atlassian-bitbucket-pipelines-runner \
  --working-directory ~/.bitbucket-runner \
  --verbose \
  --debug
```

#### **Log Fájlok**
```bash
# Runner logok
tail -f ~/.bitbucket-runner/logs/runner.log

# System logok
sudo journalctl -u bitbucket-runner -f
```

## 📊 Ellenőrzési Lista

### **Telepítés Előtt**
- [ ] Docker telepítve és futó
- [ ] Bitbucket OAuth consumer létrehozva
- [ ] Workspace runner regisztrálva
- [ ] Repository UUID és Runner UUID megszerzve

### **Telepítés Után**
- [ ] Runner service fut
- [ ] Docker konténerek indíthatók
- [ ] Pipeline sikeresen fut lokálisan
- [ ] Logok nem tartalmaznak hibákat

### **Működés Ellenőrzése**
- [ ] Pipeline a lokális runner-t használja
- [ ] Build idő javult
- [ ] Memória limit megszűnt
- [ ] SonarQube analízis működik

## 🎉 Következő Lépések

1. **Runner telepítése** a fenti lépések szerint
2. **Pipeline tesztelése** commit-tal
3. **Teljesítmény monitoring** beállítása
4. **Backup és monitoring** konfigurálása

---

**Státusz**: KONFIGURÁCIÓS ÚTMUTATÓ ✅  
**Cél**: Lokális runner használata  
**Előny**: Nincs memória limit  
**Eredmény**: Gyors, megbízható CI/CD