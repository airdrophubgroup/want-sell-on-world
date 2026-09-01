import { MiniKit, Tokens, tokenToDecimals } from "https://cdn.jsdelivr.net/npm/@worldcoin/minikit-js@1.9.6/+esm";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = 'https://adicdkrfinbudpaqqjai.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkaWNka3JmaW5idWRwYXFxamFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxNzM4MzMsImV4cCI6MjEwMTc0OTgzM30.ksv1zdQVimQTNWnrHaRqEXcLw7-3G6_zjAyEOZZkr0s';
const ADMIN_WALLET = '0x8c5b20653abcb87f6b3a7cb469d8623e94bfb6a1';
const APP_ID = 'app_06db98c492a19f80177b8d633f056982';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// LOCALIZATION
// ==========================================
const LOCALES = {
  en: {
    appName: 'WantSell', subtitle: 'Buy and sell items near you', connectWallet: 'Connect Wallet',
    postAd: 'Post Ad', myAds: 'My Ads', profile: 'Profile',
    exploreListings: 'Explore Listings', searchAds: 'Search ads...', radius: 'Radius',
    allCountries: 'All Countries', allCategories: 'All Categories',
    localMarketplace: 'Local Marketplace', marketplaceDesc: 'Buy and sell items near you. 1 WLD per listing.',
    perAd: '1 WLD per ad', earnSow: 'Earn SOW coins',
    postNewAd: 'Post a New Ad', productTitle: 'Product Title', titlePlaceholder: 'e.g. iPhone 15 Pro Max',
    category: 'Category', selectCategory: 'Select Category',
    countryRegion: 'Country / Region', selectCountry: 'Select Country',
    location: 'Location', tapDetect: 'Tap Detect GPS or type location', detectGps: 'Detect GPS',
    condition: 'Condition', brandNew: 'Brand New', likeNew: 'Like New',
    good: 'Good', fair: 'Fair', used: 'Used',
    priceType: 'Price Type', selectPriceType: 'Price Type',
    negotiable: 'Negotiable', fixedPrice: 'Fixed Price',
    description: 'Description', describeItem: 'Describe your item...',
    priceWld: 'Price (WLD)', photosMax: 'Photos (max 4)', postAdBtn: 'Post Ad (1 WLD)',
    back: 'Back', loading: 'Loading...', noListings: 'No active listings found.',
    networkError: 'Network error. Please check your connection and try again.',
    noListingsNearby: 'No listings found within {km} km of your location.',
    yourSowBalance: 'Your SOW Balance', rankings: 'Rankings',
    loadChat: 'Loading chat...', chatWith: 'Chat with {name}',
    chatSeller: 'Chat Seller', typeMessage: 'Type a message...', send: 'Send',
    loadingReviews: 'Loading reviews...', noReviews: 'No reviews yet.',
    leaveReview: 'Leave a Review', postReview: 'Post Review',
    topSellers: 'Top Sellers', noSowData: 'No data yet. Be the first to earn SOW!',
    walletNotConnected: 'Wallet Not Connected',
    connectToAccess: 'Connect your wallet to access your profile',
    viewLeaderboard: 'View Leaderboard', support: 'Support', adminPanel: 'Admin Panel',
    loadingStats: 'Loading stats...', noListingsFound: 'No listings found.',
    activeAds: 'Active Ads', users: 'Users', messages: 'Messages',
    markSold: 'Mark Sold', delete: 'Delete', sold: 'Sold',
    connectYourWallet: 'Connect Your Wallet',
    walletRequired: 'You need to connect your wallet to use this feature.',
    youOffline: 'You are offline. Some features may be unavailable.',
    postAdRate: 'Please wait before posting another ad.',
    loginRate: 'Please wait a few seconds.',
    chatRate: 'Sending too fast.',
    reviewRate: 'Please wait before another review.',
    deleteRate: 'Please wait a moment.',
    notFound: 'Ad not found or removed.', removedAd: 'This ad has been removed by the seller.',
    active: 'Active',
    locationAccess: 'Location Access',
    locationConsent: 'WantSell needs your location to show nearby listings and set your ad location. Your location is only used for this purpose.',
    verifyTitle: 'Verify Your Identity',
    verifyDesc: 'Verify your World ID to prove you are a real person. This helps keep the marketplace safe.',
    verified: 'Verified',
    worldAppRequired: 'World App Required',
    worldAppDesc: 'This app can only be used inside World App. Please open it from World App to continue.',
    worldAppBadge: 'Open in World App',
    dbUnavailable: 'Database not available. Check your internet connection.',
    invalidAddress: 'Invalid wallet address.',
    connectFailed: 'Connection Failed',
    walletConnectFailed: 'Wallet connect failed. Please try again.',
    walletConnectError: 'Wallet connect error. Try again.',
    invalidTitle: 'Invalid Title',
    invalidDesc: 'Invalid Description',
    locationRequired: 'Location Required',
    locationRequiredDesc: 'Please click Detect GPS to capture your location!',
    invalidPrice: 'Invalid Price',
    ruleViolation: 'Rule Violation',
    phoneNotAllowed: 'Phone numbers are not allowed to prevent scams!',
    prohibitedItem: 'Prohibited Item',
    containsRestricted: 'Contains restricted keyword',
    noExternalLinks: 'External links are not allowed!',
    verifyRequired: 'Verification Required',
    verifyRequiredDesc: 'You must verify your World ID to post an ad. This keeps the marketplace safe.',
    imageMissing: 'Image Missing',
    imageMissingDesc: 'Please select at least one product image!',
    limitReached: 'Limit Reached',
    limitReachedDesc: 'Max 4 photos allowed!',
    fileTooLarge: 'File Too Large',
    fileTooLargeDesc: 'Each image must be under 5MB.',
    paymentFailed: 'Payment Cancelled',
    paymentFailedDesc: 'Payment failed or was cancelled.',
  },
  es: {
    appName: 'WantSell', subtitle: 'Compra y vende articulos cerca de ti', connectWallet: 'Conectar Billetera',
    postAd: 'Publicar', myAds: 'Mis Anuncios', profile: 'Perfil',
    exploreListings: 'Explorar Anuncios', searchAds: 'Buscar anuncios...', radius: 'Radio',
    allCountries: 'Todos los Paises', allCategories: 'Todas las Categorias',
    localMarketplace: 'Mercado Local', marketplaceDesc: 'Compra y vende cerca de ti. 1 WLD por anuncio.',
    perAd: '1 WLD por anuncio', earnSow: 'Gana monedas SOW',
    postNewAd: 'Nuevo Anuncio', productTitle: 'Titulo del Producto', titlePlaceholder: 'ej. iPhone 15 Pro Max',
    category: 'Categoria', selectCategory: 'Seleccionar',
    countryRegion: 'Pais / Region', selectCountry: 'Seleccionar Pais',
    location: 'Ubicacion', tapDetect: 'Toca Detectar GPS o escribe', detectGps: 'Detectar GPS',
    condition: 'Condicion', brandNew: 'Nuevo', likeNew: 'Como Nuevo',
    good: 'Bueno', fair: 'Regular', used: 'Usado',
    priceType: 'Tipo de Precio', selectPriceType: 'Tipo',
    negotiable: 'Negociable', fixedPrice: 'Precio Fijo',
    description: 'Descripcion', describeItem: 'Describe tu articulo...',
    priceWld: 'Precio (WLD)', photosMax: 'Fotos (max 4)', postAdBtn: 'Publicar (1 WLD)',
    back: 'Volver', loading: 'Cargando...', noListings: 'No hay anuncios activos.',
    networkError: 'Error de red. Verifica tu conexion.',
    noListingsNearby: 'No se encontraron anuncios en {km} km.',
    yourSowBalance: 'Tu Balance SOW', rankings: 'Rankings',
    loadChat: 'Cargando chat...', chatWith: 'Chatear con {name}',
    chatSeller: 'Chatear', typeMessage: 'Escribe un mensaje...', send: 'Enviar',
    loadingReviews: 'Cargando...', noReviews: 'Sin reviews.',
    leaveReview: 'Dejar Review', postReview: 'Publicar',
    topSellers: 'Mejores Vendedores', noSowData: 'Sin datos. Se el primero!',
    walletNotConnected: 'Sin Billetera',
    connectToAccess: 'Conecta tu billetera para ver tu perfil',
    viewLeaderboard: 'Ver Rankings', support: 'Soporte', adminPanel: 'Admin',
    loadingStats: 'Cargando...', noListingsFound: 'Sin anuncios.',
    activeAds: 'Activos', users: 'Usuarios', messages: 'Mensajes',
    markSold: 'Vendido', delete: 'Eliminar', sold: 'Vendido',
    connectYourWallet: 'Conecta tu Billetera',
    walletRequired: 'Necesitas conectar tu billetera para usar esta funcion.',
    youOffline: 'Sin conexion. Algunas funciones pueden no estar disponibles.',
    postAdRate: 'Espera antes de publicar otro anuncio.', loginRate: 'Espera unos segundos.',
    chatRate: 'Demasiado rapido.', reviewRate: 'Espera antes de otra review.',
    deleteRate: 'Espera un momento.', notFound: 'Anuncio no encontrado.',
    removedAd: 'Este anuncio fue eliminado.', active: 'Activo',
    locationAccess: 'Acceso a Ubicacion',
    locationConsent: 'WantSell necesita tu ubicacion para mostrar anuncios cercanos.',
    verifyTitle: 'Verifica tu Identidad', verifyDesc: 'Verifica tu World ID para demostrar que eres real.',
    verified: 'Verificado',
    worldAppRequired: 'World App Requerido',
    worldAppDesc: 'Esta app solo funciona dentro de World App. Abrela desde World App.',
    worldAppBadge: 'Abrir en World App',
    dbUnavailable: 'Base de datos no disponible. Verifica tu conexion.',
    invalidAddress: 'Direccion invalida.',
    connectFailed: 'Conexion Fallida',
    walletConnectFailed: 'Error al conectar billetera.',
    walletConnectError: 'Error de conexion. Intenta de nuevo.',
    invalidTitle: 'Titulo Invalido',
    invalidDesc: 'Descripcion Invalida',
    locationRequired: 'Ubicacion Requerida',
    locationRequiredDesc: 'Toca Detectar GPS para capturar tu ubicacion!',
    invalidPrice: 'Precio Invalido',
    ruleViolation: 'Violacion de Reglas',
    phoneNotAllowed: 'No se permiten numeros de telefono!',
    prohibitedItem: 'Articulo Prohibido',
    containsRestricted: 'Contiene palabra restringida',
    noExternalLinks: 'No se permiten enlaces externos!',
    verifyRequired: 'Verificacion Requerida',
    verifyRequiredDesc: 'Debes verificar tu World ID para publicar un anuncio.',
    imageMissing: 'Imagen Faltante',
    imageMissingDesc: 'Selecciona al menos una imagen del producto!',
    limitReached: 'Limite Alcanzado',
    limitReachedDesc: 'Maximo 4 fotos permitidas!',
    fileTooLarge: 'Archivo Demasiado Grande',
    fileTooLargeDesc: 'Cada imagen debe ser menor a 5MB.',
    paymentFailed: 'Pago Cancelado',
    paymentFailedDesc: 'El pago fallo o fue cancelado.',
  },
  pt: {
    appName: 'WantSell', subtitle: 'Compre e venda perto de voce', connectWallet: 'Conectar Carteira',
    postAd: 'Publicar', myAds: 'Meus Anuncios', profile: 'Perfil',
    exploreListings: 'Explorar', searchAds: 'Buscar anuncios...', radius: 'Raio',
    allCountries: 'Todos os Paises', allCategories: 'Todas Categorias',
    localMarketplace: 'Mercado Local', marketplaceDesc: 'Compre e venda perto de voce. 1 WLD por anuncio.',
    perAd: '1 WLD por anuncio', earnSow: 'Ganhe SOW',
    postNewAd: 'Novo Anuncio', productTitle: 'Titulo do Produto', titlePlaceholder: 'ex. iPhone 15 Pro Max',
    category: 'Categoria', selectCategory: 'Selecionar',
    countryRegion: 'Pais / Regiao', selectCountry: 'Selecionar Pais',
    location: 'Localizacao', tapDetect: 'Toque Detectar GPS ou digite', detectGps: 'Detectar GPS',
    condition: 'Condicao', brandNew: 'Novo', likeNew: 'Quase Novo',
    good: 'Bom', fair: 'Razoavel', used: 'Usado',
    priceType: 'Tipo de Preco', selectPriceType: 'Tipo',
    negotiable: 'Negociavel', fixedPrice: 'Preco Fixo',
    description: 'Descricao', describeItem: 'Descreva seu item...',
    priceWld: 'Preco (WLD)', photosMax: 'Fotos (max 4)', postAdBtn: 'Publicar (1 WLD)',
    back: 'Voltar', loading: 'Carregando...', noListings: 'Nenhum anuncio ativo.',
    networkError: 'Erro de rede. Verifique sua conexao.',
    noListingsNearby: 'Nenhum anuncio em {km} km.',
    yourSowBalance: 'Saldo SOW', rankings: 'Rankings',
    loadChat: 'Carregando...', chatWith: 'Conversar com {name}',
    chatSeller: 'Conversar', typeMessage: 'Digite uma mensagem...', send: 'Enviar',
    loadingReviews: 'Carregando...', noReviews: 'Sem reviews.',
    leaveReview: 'Deixar Review', postReview: 'Publicar',
    topSellers: 'Melhores Vendedores', noSowData: 'Sem dados. Seja o primeiro!',
    walletNotConnected: 'Sem Carteira',
    connectToAccess: 'Conecte sua carteira para ver seu perfil',
    viewLeaderboard: 'Ver Rankings', support: 'Suporte', adminPanel: 'Admin',
    loadingStats: 'Carregando...', noListingsFound: 'Sem anuncios.',
    activeAds: 'Ativos', users: 'Usuarios', messages: 'Mensagens',
    markSold: 'Vendido', delete: 'Excluir', sold: 'Vendido',
    connectYourWallet: 'Conecte sua Carteira',
    walletRequired: 'Voce precisa conectar sua carteira para usar esta funcao.',
    youOffline: 'Sem conexao. Algumas funcionalidades podem nao funcionar.',
    postAdRate: 'Espere antes de publicar outro anuncio.', loginRate: 'Espere alguns segundos.',
    chatRate: 'Muito rapido.', reviewRate: 'Espere antes de outra review.',
    deleteRate: 'Espere um momento.', notFound: 'Anuncio nao encontrado.',
    removedAd: 'Este anuncio foi removido.', active: 'Ativo',
    locationAccess: 'Acesso a Localizacao',
    locationConsent: 'WantSell precisa da sua localizacao para mostrar anuncios proximos.',
    verifyTitle: 'Verifique sua Identidade', verifyDesc: 'Verifique seu World ID para provar que voce e real.',
    verified: 'Verificado',
    worldAppRequired: 'World App Necessario',
    worldAppDesc: 'Este app so funciona dentro do World App. Abra pelo World App.',
    worldAppBadge: 'Abrir no World App',
    dbUnavailable: 'Banco de dados indisponivel. Verifique sua conexao.',
    invalidAddress: 'Endereco invalido.',
    connectFailed: 'Conexao Falhou',
    walletConnectFailed: 'Falha ao conectar carteira.',
    walletConnectError: 'Erro de conexao. Tente novamente.',
    invalidTitle: 'Titulo Invalido',
    invalidDesc: 'Descricao Invalida',
    locationRequired: 'Localizacao Necessaria',
    locationRequiredDesc: 'Toque Detectar GPS para capturar sua localizacao!',
    invalidPrice: 'Preco Invalido',
    ruleViolation: 'Violacao de Regras',
    phoneNotAllowed: 'Numeros de telefone nao sao permitidos!',
    prohibitedItem: 'Item Proibido',
    containsRestricted: 'Contem palavra restrita',
    noExternalLinks: 'Links externos nao sao permitidos!',
    verifyRequired: 'Verificacao Necessaria',
    verifyRequiredDesc: 'Voce deve verificar seu World ID para publicar um anuncio.',
    imageMissing: 'Imagem Faltando',
    imageMissingDesc: 'Selecione pelo menos uma imagem do produto!',
    limitReached: 'Limite Atingido',
    limitReachedDesc: 'Maximo de 4 fotos permitidas!',
    fileTooLarge: 'Arquivo Muito Grande',
    fileTooLargeDesc: 'Cada imagem deve ter menos de 5MB.',
    paymentFailed: 'Pagamento Cancelado',
    paymentFailedDesc: 'O pagamento falhou ou foi cancelado.',
  },
  th: {
    appName: 'WantSell', subtitle: 'ซื้อขายของใกล้คุณ', connectWallet: 'เชื่อมต่อกระเป๋าเงิน',
    postAd: 'ลงประกาศ', myAds: 'ประกาศของฉัน', profile: 'โปรไฟล์',
    exploreListings: 'สำรวจประกาศ', searchAds: 'ค้นหา...', radius: 'รัศมี',
    allCountries: 'ทุกประเทศ', allCategories: 'ทุกหมวด',
    localMarketplace: 'ตลาดท้องถิ่น', marketplaceDesc: 'ซื้อขายของใกล้คุณ 1 WLD ต่อประกาศ',
    perAd: '1 WLD ต่อประกาศ', earnSow: 'รับเหรียญ SOW',
    postNewAd: 'ลงประกาศใหม่', productTitle: 'ชื่อสินค้า', titlePlaceholder: 'เช่น iPhone 15 Pro Max',
    category: 'หมวดหมู่', selectCategory: 'เลือกหมวด',
    countryRegion: 'ประเทศ / ภูมิภาค', selectCountry: 'เลือกประเทศ',
    location: 'สถานที่', tapDetect: 'แตะ GPS หรือพิมพ์', detectGps: 'GPS',
    condition: 'สภาพ', brandNew: 'ใหม่เอี่ยม', likeNew: 'แทบใหม่',
    good: 'ดี', fair: 'พอใช้', used: 'มือสอง',
    priceType: 'ประเภทราคา', selectPriceType: 'ประเภท',
    negotiable: 'ต่อรองได้', fixedPrice: 'ราคาตาย',
    description: 'รายละเอียด', describeItem: 'อธิบายสินค้า...',
    priceWld: 'ราคา (WLD)', photosMax: 'รูปภาพ (สูงสุด 4)', postAdBtn: 'ลงประกาศ (1 WLD)',
    back: 'กลับ', loading: 'กำลังโหลด...', noListings: 'ไม่มีประกาศ',
    networkError: 'เกิดข้อผิดพลาดเครือข่าย', noListingsNearby: 'ไม่พบประกาศในรัศมี {km} กม.',
    yourSowBalance: 'ยอดคงเหลือ SOW', rankings: 'อันดับ',
    loadChat: 'กำลังโหลด...', chatWith: 'แชทกับ {name}',
    chatSeller: 'แชท', typeMessage: 'พิมพ์ข้อความ...', send: 'ส่ง',
    loadingReviews: 'กำลังโหลด...', noReviews: 'ยังไม่มีรีวิว',
    leaveReview: 'เขียนรีวิว', postReview: 'โพสต์',
    topSellers: 'ผู้ขายดีที่สุด', noSowData: 'ยังไม่มีข้อมูล',
    walletNotConnected: 'ยังไม่เชื่อมต่อกระเป๋า', connectToAccess: 'เชื่อมต่อกระเป๋าเพื่อดูโปรไฟล์',
    viewLeaderboard: 'ดูอันดับ', support: 'ติดต่อเรา', adminPanel: 'แอดมิน',
    loadingStats: 'กำลังโหลด...', noListingsFound: 'ไม่มีประกาศ',
    activeAds: 'ประกาศใช้งาน', users: 'ผู้ใช้', messages: 'ข้อความ',
    markSold: 'ขายแล้ว', delete: 'ลบ', sold: 'ขายแล้ว',
    connectYourWallet: 'เชื่อมต่อกระเป๋า', walletRequired: 'ต้องเชื่อมต่อกระเป๋าเพื่อใช้ฟีเจอร์นี้',
    youOffline: 'ออฟไลน์ บางฟีเจอร์อาจใช้งานไม่ได้',
    postAdRate: 'รอสักครู่ก่อนลงประกาศใหม่', loginRate: 'รอสักครู่',
    chatRate: 'ส่งเร็วเกินไป', reviewRate: 'รอสักครู่', deleteRate: 'รอสักครู่',
    notFound: 'ไม่พบประกาศ', removedAd: 'ประกาศถูกลบแล้ว', active: 'ใช้งาน',
    locationAccess: 'ขอสิทธิ์ตำแหน่ง', locationConsent: 'WantSell ต้องการตำแหน่งของคุณเพื่อแสดงประกาศใกล้เคียง',
    verifyTitle: 'ยืนยันตัวตน', verifyDesc: 'ยืนยัน World ID เพื่อพิสูจน์ว่าคุณเป็นคนจริง', verified: 'ยืนยันแล้ว',
    worldAppRequired: 'ต้องใช้ World App', worldAppDesc: 'แอปนี้ใช้ได้เฉพาะใน World App เท่านั้น', worldAppBadge: 'เปิดใน World App',
    dbUnavailable: 'ฐานข้อมูลไม่พร้อมใช้งาน', invalidAddress: 'ที่อยู่ไม่ถูกต้อง', connectFailed: 'เชื่อมต่อล้มเหลว', walletConnectFailed: 'เชื่อมต่อกระเป๋าล้มเหลว', walletConnectError: 'เกิดข้อผิดพลาด', invalidTitle: 'ชื่อไม่ถูกต้อง', invalidDesc: 'รายละเอียดไม่ถูกต้อง', locationRequired: 'ต้องระบุตำแหน่ง', locationRequiredDesc: 'แตะ GPS เพื่อค้นหาตำแหน่ง!', invalidPrice: 'ราคาไม่ถูกต้อง', ruleViolation: 'ละเมิดกฎ', phoneNotAllowed: 'ไม่อนุญาตให้ใส่เบอร์โทรศัพท์!', prohibitedItem: 'สินค้าต้องห้าม', containsRestricted: 'มีคำต้องห้าม', noExternalLinks: 'ไม่อนุญาตให้ใส่ลิงก์!', verifyRequired: 'ต้องยืนยันตัวตน', verifyRequiredDesc: 'ต้องยืนยัน World ID เพื่อลงประกาศ', imageMissing: 'ต้องมีรูปภาพ', imageMissingDesc: 'เลือกรูปสินค้าอย่างน้อย 1 รูป!',    limitReached: 'เกินขีดจำกัด', limitReachedDesc: 'อนุญาตสูงสุด 4 รูป!',
    fileTooLarge: 'ไฟล์ใหญ่เกินไป', fileTooLargeDesc: 'รูปภาพต้องมีขนาดไม่เกิน 5MB',
    paymentFailed: 'การชำระเงินล้มเหลว', paymentFailedDesc: 'การชำระเงินไม่สำเร็จ',
  },
  ja: {
    appName: 'WantSell', subtitle: '近くの品物を売り買い', connectWallet: 'ウォレット接続',
    postAd: '投稿', myAds: '投稿一覧', profile: 'プロフィール',
    exploreListings: '一覧を見る', searchAds: '検索...', radius: '範囲',
    allCountries: 'すべての国', allCategories: 'すべてのカテゴリ',
    localMarketplace: 'ローカルマーケット', marketplaceDesc: '近くの品物を売り買い。1 WLD で掲載可能。',
    perAd: '1 WLD / 投稿', earnSow: 'SOW コインを獲得',
    postNewAd: '新規投稿', productTitle: '商品名', titlePlaceholder: '例: iPhone 15 Pro Max',
    category: 'カテゴリ', selectCategory: 'カテゴリを選択',
    countryRegion: '国 / 地域', selectCountry: '国を選択',
    location: '場所', tapDetect: 'GPS検索または入力', detectGps: 'GPS',
    condition: '状態', brandNew: '新品', likeNew: 'ほぼ新品',
    good: '良好', fair: '普通', used: '中古',
    priceType: '価格タイプ', selectPriceType: 'タイプ',
    negotiable: '値段交渉可', fixedPrice: '定価',
    description: '説明', describeItem: '商品の説明...',
    priceWld: '価格 (WLD)', photosMax: '写真 (最大4枚)', postAdBtn: '投稿する (1 WLD)',
    back: '戻る', loading: '読み込み中...', noListings: '掲載なし',
    networkError: 'ネットワークエラー', noListingsNearby: '{km} km以内に掲載なし',
    yourSowBalance: 'SOW残高', rankings: 'ランキング',
    loadChat: '読み込み中...', chatWith: '{name}とチャット',
    chatSeller: 'チャット', typeMessage: 'メッセージ...', send: '送信',
    loadingReviews: '読み込み中...', noReviews: 'レビューなし',
    leaveReview: 'レビューを書く', postReview: '投稿',
    topSellers: 'トップセラー', noSowData: 'データなし',
    walletNotConnected: 'ウォレット未接続', connectToAccess: 'プロフィールを見るには接続が必要',
    viewLeaderboard: 'ランキングを見る', support: 'サポート', adminPanel: '管理',
    loadingStats: '読み込み中...', noListingsFound: '掲載なし',
    activeAds: '有効', users: 'ユーザー', messages: 'メッセージ',
    markSold: '売却済', delete: '削除', sold: '売却済',
    connectYourWallet: 'ウォレット接続', walletRequired: 'この機能にはウォレット接続が必要です',
    youOffline: 'オフラインです', postAdRate: 'しばらくお待ちください', loginRate: 'しばらくお待ちください',
    chatRate: '送信が速すぎます', reviewRate: 'しばらくお待ちください', deleteRate: 'しばらくお待ちください',
    notFound: '掲載が見つかりません', removedAd: 'この掲載は削除されました', active: '有効',
    locationAccess: '位置情報', locationConsent: 'WantSellは近くの掲載を表示するために位置情報を使用します',
    verifyTitle: '本人確認', verifyDesc: 'World ID で本人確認を行ってください', verified: '確認済み',
    worldAppRequired: 'World Appが必要です', worldAppDesc: 'このアプリはWorld App内でのみ使用できます', worldAppBadge: 'World Appで開く',
    dbUnavailable: 'データベースが利用できません', invalidAddress: '無効なアドレスです', connectFailed: '接続失敗', walletConnectFailed: 'ウォレット接続に失敗しました', walletConnectError: '接続エラー。再試行してください', invalidTitle: '無効なタイトル', invalidDesc: '無効な説明', locationRequired: '位置情報が必要', locationRequiredDesc: 'GPS検索をタップして位置情報を取得!', invalidPrice: '無効な価格', ruleViolation: 'ルール違反', phoneNotAllowed: '電話番号は禁止されています!', prohibitedItem: '禁止アイテム', containsRestricted: '制限されたキーワードを含んでいます', noExternalLinks: '外部リンクは禁止されています!', verifyRequired: '本人確認が必要', verifyRequiredDesc: '掲載するにはWorld IDの確認が必要です', imageMissing: '画像がありません', imageMissingDesc: '商品画像を少なくとも1枚選択してください!',    limitReached: '上限に達しました', limitReachedDesc: '写真は最大4枚まで!',
    fileTooLarge: 'ファイルが大きすぎます', fileTooLargeDesc: '各画像は5MB以下にしてください',
    paymentFailed: '支払いキャンセル', paymentFailedDesc: '支払いに失敗しました',
  },
  ko: {
    appName: 'WantSell', subtitle: '주변 물건을 사고 팔기', connectWallet: '지갑 연결',
    postAd: '게시', myAds: '내 게시물', profile: '프로필',
    exploreListings: '둘러보기', searchAds: '검색...', radius: '반경',
    allCountries: '모든 국가', allCategories: '모든 카테고리',
    localMarketplace: '로컬 마켓', marketplaceDesc: '주변에서 사고 팔기. 1 WLD로 게시 가능.',
    perAd: '1 WLD / 게시', earnSow: 'SOW 코인 획득',
    postNewAd: '새 게시물', productTitle: '상품명', titlePlaceholder: '예: iPhone 15 Pro Max',
    category: '카테고리', selectCategory: '카테고리 선택',
    countryRegion: '국가 / 지역', selectCountry: '국가 선택',
    location: '위치', tapDetect: 'GPS 검색 또는 입력', detectGps: 'GPS',
    condition: '상태', brandNew: '새제품', likeNew: '거의 새것',
    good: '양호', fair: '보통', used: '중고',
    priceType: '가격 유형', selectPriceType: '유형',
    negotiable: '가격 협의', fixedPrice: '정가',
    description: '설명', describeItem: '상품 설명...',
    priceWld: '가격 (WLD)', photosMax: '사진 (최대 4장)', postAdBtn: '게시하기 (1 WLD)',
    back: '뒤로', loading: '로딩 중...', noListings: '게시물 없음',
    networkError: '네트워크 오류', noListingsNearby: '{km} km 이내에 게시물 없음',
    yourSowBalance: 'SOW 잔액', rankings: '랭킹',
    loadChat: '로딩 중...', chatWith: '{name}와 채팅',
    chatSeller: '채팅', typeMessage: '메시지 입력...', send: '보내기',
    loadingReviews: '로딩 중...', noReviews: '리뷰 없음',
    leaveReview: '리뷰 작성', postReview: '게시',
    topSellers: '탑 셀러', noSowData: '데이터 없음',
    walletNotConnected: '지갑 미연결', connectToAccess: '프로필 보려면 연결 필요',
    viewLeaderboard: '랭킹 보기', support: '지원', adminPanel: '관리자',
    loadingStats: '로딩 중...', noListingsFound: '게시물 없음',
    activeAds: '활성', users: '사용자', messages: '메시지',
    markSold: '판매완료', delete: '삭제', sold: '판매완료',
    connectYourWallet: '지갑 연결', walletRequired: '이 기능을 사용하려면 지갑 연결이 필요합니다',
    youOffline: '오프라인 상태입니다', postAdRate: '잠시만 기다려주세요', loginRate: '잠시만 기다려주세요',
    chatRate: '전송이 너무 빠릅니다', reviewRate: '잠시만 기다려주세요', deleteRate: '잠시만 기다려주세요',
    notFound: '게시물을 찾을 수 없습니다', removedAd: '이 게시물은 삭제되었습니다', active: '활성',
    locationAccess: '위치 접근', locationConsent: 'WantSell은 주변 게시물을 표시하기 위해 위치 정보를 사용합니다',
    verifyTitle: '본인 확인', verifyDesc: 'World ID로 본인 확인을 해주세요', verified: '확인됨',
    worldAppRequired: 'World App 필요', worldAppDesc: '이 앱은 World App 안에서만 사용할 수 있습니다', worldAppBadge: 'World App에서 열기',
    dbUnavailable: '데이터베이스를 사용할 수 없습니다', invalidAddress: '잘못된 주소입니다', connectFailed: '연결 실패', walletConnectFailed: '지갑 연결에 실패했습니다', walletConnectError: '연결 오류. 다시 시도해주세요', invalidTitle: '잘못된 제목', invalidDesc: '잘못된 설명', locationRequired: '위치 필요', locationRequiredDesc: 'GPS 검색을 눌러 위치를 지정하세요!', invalidPrice: '잘못된 가격', ruleViolation: '규칙 위반', phoneNotAllowed: '전화번호는 허용되지 않습니다!', prohibitedItem: '금지된 항목', containsRestricted: '제한된 키워드 포함', noExternalLinks: '외부 링크는 허용되지 않습니다!', verifyRequired: '인증 필요', verifyRequiredDesc: '게시물을 올리려면 World ID 인증이 필요합니다', imageMissing: '이미지 없음', imageMissingDesc: '상품 이미지를 최소 1장 선택하세요!',    limitReached: '한도 도달', limitReachedDesc: '최대 4장의 사진만 허용됩니다!',
    fileTooLarge: '파일이 너무 큽니다', fileTooLargeDesc: '각 이미지는 5MB 이하여야 합니다',
    paymentFailed: '결제 취소됨', paymentFailedDesc: '결제에 실패했거나 취소되었습니다',
  }
};

