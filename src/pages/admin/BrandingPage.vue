<template>
  <q-page class="branding-page q-pa-md">
    <!-- Page Header -->
    <div class="page-header q-mb-lg">
      <div class="row items-center">
        <div class="col">
          <h1 class="text-h4 q-ma-none">
            <q-icon name="palette" class="q-mr-sm" />
            Branding Kezelés
          </h1>
          <p class="text-body1 text-grey-7 q-mt-sm q-mb-none">
            Testreszabhatja szállodája megjelenését és branding elemeit minden platformon
          </p>
        </div>
        <div class="col-auto">
          <q-btn-group>
            <q-btn
              color="primary"
              icon="refresh"
              label="Frissítés"
              @click="refreshBranding"
              :loading="isLoading"
            />
            <q-btn
              color="secondary"
              icon="save"
              label="Mentés"
              @click="saveAllChanges"
              :loading="isSaving"
              :disable="!hasUnsavedChanges"
            />
            <q-btn
              color="purple"
              icon="preview"
              label="Élő Előnézet"
              @click="toggleLivePreview"
              :outline="!livePreviewMode"
            />
          </q-btn-group>
        </div>
      </div>
    </div>

    <!-- Live Preview Banner -->
    <q-banner v-if="livePreviewMode" class="bg-purple text-white q-mb-md" rounded>
      <template v-slot:avatar>
        <q-icon name="visibility" />
      </template>
      <div class="text-weight-medium">Élő Előnézet Mód Aktív</div>
      <div class="text-caption">A változtatások azonnal megjelennek az oldalon</div>
      <template v-slot:action>
        <q-btn flat label="Kikapcsolás" @click="toggleLivePreview" />
      </template>
    </q-banner>

    <!-- Branding Status -->
    <q-card class="q-mb-lg" v-if="isLoaded">
      <q-card-section>
        <div class="row items-center q-gutter-md">
          <div class="col-auto">
            <q-avatar size="64px" color="primary" text-color="white">
              <img v-if="logoUrl" :src="logoUrl" alt="Logo" />
              <q-icon v-else name="business" size="32px" />
            </q-avatar>
          </div>
          <div class="col">
            <div class="text-h6">{{ tenantName || 'Az Ön Szállodája' }}</div>
            <div class="text-body2 text-grey-7">
              <q-chip
                :color="isCustomized ? 'positive' : 'grey'"
                text-color="white"
                size="sm"
                :icon="isCustomized ? 'check' : 'info'"
              >
                {{ isCustomized ? 'Testreszabott' : 'Alapértelmezett Branding' }}
              </q-chip>
              <q-chip
                v-if="brandingScore > 0"
                :color="getBrandingScoreColor(brandingScore)"
                text-color="white"
                size="sm"
                icon="star"
              >
                {{ brandingScore }}% Teljesség
              </q-chip>
            </div>
          </div>
          <div class="col-auto">
            <div class="text-caption text-grey-6">
              Utolsó frissítés: {{ formatDate(lastUpdated) }}
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Main Content Tabs -->
    <q-card class="main-content-card">
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="colors" icon="color_lens" label="Színek" />
        <q-tab name="logo" icon="image" label="Logó" />
        <q-tab name="email" icon="email" label="Email" />
        <q-tab name="domain" icon="domain" label="Domain" />
        <q-tab name="advanced" icon="settings" label="Haladó" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <!-- Colors Tab -->
        <q-tab-panel name="colors" class="q-pa-lg">
          <div class="row q-gutter-lg">
            <!-- Color Picker Section -->
            <div class="col-12 col-lg-6">
              <div class="text-h6 q-mb-md">
                <q-icon name="palette" class="q-mr-sm" />
                Színpaletta
              </div>
              
              <!-- Primary Colors -->
              <q-card flat bordered class="q-mb-md">
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">Fő Színek</div>
                  <div class="row q-gutter-md">
                    <div class="col-12 col-sm-6">
                      <div class="color-picker-wrapper">
                        <label class="text-body2 q-mb-sm block">Elsődleges szín</label>
                        <div class="color-input-group">
                          <q-input
                            v-model="colorForm.primary"
                            type="color"
                            class="color-input"
                            @update:model-value="onColorChange"
                          />
                          <q-input
                            v-model="colorForm.primary"
                            class="color-text-input"
                            @update:model-value="onColorChange"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div class="color-picker-wrapper">
                        <label class="text-body2 q-mb-sm block">Másodlagos szín</label>
                        <div class="color-input-group">
                          <q-input
                            v-model="colorForm.secondary"
                            type="color"
                            class="color-input"
                            @update:model-value="onColorChange"
                          />
                          <q-input
                            v-model="colorForm.secondary"
                            class="color-text-input"
                            @update:model-value="onColorChange"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Accent Colors -->
              <q-card flat bordered class="q-mb-md">
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">Kiegészítő Színek</div>
                  <div class="row q-gutter-md">
                    <div class="col-12 col-sm-6">
                      <div class="color-picker-wrapper">
                        <label class="text-body2 q-mb-sm block">Hangsúly szín</label>
                        <div class="color-input-group">
                          <q-input
                            v-model="colorForm.accent"
                            type="color"
                            class="color-input"
                            @update:model-value="onColorChange"
                          />
                          <q-input
                            v-model="colorForm.accent"
                            class="color-text-input"
                            @update:model-value="onColorChange"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div class="color-picker-wrapper">
                        <label class="text-body2 q-mb-sm block">Háttér szín</label>
                        <div class="color-input-group">
                          <q-input
                            v-model="colorForm.background"
                            type="color"
                            class="color-input"
                            @update:model-value="onColorChange"
                          />
                          <q-input
                            v-model="colorForm.background"
                            class="color-text-input"
                            @update:model-value="onColorChange"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Status Colors -->
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">Állapot Színek</div>
                  <div class="row q-gutter-md">
                    <div class="col-12 col-sm-6">
                      <div class="color-picker-wrapper">
                        <label class="text-body2 q-mb-sm block">Siker</label>
                        <div class="color-input-group">
                          <q-input
                            v-model="colorForm.success"
                            type="color"
                            class="color-input"
                            @update:model-value="onColorChange"
                          />
                          <q-input
                            v-model="colorForm.success"
                            class="color-text-input"
                            @update:model-value="onColorChange"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div class="color-picker-wrapper">
                        <label class="text-body2 q-mb-sm block">Hiba</label>
                        <div class="color-input-group">
                          <q-input
                            v-model="colorForm.error"
                            type="color"
                            class="color-input"
                            @update:model-value="onColorChange"
                          />
                          <q-input
                            v-model="colorForm.error"
                            class="color-text-input"
                            @update:model-value="onColorChange"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div class="color-picker-wrapper">
                        <label class="text-body2 q-mb-sm block">Figyelmeztetés</label>
                        <div class="color-input-group">
                          <q-input
                            v-model="colorForm.warning"
                            type="color"
                            class="color-input"
                            @update:model-value="onColorChange"
                          />
                          <q-input
                            v-model="colorForm.warning"
                            class="color-text-input"
                            @update:model-value="onColorChange"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div class="color-picker-wrapper">
                        <label class="text-body2 q-mb-sm block">Információ</label>
                        <div class="color-input-group">
                          <q-input
                            v-model="colorForm.info"
                            type="color"
                            class="color-input"
                            @update:model-value="onColorChange"
                          />
                          <q-input
                            v-model="colorForm.info"
                            class="color-text-input"
                            @update:model-value="onColorChange"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Color Preview Section -->
            <div class="col-12 col-lg-6">
              <div class="text-h6 q-mb-md">
                <q-icon name="preview" class="q-mr-sm" />
                Előnézet
              </div>
              
              <ColorPreview :colors="colorForm" />
              
              <!-- Predefined Color Schemes -->
              <q-card flat bordered class="q-mt-md">
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">Előre Definiált Sémák</div>
                  <div class="row q-gutter-sm">
                    <q-btn
                      v-for="scheme in colorSchemes"
                      :key="scheme.name"
                      size="sm"
                      :style="{ backgroundColor: scheme.primary, color: 'white' }"
                      :label="scheme.name"
                      @click="applyColorScheme(scheme)"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <q-card-actions align="right" class="q-mt-md">
            <q-btn flat label="Visszaállítás" @click="resetColors" />
            <q-btn color="primary" label="Színek Mentése" @click="saveColors" :loading="isUpdating" />
          </q-card-actions>
        </q-tab-panel>

        <!-- Logo Tab -->
        <q-tab-panel name="logo" class="q-pa-lg">
          <div class="row q-gutter-lg">
            <!-- Logo Upload Section -->
            <div class="col-12 col-lg-6">
              <div class="text-h6 q-mb-md">
                <q-icon name="image" class="q-mr-sm" />
                Logó Feltöltés
              </div>
              
              <q-card flat bordered>
                <q-card-section>
                  <div class="logo-upload-area" @drop="onLogoDrop" @dragover.prevent @dragenter.prevent>
                    <q-file
                      v-model="logoFile"
                      accept="image/*"
                      max-file-size="2097152"
                      @update:model-value="onLogoSelected"
                      class="full-width"
                    >
                      <template v-slot:prepend>
                        <q-icon name="cloud_upload" />
                      </template>
                      <template v-slot:append>
                        <q-btn round dense flat icon="add" />
                      </template>
                    </q-file>
                    
                    <div class="text-center q-mt-md">
                      <div class="text-body2 text-grey-6">
                        Húzza ide a logót vagy kattintson a tallózáshoz
                      </div>
                      <div class="text-caption text-grey-5">
                        Támogatott formátumok: PNG, JPG, SVG (max. 2MB)
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Logo Settings -->
              <q-card flat bordered class="q-mt-md">
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">Logó Beállítások</div>
                  
                  <q-input
                    v-model="logoForm.alt"
                    label="Alt szöveg"
                    hint="Alternatív szöveg a logóhoz (akadálymentesség)"
                    class="q-mb-md"
                  />
                  
                  <div class="row q-gutter-md">
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model.number="logoForm.maxWidth"
                        type="number"
                        label="Max szélesség (px)"
                        min="50"
                        max="500"
                      />
                    </div>
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model.number="logoForm.maxHeight"
                        type="number"
                        label="Max magasság (px)"
                        min="30"
                        max="200"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Logo Preview Section -->
            <div class="col-12 col-lg-6">
              <div class="text-h6 q-mb-md">
                <q-icon name="preview" class="q-mr-sm" />
                Logó Előnézet
              </div>
              
              <q-card flat bordered>
                <q-card-section>
                  <div class="logo-preview-container">
                    <div class="logo-preview-item">
                      <div class="text-body2 q-mb-sm">Fejléc</div>
                      <div class="preview-header">
                        <img 
                          v-if="logoPreviewUrl" 
                          :src="logoPreviewUrl" 
                          :alt="logoForm.alt"
                          :style="logoPreviewStyle"
                          class="logo-preview"
                        />
                        <div v-else class="logo-placeholder">
                          <q-icon name="business" size="32px" />
                        </div>
                        <span class="brand-name">{{ tenantName || 'Szálloda Neve' }}</span>
                      </div>
                    </div>
                    
                    <div class="logo-preview-item q-mt-md">
                      <div class="text-body2 q-mb-sm">Email aláírás</div>
                      <div class="preview-email">
                        <img 
                          v-if="logoPreviewUrl" 
                          :src="logoPreviewUrl" 
                          :alt="logoForm.alt"
                          :style="{ ...logoPreviewStyle, maxHeight: '40px' }"
                          class="logo-preview"
                        />
                        <div v-else class="logo-placeholder small">
                          <q-icon name="business" size="20px" />
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <q-card-actions align="right" class="q-mt-md">
            <q-btn flat label="Logó Eltávolítása" @click="removeLogo" :disable="!logoUrl && !logoFile" />
            <q-btn color="primary" label="Logó Mentése" @click="saveLogo" :loading="isUpdating" :disable="!logoFile" />
          </q-card-actions>
        </q-tab-panel>

        <!-- Email Tab -->
        <q-tab-panel name="email" class="q-pa-lg">
          <div class="row q-gutter-lg">
            <!-- Email Settings -->
            <div class="col-12 col-lg-6">
              <div class="text-h6 q-mb-md">
                <q-icon name="email" class="q-mr-sm" />
                Email Branding
              </div>
              
              <q-card flat bordered>
                <q-card-section>
                  <q-input
                    v-model="emailForm.headerText"
                    label="Fejléc szöveg"
                    hint="Megjelenik az email tetején"
                    class="q-mb-md"
                  />
                  
                  <q-input
                    v-model="emailForm.footerText"
                    label="Lábléc szöveg"
                    hint="Megjelenik az email alján"
                    class="q-mb-md"
                  />
                  
                  <q-input
                    v-model="emailForm.supportEmail"
                    type="email"
                    label="Támogatási email"
                    hint="Kapcsolattartási email cím"
                    class="q-mb-md"
                  />
                  
                  <q-input
                    v-model="emailForm.signature"
                    type="textarea"
                    rows="4"
                    label="Email aláírás"
                    hint="Automatikus aláírás minden emailhez"
                  />
                </q-card-section>
              </q-card>
            </div>

            <!-- Email Preview -->
            <div class="col-12 col-lg-6">
              <div class="text-h6 q-mb-md">
                <q-icon name="preview" class="q-mr-sm" />
                Email Előnézet
              </div>
              
              <q-card flat bordered>
                <q-card-section>
                  <div class="email-preview">
                    <!-- Email Header -->
                    <div class="email-header" :style="{ backgroundColor: colorForm.primary, color: 'white' }">
                      <div class="email-logo">
                        <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="email-logo-img" />
                        <q-icon v-else name="business" size="24px" />
                      </div>
                      <div class="email-header-text">
                        {{ emailForm.headerText || tenantName || 'Szálloda Neve' }}
                      </div>
                    </div>
                    
                    <!-- Email Body -->
                    <div class="email-body">
                      <h3>Foglalás Visszaigazolás</h3>
                      <p>Kedves Vendég!</p>
                      <p>Köszönjük foglalását. Az alábbiakban találja a részleteket:</p>
                      
                      <div class="booking-details">
                        <div class="detail-row">
                          <span>Érkezés:</span>
                          <span>2024. március 15.</span>
                        </div>
                        <div class="detail-row">
                          <span>Távozás:</span>
                          <span>2024. március 18.</span>
                        </div>
                        <div class="detail-row">
                          <span>Szoba típus:</span>
                          <span>Deluxe szoba</span>
                        </div>
                      </div>
                      
                      <p>Ha bármilyen kérdése van, kérjük írjon nekünk: 
                        <a :href="`mailto:${emailForm.supportEmail}`">
                          {{ emailForm.supportEmail || 'info@hotel.com' }}
                        </a>
                      </p>
                      
                      <div class="email-signature" v-if="emailForm.signature">
                        <hr>
                        <div v-html="emailForm.signature.replace(/\n/g, '<br>')"></div>
                      </div>
                    </div>
                    
                    <!-- Email Footer -->
                    <div class="email-footer" :style="{ backgroundColor: colorForm.background || '#f5f5f5' }">
                      {{ emailForm.footerText || '© 2024 Minden jog fenntartva.' }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <q-card-actions align="right" class="q-mt-md">
            <q-btn flat label="Visszaállítás" @click="resetEmailBranding" />
            <q-btn color="primary" label="Email Branding Mentése" @click="saveEmailBranding" :loading="isUpdating" />
          </q-card-actions>
        </q-tab-panel>

        <!-- Domain Tab -->
        <q-tab-panel name="domain" class="q-pa-lg">
          <div class="row q-gutter-lg">
            <!-- Domain Settings -->
            <div class="col-12 col-lg-6">
              <div class="text-h6 q-mb-md">
                <q-icon name="domain" class="q-mr-sm" />
                Egyedi Domain
              </div>
              
              <q-card flat bordered>
                <q-card-section>
                  <q-input
                    v-model="domainForm.customDomain"
                    label="Egyedi domain"
                    hint="pl. hotel.com vagy booking.myhotel.com"
                    class="q-mb-md"
                  />
                  
                  <q-banner class="bg-info text-white q-mb-md" rounded>
                    <template v-slot:avatar>
                      <q-icon name="info" />
                    </template>
                    <div class="text-body2">
                      Az egyedi domain beállításához DNS konfigurációra van szükség.
                      Kérjük, vegye fel a kapcsolatot a támogatással.
                    </div>
                  </q-banner>
                  
                  <div class="domain-status" v-if="customDomain">
                    <div class="text-subtitle2 q-mb-sm">Jelenlegi domain állapot:</div>
                    <q-chip 
                      :color="domainStatus.verified ? 'positive' : 'warning'"
                      text-color="white"
                      :icon="domainStatus.verified ? 'check_circle' : 'pending'"
                    >
                      {{ domainStatus.verified ? 'Ellenőrizve' : 'Ellenőrzés alatt' }}
                    </q-chip>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Domain Preview -->
            <div class="col-12 col-lg-6">
              <div class="text-h6 q-mb-md">
                <q-icon name="preview" class="q-mr-sm" />
                Domain Előnézet
              </div>
              
              <q-card flat bordered>
                <q-card-section>
                  <div class="domain-preview">
                    <div class="browser-mockup">
                      <div class="browser-header">
                        <div class="browser-buttons">
                          <div class="browser-button red"></div>
                          <div class="browser-button yellow"></div>
                          <div class="browser-button green"></div>
                        </div>
                        <div class="address-bar">
                          <q-icon name="lock" size="16px" class="q-mr-xs" />
                          {{ domainForm.customDomain || 'your-hotel.hospie.com' }}
                        </div>
                      </div>
                      <div class="browser-content">
                        <div class="preview-header" :style="{ backgroundColor: colorForm.primary }">
                          <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="preview-logo" />
                          <span class="preview-title">{{ tenantName || 'Hotel Neve' }}</span>
                        </div>
                        <div class="preview-body">
                          <h2>Üdvözöljük!</h2>
                          <p>Foglaljon szobát egyszerűen és gyorsan.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <q-card-actions align="right" class="q-mt-md">
            <q-btn flat label="Domain Eltávolítása" @click="removeDomain" :disable="!customDomain" />
            <q-btn color="primary" label="Domain Mentése" @click="saveDomain" :loading="isUpdating" />
          </q-card-actions>
        </q-tab-panel>

        <!-- Advanced Tab -->
        <q-tab-panel name="advanced" class="q-pa-lg">
          <div class="row q-gutter-lg">
            <!-- Advanced Settings -->
            <div class="col-12">
              <div class="text-h6 q-mb-md">
                <q-icon name="settings" class="q-mr-sm" />
                Haladó Beállítások
              </div>
              
              <!-- CSS Variables -->
              <q-card flat bordered class="q-mb-md">
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">CSS Változók</div>
                  <q-input
                    v-model="cssVariablesText"
                    type="textarea"
                    rows="10"
                    readonly
                    label="Generált CSS változók"
                    hint="Ezeket a változókat használhatja egyedi CSS-ben"
                  >
                    <template v-slot:append>
                      <q-btn
                        flat
                        icon="content_copy"
                        @click="copyCssVariables"
                        title="Vágólapra másolás"
                      />
                    </template>
                  </q-input>
                </q-card-section>
              </q-card>

              <!-- Reset Options -->
              <q-card flat bordered class="q-mb-md">
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">Visszaállítási Opciók</div>
                  <div class="row q-gutter-md">
                    <q-btn
                      color="orange"
                      icon="refresh"
                      label="Színek Visszaállítása"
                      @click="confirmResetColors"
                    />
                    <q-btn
                      color="red"
                      icon="restore"
                      label="Teljes Visszaállítás"
                      @click="confirmResetAll"
                    />
                  </div>
                </q-card-section>
              </q-card>

              <!-- Export/Import -->
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">Export / Import</div>
                  <div class="row q-gutter-md">
                    <q-btn
                      color="info"
                      icon="download"
                      label="Branding Exportálása"
                      @click="exportBranding"
                      :disable="!isCustomized"
                    />
                    <q-btn
                      color="secondary"
                      icon="upload"
                      label="Branding Importálása"
                      @click="showImportDialog = true"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Quick Actions -->
    <q-card class="q-mt-lg">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="flash_on" class="q-mr-sm" />
          Quick Actions
        </div>
        
        <div class="row q-gutter-md">
          <q-btn
            color="info"
            icon="download"
            label="Export Branding"
            @click="exportBranding"
            :disable="!isCustomized"
          />
          <q-btn
            color="secondary"
            icon="upload"
            label="Import Branding"
            @click="showImportDialog = true"
          />
          <q-btn
            color="purple"
            icon="code"
            label="Get CSS Variables"
            @click="showCssDialog = true"
          />
          <q-btn
            color="orange"
            icon="share"
            label="Share Branding"
            @click="shareBranding"
            :disable="!isCustomized"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Branding Analytics -->
    <q-card class="q-mt-lg" v-if="isCustomized">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="analytics" class="q-mr-sm" />
          Branding Analytics
        </div>
        
        <div class="row q-gutter-md">
          <div class="col-12 col-md-3">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-h4 text-primary">{{ brandingScore }}%</div>
                <div class="text-body2">Branding Completeness</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-h4 text-secondary">{{ colorCount }}</div>
                <div class="text-body2">Custom Colors</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-h4 text-accent">{{ logoUrl ? 'Yes' : 'No' }}</div>
                <div class="text-body2">Custom Logo</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-3">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-h4 text-positive">{{ customDomain ? 'Yes' : 'No' }}</div>
                <div class="text-body2">Custom Domain</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Import Dialog -->
    <q-dialog v-model="showImportDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Import Branding</div>
        </q-card-section>
        
        <q-card-section>
          <q-file
            v-model="importFile"
            label="Select branding file"
            accept=".json"
            @input="onImportFileSelected"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="primary"
            label="Import"
            @click="importBranding"
            :disable="!importFile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- CSS Variables Dialog -->
    <q-dialog v-model="showCssDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">CSS Variables</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        
        <q-card-section>
          <q-input
            v-model="cssVariablesText"
            type="textarea"
            rows="20"
            readonly
            label="CSS Variables"
            hint="Copy these variables to use in your custom CSS"
          >
            <template v-slot:append>
              <q-btn
                flat
                icon="content_copy"
                @click="copyCssVariables"
                title="Copy to clipboard"
              />
            </template>
          </q-input>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useBranding } from 'src/composables/useBranding'
