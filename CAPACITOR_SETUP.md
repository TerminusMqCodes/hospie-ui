# Capacitor Telepítési Útmutató - Quasar Projekthez

## ✅ Már Telepítve

A Capacitor csomagok már telepítve vannak a projektben:
- `@capacitor/core` - Alapvető Capacitor funkciók
- `@capacitor/cli` - Capacitor CLI eszközök
- `@capacitor/android` - Android platform
- `@capacitor/ios` - iOS platform
- Összes plugin (Camera, Geolocation, Push Notifications, stb.)

## 📱 Platform Hozzáadása

### Android Platform

```bash
# 1. Build a PWA verzió (ez kell a Capacitornak)
npm run build:pwa

# 2. Android platform hozzáadása
npx cap add android

# 3. Szinkronizálás (másolja a web fájlokat az Android projektbe)
npx cap sync android

# 4. Android Studio megnyitása
npx cap open android
```

### iOS Platform (csak macOS-en)

```bash
# 1. Build a PWA verzió
npm run build:pwa

# 2. iOS platform hozzáadása
npx cap add ios

# 3. Szinkronizálás
npx cap cap sync ios

# 4. Xcode megnyitása
npx cap open ios
```

## 🔧 Fejlesztési Workflow

### 1. Quasar Dev Mode Capacitorral

A Quasar config már be van állítva Capacitor támogatásra. Használd ezeket a parancsokat:

```bash
# Quasar dev mode (böngészőben)
npm run dev

# PWA mode (service worker teszteléshez)
npm run dev:pwa
```

### 2. Natív Fejlesztés

```bash
# 1. Build a legújabb változtatásokat
npm run build:pwa

# 2. Szinkronizálás a natív projekttel
npx cap sync

# 3. Natív IDE megnyitása
npx cap open android
# vagy
npx cap open ios
```

### 3. Live Reload Mobilon

A `capacitor.config.ts` fájlban állítsd be a dev szervert:

```typescript
const config: CapacitorConfig = {
  // ... egyéb config
  server: {
    url: 'http://192.168.1.100:9001', // A gép IP címe a helyi hálózaton
    cleartext: true
  }
}
```

Majd:
```bash
# 1. Indítsd a Quasar dev szervert
npm run dev

# 2. Szinkronizálás
npx cap sync

# 3. Futtasd az appot Android Studio-ból vagy Xcode-ból
```

**Fontos:** Távolítsd el a `server` konfigot production buildnél!

## 📦 Hasznos Capacitor Parancsok

```bash
# Összes platform szinkronizálása
npx cap sync

# Csak Android
npx cap sync android

# Plugin lista
npx cap ls

# Capacitor verzió
npx cap --version

# Capacitor doctor (problémák ellenőrzése)
npx cap doctor

# Plugin hozzáadása
npm install @capacitor/[plugin-name]
npx cap sync
```

## 🔌 Telepített Pluginok

A projektben már telepítve vannak:

- ✅ **App** - App lifecycle events
- ✅ **Camera** - Fényképezés és galéria
- ✅ **Device** - Eszköz információk
- ✅ **Filesystem** - Fájl műveletek
- ✅ **Geolocation** - GPS pozíció
- ✅ **Haptics** - Rezgés
- ✅ **Keyboard** - Billentyűzet kezelés
- ✅ **Local Notifications** - Helyi értesítések
- ✅ **Network** - Hálózat státusz
- ✅ **Push Notifications** - Push értesítések
- ✅ **Splash Screen** - Indító képernyő
- ✅ **Status Bar** - Státusz sor testreszabás

## 🎯 Használat a Kódban

A `capacitorService.js` már készen áll a használatra:

```javascript
import { capacitorService } from '@/services/capacitorService'

// Ellenőrzés, hogy natív platformon fut-e
if (capacitorService.isNativePlatform()) {
  console.log('Platform:', capacitorService.getPlatform())
}

// Fénykép készítése
const photo = await capacitorService.takePhoto()

// GPS pozíció
const position = await capacitorService.getCurrentPosition()

// Rezgés
await capacitorService.vibrate('medium')

// Push notification inicializálás
await capacitorService.initializePushNotifications()
```

## 🚀 Production Build

### Android APK/AAB

```bash
# 1. Build a PWA
npm run build:pwa

# 2. Szinkronizálás
npx cap sync android

# 3. Android Studio-ban:
# - Build > Generate Signed Bundle / APK
# - Válaszd az APK vagy AAB opciót
# - Kövesd a signing wizard-ot
```

### iOS IPA

```bash
# 1. Build a PWA
npm run build:pwa

# 2. Szinkronizálás
npx cap sync ios

# 3. Xcode-ban:
# - Product > Archive
# - Distribute App
# - Válaszd a distribution módot (App Store, Ad Hoc, stb.)
```

## 🔐 Engedélyek Konfigurálása

### Android (`android/app/src/main/AndroidManifest.xml`)

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.VIBRATE" />
```

### iOS (`ios/App/App/Info.plist`)

```xml
<key>NSCameraUsageDescription</key>
<string>A Hospie PMS-nek szüksége van a kamerára fotók készítéséhez</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>A Hospie PMS-nek szüksége van a helyadatokra</string>
```

## 🐛 Gyakori Problémák

### 1. "Could not find gradle wrapper"
```bash
cd android
./gradlew wrapper
cd ..
```

### 2. "Xcode build failed"
- Nyisd meg az ios mappát Xcode-ban
- Válaszd ki a megfelelő Development Team-et
- Ellenőrizd a Bundle Identifier-t

### 3. "Plugin not implemented"
- Futtasd: `npx cap sync`
- Ellenőrizd, hogy a plugin telepítve van-e: `npm list @capacitor/[plugin]`

### 4. Live reload nem működik
- Ellenőrizd, hogy a mobil és a gép ugyanazon a WiFi hálózaton van-e
- Használd a gép IP címét (nem localhost)
- Tűzfal beállítások ellenőrzése

## 📚 További Információk

- [Capacitor Dokumentáció](https://capacitorjs.com/docs)
- [Quasar Capacitor Guide](https://quasar.dev/quasar-cli-vite/developing-capacitor-apps/introduction)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)

## 🎉 Következő Lépések

1. **Android fejlesztéshez:**
   - Telepítsd az [Android Studio](https://developer.android.com/studio)-t
   - Állítsd be az Android SDK-t
   - Futtasd: `npm run build:pwa && npx cap add android`

2. **iOS fejlesztéshez (macOS szükséges):**
   - Telepítsd az [Xcode](https://developer.apple.com/xcode/)-ot
   - Állítsd be az Apple Developer fiókot
   - Futtasd: `npm run build:pwa && npx cap add ios`

3. **Tesztelés:**
   - Használj valódi eszközt vagy emulátort
   - Teszteld az összes Capacitor funkciót
   - Ellenőrizd az engedélyeket

---

**Megjegyzés:** A Capacitor már teljesen konfigurálva van a projektedben. Csak add hozzá a platformokat és kezdheted a fejlesztést!