let currentLang = localStorage.getItem('lang') || (navigator.language || 'en').substring(0, 2);
if (!LOCALES[currentLang]) currentLang = 'en';

function t(key, replacements) {
  const val = LOCALES[currentLang] && LOCALES[currentLang][key] ? LOCALES[currentLang][key] : LOCALES.en[key] || key;
  if (!replacements) return val;
  return Object.entries(replacements).reduce((s, [k, v]) => s.replace('{' + k + '}', v), val);
}

function switchLang(lang) {
  if (!LOCALES[lang]) return;
  currentLang = lang;
  localStorage.setItem('lang', lang);
  const logo = document.querySelector('.app-logo');
  if (logo) logo.textContent = t('appName');
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.innerText = userWallet ? currentUsername : t('connectWallet');
  const sub = document.querySelector('.splash-subtitle');
  if (sub) sub.textContent = t('subtitle');
  const langBtn = document.getElementById('langToggle');
  if (langBtn) langBtn.textContent = currentLang.toUpperCase();
}

const LANG_ORDER = ['en', 'es', 'pt', 'th', 'ja', 'ko'];
window.cycleLang = function() {
  const idx = LANG_ORDER.indexOf(currentLang);
  const next = LANG_ORDER[(idx + 1) % LANG_ORDER.length];
  switchLang(next);
};

