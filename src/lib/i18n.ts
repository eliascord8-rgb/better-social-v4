import { useState, useEffect } from 'react';

export type Language = 'en' | 'de' | 'sr';

export const translations = {
  en: {
    flag: "🇺🇸",
    welcome_bonus: "Welcome Bonus Protocol",
    first_deposit: "+100% BALANCE",
    first_deposit_exclusive: "First Deposit Exclusive",
    refueling_on_us: "Your engine's first refueling is on us. Double your social media growth power instantly.",
    initiate_sync: "Initiate Account Sync",
    system_online: "SYSTEM ONLINE",
    social_ascension: "Social Ascension Infrastructure",
    platform_operational: "Platform Status: Operational",
    start_transmission: "Start Transmission",
    view_node_specs: "View Node Specs",
    core_protocols: "Core Protocols",
    intelligence: "Intelligence",
    protocols: "Protocols",
    operations: "Operations",
    network: "Network",
    login: "Login",
    initialize: "Initialize",
    dashboard: "Dashboard",
    overview: "Overview",
    new_order: "New Order",
    order_log: "Order Log",
    refuel_balance: "Refuel Balance",
    slot_machine: "Slot Machine",
    support_hub: "Support Hub",
    irc_terminal: "IRC Terminal",
    secure_signal: "Secure Signal",
    secure_identity: "Secure Identity",
    root_access: "Root Access",
    control_node: "Control Node",
    terminate_session: "Terminate Session",
    community_network: "Community Network",
    live_intelligence: "Live Intelligence Feed",
    online_nodes: "Active Network Nodes",
    total_transmissions: "Total Transmissions",
    account_protocol: "Account Protocol",
    signal_history: "Signal History",
    network_latency: "Network Latency",
    optimal: "Optimal",
    full_logs: "Full Logs",
    signal_deployment: "Signal Deployment",
    account_refueling: "Account Refueling",
    welcome_back: "Welcome back",
    authenticated_as: "Authenticated as",
    roulette: "Roulette",
    maintenance_title: "System Maintenance",
    maintenance_desc: "The Better Social core is currently undergoing high-frequency upgrades. Standby for reconnection.",
    active_transmissions: "Active Transmissions",
    total_invested: "Total Invested",
    network_level: "Network Level",
    loyalty_points: "Loyalty Points",
    operator: "Operator",
    recent_transmissions: "Recent Transmissions",
    network_activity: "Network Activity",
  },
  de: {
    flag: "🇩🇪",
    welcome_bonus: "Willkommensbonus-Protokoll",
    first_deposit: "+100% GUTHABEN",
    first_deposit_exclusive: "Exklusiv für die erste Einzahlung",
    refueling_on_us: "Die erste Betankung Ihres Motors geht auf uns. Verdoppeln Sie sofort Ihre Social-Media-Wachstumskraft.",
    initiate_sync: "Kontosynchronisierung einleiten",
    system_online: "SYSTEM ONLINE",
    social_ascension: "Soziale Aufstiegs-Infrastruktur",
    platform_operational: "Plattformstatus: Betriebsbereit",
    start_transmission: "Übertragung starten",
    view_node_specs: "Knoten-Spezifikationen anzeigen",
    core_protocols: "Kernprotokolle",
    intelligence: "Intelligenz",
    protocols: "Protokolle",
    operations: "Operationen",
    network: "Netzwerk",
    login: "Anmelden",
    initialize: "Initialisieren",
    dashboard: "Dashboard",
    overview: "Übersicht",
    new_order: "Neue Bestellung",
    order_log: "Bestellprotokoll",
    refuel_balance: "Guthaben aufladen",
    slot_machine: "Spielautomat",
    support_hub: "Support-Zentrum",
    irc_terminal: "IRC-Terminal",
    secure_signal: "Sicheres Signal",
    secure_identity: "Sichere Identität",
    root_access: "Root-Zugriff",
    control_node: "Kontrollknoten",
    terminate_session: "Sitzung beenden",
    community_network: "Community-Netzwerk",
    live_intelligence: "Live-Intelligence-Feed",
    online_nodes: "Aktive Netzwerkknoten",
    total_transmissions: "Gesamte Übertragungen",
    account_protocol: "Kontoprotokoll",
    signal_history: "Signalverlauf",
    network_latency: "Netzwerklatenz",
    optimal: "Optimal",
    full_logs: "Vollständige Protokolle",
    signal_deployment: "Signalbereitstellung",
    account_refueling: "Kontobetankung",
    welcome_back: "Willkommen zurück",
    authenticated_as: "Authentifiziert als",
    roulette: "Glücksrad",
    maintenance_title: "Systemwartung",
    maintenance_desc: "Der Better Social Core wird derzeit Hochfrequenz-Upgrades unterzogen. Bitte warten Sie auf die Wiederverbindung.",
    active_transmissions: "Aktive Übertragungen",
    total_invested: "Gesamt Investiert",
    network_level: "Netzwerkstufe",
    loyalty_points: "Treuepunkte",
    operator: "Operator",
    recent_transmissions: "Letzte Übertragungen",
    network_activity: "Netzwerkaktivität",
  },
  sr: {
    flag: "🇷🇸",
    welcome_bonus: "Protokol bonusa dobrodošlice",
    first_deposit: "+100% BALANS",
    first_deposit_exclusive: "Ekskluzivno za prvi depozit",
    refueling_on_us: "Prvo punjenje vašeg motora je na nas. Trenutno udvostručite svoju moć rasta na društvenim mrežama.",
    initiate_sync: "Pokreni sinhronizaciju naloga",
    system_online: "SISTEM JE ONLAJN",
    social_ascension: "Infrastruktura društvenog uspona",
    platform_operational: "Status platforme: Operativno",
    start_transmission: "Započni transmisiju",
    view_node_specs: "Pogledaj specifikacije čvora",
    core_protocols: "Glavni protokoli",
    intelligence: "Inteligencija",
    protocols: "Protokoli",
    operations: "Operacije",
    network: "Mreža",
    login: "Prijava",
    initialize: "Inicijalizacija",
    dashboard: "Kontrolna tabla",
    overview: "Pregled",
    new_order: "Nova narudžba",
    order_log: "Dnevnik narudžbi",
    refuel_balance: "Dopuni balans",
    slot_machine: "Slot mašina",
    support_hub: "Centar za podršku",
    irc_terminal: "IRC Terminal",
    secure_signal: "Siguran signal",
    secure_identity: "Siguran identitet",
    root_access: "Root pristup",
    control_node: "Kontrolni čvor",
    terminate_session: "Prekini sesiju",
    community_network: "Mreža zajednice",
    live_intelligence: "Live Intelligence Feed",
    online_nodes: "Aktivni čvorovi mreže",
    total_transmissions: "Ukupno transmisija",
    account_protocol: "Protokol naloga",
    signal_history: "Istorija signala",
    network_latency: "Mrežna latencija",
    optimal: "Optimalno",
    full_logs: "Svi dnevnici",
    signal_deployment: "Razmeštanje signala",
    account_refueling: "Punjenje naloga",
    welcome_back: "Dobrodošli nazad",
    authenticated_as: "Autentifikovan kao",
    roulette: "Rulet",
    maintenance_title: "Održavanje sistema",
    maintenance_desc: "Better Social jezgro trenutno prolazi kroz nadogradnje visoke frekvencije. Sačekajte ponovno povezivanje.",
    active_transmissions: "Aktivne transmisije",
    total_invested: "Ukupno investirano",
    network_level: "Nivo mreže",
    loyalty_points: "Poeni lojalnosti",
    operator: "Operater",
    recent_transmissions: "Nedavne transmisije",
    network_activity: "Aktivnost mreže",
  }
};

export function useI18n() {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('app-lang') as Language;
    if (saved && (saved === 'en' || saved === 'de' || saved === 'sr')) {
      setLang(saved);
    } else {
      // Auto detection logic
      const detectLang = async () => {
        try {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          if (data.country_code === 'RS' || data.country_code === 'ME' || data.country_code === 'BA' || data.country_code === 'HR') {
            updateLang('sr');
          } else if (data.country_code === 'DE' || data.country_code === 'AT' || data.country_code === 'CH') {
            updateLang('de');
          } else {
            updateLang('en');
          }
        } catch (e) {
          // Fallback to browser lang
          const browserLang = navigator.language.split('-')[0];
          if (browserLang === 'de') updateLang('de');
          else if (browserLang === 'sr' || browserLang === 'hr' || browserLang === 'bs') updateLang('sr');
        }
      };
      detectLang();
    }
  }, []);

  const updateLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('app-lang', newLang);
  };

  const t = (key: keyof typeof translations['en']) => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  return { lang, t, setLang: updateLang };
}
