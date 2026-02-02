# Liquid Glass (Glassmorphism) Útmutató

iOS stílusú üveghatás implementáció Quasar keretrendszerben.

## 🎨 Mi az a Liquid Glass?

A Liquid Glass (vagy glassmorphism) egy modern dizájn trend, amely:
- Áttetsző, elmosódott hátteret használ
- Finom árnyékokat és szegélyeket alkalmaz
- Rétegzett, mélységérzetet keltő megjelenést biztosít
- Az iOS és macOS Big Sur óta népszerű

## 📦 Telepítés

### 1. CSS importálása

A `quasar.config.js` fájlban add hozzá:

```javascript
css: [
  'app.scss',
  'liquid-glass.scss'
]
```

Vagy importáld közvetlenül a komponensedben:

```vue
<style lang="scss">
@import 'src/css/liquid-glass.scss';
</style>
```

### 2. Composable használata (opcionális)

```javascript
import { useLiquidGlass } from 'src/composables/useLiquidGlass'

const { applyGlassStyle, getGlassClasses } = useLiquidGlass()
```

## 🚀 Használat

### Alapvető használat osztályokkal

```vue
<template>
  <div class="liquid-glass liquid-glass-rounded liquid-glass-animated">
    <h3 class="text-white">Glass Card</h3>
    <p class="glass-text-muted">Tartalom itt</p>
  </div>
</template>
```

### Intenzitás variációk

```vue
<!-- Könnyű -->
<div class="liquid-glass-light liquid-glass-rounded q-pa-md">
  Könnyű elmosódás
</div>

<!-- Közepes (alapértelmezett) -->
<div class="liquid-glass-medium liquid-glass-rounded q-pa-md">
  Közepes elmosódás
</div>

<!-- Erős -->
<div class="liquid-glass-heavy liquid-glass-rounded q-pa-md">
  Erős elmosódás
</div>

<!-- Sötét -->
<div class="liquid-glass-dark liquid-glass-rounded q-pa-md">
  Sötét változat
</div>
```

### Előre definiált komponensek

```vue
<!-- Glass Card -->
<div class="glass-card">
  <h4 class="text-white">Cím</h4>
  <p class="glass-text-muted">Tartalom</p>
</div>

<!-- Glass Button -->
<button class="glass-button">
  Kattints ide
</button>

<!-- Glass Input -->
<input class="glass-input" placeholder="Írj valamit..." />

<!-- Glass Navbar -->
<nav class="glass-navbar">
  Navigáció
</nav>

<!-- Glass Modal -->
<div class="glass-modal">
  Modal tartalom
</div>
```

### Quasar komponensekkel

```vue
<template>
  <!-- Glass Card -->
  <q-card class="liquid-glass liquid-glass-rounded">
    <q-card-section>
      <div class="text-h6 text-white">Glass Card</div>
    </q-card-section>
  </q-card>

  <!-- Glass Button -->
  <q-btn
    unelevated
    class="glass-button"
    label="Glass Button"
  />

  <!-- Glass Input -->
  <q-input
    dark
    outlined
    class="glass-input-field"
    label="Glass Input"
  />

  <!-- Glass Dialog with Enhanced Backdrop -->
  <q-dialog 
    v-model="show"
    transition-show="scale"
    transition-hide="scale"
    class="glass-dialog-backdrop"
  >
    <q-card class="glass-modal">
      <q-card-section>
        <div class="text-h6 text-white">Glass Modal</div>
      </q-card-section>
      <q-card-section class="glass-text-white">
        A modal most sötétített, elmosódott háttérrel jelenik meg,
        ami jobban kiemeli a tartalmat!
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.glass-input-field {
  :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
  }
}
</style>
```

### Composable használata

```vue
<script setup>
import { useLiquidGlass } from 'src/composables/useLiquidGlass'

const { applyGlassStyle, getGlassClasses } = useLiquidGlass()

// Inline stílus
const cardStyle = applyGlassStyle('medium')

// Osztályok generálása
const classes = getGlassClasses({
  rounded: true,
  hover: true,
  animated: true
})
</script>

<template>
  <div :style="cardStyle">
    Inline stílussal
  </div>

  <div :class="classes">
    Generált osztályokkal
  </div>
</template>
```

## 🎭 Modal Backdrop Kiemelés

### Enhanced Dialog Backdrop

A modalok most sötétített, elmosódott háttérrel jelennek meg, ami jobban kiemeli őket:

```vue
<template>
  <q-dialog 
    v-model="showDialog"
    transition-show="scale"
    transition-hide="scale"
    class="glass-dialog-backdrop"
  >
    <q-card class="glass-modal">
      <!-- Modal tartalom -->
    </q-card>
  </q-dialog>
</template>
```