import ColorPreview from 'src/components/ColorPreview.vue'

const $q = useQuasar()

const {
  tenantName,
  logoUrl,
  colors,
  customDomain,
  isLoaded,
  isLoading,
  isCustomized,
  isUpdating,
  refreshBranding,
  getBrandColors,
  updateColors,
  updateLogo,
  updateEmailBranding,
  updateCustomDomain
} = useBranding()

// Tab state
const activeTab = ref('colors')

// Loading states
const isSaving = ref(false)

// Live preview mode
const livePreviewMode = ref(false)

// Form states
const colorForm = ref({
  primary: '#c45865',
  secondary: '#d68691',
  accent: '#9C27B0',
  background: '#ffffff',
  surface: '#f5f5f5',
  success: '#21BA45',
  error: '#C10015',
  warning: '#F2C037',
  info: '#31CCEC'
})

const logoForm = ref({
  alt: '',
  maxWidth: 200,
  maxHeight: 60
})

const emailForm = ref({
  headerText: '',
  footerText: '',
  supportEmail: '',
  signature: ''
})

const domainForm = ref({
  customDomain: ''
})

// File handling
const logoFile = ref(null)

// Dialog states
const showImportDialog = ref(false)
const showCssDialog = ref(false)

// Import/Export
const importFile = ref(null)
const cssVariablesText = ref('')

