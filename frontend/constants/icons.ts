/**
 * Icon mapping from lucide-react to @expo/vector-icons (Feather set)
 * Feather icons share the same design language as Lucide (Lucide is a Feather fork).
 */

export const IconMap = {
  // Index page
  FileText: 'file-text',
  Upload: 'upload',
  Link2: 'link-2',
  ArrowRight: 'arrow-right',
  Sparkles: 'star',       // closest match
  TrendingDown: 'trending-down',
  Fuel: 'droplet',        // closest match
  CloudRain: 'cloud-rain',

  // Process page
  Search: 'search',
  Lightbulb: 'sun',       // closest to lightbulb
  Zap: 'zap',
  Target: 'target',
  Rocket: 'send',         // closest to rocket
  BarChart3: 'bar-chart-2',
  Check: 'check',
  ChevronRight: 'chevron-right',
  Terminal: 'terminal',

  // Results page
  AlertTriangle: 'alert-triangle',
  Play: 'play',
  Download: 'download',
  ChevronDown: 'chevron-down',
  Activity: 'activity',

  // Simulation page
  ArrowUpRight: 'arrow-up-right',
  Video: 'video',
  RotateCw: 'rotate-cw',
  TrendingUp: 'trending-up',

  // Bottom Nav
  Home: 'home',
  Cpu: 'cpu',

  // Common
  X: 'x',
} as const;
