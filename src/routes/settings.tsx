import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import EmptyState from '#/app/components/EmptyState'
import NotificationCenter from '#/app/components/NotificationCenter'
import PageHeader from '#/app/components/PageHeader'
import SearchBar from '#/app/components/SearchBar'
import Section from '#/app/components/Section'
import DataTable from '#/app/components/ui/DataTable'
import type { DataTableColumn } from '#/app/components/ui/DataTable'
import Button from '#/app/components/ui/Button'
import { Field, FieldGroup, FormSection, FormToolbar, SmartInputField, ValidationMessage } from '#/app/components/ui/FormPrimitives'
import { useNotifications } from '#/app/hooks/useNotifications'
import { navItems } from '#/app/navigation/navConfig'
import { notificationService } from '#/app/services/NotificationService'
import { useTheme } from '#/app/hooks/useTheme'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

type EnterpriseConfiguration = {
  name: string
  logo: string
  timezone: string
  language: string
  currency: string
  country: string
  industry: string
  identifier: string
  plan: string
  workspaceStatus: string
  createdAt: string
  gatewayStatus: string
  apiVersion: string
  environment: string
  baseUrl: string
  tenantEndpoint: string
  healthStatus: string
  askSrgLanguage: string
}

type ReadinessRow = {
  item: string
  value: string
  status: string
  note: string
}

type TenantModuleRow = {
  module: string
  workspace: string
  state: string
  note: string
}

type SecurityRow = {
  control: string
  status: string
  note: string
}

type ConnectorCategory =
  | 'ERP'
  | 'CRM'
  | 'Cloud Storage'
  | 'Collaboration'
  | 'Office'
  | 'Business Intelligence'
  | 'Communication'
  | 'Industrial Systems'

type ConnectorCard = {
  id: string
  name: string
  icon: string
  description: string
  category: ConnectorCategory
  status: 'Coming Soon'
  readiness: string
  useCases: string[]
  dataScope: string[]
  integrationType: string
  version: string
  documentation: string
}

type SyncPreviewRow = {
  item: string
  value: string
  note: string
}

type SecurityPlaceholderRow = {
  control: string
  state: string
  note: string
}

type ApiKeyRow = {
  name: string
  type: string
  createdAt: string
  lastUsed: string
  status: string
}

type WebhookRow = {
  direction: string
  events: string
  retry: string
  status: string
  note: string
}

type SdkRow = {
  sdk: string
  status: string
  note: string
}

const ENTERPRISE_CONFIG_KEY = 'settings-enterprise-config'

const ENTERPRISE_DEFAULTS: EnterpriseConfiguration = {
  name: 'SRG Industries Holding',
  logo: 'logo-placeholder.svg',
  timezone: 'Europe/Paris',
  language: 'Français',
  currency: 'EUR',
  country: 'France',
  industry: 'Industrial Services',
  identifier: 'tenant-srg-industries-holding',
  plan: 'Enterprise Unlimited',
  workspaceStatus: 'Prepared',
  createdAt: '2026-08-02',
  gatewayStatus: 'Preview Ready',
  apiVersion: 'v1-placeholder',
  environment: 'Staging Preview',
  baseUrl: 'https://gateway.srg.placeholder/api',
  tenantEndpoint: '/tenants/{tenantId}/workspace',
  healthStatus: 'Healthy Placeholder',
  askSrgLanguage: 'Auto Detection',
}

const LANGUAGE_OPTIONS = ['Auto Detection', 'Français', 'English', 'Español', 'Deutsch', 'Italiano', 'Português', 'العربية', '中文', '日本語']