// Mock data
const lastUpdated = ref(new Date())
const domainStatus = ref({ verified: false })

// Color schemes
const colorSchemes = ref([
  {
    name: 'Hospie',
    primary: '#c45865',
    secondary: '#d68691',
    accent: '#9C27B0'
  },
  {
    name: 'Ocean',
    primary: '#0077be',
    secondary: '#4a90e2',
    accent: '#7b68ee'
  },
  {
    name: 'Forest',
    primary: '#228b22',
    secondary: '#32cd32',
    accent: '#9acd32'
  },
  {
    name: 'Sunset',
    primary: '#ff6b35',
    secondary: '#f7931e',
    accent: '#ffb347'
  }
])

// Computed properties
const brandingScore = computed(() => {
  let score = 0
  if (colors.value && Object.keys(colors.value).length > 0) score += 40
  if (logoUrl.value) score += 30
  if (customDomain.value) score += 20
  if (tenantName.value) score += 10
  return score
})

const colorCount = computed(() => {
  return colors.value ? Object.keys(colors.value).length : 0
})

const hasUnsavedChanges = computed(() => {
  // Check if any form has unsaved changes
  return logoFile.value !== null || 
         JSON.stringify(colorForm.value) !== JSON.stringify(colors.value)
})

const logoPreviewUrl = computed(() => {
  if (logoFile.value) {
    return URL.createObjectURL(logoFile.value)
  }
  return logoUrl.value
})

