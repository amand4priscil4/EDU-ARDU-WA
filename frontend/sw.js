// Service Worker para Edu-Ardu PWA
// Versão: 1.0.0

const CACHE_NAME = 'edu-ardu-v1.0.0';
const API_CACHE_NAME = 'edu-ardu-api-v1.0.0';

// Arquivos essenciais para cache
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/images/edu-ardu-logo.png',
  '/images/fallback-logo.png'
];

// URLs da API para cache
const API_URLS = [
  '/api/lessons',
  '/api/health'
];

// ===== INSTALAÇÃO DO SERVICE WORKER =====
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cache dos assets estáticos
      caches.open(CACHE_NAME).then((cache) => {
        console.log('📦 Service Worker: Cacheando assets estáticos');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, {
          cache: 'no-cache'
        })));
      }).catch((error) => {
        console.warn('⚠️ Service Worker: Erro ao cachear assets:', error);
      }),
      
      // Cache das APIs (opcional)
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('🌐 Service Worker: Preparando cache da API');
        return Promise.allSettled(
          API_URLS.map(url => 
            fetch(url)
              .then(response => response.ok ? cache.put(url, response.clone()) : null)
              .catch(() => null) // Ignora erros de API durante instalação
          )
        );
      })
    ]).then(() => {
      console.log('✅ Service Worker: Instalação completa');
      // Força ativação imediata
      return self.skipWaiting();
    })
  );
});

// ===== ATIVAÇÃO DO SERVICE WORKER =====
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Ativando...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== CACHE_NAME && 
              cacheName !== API_CACHE_NAME &&
              cacheName.startsWith('edu-ardu-')
            )
            .map(cacheName => {
              console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Assumir controle de todas as abas
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker: Ativação completa');
    })
  );
});

// ===== INTERCEPTAÇÃO DE REQUISIÇÕES =====
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Apenas interceptar requisições do mesmo domínio
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Estratégia baseada no tipo de requisição
  if (request.url.includes('/api/')) {
    // Requisições da API: Network First com fallback para cache
    event.respondWith(handleApiRequest(request));
  } else if (request.destination === 'document') {
    // Páginas HTML: Network First com fallback para cache
    event.respondWith(handlePageRequest(request));
  } else {
    // Assets estáticos: Cache First com fallback para network
    event.respondWith(handleStaticRequest(request));
  }
});

// ===== ESTRATÉGIAS DE CACHE =====

/**
 * Gerencia requisições da API - Network First
 */
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Tenta buscar da rede primeiro
    const networkResponse = await fetch(request.clone());
    
    if (networkResponse.ok) {
      // Se sucesso, atualiza o cache
      cache.put(request, networkResponse.clone());
      console.log('🌐 Service Worker: API response da rede:', request.url);
      return networkResponse;
    } else {
      throw new Error(`HTTP ${networkResponse.status}`);
    }
  } catch (error) {
    console.warn('⚠️ Service Worker: Rede falhou, tentando cache:', error.message);
    
    // Se rede falhar, tenta o cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📦 Service Worker: API response do cache:', request.url);
      return cachedResponse;
    }
    
    // Se não há cache, retorna resposta de fallback
    if (request.url.includes('/api/lessons')) {
      return new Response(JSON.stringify({
        success: false,
        data: [],
        message: 'Dados não disponíveis offline',
        offline: true
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Para outras APIs, retorna erro padrão
    return new Response(JSON.stringify({
      success: false,
      message: 'Serviço não disponível offline',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Gerencia requisições de páginas - Network First
 */
async function handlePageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Tenta buscar da rede primeiro
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Atualiza cache apenas para a página principal
      if (request.url === self.location.origin + '/') {
        cache.put(request, networkResponse.clone());
      }
      console.log('🌐 Service Worker: Página da rede:', request.url);
      return networkResponse;
    } else {
      throw new Error(`HTTP ${networkResponse.status}`);
    }
  } catch (error) {
    console.warn('⚠️ Service Worker: Rede falhou para página, tentando cache:', error.message);
    
    // Se rede falhar, tenta o cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📦 Service Worker: Página do cache:', request.url);
      return cachedResponse;
    }
    
    // Fallback para página principal
    const indexResponse = await cache.match('/');
    if (indexResponse) {
      console.log('📦 Service Worker: Fallback para página principal');
      return indexResponse;
    }
    
    // Se nada funcionar, retorna página de erro offline
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Edu-Ardu - Offline</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #0066CC 0%, #003d7a 100%);
            color: white;
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 20px;
          }
          .container {
            max-width: 400px;
          }
          h1 { color: #FF6B35; margin-bottom: 20px; }
          button {
            background: #FF6B35;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
          }
          button:hover { background: #e55a2b; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🤖 Edu-Ardu</h1>
          <h2>Você está offline</h2>
          <p>Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.</p>
          <button onclick="window.location.reload()">Tentar Novamente</button>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

/**
 * Gerencia requisições de assets estáticos - Cache First
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Tenta buscar do cache primeiro
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('📦 Service Worker: Asset do cache:', request.url);
    return cachedResponse;
  }
  
  try {
    // Se não há cache, busca da rede
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cacheia para uso futuro
      cache.put(request, networkResponse.clone());
      console.log('🌐 Service Worker: Asset da rede (novo):', request.url);
      return networkResponse;
    } else {
      throw new Error(`HTTP ${networkResponse.status}`);
    }
  } catch (error) {
    console.warn('⚠️ Service Worker: Asset não disponível:', request.url, error.message);
    
    // Para imagens, retorna uma imagem placeholder
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' +
        '<rect width="200" height="200" fill="#f0f0f0"/>' +
        '<text x="100" y="100" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="14" fill="#999">' +
        'Imagem não disponível' +
        '</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    // Para outros assets, retorna erro 404
    return new Response('Asset não encontrado', { status: 404 });
  }
}

// ===== MENSAGENS DO CLIENTE =====
self.addEventListener('message', (event) => {
  const { data } = event;
  
  if (data && data.type === 'SKIP_WAITING') {
    console.log('📲 Service Worker: Solicitação de atualização recebida');
    self.skipWaiting();
  }
  
  if (data && data.type === 'CACHE_URLS') {
    console.log('📦 Service Worker: Solicitação de cache personalizado');
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(data.urls || []);
      })
    );
  }
});

// ===== SYNC BACKGROUND =====
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Service Worker: Background sync executado');
    event.waitUntil(
      // Aqui você pode implementar sincronização de dados quando voltar online
      Promise.resolve()
    );
  }
});

// ===== NOTIFICAÇÕES PUSH =====
self.addEventListener('push', (event) => {
  console.log('📲 Service Worker: Push notification recebida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível!',
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/icon-72x72.png',
    tag: 'edu-ardu-notification',
    actions: [
      {
        action: 'open',
        title: 'Abrir App'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Edu-Ardu', options)
  );
});

// ===== CLIQUE EM NOTIFICAÇÃO =====
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Service Worker: Clique em notificação');
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('🔧 Service Worker: Registrado e pronto!');