const CONNECTOR_CARDS: ConnectorCard[] = [
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    icon: '◻',
    description: 'Suite collaborative enterprise pour messagerie, documents et productivité.',
    category: 'Office',
    status: 'Coming Soon',
    readiness: 'UI Ready',
    useCases: ['Collaboration documentaire', 'Messagerie équipe'],
    dataScope: ['Mailbox', 'Calendar', 'Documents'],
    integrationType: 'OAuth + API',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    icon: '◻',
    description: 'Espace bureautique cloud pour fichiers, agendas et collaboration.',
    category: 'Office',
    status: 'Coming Soon',
    readiness: 'UI Ready',
    useCases: ['Partage de fichiers', 'Agenda partagé'],
    dataScope: ['Drive files', 'Calendar', 'Mail metadata'],
    integrationType: 'OAuth + API',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'sharepoint',
    name: 'SharePoint',
    icon: '◻',
    description: 'Gestion documentaire et intranet pour contenus enterprise.',
    category: 'Cloud Storage',
    status: 'Coming Soon',
    readiness: 'Metadata Ready',
    useCases: ['Bibliothèques documentaires', 'Archivage de procédures'],
    dataScope: ['Sites', 'Lists', 'Documents'],
    integrationType: 'REST API',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    icon: '◻',
    description: 'Stockage cloud Microsoft orienté fichiers d’équipes et personnels.',
    category: 'Cloud Storage',
    status: 'Coming Soon',
    readiness: 'Search Ready',
    useCases: ['Synchronisation de dossiers', 'Partage contrôlé'],
    dataScope: ['Files', 'Folders', 'Permissions'],
    integrationType: 'Graph API',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    icon: '◻',
    description: 'Stockage cloud et partage documentaire multi-équipes.',
    category: 'Cloud Storage',
    status: 'Coming Soon',
    readiness: 'Search Ready',
    useCases: ['Centralisation des archives', 'Classement métier'],
    dataScope: ['Files', 'Folders', 'Labels'],
    integrationType: 'REST API',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: '◻',
    description: 'Partage de fichiers et dossiers distribués.',
    category: 'Cloud Storage',
    status: 'Coming Soon',
    readiness: 'UI Ready',
    useCases: ['Échanges externes', 'Dépôts partagés'],
    dataScope: ['Files', 'Folders', 'Shared links'],
    integrationType: 'OAuth + API',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'sap',
    name: 'SAP',
    icon: '◻',
    description: 'ERP enterprise pour finance, achats, logistique et opérations.',
    category: 'ERP',
    status: 'Coming Soon',
    readiness: 'Mapping Ready',
    useCases: ['Synchronisation fournisseurs', 'Référentiels achats'],
    dataScope: ['Vendors', 'Purchase orders', 'Finance records'],
    integrationType: 'API + Webhooks',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'oracle',
    name: 'Oracle',
    icon: '◻',
    description: 'ERP/DB enterprise pour gestion financière et opérations.',
    category: 'ERP',
    status: 'Coming Soon',
    readiness: 'Mapping Ready',
    useCases: ['Données financières', 'Transactions opérationnelles'],
    dataScope: ['Accounts', 'Transactions', 'Master data'],
    integrationType: 'REST API',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'dynamics-365',
    name: 'Microsoft Dynamics 365',
    icon: '◻',
    description: 'Plateforme CRM/ERP intégrée pour ventes et opérations.',
    category: 'CRM',
    status: 'Coming Soon',
    readiness: 'UI Ready',
    useCases: ['Pipeline commercial', 'Suivi clients'],
    dataScope: ['Accounts', 'Opportunities', 'Cases'],
    integrationType: 'Graph + REST API',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: '◻',
    description: 'CRM enterprise pour opportunités, comptes et support.',
    category: 'CRM',
    status: 'Coming Soon',
    readiness: 'API Ready Placeholder',
    useCases: ['Suivi pipeline', 'Historique comptes'],
    dataScope: ['Accounts', 'Contacts', 'Opportunities'],
    integrationType: 'REST API',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    icon: '◻',
    description: 'CRM orienté marketing, ventes et relation client.',
    category: 'CRM',
    status: 'Coming Soon',
    readiness: 'API Ready Placeholder',
    useCases: ['Lead management', 'Automations marketing'],
    dataScope: ['Contacts', 'Deals', 'Activities'],
    integrationType: 'REST API',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'power-bi',
    name: 'Power BI',
    icon: '◻',
    description: 'Business intelligence pour tableaux de bord et analytics.',
    category: 'Business Intelligence',
    status: 'Coming Soon',
    readiness: 'Dashboard Ready',
    useCases: ['KPIs exécutifs', 'Analyses multi-modules'],
    dataScope: ['Datasets', 'Reports', 'Tiles'],
    integrationType: 'REST API',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'tableau',
    name: 'Tableau',
    icon: '◻',
    description: 'Visualisation avancée et exploration de données business.',
    category: 'Business Intelligence',
    status: 'Coming Soon',
    readiness: 'Dashboard Ready',
    useCases: ['Data storytelling', 'Insights opérationnels'],
    dataScope: ['Workbooks', 'Views', 'Projects'],
    integrationType: 'REST API',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'looker',
    name: 'Looker',
    icon: '◻',
    description: 'BI cloud pour modélisation et dashboards métiers.',
    category: 'Business Intelligence',
    status: 'Coming Soon',
    readiness: 'Dashboard Ready',
    useCases: ['Exploration ad hoc', 'Reporting unifié'],
    dataScope: ['Looks', 'Dashboards', 'Queries'],
    integrationType: 'REST API',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: '◻',
    description: 'Messagerie d’équipe avec canaux et notifications.',
    category: 'Collaboration',
    status: 'Coming Soon',
    readiness: 'Notification Ready',
    useCases: ['Alertes workflow', 'Canaux de support'],
    dataScope: ['Channels', 'Messages', 'Users'],
    integrationType: 'Webhooks + API',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    icon: '◻',
    description: 'Collaboration et réunions unifiées pour équipes enterprise.',
    category: 'Collaboration',
    status: 'Coming Soon',
    readiness: 'Notification Ready',
    useCases: ['Canaux projet', 'Réunions opérationnelles'],
    dataScope: ['Teams', 'Channels', 'Messages'],
    integrationType: 'Graph API',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    icon: '◻',
    description: 'Visioconférence et webinaires pour coordination métier.',
    category: 'Collaboration',
    status: 'Coming Soon',
    readiness: 'UI Ready',
    useCases: ['Réunions projet', 'Sessions formation'],
    dataScope: ['Meetings', 'Users', 'Reports'],
    integrationType: 'REST API',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'whatsapp-business',
    name: 'WhatsApp Business',
    icon: '◻',
    description: 'Communication transactionnelle avec clients et partenaires.',
    category: 'Communication',
    status: 'Coming Soon',
    readiness: 'Webhook Ready Placeholder',
    useCases: ['Notifications critiques', 'Suivi intervention'],
    dataScope: ['Templates', 'Messages', 'Delivery status'],
    integrationType: 'API + Webhooks',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '◻',
    description: 'Canal de communication bot et notifications rapides.',
    category: 'Communication',
    status: 'Coming Soon',
    readiness: 'Webhook Ready Placeholder',
    useCases: ['Alertes bot', 'Broadcast équipes'],
    dataScope: ['Chats', 'Messages', 'Bot commands'],
    integrationType: 'Bot API',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'email-imap-smtp',
    name: 'Email (IMAP/SMTP)',
    icon: '◻',
    description: 'Connecteur messagerie standard pour réception et envoi.',
    category: 'Communication',
    status: 'Coming Soon',
    readiness: 'Protocol Ready Placeholder',
    useCases: ['Ingestion emails', 'Envois notifications'],
    dataScope: ['Inbox', 'Threads', 'Attachments metadata'],
    integrationType: 'IMAP + SMTP',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'rest-api',
    name: 'REST API',
    icon: '◻',
    description: 'Pont d’intégration générique vers systèmes externes.',
    category: 'Industrial Systems',
    status: 'Coming Soon',
    readiness: 'Integration Ready Placeholder',
    useCases: ['Échanges référentiels', 'Synchronisation métier'],
    dataScope: ['JSON payloads', 'Resources', 'Events'],
    integrationType: 'REST',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    icon: '◻',
    description: 'Intégration flexible par schéma orienté requêtes.',
    category: 'Industrial Systems',
    status: 'Coming Soon',
    readiness: 'Schema Ready Placeholder',
    useCases: ['Query unifiée', 'Federation BFF'],
    dataScope: ['Schemas', 'Queries', 'Mutations'],
    integrationType: 'GraphQL',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    icon: '◻',
    description: 'Notifications événementielles entrantes et sortantes.',
    category: 'Industrial Systems',
    status: 'Coming Soon',
    readiness: 'Event Ready Placeholder',
    useCases: ['Push events', 'Automation triggers'],
    dataScope: ['Event payloads', 'Delivery logs'],
    integrationType: 'HTTPS Webhooks',
    version: 'v1-preview',
    documentation: 'Documentation placeholder',
  },
]

function getStoredString(record: Record<string, string | boolean | number> | undefined, key: keyof EnterpriseConfiguration, fallback: string) {
  const value = record?.[key]
  return typeof value === 'string' ? value : fallback
}