const logoPreviewStyle = computed(() => {
  return {
    maxWidth: `${logoForm.value.maxWidth}px`,
    maxHeight: `${logoForm.value.maxHeight}px`
  }
})

// Methods
const formatDate = (date) => {
  if (!date) return 'Soha'
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const getBrandingScoreColor = (score) => {
  if (score >= 80) return 'positive'
  if (score >= 60) return 'warning'
  return 'negative'
}

const toggleLivePreview = () => {
  livePreviewMode.value = !livePreviewMode.value
  if (livePreviewMode.value) {
    $q.notify({
      type: 'info',
      message: 'Élő előnézet mód bekapcsolva',
      position: 'top-right'
    })
  }
}

// Color methods
const onColorChange = () => {
  if (livePreviewMode.value) {
    // Apply colors immediately in live preview mode
    applyColorsToDocument()
  }
}

const applyColorsToDocument = () => {
  const root = document.documentElement
  Object.entries(colorForm.value).forEach(([key, value]) => {
    root.style.setProperty(`--q-${key}`, value)
    root.style.setProperty(`--brand-${key}`, value)
  })
}

const applyColorScheme = (scheme) => {
  colorForm.value.primary = scheme.primary
  colorForm.value.secondary = scheme.secondary
  colorForm.value.accent = scheme.accent
  
  if (livePreviewMode.value) {
    applyColorsToDocument()
  }
  
  $q.notify({
    type: 'positive',
    message: `${scheme.name} színséma alkalmazva`,
    position: 'top-right'
  })
}

const resetColors = () => {
  colorForm.value = {
    primary: '#c45865',
    secondary: '#d68691',
    accent: '#9C27B0',
    background: '#ffffff',
    surface: '#f5f5f5',
    success: '#21BA45',
    error: '#C10015',
    warning: '#F2C037',
    info: '#31CCEC'
  }
  
  if (livePreviewMode.value) {
    applyColorsToDocument()
  }
}

const saveColors = async () => {
  try {
    await updateColors(colorForm.value)
    $q.notify({
      type: 'positive',
      message: 'Színek sikeresen mentve',
      position: 'top-right'
    })
  } catch (error) {
    console.error('Hiba a színek mentése során:', error)
    $q.notify({
      type: 'negative',
      message: 'Hiba a színek mentése során',
      position: 'top-right'
    })
  }
}

// Logo methods
const onLogoSelected = (file) => {
  if (file) {
    logoForm.value.alt = logoForm.value.alt || file.name.split('.')[0]
  }
}

const onLogoDrop = (event) => {
  event.preventDefault()
  const files = event.dataTransfer.files
  if (files.length > 0) {
    logoFile.value = files[0]
    onLogoSelected(files[0])
  }
}

const saveLogo = async () => {
  if (!logoFile.value) return
  
  try {
    await updateLogo(logoFile.value)
    logoFile.value = null
    $q.notify({
      type: 'positive',
      message: 'Logó sikeresen mentve',
      position: 'top-right'
    })
  } catch (error) {
    console.error('Hiba a logó mentése során:', error)
    $q.notify({
      type: 'negative',
      message: 'Hiba a logó mentése során',
      position: 'top-right'
    })
  }
}

const removeLogo = () => {
  $q.dialog({
    title: 'Logó eltávolítása',
    message: 'Biztosan el szeretné távolítani a logót?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      // Implementation would call API to remove logo
      logoFile.value = null
      $q.notify({
        type: 'positive',
        message: 'Logó eltávolítva',
        position: 'top-right'
      })
    } catch (error) {
      console.error('Hiba a logó eltávolítása során:', error)
      $q.notify({
        type: 'negative',
        message: 'Hiba a logó eltávolítása során',
        position: 'top-right'
      })
    }
  })
}

