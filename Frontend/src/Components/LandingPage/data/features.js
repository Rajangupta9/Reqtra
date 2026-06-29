import ApiIcon from '@mui/icons-material/Api';
import HubIcon from '@mui/icons-material/Hub';
import CableIcon from '@mui/icons-material/Cable';
import TuneIcon from '@mui/icons-material/Tune';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import CodeIcon from '@mui/icons-material/Code';

export const featureCards = [
  {
    icon: ApiIcon,
    title: 'REST API Testing',
    description: 'Build, send, and debug HTTP requests with an intuitive interface. Support for all methods, headers, auth, and body types.',
    gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)',
  },
  {
    icon: HubIcon,
    title: 'GraphQL Support',
    description: 'First-class GraphQL client with schema explorer, auto-complete, variables panel, and query history.',
    gradient: 'linear-gradient(135deg, #E535AB, #A855F7)',
  },
  {
    icon: CableIcon,
    title: 'WebSocket Client',
    description: 'Real-time WebSocket testing with message history, auto-reconnect, and binary data support.',
    gradient: 'linear-gradient(135deg, #22C55E, #10B981)',
  },
  {
    icon: TuneIcon,
    title: 'Environment Variables',
    description: 'Manage multiple environments with variable scoping, secrets encryption, and dynamic values.',
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
  },
  {
    icon: FolderCopyIcon,
    title: 'Collections',
    description: 'Organize requests into collections and folders. Import/export Postman, Insomnia, and OpenAPI specs.',
    gradient: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
  },
  {
    icon: CodeIcon,
    title: 'Code Generation',
    description: 'Generate production-ready code in 15+ languages. cURL, JavaScript, Python, Go, Rust, and more.',
    gradient: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
  },
];

export const powerFeatures = [
  { icon: '🕐', title: 'Request History', description: 'Full history with search, filter, and replay capabilities.' },
  { icon: '✂️', title: 'Code Snippets', description: 'Save and reuse code snippets across requests.' },
  { icon: '🔤', title: 'Variables', description: 'Global, collection, and environment variable scoping.' },
  { icon: '🔐', title: 'Authorization', description: 'OAuth 2.0, Bearer, API Key, JWT, Basic Auth support.' },
  { icon: '📁', title: 'File Upload', description: 'Multipart form data with drag-and-drop file upload.' },
  { icon: '🍪', title: 'Cookie Manager', description: 'Automatic cookie handling with domain management.' },
  { icon: '🔍', title: 'Response Inspector', description: 'JSON viewer, HTML preview, image viewer, and hex dump.' },
  { icon: '📊', title: 'Performance Metrics', description: 'DNS, TLS, connect, TTFB, and total time breakdown.' },
  { icon: '⌨️', title: 'CLI Support', description: 'Run collections from the terminal in CI/CD pipelines.' },
  { icon: '🌙', title: 'Dark Theme', description: 'Beautiful dark mode with customizable editor themes.' },
  { icon: '🧩', title: 'Plugin System', description: 'Extend functionality with community and custom plugins.' },
  { icon: '👥', title: 'Team Collaboration', description: 'Real-time sync, comments, and shared workspaces.' },
];

export const dashboardFeatures = {
  protocols: [
    'REST APIs',
    'GraphQL',
    'gRPC',
    'WebSocket',
    'HTTP/2',
  ],
  auth: [
    'OAuth 2.0',
    'Bearer Tokens',
    'API Keys',
    'JWT',
    'Basic Auth',
  ],
  features: [
    'Collections',
    'Environment Variables',
    'Mock Servers',
    'API Documentation',
    'Test Runner',
  ],
};

export const workflowSteps = [
  {
    step: 1,
    title: 'Create Request',
    description: 'Choose your method, enter the URL, and configure headers, params, and body.',
  },
  {
    step: 2,
    title: 'Test API',
    description: 'Send requests and inspect responses with our powerful response inspector.',
  },
  {
    step: 3,
    title: 'Save Collection',
    description: 'Organize requests into collections and folders for easy access.',
  },
  {
    step: 4,
    title: 'Generate Documentation',
    description: 'Auto-generate beautiful API documentation from your collections.',
  },
  {
    step: 5,
    title: 'Share With Team',
    description: 'Invite teammates, sync in real-time, and collaborate effortlessly.',
  },
];

export const statistics = [
  { value: 1000000, suffix: '+', label: 'API Requests', prefix: '' },
  { value: 100000, suffix: '+', label: 'Developers', prefix: '' },
  { value: 99.99, suffix: '%', label: 'Uptime', prefix: '' },
  { value: 30, suffix: 'ms', label: 'Avg Response', prefix: '<' },
];