// ==========================================
// STATE
// ==========================================
let userWallet = null;
let currentUsername = null;
let currentChatSeller = null;
let currentLat = 28.6139;
let currentLng = 77.2090;
let isVerified = false;

// ==========================================
// WORLD APP ENVIRONMENT CHECK
// ==========================================
function checkWorldAppEnvironment() {
  let miniOk = false;
  try { miniOk = typeof MiniKit !== 'undefined' && typeof MiniKit.isInstalled === 'function' && MiniKit.isInstalled(); } catch (e) {}
  if (!miniOk) {
    document.getElementById('splashScreen').style.display = 'flex';
    document.getElementById('splashScreen').innerHTML = `<div class="blocker-content"><div class="blocker-icon">W</div><h1 class="blocker-title">${t('worldAppRequired')}</h1><p class="blocker-text">${t('worldAppDesc')}</p><div class="blocker-badge">${t('worldAppBadge')}</div></div>`;
    return false;
  }
  return true;
}

function waitForMiniKitReady(timeoutMs = 5000) {
  return new Promise((resolve) => {
    const start = Date.now();
    (function check() {
      let miniOk = false;
      try { miniOk = typeof MiniKit !== 'undefined' && typeof MiniKit.isInstalled === 'function' && MiniKit.isInstalled(); } catch (e) {}
      if (miniOk) { resolve(true); }
      else if (Date.now() - start > timeoutMs) { resolve(false); }
      else { setTimeout(check, 100); }
    })();
  });
}