function SettingsPage() {
  const theme = useTheme()
  const notifications = useNotifications()
  const [preferences, setPreferences] = useState(() => WorkspacePreferencesService.getPreferences())
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [connectorCategory, setConnectorCategory] = useState<ConnectorCategory | 'all'>('all')
  const [selectedConnectorId, setSelectedConnectorId] = useState(CONNECTOR_CARDS[0]?.id ?? '')
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const storedEnterpriseConfig = preferences.filters[ENTERPRISE_CONFIG_KEY]
  const [enterpriseConfiguration, setEnterpriseConfiguration] = useState<EnterpriseConfiguration>(() => ({
    name: getStoredString(storedEnterpriseConfig, 'name', ENTERPRISE_DEFAULTS.name),
    logo: getStoredString(storedEnterpriseConfig, 'logo', ENTERPRISE_DEFAULTS.logo),
    timezone: getStoredString(storedEnterpriseConfig, 'timezone', ENTERPRISE_DEFAULTS.timezone),
    language: getStoredString(storedEnterpriseConfig, 'language', ENTERPRISE_DEFAULTS.language),
    currency: getStoredString(storedEnterpriseConfig, 'currency', ENTERPRISE_DEFAULTS.currency),
    country: getStoredString(storedEnterpriseConfig, 'country', ENTERPRISE_DEFAULTS.country),
    industry: getStoredString(storedEnterpriseConfig, 'industry', ENTERPRISE_DEFAULTS.industry),
    identifier: getStoredString(storedEnterpriseConfig, 'identifier', ENTERPRISE_DEFAULTS.identifier),
    plan: getStoredString(storedEnterpriseConfig, 'plan', ENTERPRISE_DEFAULTS.plan),
    workspaceStatus: getStoredString(storedEnterpriseConfig, 'workspaceStatus', ENTERPRISE_DEFAULTS.workspaceStatus),
    createdAt: getStoredString(storedEnterpriseConfig, 'createdAt', ENTERPRISE_DEFAULTS.createdAt),
    gatewayStatus: getStoredString(storedEnterpriseConfig, 'gatewayStatus', ENTERPRISE_DEFAULTS.gatewayStatus),
    apiVersion: getStoredString(storedEnterpriseConfig, 'apiVersion', ENTERPRISE_DEFAULTS.apiVersion),
    environment: getStoredString(storedEnterpriseConfig, 'environment', ENTERPRISE_DEFAULTS.environment),
    baseUrl: getStoredString(storedEnterpriseConfig, 'baseUrl', ENTERPRISE_DEFAULTS.baseUrl),
    tenantEndpoint: getStoredString(storedEnterpriseConfig, 'tenantEndpoint', ENTERPRISE_DEFAULTS.tenantEndpoint),
    healthStatus: getStoredString(storedEnterpriseConfig, 'healthStatus', ENTERPRISE_DEFAULTS.healthStatus),
    askSrgLanguage: getStoredString(storedEnterpriseConfig, 'askSrgLanguage', ENTERPRISE_DEFAULTS.askSrgLanguage),
  }))

  const syncPreferences = (updater: Parameters<typeof WorkspacePreferencesService.updatePreferences>[0], message: string) => {
    const next = WorkspacePreferencesService.updatePreferences(updater)
    setPreferences(next)
    setStatus(message)
  }

  const enterpriseModules = useMemo<TenantModuleRow[]>(() => {
    const targetedModules = [
      { id: 'dashboard', state: 'Enabled', note: 'Executive command center ready for tenant badge.' },
      { id: 'enterprise-insights', state: 'Enabled', note: 'Decision workspace prepared for API placeholders.' },
      { id: 'strategic-advisor', state: 'Enabled', note: 'Scenario surface ready for isolated context labels.' },
      { id: 'workflow-automation', state: 'Enabled', note: 'Workflow cockpit ready for connector banners.' },
      { id: 'knowledge-intelligence', state: 'Enabled', note: 'Knowledge surface ready for archive isolation preview.' },
      { id: 'profile', state: 'Ready', note: 'User context can inherit active enterprise identity.' },
    ]

    return targetedModules.map((item) => {
      const workspace = navItems.find((navItem) => navItem.id === item.id)
      return {
        module: workspace?.title ?? item.id,
        workspace: workspace?.path ?? '/settings',
        state: item.state,
        note: item.note,
      }
    })
  }, [])

  const enterpriseWorkspaceRows = useMemo<ReadinessRow[]>(() => [
    { item: 'Entreprise active', value: enterpriseConfiguration.name, status: 'Active Preview', note: 'Workspace enterprise visible sans isolation backend.' },
    { item: 'Identifiant', value: enterpriseConfiguration.identifier, status: 'Placeholder', note: 'Identifiant prêt pour mapping multi-tenant futur.' },
    { item: 'Plan', value: enterpriseConfiguration.plan, status: 'Placeholder', note: 'Aucun billing runtime connecté.' },
    { item: 'Statut', value: enterpriseConfiguration.workspaceStatus, status: 'Prepared', note: 'Statut UI/UX de préparation.' },
    { item: 'Date de création', value: enterpriseConfiguration.createdAt, status: 'Placeholder', note: 'Date affichée sans backend.' },
  ], [enterpriseConfiguration.createdAt, enterpriseConfiguration.identifier, enterpriseConfiguration.name, enterpriseConfiguration.plan, enterpriseConfiguration.workspaceStatus])

  const apiGatewayRows = useMemo<ReadinessRow[]>(() => [
    { item: 'Gateway Status', value: enterpriseConfiguration.gatewayStatus, status: 'Prepared', note: 'Aucune gateway réelle branchée.' },
    { item: 'API Version', value: enterpriseConfiguration.apiVersion, status: 'Placeholder', note: 'Version d’API purement visuelle.' },
    { item: 'Environment', value: enterpriseConfiguration.environment, status: 'Placeholder', note: 'Environnement configuré en mode preview.' },
    { item: 'Base URL', value: enterpriseConfiguration.baseUrl, status: 'Placeholder', note: 'URL de base non résolue côté runtime.' },
    { item: 'Tenant Endpoint', value: enterpriseConfiguration.tenantEndpoint, status: 'Placeholder', note: 'Point d’entrée préparé pour tenant futur.' },
    { item: 'Health Status', value: enterpriseConfiguration.healthStatus, status: 'Placeholder', note: 'Healthcheck uniquement représenté dans l’UI.' },
  ], [enterpriseConfiguration.apiVersion, enterpriseConfiguration.baseUrl, enterpriseConfiguration.environment, enterpriseConfiguration.gatewayStatus, enterpriseConfiguration.healthStatus, enterpriseConfiguration.tenantEndpoint])

  const tenantIsolationRows = useMemo<ReadinessRow[]>(() => [
    { item: 'Workspace Isolation', value: 'Placeholder', status: 'Prepared', note: 'Surface de séparation des espaces sans partition réelle.' },
    { item: 'Document Isolation', value: 'Placeholder', status: 'Prepared', note: 'Documents encore partagés au niveau UI uniquement.' },
    { item: 'Users Isolation', value: 'Placeholder', status: 'Prepared', note: 'Aucune auth ni segmentation utilisateur réelle.' },
    { item: 'Storage Isolation', value: 'Placeholder', status: 'Prepared', note: 'Stockage isolé représenté sans backend.' },
    { item: 'AI Context Isolation', value: 'Placeholder', status: 'Prepared', note: 'Contexte IA enterprise réservé pour activation future.' },
  ], [])

  const askSrgRows = useMemo<ReadinessRow[]>(() => [
    { item: 'Statut', value: 'Preparation Mode', status: 'Prepared', note: 'Ask SRG est préparé sans conversation runtime réelle.' },
    { item: 'Langue détectée automatiquement', value: enterpriseConfiguration.askSrgLanguage, status: 'Prepared', note: 'Détection automatique prévue pour messages et documents.' },
    { item: 'Conversation', value: 'Placeholder', status: 'Prepared', note: 'Conversations multi-tenant non activées.' },
    { item: 'Voix', value: 'Placeholder', status: 'Prepared', note: 'Voix réservée sans pipeline audio.' },
    { item: 'Documents', value: 'Placeholder', status: 'Prepared', note: 'Documents connectables sans ingestion réelle.' },
    { item: 'API', value: 'Placeholder', status: 'Prepared', note: 'API SRG future non exposée.' },
    { item: 'Mémoire d’entreprise', value: 'Placeholder', status: 'Prepared', note: 'Mémoire enterprise prévue sans isolation active.' },
  ], [enterpriseConfiguration.askSrgLanguage])

  const apiKeyRows = useMemo<ApiKeyRow[]>(() => [
    { name: 'srg-enterprise-gateway', type: 'Server Key', createdAt: '2026-08-02', lastUsed: 'Placeholder', status: 'Disabled Placeholder' },
    { name: 'srg-ask-client', type: 'Client Key', createdAt: '2026-08-02', lastUsed: 'Placeholder', status: 'Prepared Placeholder' },
    { name: 'srg-documents-sync', type: 'Service Key', createdAt: '2026-08-02', lastUsed: 'Placeholder', status: 'Rotation Ready' },
  ], [])

  const webhookRows = useMemo<WebhookRow[]>(() => [
    { direction: 'Incoming', events: 'tenant.created, document.indexed', retry: '3 retries placeholder', status: 'Prepared', note: 'Entrée future sans endpoint réel.' },
    { direction: 'Outgoing', events: 'workflow.completed, ask.answer.ready', retry: '5 retries placeholder', status: 'Prepared', note: 'Sortie future sans delivery runtime.' },
  ], [])

  const sdkRows = useMemo<SdkRow[]>(() => [
    { sdk: 'JavaScript', status: 'Placeholder', note: 'Client SDK prévu pour web apps.' },
    { sdk: 'Python', status: 'Placeholder', note: 'SDK data/automation prévu.' },
    { sdk: '.NET', status: 'Placeholder', note: 'SDK enterprise prévu pour environnements Microsoft.' },
    { sdk: 'Java', status: 'Placeholder', note: 'SDK backend enterprise prévu.' },
    { sdk: 'Go', status: 'Placeholder', note: 'SDK microservices prévu.' },
    { sdk: 'PHP', status: 'Placeholder', note: 'SDK web legacy prévu.' },
  ], [])

  const securityRows = useMemo<SecurityRow[]>(() => [
    { control: 'OAuth Ready', status: 'Placeholder', note: 'OAuth n’est pas activé, seulement représenté.' },
    { control: 'JWT Ready', status: 'Placeholder', note: 'JWT réservé sans émission de token.' },
    { control: 'SSO Ready', status: 'Placeholder', note: 'SSO enterprise préparé sans fédération active.' },
    { control: 'Encryption Ready', status: 'Placeholder', note: 'Chiffrement non branché côté runtime.' },
    { control: 'Audit Ready', status: 'Placeholder', note: 'Piste d’audit prévue sans backend événementiel.' },
  ], [])

  const normalizedSearch = search.trim().toLowerCase()
  const filteredEnterpriseWorkspaceRows = useMemo(
    () => enterpriseWorkspaceRows.filter((row) => !normalizedSearch || `${row.item} ${row.value} ${row.status} ${row.note}`.toLowerCase().includes(normalizedSearch)),
    [enterpriseWorkspaceRows, normalizedSearch],
  )
  const filteredApiGatewayRows = useMemo(
    () => apiGatewayRows.filter((row) => !normalizedSearch || `${row.item} ${row.value} ${row.status} ${row.note}`.toLowerCase().includes(normalizedSearch)),
    [apiGatewayRows, normalizedSearch],
  )
  const filteredEnterpriseModules = useMemo(
    () => enterpriseModules.filter((row) => !normalizedSearch || `${row.module} ${row.workspace} ${row.state} ${row.note}`.toLowerCase().includes(normalizedSearch)),
    [enterpriseModules, normalizedSearch],
  )
  const filteredTenantIsolationRows = useMemo(
    () => tenantIsolationRows.filter((row) => !normalizedSearch || `${row.item} ${row.value} ${row.status} ${row.note}`.toLowerCase().includes(normalizedSearch)),
    [normalizedSearch, tenantIsolationRows],
  )
  const filteredAskSrgRows = useMemo(
    () => askSrgRows.filter((row) => !normalizedSearch || `${row.item} ${row.value} ${row.status} ${row.note}`.toLowerCase().includes(normalizedSearch)),
    [askSrgRows, normalizedSearch],
  )
  const filteredSecurityRows = useMemo(
    () => securityRows.filter((row) => !normalizedSearch || `${row.control} ${row.status} ${row.note}`.toLowerCase().includes(normalizedSearch)),
    [normalizedSearch, securityRows],
  )
  const filteredApiKeyRows = useMemo(
    () => apiKeyRows.filter((row) => !normalizedSearch || `${row.name} ${row.type} ${row.createdAt} ${row.lastUsed} ${row.status}`.toLowerCase().includes(normalizedSearch)),
    [apiKeyRows, normalizedSearch],
  )
  const filteredWebhookRows = useMemo(
    () => webhookRows.filter((row) => !normalizedSearch || `${row.direction} ${row.events} ${row.retry} ${row.status} ${row.note}`.toLowerCase().includes(normalizedSearch)),
    [normalizedSearch, webhookRows],
  )
  const filteredSdkRows = useMemo(
    () => sdkRows.filter((row) => !normalizedSearch || `${row.sdk} ${row.status} ${row.note}`.toLowerCase().includes(normalizedSearch)),
    [normalizedSearch, sdkRows],
  )

  const connectorCategories = useMemo<Array<{ key: ConnectorCategory | 'all'; label: string }>>(
    () => [
      { key: 'all', label: 'Toutes catégories' },
      { key: 'ERP', label: 'ERP' },
      { key: 'CRM', label: 'CRM' },
      { key: 'Cloud Storage', label: 'Cloud Storage' },
      { key: 'Collaboration', label: 'Collaboration' },
      { key: 'Office', label: 'Office' },
      { key: 'Business Intelligence', label: 'Business Intelligence' },
      { key: 'Communication', label: 'Communication' },
      { key: 'Industrial Systems', label: 'Industrial Systems' },
    ],
    [],
  )

  const filteredConnectorCards = useMemo(
    () => CONNECTOR_CARDS.filter((card) => {
      if (connectorCategory !== 'all' && card.category !== connectorCategory) return false
      if (!normalizedSearch) return true
      return `${card.name} ${card.category} ${card.description} ${card.readiness} ${card.integrationType}`.toLowerCase().includes(normalizedSearch)
    }),
    [connectorCategory, normalizedSearch],
  )

  const selectedConnector = useMemo(
    () => CONNECTOR_CARDS.find((card) => card.id === selectedConnectorId) ?? filteredConnectorCards.at(0),
    [filteredConnectorCards, selectedConnectorId],
  )

  const syncPreviewRows: SyncPreviewRow[] = [
    { item: 'Dernière synchronisation', value: 'Placeholder · 2026-08-02 11:20', note: 'Aucune synchronisation réelle active.' },
    { item: 'Synchronisation automatique', value: 'Placeholder · Off', note: 'Mode visuel sans job backend.' },
    { item: 'Synchronisation manuelle', value: 'Placeholder · Ready', note: 'Action simulée dans l’interface.' },
    { item: 'Journal des synchronisations', value: 'Placeholder · 24 événements', note: 'Historique simulé pour UX.' },
  ]

  const securityPlaceholderRows: SecurityPlaceholderRow[] = [
    { control: 'OAuth Ready', state: 'Placeholder', note: 'Flux OAuth non branché.' },
    { control: 'API Key Ready', state: 'Placeholder', note: 'Gestion de clés non branchée.' },
    { control: 'Webhook Ready', state: 'Placeholder', note: 'Callbacks non actifs.' },
    { control: 'SSO Ready', state: 'Placeholder', note: 'SSO enterprise non connecté.' },
    { control: 'Encryption Ready', state: 'Placeholder', note: 'Affichage only, pas de runtime cryptographique.' },
  ]

  const filteredSyncPreviewRows = syncPreviewRows.filter((row) => !normalizedSearch || `${row.item} ${row.value} ${row.note}`.toLowerCase().includes(normalizedSearch))

  const filteredSecurityPlaceholderRows = securityPlaceholderRows.filter((row) => !normalizedSearch || `${row.control} ${row.state} ${row.note}`.toLowerCase().includes(normalizedSearch))

  const readinessColumns: Array<DataTableColumn<ReadinessRow>> = [
    { key: 'item', label: 'Item', sortable: true },
    { key: 'value', label: 'Valeur', sortable: true },
    { key: 'status', label: 'Statut', sortable: true },
    { key: 'note', label: 'Note' },
  ]

  const moduleColumns: Array<DataTableColumn<TenantModuleRow>> = [
    { key: 'module', label: 'Module', sortable: true },
    { key: 'workspace', label: 'Workspace', sortable: true },
    { key: 'state', label: 'State', sortable: true },
    { key: 'note', label: 'Note' },
  ]

  const securityColumns: Array<DataTableColumn<SecurityRow>> = [
    { key: 'control', label: 'Control', sortable: true },
    { key: 'status', label: 'Statut', sortable: true },
    { key: 'note', label: 'Note' },
  ]

  const syncPreviewColumns: Array<DataTableColumn<SyncPreviewRow>> = [
    { key: 'item', label: 'Sync item', sortable: true },
    { key: 'value', label: 'Value', sortable: true },
    { key: 'note', label: 'Note' },
  ]

  const connectorSecurityColumns: Array<DataTableColumn<SecurityPlaceholderRow>> = [
    { key: 'control', label: 'Security control', sortable: true },
    { key: 'state', label: 'State', sortable: true },
    { key: 'note', label: 'Note' },
  ]

  const apiKeyColumns: Array<DataTableColumn<ApiKeyRow>> = [
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'createdAt', label: 'Créée le', sortable: true },
    { key: 'lastUsed', label: 'Dernière utilisation', sortable: true },
    { key: 'status', label: 'Statut', sortable: true },
  ]

  const webhookColumns: Array<DataTableColumn<WebhookRow>> = [
    { key: 'direction', label: 'Direction', sortable: true },
    { key: 'events', label: 'Events', sortable: true },
    { key: 'retry', label: 'Retry', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'note', label: 'Note' },
  ]

  const sdkColumns: Array<DataTableColumn<SdkRow>> = [
    { key: 'sdk', label: 'SDK', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'note', label: 'Note' },
  ]

  const persistEnterpriseConfiguration = () => {
    WorkspacePreferencesService.setFilters(ENTERPRISE_CONFIG_KEY, {
      name: enterpriseConfiguration.name,
      logo: enterpriseConfiguration.logo,
      timezone: enterpriseConfiguration.timezone,
      language: enterpriseConfiguration.language,
      currency: enterpriseConfiguration.currency,
      country: enterpriseConfiguration.country,
      industry: enterpriseConfiguration.industry,
      identifier: enterpriseConfiguration.identifier,
      plan: enterpriseConfiguration.plan,
      workspaceStatus: enterpriseConfiguration.workspaceStatus,
      createdAt: enterpriseConfiguration.createdAt,
      gatewayStatus: enterpriseConfiguration.gatewayStatus,
      apiVersion: enterpriseConfiguration.apiVersion,
      environment: enterpriseConfiguration.environment,
      baseUrl: enterpriseConfiguration.baseUrl,
      tenantEndpoint: enterpriseConfiguration.tenantEndpoint,
      healthStatus: enterpriseConfiguration.healthStatus,
      askSrgLanguage: enterpriseConfiguration.askSrgLanguage,
    })
    setPreferences(WorkspacePreferencesService.getPreferences())
    setStatus('Préparation enterprise enregistrée localement.')
    notificationService.publish({
      title: 'Enterprise configuration updated',
      message: `${enterpriseConfiguration.name} est prête pour le raccordement API et tenant.`,
      level: 'success',
      priority: 'medium',
      category: 'system',
      read: false,
      channels: ['email'],
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configurez les préférences persistées du workspace, les layouts et les paramètres d’affichage."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowNotificationCenter((current) => !current)}
              aria-expanded={showNotificationCenter}
              aria-controls="settings-notification-center"
            >
              Notifications
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const next = WorkspacePreferencesService.resetPreferences()
                setPreferences(next)
                setEnterpriseConfiguration(ENTERPRISE_DEFAULTS)
                theme.setMode(next.themeMode)
                setStatus('Préférences réinitialisées.')
                notificationService.publish({
                  title: 'Settings reset',
                  message: 'Les préférences et la préparation enterprise ont été réinitialisées.',
                  level: 'warning',
                  priority: 'medium',
                  category: 'system',
                  read: false,
                  channels: ['email'],
                })
              }}
            >
              Réinitialiser
            </Button>
          </div>
        }
      />

      {showNotificationCenter ? (
        <Section title="Notification Center" description="Retour visuel des changements de préparation enterprise.">
          <div id="settings-notification-center">
            <NotificationCenter
              notifications={notifications.notifications}
              onClose={() => setShowNotificationCenter(false)}
              onDismiss={notifications.dismiss}
              onClear={notifications.clear}
              onMarkRead={notifications.markRead}
              onMarkAllRead={notifications.markAllRead}
            />
          </div>
        </Section>
      ) : null}

      <Section title="Enterprise Search" description="Recherche transversale sur les surfaces API, tenant, sécurité et connecteurs.">
        <SearchBar
          value={search}
          onSearch={setSearch}
          onValueChange={setSearch}
          placeholder="Rechercher une configuration, un connecteur ou un statut"
          instant
          persistKey="settings-enterprise-readiness"
        />
      </Section>

      <Section title="Enterprise Configuration" description="Préparation visuelle de l’identité entreprise pour une architecture multi-entreprises.">
        <FormSection title="Configuration de l’entreprise" description="Aucune API, aucun backend, uniquement une configuration locale prête pour intégration.">
          <FieldGroup columns={2}>
            <SmartInputField
              id="settings-enterprise-name"
              label="Nom"
              value={enterpriseConfiguration.name}
              onValueChange={(value) => setEnterpriseConfiguration((current) => ({ ...current, name: value }))}
              placeholder="Nom de l'entreprise"
              required
              autosaveLabel="Local workspace preview"
            />
            <SmartInputField
              id="settings-enterprise-logo"
              label="Logo"
              value={enterpriseConfiguration.logo}
              onValueChange={(value) => setEnterpriseConfiguration((current) => ({ ...current, logo: value }))}
              placeholder="Logo placeholder"
              autosaveLabel="Placeholder only"
            />
            <Field label="Fuseau horaire" hint="Préparation UI uniquement.">
              <select
                value={enterpriseConfiguration.timezone}
                onChange={(event) => setEnterpriseConfiguration((current) => ({ ...current, timezone: event.target.value }))}
                aria-label="Fuseau horaire de l'entreprise"
              >
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="Africa/Casablanca">Africa/Casablanca</option>
                <option value="UTC">UTC</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
              </select>
            </Field>
            <Field label="Langue" hint="Préparation tenant locale.">
              <select
                value={enterpriseConfiguration.language}
                onChange={(event) => setEnterpriseConfiguration((current) => ({ ...current, language: event.target.value }))}
                aria-label="Langue de l'entreprise"
              >
                {LANGUAGE_OPTIONS.filter((option) => option !== 'Auto Detection').map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </Field>
            <Field label="Devise" hint="Affichage uniquement.">
              <select
                value={enterpriseConfiguration.currency}
                onChange={(event) => setEnterpriseConfiguration((current) => ({ ...current, currency: event.target.value }))}
                aria-label="Devise de l'entreprise"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="MAD">MAD</option>
              </select>
            </Field>
            <Field label="Pays" hint="Sans logique de localisation backend.">
              <select
                value={enterpriseConfiguration.country}
                onChange={(event) => setEnterpriseConfiguration((current) => ({ ...current, country: event.target.value }))}
                aria-label="Pays de l'entreprise"
              >
                <option value="France">France</option>
                <option value="Morocco">Morocco</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
              </select>
            </Field>
            <Field label="Secteur" hint="Segment enterprise visible dans l’UI.">
              <select
                value={enterpriseConfiguration.industry}
                onChange={(event) => setEnterpriseConfiguration((current) => ({ ...current, industry: event.target.value }))}
                aria-label="Secteur de l'entreprise"
              >
                <option value="Industrial Services">Industrial Services</option>
                <option value="Construction">Construction</option>
                <option value="Energy">Energy</option>
                <option value="Logistics">Logistics</option>
              </select>
            </Field>
          </FieldGroup>
          <FormToolbar autosaveLabel="Manual apply for UI readiness">
            <Button onClick={persistEnterpriseConfiguration}>Appliquer la configuration</Button>
            <Link to="/dashboard" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] no-underline">
              Voir le résumé dashboard
            </Link>
            <Link to="/profile" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] no-underline">
              Ouvrir Profile
            </Link>
          </FormToolbar>
          <ValidationMessage variant="hint">Tous les champs ci-dessus sont purement visuels et ne créent aucune isolation réelle.</ValidationMessage>
        </FormSection>
      </Section>

      <Section title="Enterprise Workspace" description="Fondation visuelle du workspace enterprise actif avant activation réelle du multi-tenant.">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {enterpriseWorkspaceRows.map((row) => (
            <article key={row.item} className="rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 shadow-[var(--srg-shadow-sm)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{row.item}</p>
              <p className="mt-2 text-sm font-semibold text-[var(--srg-text-title)]">{row.value}</p>
              <p className="mt-2 text-xs text-[var(--srg-text-muted)]">{row.status}</p>
            </article>
          ))}
        </div>
        <div className="mt-4">
          <FormSection title="Workspace foundation" description="Entreprise active, identifiant, plan, statut et date de création en mode préparation.">
            <FieldGroup columns={3}>
              <SmartInputField
                id="settings-enterprise-identifier"
                label="Identifiant"
                value={enterpriseConfiguration.identifier}
                onValueChange={(value) => setEnterpriseConfiguration((current) => ({ ...current, identifier: value }))}
                placeholder="tenant-srg-industries-holding"
                autosaveLabel="Placeholder only"
              />
              <SmartInputField
                id="settings-enterprise-plan"
                label="Plan"
                value={enterpriseConfiguration.plan}
                onValueChange={(value) => setEnterpriseConfiguration((current) => ({ ...current, plan: value }))}
                placeholder="Enterprise Unlimited"
                autosaveLabel="Placeholder only"
              />
              <Field label="Statut" hint="Préparation UI uniquement.">
                <select
                  value={enterpriseConfiguration.workspaceStatus}
                  onChange={(event) => setEnterpriseConfiguration((current) => ({ ...current, workspaceStatus: event.target.value }))}
                  aria-label="Statut du workspace enterprise"
                >
                  <option value="Prepared">Prepared</option>
                  <option value="Preview Ready">Preview Ready</option>
                  <option value="Pending Backend">Pending Backend</option>
                </select>
              </Field>
              <SmartInputField
                id="settings-enterprise-created-at"
                label="Date de création"
                value={enterpriseConfiguration.createdAt}
                onValueChange={(value) => setEnterpriseConfiguration((current) => ({ ...current, createdAt: value }))}
                placeholder="2026-08-02"
                autosaveLabel="Placeholder only"
              />
            </FieldGroup>
          </FormSection>
        </div>
        <div className="mt-4">
          <DataTable
            tableId="settings-enterprise-workspace"
            title="Enterprise workspace details"
            rows={filteredEnterpriseWorkspaceRows}
            columns={readinessColumns}
            pageSize={8}
            exportFileName="srg-settings-enterprise-workspace.csv"
          />
        </div>
      </Section>

      <Section title="API Gateway" description="Vue de préparation de la gateway SRG côté UI, sans endpoint ni runtime actif.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {apiGatewayRows.map((row) => (
            <article key={row.item} className="rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5 shadow-[var(--srg-shadow-sm)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{row.item}</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{row.value}</p>
              <p className="mt-2 text-sm text-[var(--srg-text-muted)]">{row.note}</p>
            </article>
          ))}
        </div>
        <div className="mt-4">
          <FormSection title="Gateway configuration" description="Status, version, environnement, base URL, tenant endpoint et health status placeholders.">
            <FieldGroup columns={3}>
              <Field label="Gateway Status" hint="Aucune gateway réelle.">
                <select
                  value={enterpriseConfiguration.gatewayStatus}
                  onChange={(event) => setEnterpriseConfiguration((current) => ({ ...current, gatewayStatus: event.target.value }))}
                  aria-label="Gateway status"
                >
                  <option value="Preview Ready">Preview Ready</option>
                  <option value="Prepared">Prepared</option>
                  <option value="Pending Backend">Pending Backend</option>
                </select>
              </Field>
              <SmartInputField
                id="settings-api-version"
                label="API Version"
                value={enterpriseConfiguration.apiVersion}
                onValueChange={(value) => setEnterpriseConfiguration((current) => ({ ...current, apiVersion: value }))}
                placeholder="v1-placeholder"
                autosaveLabel="Display only"
              />
              <Field label="Environment" hint="Préparation sans environnement réel.">
                <select
                  value={enterpriseConfiguration.environment}
                  onChange={(event) => setEnterpriseConfiguration((current) => ({ ...current, environment: event.target.value }))}
                  aria-label="API gateway environment"
                >
                  <option value="Staging Preview">Staging Preview</option>
                  <option value="Production Placeholder">Production Placeholder</option>
                  <option value="Sandbox Placeholder">Sandbox Placeholder</option>
                </select>
              </Field>
              <SmartInputField
                id="settings-api-base-url"
                label="Base URL"
                value={enterpriseConfiguration.baseUrl}
                onValueChange={(value) => setEnterpriseConfiguration((current) => ({ ...current, baseUrl: value }))}
                placeholder="https://gateway.srg.placeholder/api"
                autosaveLabel="Display only"
              />
              <SmartInputField
                id="settings-api-tenant-endpoint"
                label="Tenant Endpoint"
                value={enterpriseConfiguration.tenantEndpoint}
                onValueChange={(value) => setEnterpriseConfiguration((current) => ({ ...current, tenantEndpoint: value }))}
                placeholder="/tenants/{tenantId}/workspace"
                autosaveLabel="Display only"
              />
              <Field label="Health Status" hint="Health placeholder uniquement.">
                <select
                  value={enterpriseConfiguration.healthStatus}
                  onChange={(event) => setEnterpriseConfiguration((current) => ({ ...current, healthStatus: event.target.value }))}
                  aria-label="API gateway health status"
                >
                  <option value="Healthy Placeholder">Healthy Placeholder</option>
                  <option value="Monitoring Pending">Monitoring Pending</option>
                  <option value="No Runtime">No Runtime</option>
                </select>
              </Field>
            </FieldGroup>
          </FormSection>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <DataTable
            tableId="settings-enterprise-api-gateway"
            title="API gateway details"
            rows={filteredApiGatewayRows}
            columns={readinessColumns}
            pageSize={8}
            exportFileName="srg-settings-api-gateway.csv"
          />
          <DataTable
            tableId="settings-enterprise-modules"
            title="Modules activés"
            rows={filteredEnterpriseModules}
            columns={moduleColumns}
            pageSize={8}
            exportFileName="srg-settings-enterprise-modules.csv"
          />
        </div>
      </Section>

      <Section title="Tenant Isolation" description="Préparation visuelle de l’isolation multi-tenant, sans séparation technique active.">
        <div className="mt-1">
          <DataTable
            tableId="settings-enterprise-tenant-isolation"
            title="Tenant isolation readiness"
            rows={filteredTenantIsolationRows}
            columns={readinessColumns}
            pageSize={8}
            exportFileName="srg-settings-tenant-isolation.csv"
          />
        </div>
      </Section>

      <Section title="Ask SRG" description="Carte de préparation conversationnelle enterprise, sans API, sans mémoire runtime et sans voix active.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredAskSrgRows.map((row) => (
            <article key={row.item} className="rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-sm)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{row.item}</p>
              <p className="mt-2 text-lg font-semibold text-[var(--srg-text-title)]">{row.value}</p>
              <p className="mt-3 text-sm text-[var(--srg-text-muted)]">{row.note}</p>
            </article>
          ))}
        </div>
        <div className="mt-4">
          <FormSection title="Language" description="Configuration multilingue d’Ask SRG en mode préparation.">
            <FieldGroup columns={2}>
              <Field label="Détection / Langue active" hint="Configuration uniquement locale.">
                <select
                  value={enterpriseConfiguration.askSrgLanguage}
                  onChange={(event) => setEnterpriseConfiguration((current) => ({ ...current, askSrgLanguage: event.target.value }))}
                  aria-label="Configuration linguistique Ask SRG"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </Field>
              <div className="rounded-[1.5rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
                <p className="text-sm font-semibold text-[var(--srg-text-title)]">Langues préparées</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((option) => (
                    <span key={option} className="rounded-full border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-1 text-xs font-semibold text-[var(--srg-text-muted)]">
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            </FieldGroup>
            <ValidationMessage variant="hint">Ask SRG détectera automatiquement la langue des messages et des documents.</ValidationMessage>
          </FormSection>
        </div>
      </Section>

      <Section title="API Keys" description="Table de préparation des clés d’accès côté UI uniquement.">
        <DataTable
          tableId="settings-enterprise-api-keys"
          title="API keys placeholder"
          rows={filteredApiKeyRows}
          columns={apiKeyColumns}
          pageSize={8}
          exportFileName="srg-settings-api-keys.csv"
        />
      </Section>

      <Section title="Webhooks" description="Incoming, outgoing, events, retry et status en mode placeholder.">
        <DataTable
          tableId="settings-enterprise-webhooks"
          title="Webhook readiness"
          rows={filteredWebhookRows}
          columns={webhookColumns}
          pageSize={8}
          exportFileName="srg-settings-webhooks.csv"
        />
      </Section>

      <Section title="SDK" description="Préparation des SDK sans distribution réelle.">
        <DataTable
          tableId="settings-enterprise-sdk"
          title="SDK readiness"
          rows={filteredSdkRows}
          columns={sdkColumns}
          pageSize={8}
          exportFileName="srg-settings-sdk.csv"
        />
      </Section>

      <Section title="Security" description="Placeholders de sécurité avant activation backend, auth et audit.">
        <div className="mt-1">
          <DataTable
            tableId="settings-enterprise-security"
            title="Security readiness"
            rows={filteredSecurityRows}
            columns={securityColumns}
            pageSize={8}
            exportFileName="srg-settings-security-readiness.csv"
          />
        </div>
      </Section>

      <Section title="Enterprise Connectors" description="Hub de préparation UI/UX pour les intégrations enterprise sans connecteur réel.">
        <FormSection title="Categories" description="ERP, CRM, Cloud Storage, Collaboration, Office, BI, Communication, Industrial Systems.">
          <FieldGroup columns={3}>
            <Field label="Catégorie" hint="Filtre visuel des connecteurs.">
              <select
                value={connectorCategory}
                onChange={(event) => setConnectorCategory(event.target.value as ConnectorCategory | 'all')}
                aria-label="Filtrer les connecteurs par catégorie"
              >
                {connectorCategories.map((category) => (
                  <option key={category.key} value={category.key}>{category.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Connecteur sélectionné" hint="Panneau de détails à droite.">
              <select
                value={selectedConnector?.id ?? ''}
                onChange={(event) => setSelectedConnectorId(event.target.value)}
                aria-label="Sélectionner un connecteur"
              >
                {filteredConnectorCards.map((connector) => (
                  <option key={connector.id} value={connector.id}>{connector.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Actions" hint="Aucune synchronisation réelle.">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    notificationService.publish({
                      title: 'Connector selection updated',
                      message: `${selectedConnector?.name ?? 'Connecteur'} est prêt pour intégration future.`,
                      level: 'info',
                      priority: 'low',
                      category: 'system',
                      read: false,
                      channels: ['email'],
                    })
                  }}
                >
                  Préparer
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </FormSection>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredConnectorCards.map((connector) => (
            <article
              key={connector.id}
              className={`rounded-[1.75rem] border p-5 shadow-[var(--srg-shadow-sm)] ${selectedConnector?.id === connector.id ? 'border-[var(--srg-color-primary-400)] bg-[var(--srg-surface)]' : 'border-[var(--srg-border)] bg-[var(--srg-surface)]'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{connector.category}</p>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--srg-text-title)]">{connector.name}</h3>
                </div>
                <span className="rounded-full border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--srg-text-muted)]" aria-hidden>
                  {connector.icon}
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--srg-text-muted)]">{connector.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--srg-text-muted)]">
                  {connector.status}
                </span>
                <span className="rounded-full border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--srg-text-muted)]">
                  {connector.readiness}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedConnectorId(connector.id)}
                className="mt-4 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--srg-text-title)]"
                aria-label={`Afficher les détails de ${connector.name}`}
              >
                Voir détails
              </button>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Connector Details" description="Description, cas d’usage, données concernées, type d’intégration, version et documentation placeholder.">
        {selectedConnector ? (
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{selectedConnector.category}</p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{selectedConnector.name}</h3>
              <p className="mt-3 text-sm text-[var(--srg-text-muted)]">{selectedConnector.description}</p>
              <div className="mt-4 grid gap-2 text-sm text-[var(--srg-text-muted)]">
                <p><strong className="text-[var(--srg-text-title)]">Type d'intégration:</strong> {selectedConnector.integrationType}</p>
                <p><strong className="text-[var(--srg-text-title)]">Version:</strong> {selectedConnector.version}</p>
                <p><strong className="text-[var(--srg-text-title)]">Documentation:</strong> {selectedConnector.documentation}</p>
              </div>
            </article>
            <article className="rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5">
              <p className="text-sm font-semibold text-[var(--srg-text-title)]">Cas d’usage</p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--srg-text-muted)]">
                {selectedConnector.useCases.map((useCase) => <li key={useCase}>{useCase}</li>)}
              </ul>
              <p className="mt-5 text-sm font-semibold text-[var(--srg-text-title)]">Données concernées</p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--srg-text-muted)]">
                {selectedConnector.dataScope.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          </div>
        ) : null}
      </Section>

      <Section title="Sync Preview" description="Prévisualisation du cycle de synchronisation des connecteurs en mode placeholder.">
        <DataTable
          tableId="settings-connectors-sync-preview"
          title="Synchronization preview"
          rows={filteredSyncPreviewRows}
          columns={syncPreviewColumns}
          pageSize={8}
          exportFileName="srg-connectors-sync-preview.csv"
        />
      </Section>

      <Section title="Connectors Security" description="Contrôles de sécurité de connecteurs en état placeholder.">
        <DataTable
          tableId="settings-connectors-security"
          title="Connector security readiness"
          rows={filteredSecurityPlaceholderRows}
          columns={connectorSecurityColumns}
          pageSize={8}
          exportFileName="srg-connectors-security.csv"
        />
      </Section>

      <Section title="Workspace shell" description="Sidebar, thème et dernière page ouverte.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-title)]">
            <span className="mb-3 block font-semibold">Sidebar</span>
            <span className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.sidebarOpen}
                onChange={(event) => syncPreferences((current) => ({ ...current, sidebarOpen: event.target.checked }), 'Préférence de sidebar enregistrée.')}
              />
              <span>{preferences.sidebarOpen ? 'Ouverte' : 'Réduite'}</span>
            </span>
          </label>

          <label className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-title)]">
            <span className="mb-3 block font-semibold">Thème</span>
            <select
              value={theme.mode}
              onChange={(event) => {
                theme.setMode(event.target.value as 'light' | 'dark' | 'system')
                setPreferences(WorkspacePreferencesService.getPreferences())
                setStatus('Préférence de thème enregistrée.')
              }}
              className="w-full rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </label>

          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-title)]">
            <span className="mb-3 block font-semibold">Dernière page</span>
            <p className="text-[var(--srg-text-muted)]">{preferences.recentPage}</p>
          </div>

          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-title)]">
            <span className="mb-3 block font-semibold">Notifications</span>
            <p className="text-[var(--srg-text-muted)]">{notifications.notifications.filter((item) => !item.read).length} non lue(s)</p>
          </div>
        </div>
      </Section>

      <Section title="AI defaults" description="Provider et modèle favoris réutilisés dans les workspaces.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-[var(--srg-text-title)]">
            <span className="font-semibold">Provider favori</span>
            <select
              value={preferences.favoriteProvider}
              onChange={(event) => syncPreferences((current) => ({ ...current, favoriteProvider: event.target.value }), 'Provider favori mis à jour.')}
              className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="azure-openai">Azure OpenAI</option>
              <option value="cohere">Cohere</option>
              <option value="mock">Mock</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm text-[var(--srg-text-title)]">
            <span className="font-semibold">Modèle favori</span>
            <input
              value={preferences.favoriteModel}
              onChange={(event) => syncPreferences((current) => ({ ...current, favoriteModel: event.target.value }), 'Modèle favori mis à jour.')}
              className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3"
            />
          </label>
        </div>
      </Section>

      <Section title="Layouts et tables" description="Vue, taille des tableaux, tri et colonnes visibles persistés côté application.">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5">
            <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Layouts</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                { id: 'projects', label: 'Projects' },
                { id: 'prompt-templates', label: 'Templates' },
                { id: 'history', label: 'History' },
                { id: 'providers', label: 'Providers' },
              ].map((item) => (
                <label key={item.id} className="grid gap-2 text-sm text-[var(--srg-text-title)]">
                  <span className="font-semibold">{item.label}</span>
                  <select
                    value={preferences.pageLayouts[item.id] ?? 'grid'}
                    onChange={(event) => syncPreferences((current) => ({
                      ...current,
                      pageLayouts: { ...current.pageLayouts, [item.id]: event.target.value },
                    }), `Layout ${item.label} enregistré.`)}
                    className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3"
                  >
                    <option value="grid">Grid</option>
                    <option value="list">List</option>
                    <option value="split">Split</option>
                  </select>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5">
            <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Tables</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                { id: 'history', label: 'History size' },
                { id: 'providers', label: 'Providers size' },
                { id: 'notifications', label: 'Notifications size' },
                { id: 'sessions', label: 'Sessions size' },
              ].map((item) => (
                <label key={item.id} className="grid gap-2 text-sm text-[var(--srg-text-title)]">
                  <span className="font-semibold">{item.label}</span>
                  <input
                    type="number"
                    min={3}
                    max={50}
                    value={preferences.tableSizes[item.id] ?? 8}
                    onChange={(event) => syncPreferences((current) => ({
                      ...current,
                      tableSizes: { ...current.tableSizes, [item.id]: Number(event.target.value) },
                    }), `Taille ${item.label} enregistrée.`)}
                    className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Enterprise Navigation" description="Raccourcis vers les surfaces auditées pour la préparation multi-entreprises.">
        <div className="flex flex-wrap gap-2">
          <Link to="/administration" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] no-underline">Administration</Link>
          <Link to="/dashboard" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] no-underline">Dashboard</Link>
          <Link to="/enterprise-insights" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] no-underline">Enterprise Insights</Link>
          <Link to="/strategic-advisor" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] no-underline">Strategic Advisor</Link>
          <Link to="/workflow-automation" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] no-underline">Workflow Automation</Link>
          <Link to="/knowledge-intelligence" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] no-underline">Knowledge Intelligence</Link>
          <Link to="/profile" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] no-underline">Profile</Link>
          <Link to="/" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] no-underline">Home</Link>
        </div>
      </Section>

      <Section title="Colonnes, tri et filtres" description="Aperçu des préférences enregistrées par workspace.">
        {Object.keys(preferences.sorts).length === 0 && Object.keys(preferences.filters).length === 0 ? (
          <EmptyState
            eyebrow="Préférences"
            illustration={<span aria-hidden>☰</span>}
            title="Aucune préférence avancée enregistrée"
            description="Les tris, filtres et colonnes visibles apparaîtront ici dès qu’une page les persiste."
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5">
              <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Tris</h3>
              <pre className="mt-4 whitespace-pre-wrap break-words text-xs text-[var(--srg-text-muted)]">{JSON.stringify(preferences.sorts, null, 2)}</pre>
            </div>
            <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5">
              <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Filtres</h3>
              <pre className="mt-4 whitespace-pre-wrap break-words text-xs text-[var(--srg-text-muted)]">{JSON.stringify(preferences.filters, null, 2)}</pre>
            </div>
            <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5">
              <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Colonnes visibles</h3>
              <pre className="mt-4 whitespace-pre-wrap break-words text-xs text-[var(--srg-text-muted)]">{JSON.stringify(preferences.visibleColumns, null, 2)}</pre>
            </div>
          </div>
        )}
      </Section>

      {status ? <p className="text-sm text-[var(--srg-text-muted)]">{status}</p> : null}
    </div>
  )
}