// Email methods
const resetEmailBranding = () => {
  emailForm.value = {
    headerText: '',
    footerText: '',
    supportEmail: '',
    signature: ''
  }
}

const saveEmailBranding = async () => {
  try {
    await updateEmailBranding(emailForm.value)
    $q.notify({
      type: 'positive',
      message: 'Email branding sikeresen mentve',
      position: 'top-right'
    })
  } catch (error) {
    console.error('Hiba az email branding mentése során:', error)
    $q.notify({
      type: 'negative',
      message: 'Hiba az email branding mentése során',
      position: 'top-right'
    })
  }
}

// Domain methods
const saveDomain = async () => {
  try {
    await updateCustomDomain(domainForm.value.customDomain)
    $q.notify({
      type: 'positive',
      message: 'Domain sikeresen mentve',
      position: 'top-right'
    })
  } catch (error) {
    console.error('Hiba a domain mentése során:', error)
    $q.notify({
      type: 'negative',
      message: 'Hiba a domain mentése során',
      position: 'top-right'
    })
  }
}

const removeDomain = () => {
  $q.dialog({
    title: 'Domain eltávolítása',
    message: 'Biztosan el szeretné távolítani az egyedi domaint?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await updateCustomDomain('')
      domainForm.value.customDomain = ''
      $q.notify({
        type: 'positive',
        message: 'Domain eltávolítva',
        position: 'top-right'
      })
    } catch (error) {
      console.error('Hiba a domain eltávolítása során:', error)
      $q.notify({
        type: 'negative',
        message: 'Hiba a domain eltávolítása során',
        position: 'top-right'
      })
    }
  })
}