### Backdrop Tulajdonságok

**Alapértelmezett backdrop:**
- 60% fekete átlátszóság
- 8px elmosódás
- 120% színtelítettség
- Fade-in animáció

**Dark mode backdrop:**
- 80% fekete átlátszóság
- Erősebb kontrasztus

**Fokozott backdrop (opcionális):**
```vue
<q-dialog class="glass-dialog-enhanced">
  <!-- 70% átlátszóság, 12px blur -->
</q-dialog>
```

### Modal Animációk

**Scale animáció:**
```vue
transition-show="scale"
transition-hide="scale"
```

**Bounce effekt:**
- Cubic-bezier easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- 0.3s időtartam
- Smooth scale-in

## 🎭 Háttér beállítása

A glass hatás legjobban színes vagy gradiens háttéren érvényesül:

```vue
<template>
  <q-page class="glass-page">
    <div class="gradient-background"></div>
    
    <!-- Glass komponensek -->
  </q-page>
</template>

<style scoped lang="scss">
.glass-page {
  position: relative;
  min-height: 100vh;
}

.gradient-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -1;
}

// Animált gradiens
.gradient-background {
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #4facfe 75%,
    #00f2fe 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
</style>
```

## 🎨 Testreszabás

### Saját glass stílus létrehozása

```scss
.my-custom-glass {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
```

### Színes glass variációk

```vue
<div class="liquid-glass-primary liquid-glass-rounded q-pa-md">
  Primary színű glass
</div>

<div class="liquid-glass-secondary liquid-glass-rounded q-pa-md">
  Secondary színű glass
</div>

<div class="liquid-glass-accent liquid-glass-rounded q-pa-md">
  Accent színű glass
</div>
```

## 💡 Tippek és trükkök

### 1. Rétegzés
Használj több glass réteget egymás felett különböző intenzitással:

```vue
<div class="liquid-glass-light q-pa-lg">
  <div class="liquid-glass-medium q-pa-md">
    <div class="liquid-glass-heavy q-pa-sm">
      Rétegzett glass
    </div>
  </div>
</div>
```

### 2. Hover effektek
Adj hozzá interaktivitást:

```scss
.my-glass-card {
  @extend .liquid-glass;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5);
  }
}
```

### 3. Szöveg olvashatóság
Használj fehér szöveget átlátszósággal:

```vue
<div class="text-white">Fő szöveg (95% opacity)</div>
<div class="glass-text-muted">Másodlagos szöveg (70% opacity)</div>
```

### 4. Teljesítmény
A `backdrop-filter` erőforrás-igényes lehet. Használd mértékkel:
- Mobil eszközökön csökkentsd az elmosódás mértékét
- Ne használj túl sok glass elemet egyszerre
- Teszteld különböző eszközökön

## 🌐 Böngésző támogatás

A `backdrop-filter` támogatása:
- ✅ Chrome/Edge 76+
- ✅ Safari 9+ (WebKit prefix)
- ✅ Firefox 103+
- ⚠️ Régebbi böngészőkben fallback szükséges

Fallback megoldás:

```scss
.liquid-glass {
  background: rgba(255, 255, 255, 0.1);
  
  @supports (backdrop-filter: blur(20px)) {
    backdrop-filter: blur(20px) saturate(180%);
  }
  
  @supports not (backdrop-filter: blur(20px)) {
    background: rgba(255, 255, 255, 0.3);
  }
}
```

## 📱 Példák

Nézd meg a teljes példákat:
- `liquid-glass-example.vue` - Alapvető példák
- `LiquidGlassShowcase.vue` - Komplett showcase oldal

## 🎯 Legjobb gyakorlatok

1. **Kontrasztus**: Használj elég kontrasztot a szöveg és háttér között
2. **Mérték**: Ne használj túl sok glass elemet - kevesebb több
3. **Animáció**: Adj hozzá finom átmeneteket a jobb UX-ért
4. **Háttér**: Színes vagy gradiens háttér szükséges a hatás érvényesüléséhez
5. **Teljesítmény**: Teszteld mobil eszközökön is

## 🔧 Hibaelhárítás

**Nem látszik az elmosódás?**
- Ellenőrizd, hogy van-e tartalom a glass elem mögött
- Próbáld növelni a blur értéket
- Ellenőrizd a böngésző támogatást

**Rossz a teljesítmény?**
- Csökkentsd a blur értéket
- Használj kevesebb glass elemet
- Kapcsold ki az animációkat mobil eszközökön

**Nem olvasható a szöveg?**
- Növeld a háttér opacity értékét
- Használj fehér szöveget sötét háttéren
- Adj hozzá text-shadow-t