// ==========================================
// SECURITY: HTML SANITIZER
// ==========================================
function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;').replace(/\//g,'&#x2F;');
}
function escapeAttr(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ==========================================
// SECURITY: INPUT VALIDATION
// ==========================================
const MAX_TITLE_LEN = 80, MAX_DESC_LEN = 500, MAX_USERNAME_LEN = 20, MIN_USERNAME_LEN = 2;
const MAX_REVIEW_LEN = 200, MAX_PRICE_VAL = 1000000, MIN_PRICE_VAL = 0.01, MAX_CHAT_LEN = 300;

function sanitizeUsername(n) { if (!n || typeof n !== 'string') return ''; return n.replace(/[^a-zA-Z0-9 _\-]/g, '').trim(); }
function validateUsername(n) { const c = sanitizeUsername(n); if (c.length < MIN_USERNAME_LEN || c.length > MAX_USERNAME_LEN) return { valid: false, error: `Username must be ${MIN_USERNAME_LEN}-${MAX_USERNAME_LEN} chars.` }; return { valid: true, clean: c }; }
function validatePrice(p) { const n = parseFloat(p); if (isNaN(n) || n < MIN_PRICE_VAL || n > MAX_PRICE_VAL) return { valid: false, error: `Price must be ${MIN_PRICE_VAL}-${MAX_PRICE_VAL} WLD.` }; return { valid: true, clean: n.toFixed(2) }; }
function validateTitle(t) { const c = (t || '').trim(); if (c.length < 3 || c.length > MAX_TITLE_LEN) return { valid: false, error: `Title must be 3-${MAX_TITLE_LEN} chars.` }; return { valid: true, clean: c }; }
function validateDescription(d) { const c = (d || '').trim(); if (c.length < 10 || c.length > MAX_DESC_LEN) return { valid: false, error: `Description must be 10-${MAX_DESC_LEN} chars.` }; return { valid: true, clean: c }; }
function validateAddress(a) { const c = (a || '').trim(); if (c.length < 3 || c.length > 200) return { valid: false, error: 'Address must be 3-200 chars.' }; return { valid: true, clean: c }; }
function validateChatMsg(m) { const c = (m || '').trim(); if (!c) return { valid: false, error: 'Empty message.' }; if (c.length > MAX_CHAT_LEN) return { valid: false, error: `Max ${MAX_CHAT_LEN} chars.` }; return { valid: true, clean: c }; }

// ==========================================
// SECURITY: RATE LIMITING
// ==========================================
const rateLimits = {};
function checkRateLimit(action, cooldownMs) {
  const now = Date.now();
  if (rateLimits[action] && now - rateLimits[action] < cooldownMs) return false;
  rateLimits[action] = now;
  return true;
}

// ==========================================
// ADDRESS UTILS
// ==========================================
function getDisplayName() { return 'User'; }
function isValidEthAddress(a) { return /^0x[a-fA-F0-9]{40}$/.test(a); }

// ==========================================
// TAB NAVIGATION
// ==========================================
window.switchTab = function(screenId) {
  if (['screenPost', 'screenMyAds', 'screenProfile'].includes(screenId)) {
    if (!requireWallet()) return;
  }
  document.querySelectorAll('.tab-item').forEach(t => {
    t.classList.remove('active');
    if (t.getAttribute('data-screen') === screenId) t.classList.add('active');
  });
  ['screenHome', 'screenPost', 'screenMyAds', 'screenProfile'].forEach(s => {
    const el = document.getElementById(s);
    if (el) {
      if (s === screenId) { el.style.display = 'flex'; el.classList.add('active'); el.style.animation = 'fadeIn 0.25s ease'; }
      else { el.style.display = 'none'; el.classList.remove('active'); }
    }
  });
  const fab = document.getElementById('fabPost');
  if (fab) fab.style.display = (screenId === 'screenHome') ? 'flex' : 'none';
  if (screenId === 'screenMyAds') window.openMyAdsScreen();
  if (screenId === 'screenProfile') window.renderProfile();
  if (screenId === 'screenHome') fetchListings();
};

// ==========================================
// SPLASH + APP INIT
// ==========================================
function showSkeleton(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += '<div class="skeleton skeleton-card skeleton-card-inner"><div class="skeleton skeleton-thumb"></div><div class="card-info"><div class="skeleton skeleton-text skeleton-text-70"></div><div class="skeleton skeleton-text skeleton-text-50"></div><div class="skeleton skeleton-text-sm"></div></div></div>';
  }
  return html;
}

function initApp() {
  const tabItems = document.querySelectorAll('.tab-item');
  tabItems.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-screen');
      window.switchTab(targetId);
    });
  });

  const categoryChips = document.querySelectorAll('.category-chip');
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      document.getElementById('categoryFilter').value = chip.getAttribute('data-cat');
      fetchListings();
    });
  });

  const fabBtn = document.getElementById('fabPost');
  if (fabBtn) {
    fabBtn.addEventListener('click', () => {
      if (!requireWallet()) return;
      window.switchTab('screenPost');
    });
  }

  const detBtn = document.getElementById('detectLocationBtn');
  if (detBtn) detBtn.addEventListener('click', () => window.detectLocation());

  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    const shell = document.getElementById('appShell');
    const fab = document.getElementById('fabPost');
    if (splash) { splash.style.opacity = '0'; splash.style.transition = 'opacity 0.5s'; setTimeout(() => splash.style.display = 'none', 500); }
    if (shell) shell.style.display = 'flex';
    if (fab) fab.style.display = 'flex';
  }, 1500);
}

// ==========================================
// POPUP SYSTEM
// ==========================================
let popupResolve = null;
window.showNeonPopup = function(title, text, icon = 'Notice', type = 'alert') {
  return new Promise((resolve) => {
    document.getElementById('neonPopupIcon').innerText = icon;
    document.getElementById('neonPopupTitle').innerText = title;
    document.getElementById('neonPopupText').innerHTML = text;
    const inputContainer = document.getElementById('neonPopupInputContainer');
    const alertBtns = document.getElementById('neonPopupAlertBtnContainer');
    const confirmBtns = document.getElementById('neonPopupConfirmBtnContainer');
    const popupBox = document.getElementById('neonPopupBox');
    inputContainer.style.display = 'none';
    alertBtns.style.display = 'none';
    confirmBtns.style.display = 'none';
    if (type === 'confirm') {
      confirmBtns.style.display = 'flex';
      popupBox.style.borderColor = 'var(--danger)';
    } else if (type === 'prompt') {
      inputContainer.style.display = 'block';
      document.getElementById('neonPopupInput').value = '';
      alertBtns.style.display = 'block';
      document.getElementById('neonPopupAlertBtn').innerText = 'Submit';
      popupBox.style.borderColor = 'var(--success)';
    } else {
      alertBtns.style.display = 'block';
      document.getElementById('neonPopupAlertBtn').innerText = 'OK';
      popupBox.style.borderColor = 'var(--primary)';
    }
    popupBox.style.boxShadow = 'var(--shadow-lg)';
    document.getElementById('neonPopup').style.display = 'flex';
    popupResolve = resolve;
    document.getElementById('neonPopupAlertBtn').onclick = function() {
      if (type === 'prompt') {
        const val = document.getElementById('neonPopupInput').value.trim();
        if (!val) closeNeonPopup("User_" + Math.floor(Math.random() * 10000));
        else closeNeonPopup(val);
      } else { closeNeonPopup(true); }
    };
    document.getElementById('neonPopupConfirmYesBtn').onclick = () => closeNeonPopup(true);
    document.getElementById('neonPopupConfirmNoBtn').onclick = () => closeNeonPopup(false);
  });
};

window.closeNeonPopup = function(result) {
  document.getElementById('neonPopup').style.display = 'none';
  if (popupResolve) { popupResolve(result); popupResolve = null; }
};

// ==========================================
// WALLET REQUIRED CHECK
// ==========================================
function requireWallet() {
  if (userWallet && currentUsername) return true;
  showWalletRequiredOverlay();
  return false;
}