// Advanced methods
const confirmResetColors = () => {
  $q.dialog({
    title: 'Színek visszaállítása',
    message: 'Biztosan vissza szeretné állítani a színeket az alapértelmezettre?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    resetColors()
    saveColors()
  })
}

const confirmResetAll = () => {
  $q.dialog({
    title: 'Teljes visszaállítás',
    message: 'Biztosan vissza szeretné állítani az összes branding beállítást?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      // Reset all forms
      resetColors()
      resetEmailBranding()
      domainForm.value.customDomain = ''
      logoFile.value = null
      
      // Save changes
      await Promise.all([
        saveColors(),
        saveEmailBranding(),
        saveDomain()
      ])
      
      $q.notify({
        type: 'positive',
        message: 'Összes beállítás visszaállítva',
        position: 'top-right'
      })
    } catch (error) {
      console.error('Hiba a visszaállítás során:', error)
      $q.notify({
        type: 'negative',
        message: 'Hiba a visszaállítás során',
        position: 'top-right'
      })
    }
  })
}

const saveAllChanges = async () => {
  isSaving.value = true
  try {
    const promises = []
    
    if (JSON.stringify(colorForm.value) !== JSON.stringify(colors.value)) {
      promises.push(updateColors(colorForm.value))
    }
    
    if (logoFile.value) {
      promises.push(updateLogo(logoFile.value))
    }
    
    if (emailForm.value.headerText || emailForm.value.footerText || 
        emailForm.value.supportEmail || emailForm.value.signature) {
      promises.push(updateEmailBranding(emailForm.value))
    }
    
    if (domainForm.value.customDomain !== customDomain.value) {
      promises.push(updateCustomDomain(domainForm.value.customDomain))
    }
    
    await Promise.all(promises)
    
    logoFile.value = null
    
    $q.notify({
      type: 'positive',
      message: 'Összes változtatás mentve',
      position: 'top-right'
    })
  } catch (error) {
    console.error('Hiba a mentés során:', error)
    $q.notify({
      type: 'negative',
      message: 'Hiba a mentés során',
      position: 'top-right'
    })
  } finally {
    isSaving.value = false
  }
}

