export type AppNavItem = {
  id: string
  title: string
  description: string
  path: string
  icon: string
}

export const navItems: AppNavItem[] = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'Manage account profile, password, and connected devices.',
    path: '/profile',
    icon: '👤',
  },
  {
    id: 'auth',
    title: 'Authentication',
    description: 'Register accounts, login, OTP, and device sessions.',
    path: '/auth',
    icon: '🔐',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Overview of SRG activity and health.',
    path: '/dashboard',
    icon: '📊',
  },
  {
    id: 'projects',
    title: 'Projects',
    description: 'Manage your workspaces and tasks.',
    path: '/projects',
    icon: '🗂️',
  },
  {
    id: 'knowledge-center',
    title: 'Knowledge Center',
    description: 'Browse documentation and reference guides.',
    path: '/knowledge-center',
    icon: '📚',
  },
  {
    id: 'prompt-studio',
    title: 'Prompt Studio',
    description: 'Build and refine prompts for your agents.',
    path: '/prompt-studio',
    icon: '🎯',
  },
  {
    id: 'prompt-templates',
    title: 'Prompt Templates',
    description: 'Manage reusable template library and publishing workflows.',
    path: '/prompt-templates',
    icon: '🧩',
  },
  {
    id: 'generate',
    title: 'Generate',
    description: 'Create content and code with AI.',
    path: '/generate',
    icon: '✨',
  },
  {
    id: 'providers',
    title: 'Providers',
    description: 'Configure AI providers and endpoints.',
    path: '/providers',
    icon: '🔌',
  },
  {
    id: 'history',
    title: 'History',
    description: 'Track past requests and outputs.',
    path: '/history',
    icon: '🕘',
  },
  {
    id: 'observability',
    title: 'Observability',
    description: 'Monitor logs, metrics, and diagnostics.',
    path: '/observability',
    icon: '📈',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Customize your workspace and preferences.',
    path: '/settings',
    icon: '⚙️',
  },
  {
    id: 'administration',
    title: 'Administration',
    description: 'Manage access, security, and governance.',
    path: '/administration',
    icon: '🛡️',
  },
]