function showWalletRequiredOverlay() {
  const existing = document.getElementById('walletRequiredOverlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'walletRequiredOverlay';
  overlay.className = 'wallet-required-overlay';
  overlay.innerHTML = `<div class="wallet-required-box"><div class="wallet-required-icon">W</div><h2 class="wallet-required-title">${t('connectYourWallet')}</h2><p class="wallet-required-text">${t('walletRequired')}</p><button class="wallet-required-btn" onclick="document.getElementById('walletRequiredOverlay').remove(); document.getElementById('loginBtn').click();">${t('connectWallet')}</button></div>`;
  document.body.appendChild(overlay);
}

function randomAlphaNumeric(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  return out;
}

// ==========================================
// MINIKIT COMMANDS: VERIFY (World ID)
// ==========================================
async function verifyWorldID() {
  if (isVerified) return true;
  try {
    const mk = MiniKit;
    if (!mk || !mk.commandsAsync || !mk.commandsAsync.verify) {
      console.log('[VERIFY] MiniKit verify not available');
      return false;
    }
    const { finalPayload } = await mk.commandsAsync.verify({
      action: 'post_ad',
      signal_description: 'Verify your World ID to post an ad on WantSell',
    });
    if (finalPayload && finalPayload.status === 'success') {
      isVerified = true;
      localStorage.setItem('worldIdVerified', 'true');
      console.log('[VERIFY] World ID verified successfully');
      return true;
    }
    console.log('[VERIFY] Verification failed or cancelled:', finalPayload?.status);
    return false;
  } catch (err) {
    console.log('[VERIFY] Error:', err.message);
    return false;
  }
}

// ==========================================
// MINIKIT COMMANDS: NOTIFICATION PERMISSIONS
// ==========================================
async function requestNotificationPermissions() {
  try {
    const mk = MiniKit;
    if (mk && mk.commandsAsync && mk.commandsAsync.requestNotificationPermissions) {
      await mk.commandsAsync.requestNotificationPermissions();
      console.log('[NOTIF] Notification permissions requested');
    }
  } catch (err) {
    console.log('[NOTIF] Could not request notifications:', err.message);
  }
}

// ==========================================
// MINIKIT COMMANDS: SHARE (when sharing ad)
// ==========================================
async function shareAd(title, price) {
  try {
    const mk = MiniKit;
    if (mk && mk.commandsAsync && mk.commandsAsync.share) {
      await mk.commandsAsync.share({
        title: `WantSell: ${title}`,
        text: `Check out "${title}" for ${price} WLD on WantSell!`,
      });
      console.log('[SHARE] Ad shared via MiniKit');
    }
  } catch (err) {
    console.log('[SHARE] Share failed:', err.message);
  }
}

// ==========================================
// DOMContentLoaded — APP BOOT
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  try { MiniKit.install(APP_ID); } catch (e) {}

  // Restore saved wallet immediately
  const savedAddress = localStorage.getItem('userWallet');
  const savedUsername = localStorage.getItem('currentUsername');
  if (savedAddress && !userWallet) {
    userWallet = savedAddress;
    currentUsername = savedUsername || ('User_' + savedAddress.substring(2, 8));
    document.getElementById('loginBtn').innerText = currentUsername;
    updateSowBadge();
    detectUserCurrentPosition();
    fetchListings();
  }

  // Check saved verification
  if (localStorage.getItem('worldIdVerified') === 'true') {
    isVerified = true;
  }

  const ready = await waitForMiniKitReady();
  if (!ready) { checkWorldAppEnvironment(); return; }

  // Silent wallet auth
  if (typeof MiniKit !== 'undefined') {
    try {
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: randomAlphaNumeric(24),
        requestId: 'req_silent_' + Date.now(),
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(Date.now() - 60 * 1000),
        statement: 'Sign in to WantSell',
      });
      if (finalPayload?.status === 'success' && finalPayload?.address) {
        userWallet = finalPayload.address;
        const { data: userData } = await supabase.from('users').select('username').eq('wallet_address', userWallet).single();
        currentUsername = userData?.username || ('User_' + userWallet.substring(2, 8));
        localStorage.setItem('userWallet', userWallet);
        localStorage.setItem('currentUsername', currentUsername);
        document.getElementById('loginBtn').innerText = currentUsername;
        updateSowBadge();
        detectUserCurrentPosition();
      }
    } catch (err) {}
  }

  setupUI();
  initApp();
  fetchListings();

  // Request notification permissions (MiniKit command)
  setTimeout(() => requestNotificationPermissions(), 3000);

  if (!userWallet) detectUserCurrentPosition();
});

function setupUI() {
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  document.getElementById('adForm').addEventListener('submit', handlePostAd);
  document.getElementById('countryFilter').addEventListener('change', fetchListings);
  document.getElementById('categoryFilter').addEventListener('change', fetchListings);

  const rangeInput = document.getElementById('distanceRange');
  rangeInput.addEventListener('input', (e) => {
    document.getElementById('rangeValue').innerText = e.target.value + ' km';
  });
  rangeInput.addEventListener('change', fetchListings);

  let searchDebounceTimer;
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(fetchListings, 300);
    });
  }

  // Offline banner
  const offlineBanner = document.createElement('div');
  offlineBanner.id = 'offlineBanner';
  offlineBanner.className = 'offline-banner';
  offlineBanner.textContent = t('youOffline');
  document.body.appendChild(offlineBanner);
  window.addEventListener('online', () => { offlineBanner.style.display = 'none'; if (supabase) fetchListings(); });
  window.addEventListener('offline', () => { offlineBanner.style.display = 'block'; });
}

// ==========================================
// WALLET AUTH (MiniKit command)
// ==========================================
async function handleLogin() {
  if (!checkWorldAppEnvironment()) return;
  if (!supabase) { showNeonPopup('Offline', t('dbUnavailable'), 'OK'); return; }
  if (!checkRateLimit('login', 5000)) { showNeonPopup('Slow Down', t('loginRate'), 'OK'); return; }
  try {
    const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
      nonce: randomAlphaNumeric(24),
      requestId: 'req_login_' + Date.now(),
      expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notBefore: new Date(Date.now() - 60 * 1000),
      statement: 'Sign in to WantSell',
    });
    if (finalPayload?.status === 'success' && finalPayload?.address) {
      if (!isValidEthAddress(finalPayload.address)) { showNeonPopup('Error', t('invalidAddress'), 'OK'); return; }
      userWallet = finalPayload.address;
      const { data: userData } = await supabase.from('users').select('username').eq('wallet_address', userWallet).single();
      if (userData && userData.username) {
        currentUsername = userData.username;
      } else {
        let usernameInput = await showNeonPopup('Welcome!', 'Choose a Username (2-20 chars):', 'OK', 'prompt');
        let attempts = 0;
        while (attempts < 3) {
          const v = validateUsername(usernameInput);
          if (v.valid) { currentUsername = v.clean; break; }
          attempts++;
          if (attempts >= 3) { currentUsername = 'User_' + Math.floor(Math.random() * 10000); break; }
          usernameInput = await showNeonPopup('Invalid', v.error, 'OK', 'prompt');
        }
        const { data: exUser } = await supabase.from('users').select('wallet_address').eq('wallet_address', userWallet).single();
        if (!exUser) { await supabase.from('users').upsert([{ wallet_address: userWallet, username: currentUsername }]); }
      }
      localStorage.setItem('userWallet', userWallet);
      localStorage.setItem('currentUsername', currentUsername);
      document.getElementById('loginBtn').innerText = currentUsername;
      updateSowBadge();
      detectUserCurrentPosition();
      fetchListings();
    } else {
      showNeonPopup(t('connectFailed'), t('walletConnectFailed'), 'OK');
    }
  } catch (err) {
    console.error('[LOGIN ERROR]', err.message || err);
    showNeonPopup('Error', t('walletConnectError'), 'OK');
  }
}

// ==========================================
// LOCATION DETECTION
// ==========================================
function detectUserCurrentPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      currentLat = position.coords.latitude;
      currentLng = position.coords.longitude;
    }, () => {}, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  }
}