// Export/Import methods
const exportBranding = () => {
  const brandingData = {
    tenant_name: tenantName.value,
    colors: colors.value,
    logo_url: logoUrl.value,
    custom_domain: customDomain.value,
    email_branding: emailForm.value,
    exported_at: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(brandingData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${tenantName.value || 'hotel'}-branding.json`
  a.click()
  URL.revokeObjectURL(url)
  
  $q.notify({
    type: 'positive',
    message: 'Branding exportálva',
    position: 'top-right'
  })
}

const onImportFileSelected = (file) => {
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        console.log('Import data:', data)
        // Validate import data structure here
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Érvénytelen branding fájl formátum',
          position: 'top-right'
        })
      }
    }
    reader.readAsText(file)
  }
}

const importBranding = () => {
  $q.notify({
    type: 'info',
    message: 'Import funkció hamarosan elérhető',
    position: 'top-right'
  })
  showImportDialog.value = false
}

const loadCssVariables = async () => {
  try {
    const brandColors = getBrandColors()
    const variables = Object.entries(brandColors)
      .map(([key, value]) => `  --brand-${key}: ${value};`)
      .join('\n')
    
    cssVariablesText.value = `:root {\n${variables}\n}`
  } catch (error) {
    console.error('Failed to load CSS variables:', error)
  }
}

const copyCssVariables = async () => {
  try {
    await navigator.clipboard.writeText(cssVariablesText.value)
    $q.notify({
      type: 'positive',
      message: 'CSS változók vágólapra másolva',
      position: 'top-right'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Hiba a vágólapra másolás során',
      position: 'top-right'
    })
  }
}

const shareBranding = () => {
  const shareData = {
    title: `${tenantName.value} Branding`,
    text: `Nézze meg a ${tenantName.value} egyedi branding-jét`,
    url: window.location.href
  }
  
  if (navigator.share) {
    navigator.share(shareData)
  } else {
    navigator.clipboard.writeText(window.location.href)
    $q.notify({
      type: 'positive',
      message: 'Branding URL vágólapra másolva',
      position: 'top-right'
    })
  }
}

// Initialize forms with current data
const initializeForms = () => {
  if (colors.value) {
    colorForm.value = { ...colors.value }
  }
  
  if (customDomain.value) {
    domainForm.value.customDomain = customDomain.value
  }
}

// Watch for data changes
watch([colors, customDomain], () => {
  initializeForms()
}, { immediate: true })

// Watch for CSS dialog opening
watch(() => showCssDialog.value, (isOpen) => {
  if (isOpen) {
    loadCssVariables()
  }
})

// Initialize
onMounted(() => {
  if (!isLoaded.value) {
    refreshBranding()
  }
  initializeForms()
})
</script>

<style lang="scss" scoped>
.branding-page {
  max-width: 1200px;
  margin: 0 auto;
  
  .page-header {
    h1 {
      color: var(--brand-primary, #1976d2);
    }
  }
  
  .q-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
  }
  
  .q-btn {
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-1px);
    }
  }
  
  // Color picker styles
  .color-picker-wrapper {
    .color-input-group {
      display: flex;
      gap: 8px;
      align-items: center;
      
      .color-input {
        width: 60px;
        height: 40px;
        
        :deep(.q-field__control) {
          padding: 0;
          border-radius: 8px;
          overflow: hidden;
        }
        
        :deep(input[type="color"]) {
          width: 100%;
          height: 100%;
          border: none;
          cursor: pointer;
        }
      }
      
      .color-text-input {
        flex: 1;
      }
    }
  }
  
  // Logo upload styles
  .logo-upload-area {
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 24px;
    text-align: center;
    transition: border-color 0.3s ease;
    
    &:hover {
      border-color: var(--q-primary);
    }
    
    &.dragover {
      border-color: var(--q-primary);
      background-color: rgba(25, 118, 210, 0.05);
    }
  }
  
  .logo-preview-container {
    .logo-preview-item {
      .preview-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background-color: #f5f5f5;
        border-radius: 6px;
        
        .logo-preview {
          object-fit: contain;
        }
        
        .logo-placeholder {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ddd;
          border-radius: 4px;
          
          &.small {
            width: 30px;
            height: 30px;
          }
        }
        
        .brand-name {
          font-weight: 500;
          color: #333;
        }
      }
      
      .preview-email {
        padding: 8px;
        background-color: #f9f9f9;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }
  
  // Email preview styles
  .email-preview {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    font-family: Arial, sans-serif;
    
    .email-header {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      
      .email-logo {
        .email-logo-img {
          max-height: 32px;
          max-width: 100px;
          object-fit: contain;
        }
      }
      
      .email-header-text {
        font-size: 18px;
        font-weight: 500;
      }
    }
    
    .email-body {
      padding: 20px;
      background-color: white;
      
      h3 {
        margin: 0 0 16px 0;
        color: #333;
      }
      
      p {
        margin: 0 0 12px 0;
        line-height: 1.5;
        color: #555;
      }
      
      .booking-details {
        background-color: #f8f9fa;
        padding: 16px;
        border-radius: 6px;
        margin: 16px 0;
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          span:first-child {
            font-weight: 500;
            color: #333;
          }
          
          span:last-child {
            color: #666;
          }
        }
      }
      
      a {
        color: var(--q-primary);
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
      
      .email-signature {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid #eee;
        font-size: 14px;
        color: #666;
      }
    }
    
    .email-footer {
      padding: 12px 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  }
  
  // Domain preview styles
  .domain-preview {
    .browser-mockup {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      
      .browser-header {
        background-color: #f0f0f0;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        
        .browser-buttons {
          display: flex;
          gap: 4px;
          
          .browser-button {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            
            &.red { background-color: #ff5f56; }
            &.yellow { background-color: #ffbd2e; }
            &.green { background-color: #27ca3f; }
          }
        }
        
        .address-bar {
          flex: 1;
          background-color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          display: flex;
          align-items: center;
          color: #666;
        }
      }
      
      .browser-content {
        .preview-header {
          padding: 16px;
          color: white;
          display: flex;
          align-items: center;
          gap: 12px;
          
          .preview-logo {
            max-height: 32px;
            max-width: 100px;
            object-fit: contain;
          }
          
          .preview-title {
            font-size: 18px;
            font-weight: 500;
          }
        }
        
        .preview-body {
          padding: 20px;
          background-color: white;
          
          h2 {
            margin: 0 0 12px 0;
            color: #333;
          }
          
          p {
            margin: 0;
            color: #666;
          }
        }
      }
    }
  }
}

// Mobile responsiveness
@media (max-width: 768px) {
  .branding-page {
    .page-header {
      .row {
        flex-direction: column;
        gap: 16px;
        
        .col-auto {
          align-self: stretch;
          
          .q-btn-group {
            width: 100%;
            
            .q-btn {
              flex: 1;
            }
          }
        }
      }
    }
    
    .row.q-gutter-md {
      flex-direction: column;
      
      .q-btn {
        width: 100%;
      }
    }
    
    .color-picker-wrapper {
      .color-input-group {
        .color-input {
          width: 50px;
          height: 35px;
        }
      }
    }
    
    .email-preview {
      .email-body {
        padding: 16px;
        
        .booking-details {
          padding: 12px;
          
          .detail-row {
            flex-direction: column;
            gap: 4px;
            margin-bottom: 12px;
          }
        }
      }
    }
    
    .browser-mockup {
      .browser-header {
        .address-bar {
          font-size: 10px;
        }
      }
      
      .browser-content {
        .preview-header {
          padding: 12px;
          
          .preview-title {
            font-size: 16px;
          }
        }
        
        .preview-body {
          padding: 16px;
        }
      }
    }
  }
}

// Dark mode support
.body--dark {
  .branding-page {
    .q-card {
      background-color: var(--q-dark);
      
      &:hover {
        box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1);
      }
    }
    
    .logo-upload-area {
      border-color: #555;
      
      &:hover {
        border-color: var(--q-primary);
        background-color: rgba(25, 118, 210, 0.1);
      }
    }
    
    .email-preview {
      border-color: #555;
      
      .email-body {
        background-color: var(--q-dark);
        color: #fff;
        
        h3 {
          color: #fff;
        }
        
        p {
          color: #ccc;
        }
        
        .booking-details {
          background-color: rgba(255, 255, 255, 0.05);
          
          .detail-row {
            span:first-child {
              color: #fff;
            }
            
            span:last-child {
              color: #ccc;
            }
          }
        }
      }
    }
    
    .browser-mockup {
      border-color: #555;
      
      .browser-header {
        background-color: #333;
        
        .address-bar {
          background-color: #444;
          color: #ccc;
        }
      }
      
      .browser-content {
        .preview-body {
          background-color: var(--q-dark);
          
          h2 {
            color: #fff;
          }
          
          p {
            color: #ccc;
          }
        }
      }
    }
  }
}
</style>