export default {
  // Általános üzenetek
  failed: 'A művelet sikertelen',
  success: 'A művelet sikeres volt',
  
  // Navigáció
  navigation: {
    dashboard: 'Irányítópult',
    reservations: 'Foglalások',
    calendar: 'Naptár',
    rooms: 'Szobák',
    guests: 'Vendégek',
    housekeeping: 'Takarítás',
    reports: 'Jelentések',
    settings: 'Beállítások',
    profile: 'Profil',
    logout: 'Kijelentkezés',
    analytics: 'Analitika',
    finance: 'Pénzügyek',
    spa: 'Wellness',
    spaManagement: 'Wellness kezelés',
    events: 'Események',
    pos: 'Pénztár',
    rates: 'Árak',
    rateManagement: 'Árkezelés',
    admin: 'Adminisztráció',
    guestPortal: 'Vendégportál',
    invoices: 'Számlák',
    payments: 'Fizetések',
    sustainability: 'Fenntarthatóság',
    channelManager: 'Csatornamanager',
    waitlist: 'Várólisták',
    gdpr: 'GDPR',
    branding: 'Márkaépítés',
    electronTest: 'Electron teszt',
    shortcutsTest: 'Billentyűparancsok teszt',
    electronFeatures: 'Electron funkciók'
  },
  
  // Általános műveletek
  actions: {
    save: 'Mentés',
    cancel: 'Mégse',
    delete: 'Törlés',
    edit: 'Szerkesztés',
    add: 'Hozzáadás',
    search: 'Keresés',
    filter: 'Szűrés',
    export: 'Exportálás',
    import: 'Importálás',
    refresh: 'Frissítés',
    close: 'Bezárás',
    open: 'Megnyitás',
    view: 'Megtekintés',
    print: 'Nyomtatás',
    send: 'Küldés',
    confirm: 'Megerősítés',
    back: 'Vissza',
    next: 'Következő',
    previous: 'Előző',
    submit: 'Elküldés',
    reset: 'Visszaállítás'
  },
  
  // Státuszok
  status: {
    active: 'Aktív',
    inactive: 'Inaktív',
    pending: 'Függőben',
    confirmed: 'Megerősítve',
    cancelled: 'Lemondva',
    completed: 'Befejezve',
    processing: 'Feldolgozás alatt',
    available: 'Elérhető',
    occupied: 'Foglalt',
    maintenance: 'Karbantartás',
    cleaning: 'Takarítás alatt'
  },
  
  // Űrlapok
  forms: {
    required: 'Ez a mező kötelező',
    email: 'Érvényes email címet adjon meg',
    password: 'A jelszó legalább 8 karakter legyen',
    phone: 'Érvényes telefonszámot adjon meg',
    date: 'Érvényes dátumot adjon meg',
    number: 'Számot adjon meg',
    min: 'Minimum {min} karakter szükséges',
    max: 'Maximum {max} karakter engedélyezett'
  },
  
  // Dátum és idő
  datetime: {
    today: 'Ma',
    yesterday: 'Tegnap',
    tomorrow: 'Holnap',
    thisWeek: 'Ezen a héten',
    thisMonth: 'Ebben a hónapban',
    thisYear: 'Ebben az évben',
    selectDate: 'Válasszon dátumot',
    selectTime: 'Válasszon időt'
  },
  
  // Hibaüzenetek
  errors: {
    general: 'Hiba történt',
    network: 'Hálózati hiba',
    unauthorized: 'Nincs jogosultsága',
    forbidden: 'Hozzáférés megtagadva',
    notFound: 'Nem található',
    serverError: 'Szerver hiba',
    timeout: 'Időtúllépés',
    validation: 'Érvényesítési hiba'
  },
  
  // Megerősítő üzenetek
  confirmations: {
    delete: 'Biztosan törölni szeretné?',
    save: 'Biztosan menteni szeretné a változtatásokat?',
    cancel: 'Biztosan megszakítja? A nem mentett változtatások elvesznek.',
    logout: 'Biztosan ki szeretne jelentkezni?'
  },
  
  // Nyelv
  language: {
    select: 'Nyelv választása',
    hungarian: 'Magyar',
    english: 'Angol'
  },
  
  // Keresés
  search: {
    placeholder: 'Keresés foglalásokban, vendégekben, szobákban...',
    advanced: 'Részletes keresés',
    advancedOptions: 'Részletes keresési beállítások',
    guestName: 'Vendég neve',
    roomNumber: 'Szobaszám',
    dateRange: 'Dátum tartomány',
    clear: 'Törlés'
  },

  // Alkalmazások
  applications: {
    title: 'Hospie SaaS Szolgáltatások',
    hospiePay: 'HospiePAY',
    channelManager: 'Csatornamanager',
    subscription: 'Előfizetés',
    settings: 'Beállítások'
  },

  // Menü szekciók
  menu: {
    main: 'Főmenü',
    management: 'Kezelés',
    more: 'Egyéb'
  },

  // Lábléc
  footer: {
    privacy: 'Adatvédelem',
    terms: 'Feltételek',
    about: 'A Hospie-ról',
    version: 'Verzió 1.0.0'
  },

  // Értesítések
  notifications: {
    title: 'Értesítések',
    newReservation: 'Új foglalás',
    roomReady: 'Szoba kész',
    viewAll: 'Összes megtekintése',
    install: 'Hospie PMS telepítése',
    offline: 'Offline módban van',
    lockSession: 'Munkamenet zárolása',
    sessionLocked: 'Munkamenet zárolva',
    sessionLockFailed: 'Munkamenet zárolása sikertelen',
    logoutSuccess: 'Sikeres kijelentkezés',
    logoutFailed: 'Kijelentkezés sikertelen'
  },

  // Tooltipek
  tooltips: {
    menu: 'Menü',
    search: 'Keresés',
    advancedSearch: 'Részletes keresés',
    applications: 'Alkalmazások',
    notifications: 'Értesítések',
    keyboardShortcuts: 'Billentyűparancsok (Ctrl+?)',
    electronMode: 'Electron mód',
    browserMode: 'Böngésző mód'
  },

  // Mobil
  mobile: {
    search: 'Keresés',
    cancel: 'Mégse'
  },

  // Linkek
  links: {
    languageRegion: 'Nyelv és régió',
    getAndroidApp: 'Android alkalmazás letöltése',
    getIosApp: 'iOS alkalmazás letöltése',
    sendFeedback: 'Visszajelzés küldése',
    help: 'Súgó'
  },

  pages: {
    // Dashboard
    dashboard: {
      title: 'Irányítópult',
      welcome: 'Üdvözöljük újra, {name}! 👋',
      welcomeSubtitle: 'Itt láthatja, mi történik ma a szálláshelyén',
      todaysArrivals: 'Mai érkezések',
      departures: 'Távozások',
      occupancy: 'Foglaltság',
      revenue: 'Bevétel',
      quickActions: 'Gyors műveletek',
      newReservation: 'Új foglalás',
      roomStatus: 'Szoba állapot',
      checkIn: 'Bejelentkezés',
      checkOut: 'Kijelentkezés',
      recentActivity: 'Legutóbbi tevékenységek',
      todaysSchedule: 'Mai program',
      roomStatusOverview: 'Szoba állapot áttekintés',
      available: 'Elérhető',
      occupied: 'Foglalt',
      cleaning: 'Takarítás',
      maintenance: 'Karbantartás',
      viewFullStatus: 'Teljes állapot megtekintése',
      quickCheckIn: 'Gyors bejelentkezés',
      quickCheckOut: 'Gyors kijelentkezés',
      selectReservation: 'Válasszon foglalást',
      selectGuest: 'Válasszon vendéget'
    },

    // Profile
    user_profile: {
      title: 'Felhasználói profil',
      fullName: 'Teljes név',
      email: 'Email cím',
      updateProfile: 'Profil frissítése',
      changePassword: 'Jelszó módosítása',
      currentPassword: 'Jelenlegi jelszó',
      newPassword: 'Új jelszó',
      confirmPassword: 'Új jelszó megerősítése',
      accountActions: 'Fiók műveletek',
      logoutAllDevices: 'Kijelentkezés minden eszközről',
      nameRequired: 'A név megadása kötelező',
      emailRequired: 'Az email cím megadása kötelező',
      validEmail: 'Kérjük, adjon meg érvényes email címet',
      currentPasswordRequired: 'A jelenlegi jelszó megadása kötelező',
      newPasswordRequired: 'Az új jelszó megadása kötelező',
      passwordMinLength: 'A jelszó legalább 8 karakter legyen',
      confirmPasswordRequired: 'Kérjük, erősítse meg a jelszót',
      passwordsNotMatch: 'A jelszavak nem egyeznek',
      profileUpdated: 'Profil sikeresen frissítve!',
      profileUpdateFailed: 'Profil frissítése sikertelen',
      passwordChanged: 'Jelszó sikeresen módosítva!',
      passwordChangeFailed: 'Jelszó módosítása sikertelen',
      loggedOutAllDevices: 'Sikeresen kijelentkezett minden eszközről',
      logoutAllFailed: 'Kijelentkezés sikertelen'
    },

    // Error pages
    error_not_found: {
      title: 'Hoppá. Itt nincs semmi...',
      goHome: 'Főoldal'
    },

    unauthorized: {
      title: 'Jogosulatlan hozzáférés',
      message: 'Nincs jogosultsága az oldal megtekintéséhez.',
      goToDashboard: 'Irányítópult'
    },

    // Auth pages
    auth: {
      login: {
        title: 'Bejelentkezés',
        email: 'Email cím',
        password: 'Jelszó',
        rememberMe: 'Emlékezzen rám',
        forgotPassword: 'Elfelejtett jelszó?',
        loginButton: 'Bejelentkezés',
        noAccount: 'Nincs még fiókja?',
        signUp: 'Regisztráció',
        emailRequired: 'Az email cím megadása kötelező',
        passwordRequired: 'A jelszó megadása kötelező',
        invalidCredentials: 'Hibás email cím vagy jelszó'
      },
      register: {
        title: 'Regisztráció',
        firstName: 'Keresztnév',
        lastName: 'Vezetéknév',
        email: 'Email cím',
        password: 'Jelszó',
        confirmPassword: 'Jelszó megerősítése',
        agreeTerms: 'Elfogadom a felhasználási feltételeket',
        registerButton: 'Regisztráció',
        alreadyHaveAccount: 'Már van fiókja?',
        signIn: 'Bejelentkezés',
        firstNameRequired: 'A keresztnév megadása kötelező',
        lastNameRequired: 'A vezetéknév megadása kötelező',
        termsRequired: 'El kell fogadnia a felhasználási feltételeket'
      },
      forgotPassword: {
        title: 'Jelszó visszaállítása',
        email: 'Email cím',
        sendResetLink: 'Visszaállítási link küldése',
        backToLogin: 'Vissza a bejelentkezéshez',
        resetLinkSent: 'Visszaállítási link elküldve!',
        checkEmail: 'Ellenőrizze email fiókját a további utasításokért.'
      }
    },

    // Reservations
    reservations: {
      title: 'Foglalások',
      list: {
        title: 'Foglalások listája',
        searchPlaceholder: 'Keresés foglalásokban...',
        guestName: 'Vendég neve',
        room: 'Szoba',
        checkIn: 'Bejelentkezés',
        checkOut: 'Kijelentkezés',
        status: 'Állapot',
        actions: 'Műveletek',
        from_date: 'Időszak kezdete',
        to_date: 'Időszak vége',
        loading: 'Foglalások betöltése...',
        not_found: 'Nem találhatóak foglalások'
      },
      create: {
        title: 'Új foglalás létrehozása',
        guestInformation: 'Vendég adatok',
        reservationDetails: 'Foglalás részletei',
        roomSelection: 'Szoba kiválasztása',
        paymentInformation: 'Fizetési információk'
      },
      edit: {
        title: 'Foglalás szerkesztése',
        updateReservation: 'Foglalás frissítése'
      },
      calendar: {
        title: 'Foglalási naptár',
        monthView: 'Havi nézet',
        weekView: 'Heti nézet',
        dayView: 'Napi nézet'
      }
    },

    // Rooms
    rooms: {
      title: 'Szobák',
      roomNumber: 'Szobaszám',
      roomType: 'Szoba típus',
      status: 'Állapot',
      guest: 'Vendég',
      checkIn: 'Bejelentkezés',
      checkOut: 'Kijelentkezés',
      clean: 'Takarítás',
      maintenance: 'Karbantartás'
    },

    // Guests
    guests: {
      title: 'Vendégek',
      guestName: 'Vendég neve',
      email: 'Email',
      phone: 'Telefon',
      nationality: 'Nemzetiség',
      lastVisit: 'Utolsó látogatás',
      totalStays: 'Összes tartózkodás'
    },

    // Housekeeping
    housekeeping: {
      title: 'Takarítás',
      roomNumber: 'Szobaszám',
      status: 'Állapot',
      assignedTo: 'Hozzárendelve',
      priority: 'Prioritás',
      notes: 'Megjegyzések'
    },

    // Reports
    reports: {
      title: 'Jelentések',
      occupancyReport: 'Foglaltsági jelentés',
      revenueReport: 'Bevételi jelentés',
      guestReport: 'Vendég jelentés',
      roomReport: 'Szoba jelentés',
      dateRange: 'Dátum tartomány',
      generateReport: 'Jelentés generálása'
    },

    // Settings
    settings: {
      title: 'Beállítások',
      general: 'Általános',
      notifications: 'Értesítések',
      security: 'Biztonság',
      integrations: 'Integrációk',
      backup: 'Biztonsági mentés'
    },

    // Analytics
    analytics: {
      title: 'Analitika',
      overview: 'Áttekintés',
      performance: 'Teljesítmény',
      trends: 'Trendek',
      forecasting: 'Előrejelzés'
    },

    // Finance
    finance: {
      title: 'Pénzügyek',
      revenue: 'Bevétel',
      expenses: 'Kiadások',
      profit: 'Profit',
      invoices: 'Számlák',
      payments: 'Fizetések'
    },

    // SPA & Wellness
    spa: {
      title: 'Wellness',
      treatments: 'Kezelések',
      appointments: 'Időpontok',
      therapists: 'Terapeuták',
      packages: 'Csomagok'
    },

    // Events
    events: {
      title: 'Események',
      eventName: 'Esemény neve',
      date: 'Dátum',
      venue: 'Helyszín',
      capacity: 'Kapacitás',
      bookings: 'Foglalások'
    },

    // POS
    pos: {
      title: 'Pénztár',
      products: 'Termékek',
      sales: 'Eladások',
      inventory: 'Készlet',
      transactions: 'Tranzakciók'
    },

    // Rates
    rates: {
      title: 'Árak',
      roomType: 'Szoba típus',
      baseRate: 'Alapár',
      seasonalRates: 'Szezonális árak',
      discounts: 'Kedvezmények'
    },

    // Admin
    admin: {
      title: 'Adminisztráció',
      users: 'Felhasználók',
      roles: 'Szerepkörök',
      permissions: 'Jogosultságok',
      systemSettings: 'Rendszer beállítások'
    },

    // Guest Portal
    guestPortal: {
      title: 'Vendégportál',
      welcome: 'Üdvözöljük',
      services: 'Szolgáltatások',
      requests: 'Kérések',
      feedback: 'Visszajelzés'
    },

    // Invoices
    invoices: {
      title: 'Számlák',
      invoiceNumber: 'Számlaszám',
      date: 'Dátum',
      amount: 'Összeg',
      status: 'Állapot',
      customer: 'Ügyfél'
    },

    // Sustainability
    sustainability: {
      title: 'Fenntarthatóság',
      energyUsage: 'Energiafelhasználás',
      waterUsage: 'Vízfelhasználás',
      wasteManagement: 'Hulladékkezelés',
      carbonFootprint: 'Szénlábnyom'
    },

    // Channel Manager
    channelManager: {
      title: 'Csatornamanager',
      channels: 'Csatornák',
      inventory: 'Készlet',
      rates: 'Árak',
      bookings: 'Foglalások'
    },

    // Waitlist
    waitlist: {
      title: 'Várólisták',
      guestName: 'Vendég neve',
      requestedDates: 'Kért dátumok',
      roomType: 'Szoba típus',
      priority: 'Prioritás'
    },

    // GDPR
    gdpr: {
      title: 'GDPR',
      dataProtection: 'Adatvédelem',
      consent: 'Hozzájárulás',
      dataRequests: 'Adatkérések',
      compliance: 'Megfelelőség'
    }
  }
}