window.detectLocation = async function() {
  if (!requireWallet()) return;
  const consent = await showNeonPopup(t('locationAccess'), t('locationConsent'), 'OK', 'confirm');
  if (!consent) return;
  const addressField = document.getElementById('adAddress');
  addressField.value = "Detecting precise location...";
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        currentLat = position.coords.latitude;
        currentLng = position.coords.longitude;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLat}&lon=${currentLng}`);
        const data = await response.json();
        if (data && data.display_name) { addressField.value = data.display_name; }
        else { addressField.value = `Lat: ${currentLat.toFixed(4)}, Lng: ${currentLng.toFixed(4)}`; }
      } catch (e) {
        addressField.value = `Lat: ${currentLat.toFixed(4)}, Lng: ${currentLng.toFixed(4)}`;
      }
    }, async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const locData = await res.json();
        if (locData && locData.city) {
          currentLat = locData.latitude; currentLng = locData.longitude;
          addressField.value = `${locData.city}, ${locData.region}, ${locData.country_name}`;
        } else { addressField.value = ""; await showNeonPopup('Notice', 'Could not auto-detect. Please type manually.', 'OK'); }
      } catch (err) { addressField.value = ""; await showNeonPopup('Error', 'Location permissions denied. Please type manually.', 'OK'); }
    }, { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 });
  } else { addressField.value = ""; await showNeonPopup('Error', 'Geolocation not supported.', 'OK'); }
}

// ==========================================
// DISTANCE CALC
// ==========================================
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function containsPhoneNumber(text) {
  // Strip spaces/dashes/parens then check for 10+ digits, or +country code pattern
  const stripped = text.replace(/[\s\-().]/g, '');
  if (/\b\d{10,}\b/.test(stripped)) return true;
  if (/\+\d{7,}/.test(stripped)) return true;
  // Also check original for formatted patterns like (555) 123-4567
  return /(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/.test(text);
}

// ==========================================
// TIME AGO
// ==========================================
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'Just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ==========================================
// BADGES
// ==========================================
function getConditionBadge(cond) {
  const map = { 'new': { text: 'Brand New', cls: 'new' }, 'like_new': { text: 'Like New', cls: 'like-new' }, 'good': { text: 'Good', cls: 'good' }, 'fair': { text: 'Fair', cls: 'fair' }, 'used': { text: 'Used', cls: 'used' } };
  return map[cond] || map['used'];
}
function getPriceTypeBadge(pt) {
  if (pt === 'negotiable') return { text: 'Negotiable', cls: 'negotiable' };
  return { text: 'Fixed', cls: 'fixed' };
}

// ==========================================
// CONTENT FILTER
// ==========================================
const forbiddenWords = ['weapon', 'drug', 'gun', 'hack', 'counterfeit', 'illegal', 'adult', 'bomb', 'firearm', 'steal', 'scam', 'phishing', 'crack', 'exploit', 'cheat', 'fraud', 'narcotics', 'meth', 'cocaine', 'terrorist', 'kill', 'murder', 'porn', 'nsfw', 'sex', 'prostitution'];
function validateListingContent(title, description) {
  const content = (title + " " + description).toLowerCase();
  for (let word of forbiddenWords) { if (content.includes(word)) return word; }
  return null;
}

// ==========================================
// IMAGE SYSTEM
// ==========================================
let viewerImages = [];
let currentImageIndex = 0;

window.openImageViewer = function(imagesStr, index) {
  viewerImages = imagesStr.split('|');
  currentImageIndex = parseInt(index);
  updateViewer();
  document.getElementById('imageViewerModal').style.display = 'flex';
};
window.prevImage = function() { if (currentImageIndex > 0) { currentImageIndex--; updateViewer(); } };
window.nextImage = function() { if (currentImageIndex < viewerImages.length - 1) { currentImageIndex++; updateViewer(); } };
function updateViewer() {
  document.getElementById('viewerImage').src = viewerImages[currentImageIndex];
  document.getElementById('imageCounter').innerText = `${currentImageIndex + 1} / ${viewerImages.length}`;
}

function compressImage(file, maxWidth = 1000, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width, height = img.height;
        if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
        }, 'image/jpeg', quality);
      };
    };
  });
}

// ==========================================
// POST AD — with MiniKit verify + pay
// ==========================================
async function handlePostAd(e) {
  e.preventDefault();
  if (!requireWallet()) return;
  if (!checkRateLimit('postAd', 10000)) { await showNeonPopup('Slow Down', t('postAdRate'), 'OK'); return; }
  if (!supabase) { await showNeonPopup('Offline', t('dbUnavailable'), 'OK'); return; }

  const titleV = validateTitle(document.getElementById('title').value);
  if (!titleV.valid) { await showNeonPopup(t('invalidTitle'), titleV.error, 'OK'); return; }
  const descV = validateDescription(document.getElementById('description').value);
  if (!descV.valid) { await showNeonPopup(t('invalidDesc'), descV.error, 'OK'); return; }
  const addrV = validateAddress(document.getElementById('adAddress').value);
  if (!addrV.valid) { await showNeonPopup(t('locationRequired'), t('locationRequiredDesc'), 'OK'); return; }
  const priceV = validatePrice(document.getElementById('price').value);
  if (!priceV.valid) { await showNeonPopup(t('invalidPrice'), priceV.error, 'OK'); return; }

  if (containsPhoneNumber(titleV.clean) || containsPhoneNumber(descV.clean) || containsPhoneNumber(addrV.clean)) {
    await showNeonPopup(t('ruleViolation'), t('phoneNotAllowed'), 'OK'); return;
  }
  const restrictedWord = validateListingContent(titleV.clean, descV.clean);
  if (restrictedWord) {    await showNeonPopup(t('prohibitedItem'), `${t('containsRestricted')} ("${escapeHtml(restrictedWord)}").`, 'OK'); return; }
  if (/https?:\/\//i.test(descV.clean) || /www\./i.test(descV.clean)) {
    await showNeonPopup(t('ruleViolation'), t('noExternalLinks'), 'OK'); return;
  }

  // MINIKIT COMMAND: Verify World ID before posting
  const verified = await verifyWorldID();
  if (!verified) {
    await showNeonPopup(t('verifyRequired'), t('verifyRequiredDesc'), 'OK');
    return;
  }

  const fileInput = document.getElementById('imageInput');
  const files = fileInput.files;
  if (files.length === 0) { await showNeonPopup(t('imageMissing'), t('imageMissingDesc'), 'OK'); return; }
  if (files.length > 4) { await showNeonPopup(t('limitReached'), t('limitReachedDesc'), 'OK'); return; }
  for (let f of files) { if (f.size > 5 * 1024 * 1024) {    await showNeonPopup(t('fileTooLarge'), t('fileTooLargeDesc'), 'OK'); return; } }

  if (!checkWorldAppEnvironment()) { return; }

  // MINIKIT COMMAND: Pay 1 WLD
  let paymentSuccessful = false;
  const paymentRef = randomAlphaNumeric(16);
  try {
    const WLD_SYMBOL = (Tokens && Tokens.WLD) || 'WLD';
    const WLD_TO_DEC = tokenToDecimals;
    const tokenAmount = WLD_TO_DEC ? WLD_TO_DEC(1, WLD_SYMBOL).toString() : '1000000000000000000';
    console.log(`[PAY] Sending ${tokenAmount} ${WLD_SYMBOL} to ${ADMIN_WALLET}`);
    const { finalPayload } = await MiniKit.commandsAsync.pay({
      reference: paymentRef, to: ADMIN_WALLET,
      tokens: [{ symbol: WLD_SYMBOL, token_amount: tokenAmount }],
      description: 'Listing Fee: 1 WLD',
    });
    paymentSuccessful = (finalPayload?.status === 'success');
    if (paymentSuccessful) console.log(`[PAYMENT OK] ref=${paymentRef}`);
  } catch (err) { console.error('[PAYMENT FAILED]', err); }

  if (!paymentSuccessful) { await showNeonPopup(t('paymentFailed'), t('paymentFailedDesc'), 'OK'); return; }

  let imageUrls = ['', '', '', ''];
  for (let i = 0; i < files.length; i++) {
    try {
      const cf = await compressImage(files[i]);
      const fn = `${Date.now()}_${randomAlphaNumeric(8)}.jpg`;
      const { error: ue } = await supabase.storage.from('listing').upload(fn, cf);
      if (ue) { await showNeonPopup('Upload Error', 'Image upload failed. Try again.', 'OK'); return; }
      const { data: pd } = supabase.storage.from('listing').getPublicUrl(fn);
      imageUrls[i] = pd.publicUrl;
    } catch (imgErr) { await showNeonPopup('Image Error', imgErr.message || 'Process failed.', 'OK'); return; }
  }

  const listingPayload = {
    seller_address: userWallet, seller_name: currentUsername,
    title: titleV.clean, description: descV.clean, price: priceV.clean,
    category: document.getElementById('category').value,
    country: document.getElementById('adCountry').value, address: addrV.clean,
    lat: currentLat, lng: currentLng,
    condition: document.getElementById('adCondition').value || 'used',
    price_type: document.getElementById('priceType').value || 'fixed',
    image1: imageUrls[0], image2: imageUrls[1], image3: imageUrls[2], image4: imageUrls[3],
    status: 'active'
  };

  let { error: insertError } = await supabase.from('listings').insert([listingPayload]);
  if (insertError && insertError.message && (insertError.message.includes('condition') || insertError.message.includes('price_type') || insertError.message.includes('column'))) {
    delete listingPayload.condition;
    delete listingPayload.price_type;
    const retry = await supabase.from('listings').insert([listingPayload]);
    insertError = retry.error;
  }

  if (!insertError) {
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data: recentAds } = await supabase.from('listings').select('id').eq('seller_address', userWallet).eq('title', titleV.clean).gte('created_at', twoMinAgo);
    if ((recentAds || []).length <= 1) {
      const { data: balData } = await supabase.from('sow_balances').select('balance').eq('wallet_address', userWallet).single();
      let newBal = (balData && balData.balance) ? balData.balance + 1 : 1;
      await supabase.from('sow_balances').upsert([{ wallet_address: userWallet, balance: newBal }]);
      updateSowBadge();
      await showNeonPopup('Success', `Ad posted successfully!<br><span class="sow-earned-text">+1 SOW Coin Earned!</span>`, 'OK');
    } else {
      await showNeonPopup('Ad Posted', 'Your ad is now live.', 'OK');
    }
    document.getElementById('adForm').reset();
    window.switchTab('screenHome');
  } else {
    console.error('[DB ERROR]', insertError);
    await showNeonPopup('Error', 'Could not save your ad. Try again.', 'OK');
  }
}

// ==========================================
// FETCH LISTINGS
// ==========================================
async function fetchListings() {
  const container = document.getElementById('listingsContainer');
  if (!container) return;
  if (!supabase) { container.innerHTML = '<p class="loading-placeholder">Database not available.</p>'; return; }
  const selectedCountry = document.getElementById('countryFilter').value;
  const selectedCategory = document.getElementById('categoryFilter').value;
  const maxDistance = parseInt(document.getElementById('distanceRange').value);
  const searchInput = document.getElementById('searchInput');
  const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';

  let query = supabase.from('listings').select('*').eq('status', 'active');
  if (selectedCountry !== 'ALL') query = query.eq('country', selectedCountry);
  if (selectedCategory !== 'ALL') query = query.eq('category', selectedCategory);

  let data, error;
  try {
    const result = await query;
    data = result.data;
    error = result.error;
  } catch (netErr) {
    container.innerHTML = `<p class="loading-placeholder">${t('networkError')}</p>`;
    return;
  }

  container.innerHTML = showSkeleton(4);

  if (error || !data || data.length === 0) {
    container.innerHTML = `<p class="loading-placeholder">${t('noListings')}</p>`;
    return;
  }

  const filteredData = data.filter((item) => {
    const itemLat = item.lat || 28.6139;
    const itemLng = item.lng || 77.2090;
    const realDist = calculateDistance(currentLat, currentLng, itemLat, itemLng);
    item.calculatedDistance = realDist;
    if (realDist > maxDistance) return false;
    if (searchText && !item.title.toLowerCase().includes(searchText)) return false;
    return true;
  });

  if (filteredData.length === 0) {
    container.innerHTML = `<p class="loading-placeholder">${t('noListingsNearby', { km: maxDistance })}</p>`;
    return;
  }

  container.innerHTML = filteredData.map((item) => {
    const thumbImg = (item.image1 && item.image1.startsWith('http')) ? escapeAttr(item.image1) : 'https://via.placeholder.com/90';
    const dName = escapeHtml(item.seller_name || 'User');
    const iTitle = escapeHtml(item.title);
    const iCountry = escapeHtml(item.country);
    const iPrice = escapeHtml(item.price);
    const iId = escapeAttr(item.id);
    const iSeller = escapeAttr(item.seller_address);
    const cBadge = getConditionBadge(item.condition);
    const pBadge = getPriceTypeBadge(item.price_type);
    const posted = timeAgo(item.created_at);
    return `
      <div class="listing-card" onclick="window.openAdDetails('${iId}')">
        <div class="card-inner">
          <img src="${thumbImg}" class="card-thumb" alt="listing">
          <div class="card-info">
            <div class="card-badges">
              <span class="badge badge-${cBadge.cls}">${cBadge.text}</span>
              <span class="badge badge-${pBadge.cls}">${pBadge.text}</span>
            </div>
            <h3 class="card-title">${iTitle}</h3>
            <p class="card-price">${iPrice} WLD</p>
            <div class="card-meta">
              <span class="card-seller">${dName} - ${iCountry}</span>
              <span class="card-time">${posted}</span>
            </div>
          </div>
        </div>
        <div class="card-actions">
          <button onclick="event.stopPropagation(); window.openChat('${iSeller}', '${escapeAttr(item.title)}', '${escapeAttr(item.seller_name || 'User')}')" class="btn-chat-seller">Chat Seller</button>
          <button onclick="event.stopPropagation(); shareAd('${escapeAttr(item.title)}', '${escapeAttr(item.price)}')" class="btn-chat-seller btn-share">Share</button>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// AD DETAILS
// ==========================================
window.openAdDetails = async function(id) {
  const cleanId = String(id).replace(/[^a-zA-Z0-9\-]/g, '');
  const { data, error } = await supabase.from('listings').select('*').eq('id', cleanId).single();
  if (error || !data) {  await showNeonPopup(t('notFound'), t('notFound'), 'OK'); return; }
  if (data.status === 'deleted') {  await showNeonPopup(t('removedAd'), t('removedAd'), 'OK'); return; }
  const allImages = [data.image1, data.image2, data.image3, data.image4].filter(img => img && img.trim() !== "" && (img.startsWith('http://') || img.startsWith('https://')));
  const imagesUrlsJoined = allImages.join('|');
  const imagesHtml = allImages.map((img, index) => `<img src="${escapeAttr(img)}" onclick="window.openImageViewer('${escapeAttr(imagesUrlsJoined)}', ${index})" class="detail-img" alt="product">`).join('');
  const dName = escapeHtml(data.seller_name || 'User');
  const sAddr = data.seller_address;
  const cBadge = getConditionBadge(data.condition);
  const pBadge = getPriceTypeBadge(data.price_type);
  const posted = timeAgo(data.created_at);
  const dist = data.calculatedDistance ? ` (~${escapeHtml(data.calculatedDistance)} km)` : '';
  const verifiedBadge = isVerified ? '<span class="verify-badge">Verified</span>' : '';
  document.getElementById('adDetailsBody').innerHTML = `
    <div>
      <div class="detail-meta">
        <span class="badge badge-category">${escapeHtml(data.category)}</span>
        <span class="card-time">${posted}</span>
        ${verifiedBadge}
      </div>
      <h2 class="detail-title">${escapeHtml(data.title)}</h2>
      <div class="detail-meta">
        <span class="badge badge-${cBadge.cls}">${cBadge.text}</span>
        <span class="badge badge-${pBadge.cls}">${pBadge.text}</span>
      </div>
      <div class="detail-price-row">
        <h3 class="detail-price">${escapeHtml(data.price)} WLD</h3>
        <span class="card-seller">${escapeHtml(data.country)}${dist}</span>
      </div>
      <div class="detail-section"><b>Location:</b> ${escapeHtml(data.address || 'Not specified')}</div>
      <div class="detail-seller-bar">
        <div>
          <span class="detail-seller-label">Seller</span>
          <h4 class="detail-seller-name">${dName}</h4>
        </div>
        <button class="btn-mark-sold btn-reviews" onclick="window.openReviews('${escapeAttr(sAddr)}', '${escapeAttr(data.seller_name || 'User')}')">Reviews</button>
      </div>
      <hr class="detail-divider">
      <h4 class="detail-section-title">Photos (${allImages.length}) - Tap to Zoom</h4>
      <div class="detail-images-scroll">${imagesHtml}</div>
      <h4 class="detail-section-title">Description</h4>
      <p class="detail-section detail-description">${escapeHtml(data.description)}</p>
      <div class="detail-action-bar">
        <button class="btn-chat-seller btn-back" onclick="document.getElementById('adDetailsModal').style.display='none';">Back</button>
        <button class="btn-chat-seller" onclick="window.openChat('${escapeAttr(sAddr)}', '${escapeAttr(data.title)}', '${escapeAttr(data.seller_name || 'User')}'); document.getElementById('adDetailsModal').style.display='none';">Chat with Seller</button>
      </div>
    </div>`;
  document.getElementById('adDetailsModal').style.display = 'flex';
  document.querySelector('#adDetailsModal .modal-content').style.animation = 'slideInUp 0.35s ease';
};

// ==========================================
// CHAT SYSTEM
// ==========================================
window.openChat = async function(sellerWallet, adTitle, sellerName) {
  if (!requireWallet()) return;
  if (sellerWallet === userWallet) { await showNeonPopup('Notice', 'You cannot chat with yourself!', 'OK'); return; }
  currentChatSeller = sellerWallet;
  window.currentChatAdTitle = adTitle;
  document.getElementById('chatTitle').innerText = `Chat with ${sellerName || 'User'}`;
  const chatBox = document.getElementById('chatMessages');
  chatBox.innerHTML = `<p class="loading-placeholder">${t('loadChat')}</p>`;
  document.getElementById('chatModal').style.display = 'flex';
  document.querySelector('#chatModal .modal-content').style.animation = 'slideInUp 0.35s ease';
  const { data, error } = await supabase.from('chats').select('*').order('created_at', { ascending: true });
  if (!data) return;
  let chatHtml = `<div class="chat-msg system">Hello! I am interested in: ${escapeHtml(adTitle)}</div>`;
  if (data && data.length > 0) {
    data.filter(m => m.ad_title === adTitle && ((m.sender === userWallet && m.receiver === sellerWallet) || (m.sender === sellerWallet && m.receiver === userWallet)))
      .forEach(msg => {
        const safe = escapeHtml(msg.message);
        chatHtml += msg.sender === userWallet ? `<div class="chat-msg sent">${safe}</div>` : `<div class="chat-msg received">${safe}</div>`;
      });
  }
  chatBox.innerHTML = chatHtml;
  chatBox.scrollTop = chatBox.scrollHeight;
};

window.sendMessage = async function() {
  const input = document.getElementById('chatInput');
  const rawMsg = input.value;
  const msgV = validateChatMsg(rawMsg);
  if (!msgV.valid) { await showNeonPopup('Invalid', msgV.error, 'OK'); return; }
  if (!checkRateLimit('chat', 1000)) { await showNeonPopup('Slow Down', t('chatRate'), 'OK'); return; }
  if (!currentChatSeller || !window.currentChatAdTitle) return;
  const msg = msgV.clean;
  const chatBox = document.getElementById('chatMessages');
  chatBox.innerHTML += `<div class="chat-msg sent">${escapeHtml(msg)}</div>`;
  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;
  const { error } = await supabase.from('chats').insert([{ sender: userWallet, receiver: currentChatSeller, ad_title: window.currentChatAdTitle, message: msg }]);
  if (error) console.error('[CHAT ERROR]', error);
};

// ==========================================
// REVIEWS
// ==========================================
window.openReviews = async function(sellerAddress, sellerName) {
  document.getElementById('reviewsModalTitle').innerText = `${sellerName}'s Reviews`;
  document.getElementById('reviewsModal').style.display = 'flex';
  document.querySelector('#reviewsModal .modal-content').style.animation = 'slideInUp 0.35s ease';
  window.targetSellerAddress = sellerAddress;
  const container = document.getElementById('reviewsListContainer');
  container.innerHTML = `<p class="loading-placeholder">${t('loadingReviews')}</p>`;
  const { data: reviews, error } = await supabase.from('reviews').select('*').eq('seller_address', sellerAddress).order('created_at', { ascending: false });
  if (error || !reviews || reviews.length === 0) { container.innerHTML = `<p class="loading-placeholder">${t('noReviews')}</p>`; return; }
  container.innerHTML = reviews.map(r => {
    const bName = escapeHtml(r.buyer_name);
    const comment = escapeHtml(r.comment || 'No comment provided.');
    const rating = Math.min(5, Math.max(1, parseInt(r.rating) || 5));
    return `<div class="review-item"><div class="review-header-row"><span class="review-buyer-name">${bName}</span><span class="review-rating-badge">${rating}/5</span></div><p class="review-body">${comment}</p></div>`;
  }).join('');
};

window.submitReview = async function() {
  if (!requireWallet()) return;
  if (!checkRateLimit('review', 5000)) { await showNeonPopup('Slow Down', t('reviewRate'), 'OK'); return; }
  if (userWallet === window.targetSellerAddress) { await showNeonPopup('Not Allowed', 'You cannot review yourself!', 'OK'); return; }
  const rating = parseInt(document.getElementById('reviewRating').value);
  if (rating < 1 || rating > 5) { await showNeonPopup('Invalid Rating', 'Rating must be 1-5.', 'OK'); return; }
  const commentRaw = document.getElementById('reviewComment').value.trim();
  if (commentRaw.length > MAX_REVIEW_LEN) { await showNeonPopup('Too Long', `Review max ${MAX_REVIEW_LEN} chars.`, 'OK'); return; }
  if (containsPhoneNumber(commentRaw) || /https?:\/\//i.test(commentRaw)) { await showNeonPopup('Rule Violation', 'No phone numbers or links in reviews!', 'OK'); return; }
  const comment = commentRaw || '';
  const { data: ex } = await supabase.from('reviews').select('id').eq('seller_address', window.targetSellerAddress).eq('buyer_address', userWallet).single();
  if (ex) { await showNeonPopup('Already Reviewed', 'One review per buyer per seller.', 'OK'); return; }
  const { error } = await supabase.from('reviews').insert([{ seller_address: window.targetSellerAddress, buyer_address: userWallet, buyer_name: currentUsername, rating, comment }]);
  if (!error) { document.getElementById('reviewComment').value = ''; await showNeonPopup('Success', 'Review submitted!', 'OK'); window.openReviews(window.targetSellerAddress, 'Seller'); }
  else { console.error('[REVIEW ERROR]', error); await showNeonPopup('Error', 'Could not submit review.', 'OK'); }
};

// ==========================================
// ADMIN PANEL
// ==========================================
window.openAdminPanel = async function() {
  if (!userWallet || userWallet.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
    await showNeonPopup('Unauthorized', 'Admin only.', 'OK'); return;
  }
  document.getElementById('adminModal').style.display = 'flex';
  document.querySelector('#adminModal .modal-content').style.animation = 'slideInUp 0.35s ease';
  const statsContainer = document.getElementById('adminStatsContainer');
  const listingsContainer = document.getElementById('adminListingsContainer');
  statsContainer.innerHTML = `<p class="loading-placeholder">${t('loadingStats')}</p>`;
  listingsContainer.innerHTML = showSkeleton(3);

  const { count: totalListings } = await supabase.from('listings').select('*', { count: 'exact', head: true }).neq('status', 'deleted');
  const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: totalChats } = await supabase.from('chats').select('*', { count: 'exact', head: true });

  statsContainer.innerHTML = `<div class="admin-stats-grid"><div class="detail-section"><b class="admin-stat-number admin-stat-indigo">${totalListings || 0}</b><span class="sow-stats-label">${t('activeAds')}</span></div><div class="detail-section"><b class="admin-stat-number admin-stat-success">${totalUsers || 0}</b><span class="sow-stats-label">${t('users')}</span></div><div class="detail-section"><b class="admin-stat-number admin-stat-warning">${totalChats || 0}</b><span class="sow-stats-label">${t('messages')}</span></div></div>`;

  const { data: listings } = await supabase.from('listings').select('*').neq('status', 'deleted').order('created_at', { ascending: false });
  if (!listings || listings.length === 0) { listingsContainer.innerHTML = `<p class="loading-placeholder">${t('noListingsFound')}</p>`; return; }

  listingsContainer.innerHTML = listings.map(item => {
    const sT = escapeHtml(item.title), sN = escapeHtml(item.seller_name), sP = escapeHtml(item.price), sI = escapeAttr(item.id);
    return `<div class="my-ad-item"><div><h4 class="my-ad-title">${sT}</h4><p class="my-ad-price admin-ad-subtitle">By: ${sN} | ${sP} WLD</p></div><button onclick="window.adminDeleteAd('${sI}')" class="btn-mark-sold btn-force-delete">Force Delete</button></div>`;
  }).join('');
};

window.adminDeleteAd = async function(id) {
  const confirmDel = await window.showNeonPopup('Admin Action', 'Force delete this ad?', 'OK', 'confirm');
  if (confirmDel) {
    let deleted = false;
    try { const { data: rpcResult } = await supabase.rpc('delete_ad', { p_ad_id: id, p_wallet: ADMIN_WALLET }); if (rpcResult && rpcResult.success) deleted = true; } catch (e) {}
    if (!deleted) { try { const { data: rpcResult } = await supabase.rpc('mark_ad_sold', { p_ad_id: id, p_wallet: ADMIN_WALLET }); if (rpcResult && rpcResult.success) deleted = true; } catch (e) {} }
    if (!deleted) {
      const { data: adData } = await supabase.from('listings').select('title, image1, image2, image3, image4').eq('id', id).single();
      if (adData) {
        for (const imgUrl of [adData.image1, adData.image2, adData.image3, adData.image4]) {
          if (imgUrl && imgUrl.includes('/listing/')) {
            const filePath = imgUrl.split('/listing/')[1];
            if (filePath) await supabase.storage.from('listing').remove([filePath]);
          }
        }
      }
      try { await supabase.from('listings').delete().match({ id }); deleted = true; } catch (e) {}
    }
    await showNeonPopup(deleted ? 'Success' : 'Info', deleted ? 'Ad deleted by admin.' : 'Could not delete. Run SUPABASE_SQL_DELETE.sql.', 'OK');
    window.openAdminPanel();
    fetchListings();
  }
};

// ==========================================
// MY ADS
// ==========================================
window.openMyAdsScreen = async function() {
  if (!userWallet) {
    document.getElementById('myAdsContainer').innerHTML = `<p class="loading-placeholder">Please connect wallet first.</p>`;
    document.getElementById('myAdsBalanceCard').innerHTML = '';
    return;
  }
  const container = document.getElementById('myAdsContainer');
  container.innerHTML = showSkeleton(3);

  const { data: balData } = await supabase.from('sow_balances').select('balance').eq('wallet_address', userWallet).single();
  const earnedSow = balData ? balData.balance : 0;

  document.getElementById('myAdsBalanceCard').innerHTML = `<div class="sow-stats-inner"><div class="sow-stats-left"><span class="sow-stats-icon">SOW</span><div><p class="sow-stats-label">SOW Balance</p><p class="sow-stats-value">${earnedSow}</p></div></div><button onclick="window.openLeaderboard()" class="sow-stats-lead-btn">Rankings</button></div>`;

  const { data: allMyAds } = await supabase.from('listings').select('*').eq('seller_address', userWallet).neq('status', 'deleted').order('created_at', { ascending: false });

  const activeAds = (allMyAds || []).filter(a => a.status === 'active');
  const soldAds = (allMyAds || []).filter(a => a.status === 'sold');

  let html = '';
  if (activeAds.length > 0) {
    html += `<p class="my-ads-section-title">Active (${activeAds.length})</p>`;
    html += activeAds.map(item => {
      const sI = escapeAttr(item.id), sT = escapeHtml(item.title), sP = escapeHtml(item.price), sC = escapeHtml(item.country);
      return `<div onclick="window.openAdDetails('${sI}')" class="my-ad-item"><div><h4 class="my-ad-title">${sT}</h4><p class="my-ad-price">${sP} WLD (${sC})</p></div><div class="my-ad-actions-row"><button onclick="event.stopPropagation(); window.markAsSoldOut('${sI}')" class="btn-mark-sold">${t('markSold')}</button><button onclick="event.stopPropagation(); window.deleteMyAd('${sI}')" class="btn-delete-ad">${t('delete')}</button></div></div>`;
    }).join('');
  }
  if (soldAds.length > 0) {
    html += `<p class="my-ads-section-title">Sold (${soldAds.length})</p>`;
    html += soldAds.map(item => {
      const sI = escapeAttr(item.id), sT = escapeHtml(item.title), sP = escapeHtml(item.price), sC = escapeHtml(item.country);
      return `<div onclick="window.openAdDetails('${sI}')" class="my-ad-item sold"><div><h4 class="my-ad-title my-ad-sold-title">${sT}</h4><p class="my-ad-price my-ad-sold-price">${sP} WLD (${sC})</p></div><span class="btn-sold-done">${t('sold')}</span></div>`;
    }).join('');
  }
  if (!html) html = '<p class="loading-placeholder">No ads yet. Post your first ad!</p>';
  container.innerHTML = html;
};

// ==========================================
// DELETE AD
// ==========================================
window.deleteMyAd = async function(id) {
  if (!userWallet) { await showNeonPopup('Error', 'Connect wallet first.', 'OK'); return; }
  if (!checkRateLimit('deleteAd', 3000)) { await showNeonPopup('Slow Down', t('deleteRate'), 'OK'); return; }
  const isConfirmed = await showNeonPopup('Delete Ad?', 'This ad will be permanently removed. Your SOW coins are safe!', 'OK', 'confirm');
  if (!isConfirmed) return;

  const { data: adData, error: fetchErr } = await supabase.from('listings').select('seller_address, status').eq('id', id).single();
  if (fetchErr || !adData) { await showNeonPopup('Error', 'Ad not found.', 'OK'); return; }
  if (adData.seller_address.toLowerCase() !== userWallet.toLowerCase()) { await showNeonPopup('Unauthorized', 'You can only delete your own ads.', 'OK'); return; }
  if (adData.status === 'deleted') { await showNeonPopup('Info', 'Already deleted.', 'OK'); window.openMyAdsScreen(); return; }

  let deleteOk = false;
  try { const { data: rpcResult } = await supabase.rpc('delete_ad', { p_ad_id: id, p_wallet: userWallet }); if (rpcResult && rpcResult.success) deleteOk = true; } catch (e) {}
  if (!deleteOk) { try { const { data: updateData, error: updateErr } = await supabase.from('listings').update({ status: 'deleted' }).eq('id', id).eq('seller_address', userWallet).select('id, status'); if (!updateErr && updateData && updateData.length > 0) deleteOk = true; } catch (e) {} }

  if (deleteOk) {
    const { data: verifyData } = await supabase.from('listings').select('status').eq('id', id).single();
    if (verifyData && verifyData.status === 'deleted') {
      await showNeonPopup('Deleted', 'Ad removed. Your SOW coins are safe!', 'OK');
      window.openMyAdsScreen(); fetchListings(); return;
    }
  }
  await showNeonPopup('Delete Failed', 'Could not delete ad. Run SUPABASE_SQL_DELETE.sql in Supabase.', 'OK');
};

// ==========================================
// MARK AS SOLD
// ==========================================
window.markAsSoldOut = async function(id) {
  if (!userWallet) { await showNeonPopup('Error', 'Connect wallet first.', 'OK'); return; }
  if (!checkRateLimit('soldOut', 3000)) { await showNeonPopup('Slow Down', t('deleteRate'), 'OK'); return; }
  const isConfirmed = await showNeonPopup('Mark as Sold?', 'Your SOW coins will stay!', 'OK', 'confirm');
  if (!isConfirmed) return;

  const { data: adData, error: fetchErr } = await supabase.from('listings').select('seller_address, status').eq('id', id).single();
  if (fetchErr || !adData) { await showNeonPopup('Error', 'Ad not found.', 'OK'); return; }
  if (adData.seller_address.toLowerCase() !== userWallet.toLowerCase()) { await showNeonPopup('Unauthorized', 'You can only mark your own ads as sold.', 'OK'); return; }
  if (adData.status === 'sold') { await showNeonPopup('Already Sold', 'This ad is already sold.', 'OK'); window.openMyAdsScreen(); return; }

  let soldOk = false;
  try { const { data: rpcResult } = await supabase.rpc('mark_ad_sold', { p_ad_id: id, p_wallet: userWallet }); if (rpcResult && rpcResult.success) soldOk = true; } catch (rpcErr) {}
  if (!soldOk) { try { const { data: updateData, error: updateErr } = await supabase.from('listings').update({ status: 'sold' }).eq('id', id).select('id, status'); if (!updateErr && updateData && updateData.length > 0) soldOk = true; } catch (e) {} }

  if (soldOk) {
    const { data: verifyData } = await supabase.from('listings').select('status').eq('id', id).single();
    if (verifyData && verifyData.status === 'sold') {
      await showNeonPopup('Sold', 'Ad marked as sold. Your SOW coins are safe!', 'OK');
      window.openMyAdsScreen(); fetchListings(); return;
    }
  }
  await showNeonPopup('Update Failed', 'Could not mark as sold. Run SUPABASE_SQL_FIX.sql.', 'OK');
};

// ==========================================
// LEADERBOARD
// ==========================================
window.openLeaderboard = async function() {
  document.getElementById('leaderboardModal').style.display = 'flex';
  document.querySelector('#leaderboardModal .modal-content').style.animation = 'slideInUp 0.35s ease';
  const container = document.getElementById('leaderboardContainer');
  container.innerHTML = showSkeleton(3);
  const { data: balances, error: balError } = await supabase.from('sow_balances').select('*').order('balance', { ascending: false }).limit(50);
  if (balError || !balances || balances.length === 0) { container.innerHTML = `<p class="loading-placeholder">${t('noSowData')}</p>`; return; }
  const wallets = balances.map(b => b.wallet_address);
  const { data: usersData } = await supabase.from('users').select('*').in('wallet_address', wallets);
  const userMap = {};
  if (usersData) { usersData.forEach(u => { userMap[u.wallet_address] = u.username; }); }

  const rankLabels = ['1st', '2nd', '3rd'];
  container.innerHTML = balances.map((item, index) => {
    const isTop3 = index < 3;
    const username = escapeHtml(userMap[item.wallet_address] || 'Unknown User');
    const bal = escapeHtml(item.balance);
    const rankText = isTop3 ? rankLabels[index] : '#' + (index + 1);
    return `<div class="${isTop3 ? 'lb-item top-3' : 'lb-item'}"><div class="lb-info-row"><span class="lb-rank">${rankText}</span><div><h4 class="lb-name">${username}</h4></div></div><div class="lb-right"><div class="lb-balance">${bal}</div><div class="lb-balance-label">SOW</div></div></div>`;
  }).join('');
};

// ==========================================
// SOW BADGE UPDATE
// ==========================================
async function updateSowBadge() {
  if (!userWallet) return;
  try {
    const { data: balData } = await supabase.from('sow_balances').select('balance').eq('wallet_address', userWallet).single();
    const sow = balData ? balData.balance : 0;
    const statsCard = document.getElementById('sowStatsCard');
    const homeCount = document.getElementById('homeSowCount');
    if (statsCard) statsCard.style.display = 'block';
    if (homeCount) homeCount.textContent = sow;
  } catch (e) {}
}

// ==========================================
// PROFILE
// ==========================================
window.renderProfile = async function() {
  const container = document.getElementById('profileContainer');
  if (!userWallet || !currentUsername) {
    container.innerHTML = `<div class="text-center py-20 color-muted"><p class="profile-wallet-icon">W</p><p class="profile-title">${t('walletNotConnected')}</p><p class="profile-subtitle">${t('connectToAccess')}</p></div>`;
    return;
  }
  const { data: balData } = await supabase.from('sow_balances').select('balance').eq('wallet_address', userWallet).single();
  const earnedSow = balData ? balData.balance : 0;
  const isAdmin = userWallet.toLowerCase() === ADMIN_WALLET.toLowerCase();
  const verifiedHtml = isVerified ? '<span class="verify-badge verify-badge-inline">Verified</span>' : '';

  container.innerHTML = `
    <div class="profile-card">
      <div class="profile-header-row">
        <div>
          <p class="profile-label">Profile</p>
          <h3 class="profile-name">${escapeHtml(currentUsername)}${verifiedHtml}</h3>
        </div>
        <span class="sow-stats-icon">SOW</span>
      </div>
      <div class="profile-balance-section">
        <p class="profile-label">SOW Balance</p>
        <p class="sow-stats-value">${earnedSow}</p>
      </div>
    </div>
    <div class="profile-actions">
      <button onclick="window.openLeaderboard()" class="btn-profile-action btn-leaderboard">View Leaderboard</button>
      <button onclick="verifyWorldID().then(v => { if(v) { isVerified=true; window.renderProfile(); } })" class="btn-profile-action btn-verify">Verify World ID</button>
      <a href="mailto:airdrophubgroup@gmail.com" class="btn-profile-action btn-support">Support</a>
      ${isAdmin ? '<button onclick="window.openAdminPanel()" class="btn-profile-action btn-admin">Admin Panel</button>' : ''}
    </div>
  `;
};
