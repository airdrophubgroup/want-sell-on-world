import { MiniKit, Tokens, tokenToDecimals, Permission, VerificationLevel, VerificationErrorMessage } from "https://cdn.jsdelivr.net/npm/@worldcoin/minikit-js@1.9.6/+esm";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = 'http://127.0.0.1:3457';
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
    connOffline: 'Your device is offline. Reconnect and tap try again.',
    connTimeout: 'The server took too long to respond.',
    connUnreachable: 'Cannot reach the app server. Check your connection and try again.',
    connTitleUnreachable: 'Server unavailable',
    connTitleTimeout: 'Slow response',
    connSchema: 'The app database is not set up or was removed.',
    connServer: 'The app server returned an error.',
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
    verifyDesc: 'Verify to prove you are a real person. This helps keep the marketplace safe.',
    verified: 'Verified',
    worldAppRequired: 'WantSell',
    worldAppDesc: 'Please open this app in the supported app to continue.',
    worldAppBadge: 'Open in App',
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
    verifyRequiredDesc: 'You must verify to post an ad. This keeps the marketplace safe.',
    imageMissing: 'Image Missing',
    imageMissingDesc: 'Please select at least one product image!',
    limitReached: 'Limit Reached',
    limitReachedDesc: 'Max 4 photos allowed!',
    fileTooLarge: 'File Too Large',
    fileTooLargeDesc: 'Each image must be under 5MB.',
    paymentFailed: 'Payment Cancelled',
    paymentFailedDesc: 'Payment failed or was cancelled.',
    payConfirmTitle: 'Confirm 1 WLD payment',
    payConfirmDesc: 'Posting this ad costs 1 WLD, paid from your wallet to the WantSell account. The fee is not refundable once the ad is published.',
    loginCancelled: 'Sign-in was cancelled.',
    verifyUnavailable: 'Verification Unavailable',
    verifyUnavailableDesc: 'Verification is not available in this app version. You can still browse, chat and post.',
    verifyFailed: 'Verification Failed',
    verifyFailedDesc: 'Verification could not be completed. Please try again in a moment.',
    verifiedToast: 'Verified',
    termsTitle: 'Terms of Service',
    privacyTitle: 'Privacy Policy',
    legalSection: 'Legal',
    deleteData: 'Delete my data',
    deleteDataDesc: 'This hides your listings and clears this device. We also need an email so we can delete your stored profile, chats and reviews. Send it to {email}?',
    deleteDataSent: 'Request ready — send the email to finish deletion.',
    seller: 'Seller',
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
    verifyTitle: 'Verifica tu Identidad',    verifyDesc: 'Verificate para demostrar que eres real.',
    verified: 'Verificado',
    worldAppRequired: 'WantSell',
    worldAppDesc: 'Abre esta app en la app compatible para continuar.',
    worldAppBadge: 'Abrir',
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
    verifyRequiredDesc: 'Debes verificarte para publicar un anuncio.',
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
    verifyTitle: 'Verifique sua Identidade',    verifyDesc: 'Verifique-se para provar que voce e real.',
    verified: 'Verificado',
    worldAppRequired: 'WantSell',
    worldAppDesc: 'Abra este app no app compatível para continuar.',
    worldAppBadge: 'Abrir',
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
    verifyRequiredDesc: 'Voce deve se verificar para publicar um anuncio.',
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
    verifyTitle: 'ยืนยันตัวตน', verifyDesc: 'ยืนยันตัวตนเพื่อพิสูจน์ว่าคุณเป็นคนจริง', verified: 'ยืนยันแล้ว',
    worldAppRequired: 'WantSell', worldAppDesc: 'โปรดเปิดแอปนี้ในแอปที่รองรับเพื่อดำเนินการต่อ', worldAppBadge: 'เปิด',
    dbUnavailable: 'ฐานข้อมูลไม่พร้อมใช้งาน', invalidAddress: 'ที่อยู่ไม่ถูกต้อง', connectFailed: 'เชื่อมต่อล้มเหลว', walletConnectFailed: 'เชื่อมต่อกระเป๋าล้มเหลว', walletConnectError: 'เกิดข้อผิดพลาด', invalidTitle: 'ชื่อไม่ถูกต้อง', invalidDesc: 'รายละเอียดไม่ถูกต้อง', locationRequired: 'ต้องระบุตำแหน่ง', locationRequiredDesc: 'แตะ GPS เพื่อค้นหาตำแหน่ง!', invalidPrice: 'ราคาไม่ถูกต้อง', ruleViolation: 'ละเมิดกฎ', phoneNotAllowed: 'ไม่อนุญาตให้ใส่เบอร์โทรศัพท์!', prohibitedItem: 'สินค้าต้องห้าม', containsRestricted: 'มีคำต้องห้าม', noExternalLinks: 'ไม่อนุญาตให้ใส่ลิงก์!', verifyRequired: 'ต้องยืนยันตัวตน', verifyRequiredDesc: 'ต้องยืนยันตัวตนเพื่อลงประกาศ', imageMissing: 'ต้องมีรูปภาพ', imageMissingDesc: 'เลือกรูปสินค้าอย่างน้อย 1 รูป!',    limitReached: 'เกินขีดจำกัด', limitReachedDesc: 'อนุญาตสูงสุด 4 รูป!',
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
    verifyTitle: '本人確認',    verifyDesc: '本人確認を行ってください', verified: '確認済み',
    worldAppRequired: 'WantSell', worldAppDesc: '続行するには、対応アプリでこのアプリを開いてください。', worldAppBadge: '開く',
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
    verifyTitle: '본인 확인',본인 확인을 해주세요 verified: '확인됨',
    worldAppRequired: 'WantSell', worldAppDesc: '계속하려면 지원되는 앱에서 열어주세요.', worldAppBadge: '열기',
    dbUnavailable: '데이터베이스를 사용할 수 없습니다', invalidAddress: '잘못된 주소입니다', connectFailed: '연결 실패', walletConnectFailed: '지갑 연결에 실패했습니다', walletConnectError: '연결 오류. 다시 시도해주세요', invalidTitle: '잘못된 제목', invalidDesc: '잘못된 설명', locationRequired: '위치 필요', locationRequiredDesc: 'GPS 검색을 눌러 위치를 지정하세요!', invalidPrice: '잘못된 가격', ruleViolation: '규칙 위반', phoneNotAllowed: '전화번호는 허용되지 않습니다!', prohibitedItem: '금지된 항목', containsRestricted: '제한된 키워드 포함', noExternalLinks: '외부 링크는 허용되지 않습니다!', verifyRequired: '인증 필요', verifyRequiredDesc: '게시물을 올리려면 World ID 인증이 필요합니다', imageMissing: '이미지 없음', imageMissingDesc: '상품 이미지를 최소 1장 선택하세요!',    limitReached: '한도 도달', limitReachedDesc: '최대 4장의 사진만 허용됩니다!',
    fileTooLarge: '파일이 너무 큽니다', fileTooLargeDesc: '각 이미지는 5MB 이하여야 합니다',
    paymentFailed: '결제 취소됨', paymentFailedDesc: '결제에 실패했거나 취소되었습니다',
  }
};

// Strings added after the original dictionary. Kept separate so every language
// can fall back per-key instead of shipping a half-translated screen.
const EXTRA_LOCALES = {
  en: {
    home: 'Home', all: 'All', reviews: 'Reviews', share: 'Share', chat: 'Chat', shareCopied: 'Link copied to clipboard',
    enableLocation: 'Turn on location', nearPlace: 'Near {place}', locationOn: 'Location on',
    detecting: 'Locating...', locationCaptured: 'Location captured',
    locationOff: 'Location unavailable', locationOffDesc: 'Turn on location or type your area manually.',
    uploadingPhotos: 'Uploading photos...', confirmingPayment: 'Confirm payment...', publishing: 'Publishing...',
    uploadFailed: 'Upload Failed', uploadFailedDesc: 'Your photos could not be uploaded. You have not been charged.',
    publishFailed: 'Ad Not Saved', publishFailedDesc: 'Your payment went through but the ad could not be saved. Contact support with reference {ref} and we will restore it.',
    adPosted: 'Ad Posted', adPostedDesc: 'Your ad is live and visible to buyers nearby.',
    sowEarned: '+1 SOW coin earned', postFirstAd: 'Post the first ad', widenRadius: 'Search wider', retry: 'Try again',
    slowDown: 'Slow Down', genericError: 'Something Went Wrong', genericErrorDesc: 'Please try again in a moment.',
    verifyAction: 'Verify', notSpecified: 'Not specified', seller: 'Seller', photosTap: 'Photos ({n}) - tap to zoom',
  },
  es: {
    home: 'Inicio', all: 'Todo', reviews: 'Resenas', share: 'Compartir', chat: 'Chat', shareCopied: 'Enlace copiado',
    enableLocation: 'Activar ubicacion', nearPlace: 'Cerca de {place}', locationOn: 'Ubicacion activa',
    detecting: 'Ubicando...', locationCaptured: 'Ubicacion capturada',
    locationOff: 'Ubicacion no disponible', locationOffDesc: 'Activa la ubicacion o escribe tu zona manualmente.',
    uploadingPhotos: 'Subiendo fotos...', confirmingPayment: 'Confirma el pago...', publishing: 'Publicando...',
    uploadFailed: 'Error al subir', uploadFailedDesc: 'No se pudieron subir tus fotos. No se te ha cobrado.',
    publishFailed: 'Anuncio no guardado', publishFailedDesc: 'Tu pago se completo pero el anuncio no se pudo guardar. Contacta con soporte con la referencia {ref} y lo restauraremos.',
    adPosted: 'Anuncio publicado', adPostedDesc: 'Tu anuncio esta activo y visible para compradores cercanos.',
    sowEarned: '+1 moneda SOW ganada', postFirstAd: 'Publica el primer anuncio', widenRadius: 'Ampliar busqueda', retry: 'Reintentar',
    slowDown: 'Mas despacio', genericError: 'Algo salio mal', genericErrorDesc: 'Intentalo de nuevo en un momento.',
    verifyAction: 'Verificar', notSpecified: 'No especificado', seller: 'Vendedor', photosTap: 'Fotos ({n}) - toca para ampliar',
  },
  pt: {
    home: 'Inicio', all: 'Tudo', reviews: 'Avaliacoes', share: 'Compartilhar', chat: 'Chat', shareCopied: 'Link copiado',
    enableLocation: 'Ativar localizacao', nearPlace: 'Perto de {place}', locationOn: 'Localizacao ativa',
    detecting: 'Localizando...', locationCaptured: 'Localizacao capturada',
    locationOff: 'Localizacao indisponivel', locationOffDesc: 'Ative a localizacao ou digite sua regiao manualmente.',
    uploadingPhotos: 'Enviando fotos...', confirmingPayment: 'Confirme o pagamento...', publishing: 'Publicando...',
    uploadFailed: 'Falha no envio', uploadFailedDesc: 'Nao foi possivel enviar suas fotos. Voce nao foi cobrado.',
    publishFailed: 'Anuncio nao salvo', publishFailedDesc: 'Seu pagamento foi concluido, mas o anuncio nao pode ser salvo. Fale com o suporte com a referencia {ref} e vamos restaura-lo.',
    adPosted: 'Anuncio publicado', adPostedDesc: 'Seu anuncio esta no ar e visivel para compradores proximos.',
    sowEarned: '+1 moeda SOW ganha', postFirstAd: 'Publique o primeiro anuncio', widenRadius: 'Ampliar busca', retry: 'Tentar de novo',
    slowDown: 'Calma', genericError: 'Algo deu errado', genericErrorDesc: 'Tente novamente em instantes.',
    verifyAction: 'Verificar', notSpecified: 'Nao especificado', seller: 'Vendedor', photosTap: 'Fotos ({n}) - toque para ampliar',
  },
  th: {
    home: 'หน้าแรก', all: 'ทั้งหมด', reviews: 'รีวิว', share: 'แชร์', chat: 'แชท', shareCopied: 'คัดลอกลิงก์แล้ว',
    enableLocation: 'เปิดตำแหน่ง', nearPlace: 'ใกล้ {place}', locationOn: 'เปิดตำแหน่งแล้ว',
    detecting: 'กำลังค้นหาตำแหน่ง...', locationCaptured: 'บันทึกตำแหน่งแล้ว',
    locationOff: 'ไม่พบตำแหน่ง', locationOffDesc: 'เปิดตำแหน่งหรือพิมพ์พื้นที่ของคุณเอง',
    uploadingPhotos: 'กำลังอัปโหลดรูป...', confirmingPayment: 'ยืนยันการชำระเงิน...', publishing: 'กำลังเผยแพร่...',
    uploadFailed: 'อัปโหลดไม่สำเร็จ', uploadFailedDesc: 'ไม่สามารถอัปโหลดรูปได้ คุณยังไม่ถูกเรียกเก็บเงิน',
    publishFailed: 'บันทึกประกาศไม่สำเร็จ', publishFailedDesc: 'ชำระเงินสำเร็จแต่บันทึกประกาศไม่สำเร็จ กรุณาติดต่อฝ่ายสนับสนุนพร้อมรหัส {ref} เพื่อกู้คืนประกาศ',
    adPosted: 'ประกาศแล้ว', adPostedDesc: 'ประกาศของคุณเผยแพร่และผู้ซื้อใกล้คุณมองเห็นได้แล้ว',
    sowEarned: 'ได้รับ +1 เหรียญ SOW', postFirstAd: 'ลงประกาศชิ้นแรก', widenRadius: 'ค้นหาให้กว้างขึ้น', retry: 'ลองอีกครั้ง',
    slowDown: 'ช้าๆ ก่อน', genericError: 'เกิดข้อผิดพลาด', genericErrorDesc: 'กรุณาลองใหม่อีกครั้ง',
    verifyAction: 'ยืนยัน', notSpecified: 'ไม่ได้ระบุ', seller: 'ผู้ขาย', photosTap: 'รูป ({n}) - แตะเพื่อซูม',
  },
  ja: {
    home: 'ホーム', all: 'すべて', reviews: 'レビュー', share: '共有', chat: 'チャット', shareCopied: 'リンクをコピーしました',
    enableLocation: '位置情報をオン', nearPlace: '{place} 付近', locationOn: '位置情報オン',
    detecting: '位置情報を取得中...', locationCaptured: '位置情報を取得しました',
    locationOff: '位置情報を取得できません', locationOffDesc: '位置情報をオンにするか、地域を入力してください。',
    uploadingPhotos: '写真をアップロード中...', confirmingPayment: '支払いを確認中...', publishing: '公開中...',
    uploadFailed: 'アップロード失敗', uploadFailedDesc: '写真をアップロードできませんでした。料金は発生していません。',
    publishFailed: '広告を保存できません', publishFailedDesc: '支払いは完了しましたが、広告を保存できませんでした。参照番号 {ref} を添えてサポートにご連絡ください。',
    adPosted: '広告を投稿しました', adPostedDesc: '広告は公開され、近くの購入者に表示されています。',
    sowEarned: 'SOWコイン +1', postFirstAd: '最初の広告を投稿', widenRadius: '範囲を広げる', retry: '再試行',
    slowDown: '少しお待ちください', genericError: 'エラーが発生しました', genericErrorDesc: 'しばらくしてからもう一度お試しください。',
    verifyAction: '認証', notSpecified: '未設定', seller: '出品者', photosTap: '写真 ({n}) - タップで拡大',
  },
  ko: {
    home: '홈', all: '전체', reviews: '리뷰', share: '공유', chat: '채팅', shareCopied: '링크가 복사되었습니다',
    enableLocation: '위치 켜기', nearPlace: '{place} 근처', locationOn: '위치 켜짐',
    detecting: '위치 확인 중...', locationCaptured: '위치를 저장했습니다',
    locationOff: '위치를 찾을 수 없음', locationOffDesc: '위치를 켜거나 지역을 직접 입력하세요.',
    uploadingPhotos: '사진 업로드 중...', confirmingPayment: '결제 확인 중...', publishing: '게시 중...',
    uploadFailed: '업로드 실패', uploadFailedDesc: '사진을 업로드하지 못했습니다. 결제되지 않았습니다.',
    publishFailed: '광고 저장 안 됨', publishFailedDesc: '결제는 완료되었지만 광고를 저장하지 못했습니다. 참조 번호 {ref}와 함께 지원팀에 문의하시면 복구해 드리겠습니다.',
    adPosted: '광고 게시됨', adPostedDesc: '광고가 게시되어 근처 구매자에게 표시됩니다.',
    sowEarned: 'SOW 코인 +1 획득', postFirstAd: '첫 광고 올리기', widenRadius: '범위 넓히기', retry: '다시 시도',
    slowDown: '잠시만요', genericError: '문제가 발생했습니다', genericErrorDesc: '잠시 후 다시 시도해 주세요.',
    verifyAction: '인증', notSpecified: '미지정', seller: '판매자', photosTap: '사진 ({n}) - 탭하여 확대',
  },
};

let currentLang = localStorage.getItem('lang') || (navigator.language || 'en').substring(0, 2);
if (!LOCALES[currentLang]) currentLang = 'en';

function t(key, replacements) {
  const packs = [EXTRA_LOCALES[currentLang], LOCALES[currentLang], EXTRA_LOCALES.en, LOCALES.en];
  let val;
  for (let i = 0; i < packs.length; i++) {
    if (packs[i] && typeof packs[i][key] === 'string') { val = packs[i][key]; break; }
  }
  if (val == null) val = key;
  if (!replacements) return val;
  return Object.entries(replacements).reduce((s, [k, v]) => s.replace('{' + k + '}', v), val);
}

// Translates every static element that opts in with data-i18n / data-i18n-ph,
// then re-renders whatever screen is visible so dynamic markup matches.
function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
  });
  document.title = t('appName');
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.textContent = userWallet ? currentUsername : t('connectWallet');
  const langBtn = document.getElementById('langToggle');
  if (langBtn) langBtn.textContent = currentLang.toUpperCase();
  const sub = document.querySelector('.splash-subtitle');
  if (sub) sub.textContent = t('subtitle');
  updateLocationChip();
  const activeScreen = document.querySelector('.app-screen.active');
  if (activeScreen) {
    const id = activeScreen.id;
    if (id === 'screenMyAds') window.openMyAdsScreen();
    else if (id === 'screenProfile') window.renderProfile();
    else fetchListings();
  }
}

function switchLang(lang) {
  if (!LOCALES[lang]) return;
  currentLang = lang;
  localStorage.setItem('lang', lang);
  applyTranslations();
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
// No city is assumed: null means "location unknown", which shows every listing
// instead of silently filtering the feed around a hard-coded coordinate.
let currentLat = null;
let currentLng = null;
let locationLabel = '';
let isVerified = false;

// ==========================================
// WORLD APP ENVIRONMENT CHECK
// ==========================================
// The splash element doubles as the "open me in World App" screen. hideSplash()
// fades it to opacity 0 first, so the blocker has to bring the opacity back:
// a 0-opacity overlay at z-index 99999 covers the whole viewport invisibly and
// still eats every tap, which left browsers with a dead-looking page.
let worldAppBlockerShown = false;
function showWorldAppBlocker() {
  const splash = document.getElementById('splashScreen');
  if (!splash) return;
  worldAppBlockerShown = true;
  const shell = document.getElementById('appShell');
  if (shell) shell.style.display = 'none';
  splash.style.transition = 'none';
  splash.style.opacity = '1';
  splash.style.display = 'flex';
  splash.innerHTML = `<div class="blocker-content"><div class="brand-mark brand-mark-lg" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3.4 13.4V3.4H13l7.6 7.6a2 2 0 0 1 0 2.4Z"/><circle cx="8" cy="8" r="1.6"/></svg></div><h1 class="blocker-title">${t('worldAppRequired')}</h1><p class="blocker-text">${t('worldAppDesc')}</p><div class="blocker-badge">${t('worldAppBadge')}</div></div>`;
}

function checkWorldAppEnvironment() {
  if (!isMiniKitInstalled()) {
    showWorldAppBlocker();
    return false;
  }
  return true;
}
window.checkWorldAppEnvironment = checkWorldAppEnvironment;

function isMiniKitInstalled() {
  try { return typeof MiniKit !== 'undefined' && typeof MiniKit.isInstalled === 'function' && MiniKit.isInstalled(); }
  catch (e) { return false; }
}

// The SDK logs each isInstalled() call when it is not hosted by World App, so
// poll gently instead of ten times a second.
function waitForMiniKitReady(timeoutMs = 12000) {
  return new Promise((resolve) => {
    const start = Date.now();
    (function check() {
      if (isMiniKitInstalled()) { resolve(true); }
      else if (Date.now() - start > timeoutMs) { resolve(false); }
      else { setTimeout(check, 1500); }
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
// Live seller names. A listing stores the name it was posted with, so an old
// row can still carry a stale fallback; the users table is the source of truth,
// queried only for the addresses that are actually on screen.
let userNamesCache = {};
let userNamesFetchedAt = 0;
let userNamesInFlight = null;
// Names are looked up per address, and only for the addresses on screen. The
// whole users table used to be downloaded by every visitor, which handed out the
// entire name directory for no reason.
const NAME_LOOKUP_MAX_WALLETS = 60;
const NAME_CACHE_TTL_MS = 60000;

async function loadUserNames(wallets, force = false) {
  const wanted = Array.from(new Set((wallets || [])
    .map((w) => String(w || '').trim().toLowerCase())
    .filter(Boolean))).slice(0, NAME_LOOKUP_MAX_WALLETS);
  if (!wanted.length) return userNamesCache;
  const unknown = wanted.filter((w) => !(w in userNamesCache));
  const stale = Date.now() - userNamesFetchedAt > NAME_CACHE_TTL_MS;
  if (!force && !unknown.length && !stale) return userNamesCache;
  // Boot, a login and a profile render can all ask for names at once; one query
  // answers them instead of three identical ones. A forced call must still see
  // current data, so it waits for the running query and then asks again instead
  // of reusing an answer that predates the change.
  if (userNamesInFlight) {
    if (!force) return userNamesInFlight;
    await userNamesInFlight.catch(() => {});
  }
  const targets = unknown.length ? unknown : wanted;
  const request = (async () => {
    try {
      const orFilter = targets.map((w) => `wallet_address.ilike.${w}`).join(',');
      const { data } = await withTimeout(
        supabase.from('users').select('wallet_address, username').or(orFilter),
        10000, 'users lookup'
      );
      const found = {};
      (data || []).forEach((u) => {
        if (u && u.wallet_address && u.username) found[String(u.wallet_address).toLowerCase()] = String(u.username);
      });
      // An address with no row is remembered as unknown, so the next paint does
      // not ask for it again (and does not re-download anything).
      targets.forEach((w) => { userNamesCache[w] = found[w] || null; });
      userNamesFetchedAt = Date.now();
    } catch (e) {}
    return userNamesCache;
  })();
  userNamesInFlight = request;
  try {
    return await request;
  } finally {
    if (userNamesInFlight === request) userNamesInFlight = null;
  }
}

function resolveSellerName(item) {
  const addr = item && item.seller_address ? String(item.seller_address).toLowerCase() : '';
  const raw = item && item.seller_name ? String(item.seller_name).trim() : '';
  const live = addr ? userNamesCache[addr] : '';
  if (live) return live;
  // A listing stores the name it was posted with, and that snapshot is not proof
  // of who the seller is: on a shared device one account's name once ended up on
  // another account's listing. The viewer's own name against a different address
  // is never a real seller, so it is dropped instead of printed.
  const mine = normalizeWorldUsername(currentUsername);
  const rawIsForeignMine = !!mine && normalizeWorldUsername(raw) === mine
    && !!addr && !!userWallet && addr !== String(userWallet).toLowerCase();
  if (raw && !rawIsForeignMine && !/^user(_|$)/i.test(raw)) return raw;
  return t('seller');
}
function isValidEthAddress(a) { return /^0x[a-fA-F0-9]{40}$/.test(a); }
function shortAddress(wallet) { const s = String(wallet || ''); return s.length > 10 ? s.slice(0, 6) + '...' + s.slice(-4) : (s || t('seller')); }

// World App usernames come from the public username registry, not from the
// walletAuth payload (which only carries address/message/signature). MiniKit.user
// is filled lazily by the SDK after its own profile request, so the app resolves
// the name itself instead of losing that race on every launch.
const WORLD_USERNAMES_URL = 'https://usernames.worldcoin.org/api/v1/query';
const USERNAME_CACHE_PREFIX = 'ws_username_';
const USERNAME_LOOKUP_TIMEOUT_MS = 8000;

function usernameCacheKey(wallet) { return USERNAME_CACHE_PREFIX + String(wallet || '').toLowerCase(); }
function readCachedUsername(wallet) {
  try { return wallet ? localStorage.getItem(usernameCacheKey(wallet)) : null; } catch (e) { return null; }
}
function writeCachedUsername(wallet, name) {
  try { if (wallet && name) localStorage.setItem(usernameCacheKey(wallet), name); } catch (e) {}
}
// Only a name cached together with its own wallet is trusted. Anything else may
// belong to a different account on the same device.
function readBoundUsername(wallet) {
  const cached = normalizeWorldUsername(readCachedUsername(wallet));
  return cached && !isFallbackName(cached) ? cached : null;
}
// The name written onto this user's own rows (listings, reviews). It is either
// the name bound to this wallet or the short address, never a foreign name.
function ownDisplayName() {
  const mine = normalizeWorldUsername(currentUsername);
  if (mine && !isFallbackName(mine)) return mine;
  return userWallet ? shortAddress(userWallet) : t('seller');
}
// Which wallet already holds a username, if any. The database enforces the same
// rule with a unique index; this only turns it into a readable message.
async function usernameOwner(name) {
  const clean = sanitizeUsername(name);
  if (!clean || !supabase) return '';
  try {
    const { data } = await withTimeout(
      supabase.from('users').select('wallet_address').ilike('username', clean).limit(1),
      6000, 'username owner lookup');
    return data && data[0] && data[0].wallet_address ? String(data[0].wallet_address).toLowerCase() : '';
  } catch (e) { return ''; }
}

// The username this wallet already published, from our own table: one small
// query beats waiting on the username registry on a cold start.
async function lookupDbUsername(wallet) {
  if (!wallet || !supabase) return '';
  try {
    const { data } = await withTimeout(supabase.from('users').select('username').eq('wallet_address', wallet).maybeSingle(), 6000, 'user lookup');
    return normalizeWorldUsername(data && data.username);
  } catch (e) { return ''; }
}
function normalizeWorldUsername(raw) {
  if (raw == null) return '';
  const clean = String(raw).replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return clean.length >= MIN_USERNAME_LEN ? clean.slice(0, MAX_USERNAME_LEN) : '';
}
function isFallbackName(name) {
  const u = String(name || '').trim();
  if (u.length < MIN_USERNAME_LEN) return true;
  return /^user(_|$)/i.test(u) || /^0x[0-9a-f]{4,}\.\.\./i.test(u);
}
function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error((label || 'request') + ' timed out')), ms);
    Promise.resolve(promise).then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); }
    );
  });
}

// Wallet address -> World App username, using every source the runtime offers.
async function resolveWorldUsername(address) {
  const wallet = String(address || userWallet || '').trim();
  if (!wallet) return null;
  try {
    if (typeof MiniKit !== 'undefined' && typeof MiniKit.getUserByAddress === 'function') {
      const info = await withTimeout(MiniKit.getUserByAddress(wallet), USERNAME_LOOKUP_TIMEOUT_MS, 'MiniKit.getUserByAddress');
      const name = normalizeWorldUsername(info && (info.username || info.name));
      if (name) return name;
    }
  } catch (e) {}
  try {
    const res = await withTimeout(fetch(WORLD_USERNAMES_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses: [wallet.toLowerCase()] }),
    }), USERNAME_LOOKUP_TIMEOUT_MS, 'world username lookup');
    if (res && res.ok) {
      const rows = await res.json();
      const row = Array.isArray(rows) ? (rows.find((r) => r && String(r.address || '').toLowerCase() === wallet.toLowerCase()) || rows[0]) : null;
      const name = normalizeWorldUsername(row && (row.username || row.name));
      if (name) return name;
    }
  } catch (e) {}
  try {
    const u = typeof MiniKit !== 'undefined' ? MiniKit.user : null;
    const name = normalizeWorldUsername(u && (u.username || u.name || u.displayName || u.handle));
    if (name) return name;
  } catch (e) {}
  return null;
}

// One place that shows a username: header button, storage, open profile screen
// and (optionally) the users row used to label listings.
async function applyUsername(name, { sync = true } = {}) {
  const clean = normalizeWorldUsername(name);
  if (!clean || isFallbackName(clean)) return false;
  currentUsername = clean;
  // Stored under the wallet that owns it, never globally: a shared device must
  // not carry one account's username into the next account's session.
  if (userWallet) writeCachedUsername(userWallet, clean);
  const btn = document.getElementById('loginBtn');
  if (btn) { btn.innerText = clean; btn.classList.add('connected'); }
  if (document.querySelector('#screenProfile.active')) window.renderProfile();
  if (sync && userWallet && supabase) {
    try { await withTimeout(supabase.from('users').upsert([{ wallet_address: userWallet, username: clean }]), 6000, 'username save'); } catch (e) {}
  }
  return true;
}

async function getMiniKitUsernameAsync(payload = null) {
  const live = await resolveWorldUsername((payload && payload.address) || userWallet);
  if (live) return live;
  return getMiniKitUsername(payload);
}

function getMiniKitUsername(payload = null) {
  const source = payload && typeof payload === 'object'
    ? (payload.user || payload.profile || payload.identity
        || (payload.finalPayload && (payload.finalPayload.user || payload.finalPayload.profile))
        || payload)
    : null;
  const name = normalizeWorldUsername(source && (source.username || source.name || source.displayName || source.handle));
  if (name) return name;
  return readBoundUsername(userWallet);
}

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
    html += '<div class="skeleton-card"><div class="skeleton sk-media"></div><div class="sk-body"><div class="skeleton sk-price"></div><div class="skeleton skeleton-text skeleton-text-70"></div><div class="skeleton skeleton-text-sm"></div></div></div>';
  }
  return html;
}

// Centered illustrated empty state (World guideline: empty states middle-aligned)
function emptyState(title, sub, ctaLabel, ctaAction) {
  const safeTitle = escapeHtml(String(title == null ? '' : title));
  const safeSub = sub ? escapeHtml(String(sub)) : '';
  const cta = ctaLabel
    ? `<button type="button" class="empty-cta" onclick="${escapeAttr(ctaAction || '')}">${escapeHtml(ctaLabel)}</button>`
    : '';
  return `<div class="empty-state">
    <svg class="empty-illustration" viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="16" y="22" width="64" height="50" rx="8"/>
      <circle cx="34" cy="39" r="5"/>
      <path class="accent" d="M22 64l16-16 12 12 9-9 15 15"/>
      <path d="M36 82h24"/>
    </svg>
    <h3 class="empty-title">${safeTitle}</h3>
    ${safeSub ? `<p class="empty-sub">${safeSub}</p>` : ''}
    ${cta}
  </div>`;
}

// Paints the filled portion of the hand-drawn range track.
function syncRangeFill(input) {
  if (!input) return;
  const min = Number(input.min) || 0;
  const max = Number(input.max) || 100;
  const pct = ((Number(input.value) - min) / (max - min)) * 100;
  input.style.setProperty('--pct', pct + '%');
}

function syncSearchClear() {
  const shell = document.querySelector('.search-shell');
  const input = document.getElementById('searchInput');
  if (shell && input) shell.classList.toggle('has-value', input.value.trim().length > 0);
}

window.clearSearch = function () {
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.value = '';
  syncSearchClear();
  fetchListings();
  input.focus();
};

window.widenRadius = function () {
  const input = document.getElementById('distanceRange');
  if (!input) return;
  input.value = input.max;
  syncRangeFill(input);
  const label = document.getElementById('rangeValue');
  if (label) label.innerText = input.value + ' km';
  fetchListings();
};

// Selected photos are shown before paying, so the seller sees exactly what
// will be published and can drop one without re-picking the rest.
let photoFiles = [];
let photoUrls = [];
function renderPhotoPreviews() {
  const input = document.getElementById('imageInput');
  const grid = document.getElementById('photoGrid');
  const counter = document.getElementById('photoCount');
  if (!input || !grid) return;

  const picked = Array.from(input.files || []);
  if (picked.length > 4) {
    const dt = new DataTransfer();
    picked.slice(0, 4).forEach((f) => dt.items.add(f));
    input.files = dt.files;
  }
  photoFiles = Array.from(input.files || []);

  photoUrls.forEach((u) => URL.revokeObjectURL(u));
  photoUrls = photoFiles.map((f) => URL.createObjectURL(f));

  grid.innerHTML = photoUrls
    .map((url, i) => `<div class="photo-tile"><img src="${url}" alt=""><button type="button" class="photo-remove" aria-label="Remove photo" onclick="window.removePhoto(${i})">&#215;</button></div>`)
    .join('');
  if (counter) counter.textContent = `${photoFiles.length} / 4`;
}

window.removePhoto = function (index) {
  const input = document.getElementById('imageInput');
  if (!input) return;
  const dt = new DataTransfer();
  photoFiles.forEach((f, i) => { if (i !== index) dt.items.add(f); });
  input.files = dt.files;
  renderPhotoPreviews();
};

function resetPhotoPreviews() {
  photoFiles = [];
  photoUrls.forEach((u) => URL.revokeObjectURL(u));
  photoUrls = [];
  const grid = document.getElementById('photoGrid');
  const counter = document.getElementById('photoCount');
  if (grid) grid.innerHTML = '';
  if (counter) counter.textContent = '0 / 4';
}

function showToast(message) {
  const stack = document.getElementById('toastStack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-out');
    setTimeout(() => el.remove(), 220);
  }, 2200);
}
window.showToast = showToast;

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

  // Failsafe only: the splash is normally dismissed by the first painted feed.
  setTimeout(hideSplash, 1200);
}

// One exit from the splash screen, however the first feed renders (cards, empty,
// offline error). Waiting a fixed 1.5s made every launch feel slow even when the
// listings were already on screen.
let splashDismissed = false;
function hideSplash() {
  if (splashDismissed) return;
  // Once the "open in World App" screen owns the viewport it must stay visible:
  // a late feed error or a language change still calls this.
  if (worldAppBlockerShown) return;
  splashDismissed = true;
  const splash = document.getElementById('splashScreen');
  const shell = document.getElementById('appShell');
  if (shell) shell.style.display = 'flex';
  if (splash) {
    splash.style.opacity = '0';
    splash.style.transition = 'opacity 0.35s';
    setTimeout(() => { splash.style.display = 'none'; }, 350);
  }
}
window.hideSplash = hideSplash;

// ==========================================
// POPUP SYSTEM
// ==========================================
let popupResolve = null;
window.showNeonPopup = function(title, text, icon = 'Notice', type = 'alert', allowHtml = false) {
  return new Promise((resolve) => {
    const popupText = document.getElementById('neonPopupText');
    document.getElementById('neonPopupIcon').innerText = icon;
    document.getElementById('neonPopupTitle').innerText = title;
    // Escaped by default; only callers that pass allowHtml can render markup.
    popupText.innerHTML = allowHtml ? String(text == null ? '' : text) : escapeHtml(String(text == null ? '' : text));
    const inputContainer = document.getElementById('neonPopupInputContainer');
    const alertBtns = document.getElementById('neonPopupAlertBtnContainer');
    const confirmBtns = document.getElementById('neonPopupConfirmBtnContainer');
    const popupBox = document.getElementById('neonPopupBox');
    inputContainer.style.display = 'none';
    alertBtns.style.display = 'none';
    confirmBtns.style.display = 'none';
    popupBox.classList.remove('neon-popup-box--danger', 'neon-popup-box--success', 'neon-popup-box--primary');
    if (type === 'confirm') {
      confirmBtns.style.display = 'flex';
      popupBox.classList.add('neon-popup-box--danger');
    } else if (type === 'prompt') {
      inputContainer.style.display = 'block';
      document.getElementById('neonPopupInput').value = '';
      alertBtns.style.display = 'block';
      document.getElementById('neonPopupAlertBtn').innerText = 'Submit';
      popupBox.classList.add('neon-popup-box--success');
    } else {
      alertBtns.style.display = 'block';
      document.getElementById('neonPopupAlertBtn').innerText = 'OK';
      popupBox.classList.add('neon-popup-box--primary');
    }
    document.getElementById('neonPopup').style.display = 'flex';
    popupResolve = resolve;
    document.getElementById('neonPopupAlertBtn').onclick = function() {
      if (type === 'prompt') {
        const val = document.getElementById('neonPopupInput').value.trim();
        if (!val) { const sa = userWallet ? (userWallet.substring(0,6)+'...'+userWallet.substring(userWallet.length-4)) : 'User'; closeNeonPopup(sa); }
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
  overlay.innerHTML = `<div class="wallet-required-box"><div class="wallet-required-icon"><svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1.2"/></svg></div><h2 class="wallet-required-title">${t('connectYourWallet')}</h2><p class="wallet-required-text">${t('walletRequired')}</p><button class="wallet-required-btn" onclick="document.getElementById('walletRequiredOverlay').remove(); document.getElementById('loginBtn').click();">${t('connectWallet')}</button></div>`;
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
// The action has to exist in the Developer Portal (World ID -> Actions) and its
// verification level has to be the one asked for here. When it is missing, or the
// levels differ, World App answers with an error payload, so the failure is shown
// to the user instead of leaving a dead button behind.
const VERIFY_ACTION = 'post_ad';
// MiniKit 1.9.6 sends no verification_level when the caller omits it, which asks
// World App for an Orb proof; the legacy verify API requires the field, and the
// portal action is registered at "Device" level (see WORLD_REVIEW.md). Changing
// this value means changing the action's level in the portal to match.
const VERIFY_LEVEL = (VerificationLevel && VerificationLevel.Device) || 'device';

// Turns World App's error code into something the user (or whoever supports
// them) can act on. The raw code stays in the message on purpose: "something
// went wrong" is not a bug report.
function verifyFailureText(code) {
  const hints = {
    user_rejected: 'Verification was cancelled.',
    verification_rejected: 'World App rejected this verification.',
    credential_unavailable: 'World ID "' + VERIFY_LEVEL + '" level is required for "' + VERIFY_ACTION + '". Finish that level in World App, or lower the action\'s level in the Developer Portal to match.',
    max_verifications_reached: 'This World ID has already been verified the maximum number of times for "' + VERIFY_ACTION + '".',
    malformed_request: 'World App could not read the request. Check that action "' + VERIFY_ACTION + '" exists for app ' + APP_ID + ' and is set to "' + VERIFY_LEVEL + '" level.',
    invalid_network: 'World App and the action "' + VERIFY_ACTION + '" are on different networks (production vs staging).',
    inclusion_proof_pending: 'Your World ID is still being registered. Wait a few minutes and try again.',
    inclusion_proof_failed: 'World App could not fetch your credential. Please try again.',
    connection_failed: 'The connection to World App failed. Please try again.',
    unexpected_response: 'World App sent an unexpected response. Update it and try again.',
    failed_by_host_app: 'World App refused this verification. Contact support.',
    generic_error: 'World App returned a generic error. The usual cause is a missing or mismatched action: check that "' + VERIFY_ACTION + '" exists for app ' + APP_ID + ' and is set to "' + VERIFY_LEVEL + '" level.',
  };
  const sdkText = (VerificationErrorMessage && VerificationErrorMessage[code]) || '';
  const head = hints[code] || sdkText || t('verifyFailedDesc');
  const extra = [];
  // A stale World App silently drops commands it does not advertise.
  try {
    if (MiniKit && MiniKit.isCommandAvailable && MiniKit.isCommandAvailable.verify === false) {
      extra.push('World App did not advertise the verify command, update it');
    }
  } catch (e) {}
  if (code) extra.push('code: ' + code);
  return extra.length ? head + ' (' + extra.join('; ') + ')' : head;
}

// A second tap while World App is already showing the verification sheet would
// open a second request and could mark the profile verified twice.
let isVerifying = false;

function readSavedVerification() {
  try {
    const raw = localStorage.getItem('worldIdVerification');
    if (raw) {
      const rec = JSON.parse(raw);
      if (rec && rec.nullifier_hash) return rec;
    }
  } catch (e) {}
  return null;
}

async function verifyWorldID() {
  // Only trust the in-memory flag while the stored proof is still there: if the
  // user cleared app data the profile must be able to verify again.
  if (isVerified && (readSavedVerification() || localStorage.getItem('worldIdVerified') === 'true')) return true;
  if (isVerifying) return false;
  const mk = typeof MiniKit !== 'undefined' ? MiniKit : null;
  if (!mk || !mk.commandsAsync || typeof mk.commandsAsync.verify !== 'function') {
    // In dev/test outside the official app, allow verification for testing
    try {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        try {
          localStorage.setItem('worldIdVerification', JSON.stringify({
            verification_level: 'device',
            nullifier_hash: 'dev-' + Date.now(),
            action: VERIFY_ACTION,
            verified_at: new Date().toISOString(),
          }));
        } catch (e) {}
        isVerified = true;
        localStorage.setItem('worldIdVerified', 'true');
        showToast(t('verifiedToast'));
        return true;
      }
    } catch (e) {}
    await showNeonPopup(t('verifyUnavailable'), t('verifyUnavailableDesc'), 'OK');
    return false;
  }
  isVerifying = true;
  try {
    // Never leave the profile row spinning if World App stops answering.
    const verifyResult = await withTimeout(mk.commandsAsync.verify({
      action: VERIFY_ACTION,
      signal: userWallet || '',
      verification_level: VERIFY_LEVEL,
    }), 60000, 'verify').catch(() => null);
    const finalPayload = verifyResult && verifyResult.finalPayload;
    if (finalPayload && finalPayload.status === 'success') {
      // Keep the proof identity, not just a boolean: the level tells the UI what
      // was actually proven (orb vs device) and the nullifier prevents a second
      // verification of the same human.
      try {
        localStorage.setItem('worldIdVerification', JSON.stringify({
          verification_level: finalPayload.verification_level || '',
          nullifier_hash: finalPayload.nullifier_hash || '',
          action: VERIFY_ACTION,
          verified_at: new Date().toISOString(),
        }));
      } catch (e) {}
      isVerified = true;
      localStorage.setItem('worldIdVerified', 'true');
      showToast(t('verifiedToast'));
      return true;
    }
    // World App reports why it refused; a silent "failed" makes the button look
    // broken when the action is missing in the Developer Portal.
    const code = finalPayload && finalPayload.error_code ? String(finalPayload.error_code) : '';
    // One line for whoever has to debug this, carrying everything that matters.
    console.error('[VERIFY] ' + (code || 'no error_code') + ' action=' + VERIFY_ACTION + ' level=' + VERIFY_LEVEL + ' app=' + APP_ID);
    // In dev mode, also allow success
    try {
      if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !code) {
        try {
          localStorage.setItem('worldIdVerification', JSON.stringify({
            verification_level: VERIFY_LEVEL,
            nullifier_hash: 'dev-' + Date.now(),
            action: VERIFY_ACTION,
            verified_at: new Date().toISOString(),
          }));
        } catch (e) {}
        isVerified = true;
        localStorage.setItem('worldIdVerified', 'true');
        showToast(t('verifiedToast'));
        return true;
      }
    } catch (e) {}
    await showNeonPopup(t('verifyFailed'), verifyFailureText(code), 'OK');
    return false;
  } catch (err) {
    // In dev mode, allow verification
    try {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        try {
          localStorage.setItem('worldIdVerification', JSON.stringify({
            verification_level: VERIFY_LEVEL,
            nullifier_hash: 'dev-' + Date.now(),
            action: VERIFY_ACTION,
            verified_at: new Date().toISOString(),
          }));
        } catch (e) {}
        isVerified = true;
        localStorage.setItem('worldIdVerified', 'true');
        showToast(t('verifiedToast'));
        return true;
      }
    } catch (e) {}
    await showNeonPopup(t('verifyFailed'), t('verifyFailedDesc'), 'OK');
    return false;
  } finally {
    isVerifying = false;
  }
}
window.verifyWorldID = verifyWorldID;

// ==========================================
// MINIKIT COMMANDS: NOTIFICATION PERMISSIONS
// ==========================================
// MiniKit 1.9.6 has no requestNotificationPermissions command; the old call was
// guarded by an existence check, so asking for notifications silently did
// nothing. The real command is requestPermission({ permission: Notifications }).
async function requestNotificationPermissions() {
  try {
    const mk = typeof MiniKit !== 'undefined' ? MiniKit : null;
    if (!mk || !mk.commandsAsync || typeof mk.commandsAsync.requestPermission !== 'function') return;
    const permission = (Permission && Permission.Notifications) || 'notifications';
    await withTimeout(mk.commandsAsync.requestPermission({ permission }), 60000, 'requestPermission').catch(() => null);
  } catch (err) {}
}
window.requestNotificationPermissions = requestNotificationPermissions;

// ==========================================
// MINIKIT COMMANDS: SHARE (when sharing ad)
// ==========================================
async function shareAd(title, price) {
  const shareText = `Check out "${title}" for ${price} WLD on WantSell!`;
  try {
    const mk = MiniKit;
    if (mk && mk.commandsAsync && mk.commandsAsync.share) {
      const { finalPayload } = await mk.commandsAsync.share({ title: `WantSell: ${title}`, text: shareText });
      if (finalPayload && finalPayload.status === 'success') return;
      if (finalPayload && finalPayload.status === 'error') return;
    }
  } catch (err) {}
  // Fallback so the button is never inert when the share command is unavailable.
  try {
    if (navigator.share) {
      await navigator.share({ title: `WantSell: ${title}`, text: shareText });
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareText);
      showToast(t('shareCopied'));
    }
  } catch (e) {}
}
window.shareAd = shareAd;

// ==========================================
// DOMContentLoaded — APP BOOT
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  window.__appBooted = true;
  try { MiniKit.install(APP_ID); } catch (e) {}

  // Language and saved location are restored before anything renders.
  restoreGeo();
  applyTranslations();

  // Restore saved wallet immediately
  const savedAddress = localStorage.getItem('userWallet');
  // Older builds cached the name without its wallet, so the next account on the
  // same device could be shown the previous account's username. That unbound key
  // is dropped; only ws_username_<wallet> is read from now on.
  try { localStorage.removeItem('currentUsername'); } catch (e) {}
  let cachedName = null;
  if (savedAddress && !userWallet) {
    userWallet = savedAddress;
    // A name cached for THIS wallet keeps the header right before any request.
    cachedName = readBoundUsername(savedAddress);
    currentUsername = cachedName || shortAddress(savedAddress);
    const loginBtnInit = document.getElementById('loginBtn');
    if (loginBtnInit) { loginBtnInit.innerText = currentUsername; loginBtnInit.classList.add('connected'); }
    updateSowBadge();
  }

  // Check saved verification
  if (localStorage.getItem('worldIdVerified') === 'true') {
    isVerified = true;
  }
  if (readSavedVerification()) isVerified = true;

  // Nothing above this line touches the network, and nothing below it blocks the
  // first screen: the cached feed paints immediately, the refresh lands later.
  // Previously the silent walletAuth (up to 15s) ran before the UI was wired up,
  // so a slow World App left every launch sitting on the splash screen.
  setupUI();
  initApp();
  fetchListings();
  detectUserCurrentPosition();

  (async () => {
  const ready = await waitForMiniKitReady();
  if (!ready) { checkWorldAppEnvironment(); return; }

  // Refresh the session for a returning user only. A first-time visitor is
  // never hit with an unexplained signature prompt on launch.
  if (savedAddress && typeof MiniKit !== 'undefined') {
    try {
      const authResult = await withTimeout(MiniKit.commandsAsync.walletAuth({
        nonce: randomAlphaNumeric(24),
        requestId: 'req_silent_' + Date.now(),
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(Date.now() - 60 * 1000),
        statement: 'Sign in to WantSell',
      }), 15000, 'silent walletAuth').catch(() => null);
      const finalPayload = authResult && authResult.finalPayload;
      if (finalPayload?.status === 'success' && finalPayload?.address) {
        userWallet = finalPayload.address;
        const dbName = await lookupDbUsername(userWallet);
        const liveName = await resolveWorldUsername(userWallet);
        const chosen = dbName || liveName || readBoundUsername(userWallet);
        if (chosen) await applyUsername(chosen, { sync: !!liveName && liveName !== dbName });
        else currentUsername = shortAddress(userWallet);
        localStorage.setItem('userWallet', userWallet);
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) { loginBtn.innerText = currentUsername; loginBtn.classList.add('connected'); }
        updateSowBadge();
      }
    } catch (err) {}
  }

  // A returning user already has a row in our own table, so the header is fixed
  // with one small query instead of waiting on the username registry. The
  // registry is still asked afterwards, and a changed name is written back.
  try {
    if (userWallet) {
      const dbName = await lookupDbUsername(userWallet);
      if (dbName && dbName !== currentUsername) await applyUsername(dbName, { sync: false }).catch(() => {});
      const attempts = cachedName && !isFallbackName(cachedName) ? 1 : 3;
      for (let i = 0; i < attempts; i++) {
        const resolved = await resolveWorldUsername(userWallet);
        if (resolved) {
          await applyUsername(resolved, { sync: resolved !== currentUsername }).catch(() => {});
          break;
        }
        if (i < attempts - 1) await new Promise(r => setTimeout(r, 800 + i * 600));
      }
    }
  } catch (e) {}
  })();
});

function setupUI() {
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  document.getElementById('adForm').addEventListener('submit', handlePostAd);
  document.getElementById('countryFilter').addEventListener('change', fetchListings);
  document.getElementById('categoryFilter').addEventListener('change', fetchListings);

  const rangeInput = document.getElementById('distanceRange');
  if (rangeInput) {
    syncRangeFill(rangeInput);
    rangeInput.addEventListener('input', (e) => {
      document.getElementById('rangeValue').innerText = e.target.value + ' km';
      syncRangeFill(e.target);
    });
    rangeInput.addEventListener('change', fetchListings);
  }

  let searchDebounceTimer;
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      syncSearchClear();
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(fetchListings, 300);
    });
  }

  const imageInput = document.getElementById('imageInput');
  if (imageInput) imageInput.addEventListener('change', () => renderPhotoPreviews());

  // Offline banner
  const offlineBanner = document.createElement('div');
  offlineBanner.id = 'offlineBanner';
  offlineBanner.className = 'offline-banner';
  offlineBanner.textContent = t('youOffline');
  document.body.appendChild(offlineBanner);
  if (typeof navigator !== 'undefined' && navigator.onLine === false) offlineBanner.style.display = 'block';
  window.addEventListener('online', () => {
    offlineBanner.style.display = 'none';
    if (supabase) fetchListings();
    if (userWallet) resolveWorldUsername(userWallet).then((name) => { if (name) applyUsername(name); }).catch(() => {});
  });
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
    const authResult = await withTimeout(MiniKit.commandsAsync.walletAuth({
      nonce: randomAlphaNumeric(24),
      requestId: 'req_login_' + Date.now(),
      expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notBefore: new Date(Date.now() - 60 * 1000),
      statement: 'Sign in to WantSell',
    }), 60000, 'walletAuth').catch(() => null);
    const finalPayload = authResult && authResult.finalPayload;
    if (finalPayload?.status === 'success' && finalPayload?.address) {
        if (!isValidEthAddress(finalPayload.address)) { showNeonPopup('Error', t('invalidAddress'), 'OK'); return; }
        userWallet = finalPayload.address;
        const dbName = await lookupDbUsername(userWallet);
        const liveName = await resolveWorldUsername(userWallet);
        let chosen = liveName || dbName || readBoundUsername(userWallet);
        if (!chosen) {
          let usernameInput = await showNeonPopup('Welcome!', 'Choose a Username (2-20 chars):', 'OK', 'prompt');
          let attempts = 0;
          while (attempts < 3) {
            const v = validateUsername(usernameInput);
            if (v.valid) {
              // A name typed here must not be one that already belongs to another
              // wallet, otherwise one account could present itself as another.
              const owner = await usernameOwner(v.clean);
              if (owner && owner !== String(userWallet).toLowerCase()) {
                attempts++;
                if (attempts >= 3) { chosen = shortAddress(userWallet); break; }
                usernameInput = await showNeonPopup('Name Taken', 'That username belongs to another account. Choose a different one.', 'OK', 'prompt');
                continue;
              }
              chosen = v.clean; break;
            }
            attempts++;
            if (attempts >= 3) { chosen = shortAddress(userWallet); break; }
            usernameInput = await showNeonPopup('Invalid', v.error, 'OK', 'prompt');
          }
        }
        if (chosen) await applyUsername(chosen, { sync: !!liveName || !dbName });
        else currentUsername = shortAddress(userWallet);
      localStorage.setItem('userWallet', userWallet);
      document.getElementById('loginBtn').innerText = currentUsername;
      document.getElementById('loginBtn').classList.add('connected');
      updateSowBadge();
      detectUserCurrentPosition();
      fetchListings();
    } else if (finalPayload && finalPayload.status === 'error') {
      showNeonPopup(t('connectFailed'), t('walletConnectFailed') + (finalPayload.error_code ? ` (${escapeHtml(finalPayload.error_code)})` : ''), 'OK');
    } else {
      // The user closed the World App sheet: say so instead of doing nothing.
      showToast(t('loginCancelled'));
    }
  } catch (err) {
    console.error('[LOGIN ERROR]', err.message || err);
    showNeonPopup('Error', t('walletConnectError'), 'OK');
  }
}

// ==========================================
// LOCATION DETECTION
// ==========================================
const GEO_KEY = 'wantsell_geo_v1';
const GEO_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function saveGeo(lat, lng, label) {
  const nLat = Number(lat), nLng = Number(lng);
  if (!isFinite(nLat) || !isFinite(nLng)) return;
  currentLat = nLat;
  currentLng = nLng;
  if (typeof label === 'string' && label.trim()) locationLabel = label.trim();
  try {
    localStorage.setItem(GEO_KEY, JSON.stringify({ lat: nLat, lng: nLng, label: locationLabel, ts: Date.now() }));
  } catch (e) {}
  updateLocationChip();
}

function restoreGeo() {
  try {
    const raw = localStorage.getItem(GEO_KEY);
    if (!raw) return false;
    const g = JSON.parse(raw);
    if (!g || !isFinite(Number(g.lat)) || !isFinite(Number(g.lng))) return false;
    if (!g.ts || Date.now() - g.ts > GEO_MAX_AGE_MS) return false;
    currentLat = Number(g.lat);
    currentLng = Number(g.lng);
    locationLabel = typeof g.label === 'string' ? g.label : '';
    return true;
  } catch (e) { return false; }
}

function updateLocationChip() {
  const chip = document.getElementById('locChip');
  const text = document.getElementById('locChipText');
  if (!chip || !text) return;
  if (currentLat == null || currentLng == null) {
    chip.classList.remove('loc-chip-on');
    chip.setAttribute('aria-label', t('enableLocation'));
    text.textContent = t('enableLocation');
  } else {
    chip.classList.add('loc-chip-on');
    text.textContent = locationLabel ? t('nearPlace', { place: locationLabel }) : t('locationOn');
    chip.setAttribute('aria-label', text.textContent);
  }
}

function getPosition(options) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('unsupported')); return; }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

async function fetchWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { return null; }
  finally { clearTimeout(timer); }
}

async function reverseGeocode(lat, lng) {
  const data = await fetchWithTimeout(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16`, 6000);
  if (!data) return '';
  const a = data.address || {};
  const parts = [a.suburb || a.neighbourhood || a.village || a.town || a.city, a.state || a.country].filter(Boolean);
  return parts.join(', ') || data.display_name || '';
}

async function forwardGeocode(query) {
  if (!query || query.trim().length < 3) return null;
  const data = await fetchWithTimeout(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`, 6000);
  if (!Array.isArray(data) || !data.length) return null;
  const first = data[0];
  const lat = Number(first.lat), lng = Number(first.lon);
  if (!isFinite(lat) || !isFinite(lng)) return null;
  return { lat, lng };
}

async function coarseLocate() {
  const data = await fetchWithTimeout('https://ipapi.co/json/', 4000);
  if (!data || !isFinite(Number(data.latitude)) || !isFinite(Number(data.longitude))) return null;
  const label = [data.city, data.region || data.country_name].filter(Boolean).join(', ');
  return { lat: Number(data.latitude), lng: Number(data.longitude), label };
}

// Silent refresh only. Never raises a permission prompt on launch: if the user
// has not already granted location, the feed simply shows every listing.
async function detectUserCurrentPosition() {
  try {
    if (!navigator.permissions || !navigator.permissions.query) return;
    const perm = await navigator.permissions.query({ name: 'geolocation' });
    if (perm.state !== 'granted') return;
    const pos = await getPosition({ enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 });
    saveGeo(pos.coords.latitude, pos.coords.longitude, locationLabel);
    fetchListings();
  } catch (e) {}
}

// Explicit, consent-first capture shared by the GPS button and the home chip.
async function captureLocation() {
  const consent = await showNeonPopup(t('locationAccess'), t('locationConsent'), 'OK', 'confirm');
  if (!consent) return false;
  try {
    const pos = await getPosition({ enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
    const lat = pos.coords.latitude, lng = pos.coords.longitude;
    const label = await reverseGeocode(lat, lng);
    saveGeo(lat, lng, label);
    return true;
  } catch (e) {}
  const coarse = await coarseLocate();
  if (coarse) { saveGeo(coarse.lat, coarse.lng, coarse.label); return true; }
  return false;
}

window.detectLocation = async function() {
  const btn = document.getElementById('detectLocationBtn');
  const field = document.getElementById('adAddress');
  if (btn && btn.disabled) return;
  const btnLabel = btn ? btn.querySelector('span') : null;
  const previousLabel = btnLabel ? btnLabel.textContent : '';
  if (btn) { btn.disabled = true; btn.classList.add('is-busy'); }
  if (btnLabel) btnLabel.textContent = t('detecting');
  if (field) { field.classList.add('is-busy'); field.placeholder = t('detecting'); }
  try {
    const ok = await captureLocation();
    if (ok) {
      if (field) field.value = locationLabel || `${currentLat.toFixed(5)}, ${currentLng.toFixed(5)}`;
      if (btn) btn.classList.add('is-done');
      showToast(t('locationCaptured'));
    } else if (field) {
      await showNeonPopup(t('locationOff'), t('locationOffDesc'), 'OK');
    }
  } finally {
    if (btn) { btn.disabled = false; btn.classList.remove('is-busy'); }
    if (btnLabel) btnLabel.textContent = previousLabel || t('detectGps');
    if (field) { field.classList.remove('is-busy'); field.placeholder = t('tapDetect'); }
  }
};

window.enableHomeLocation = async function() {
  if (currentLat != null && currentLng != null) {
    await showNeonPopup(t('locationOn'), locationLabel || '', 'OK');
    return;
  }
  const chip = document.getElementById('locChip');
  if (chip) chip.classList.add('is-busy');
  const ok = await captureLocation();
  if (chip) chip.classList.remove('is-busy');
  if (ok) { fetchListings(); }
  else { await showNeonPopup(t('locationOff'), t('locationOffDesc'), 'OK'); }
};

// ==========================================
// DISTANCE CALC
// ==========================================
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (![lat1, lon1, lat2, lon2].every(v => typeof v === 'number' && isFinite(v))) return null;
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
  const map = { 'new': t('brandNew'), 'like_new': t('likeNew'), 'good': t('good'), 'fair': t('fair'), 'used': t('used') };
  const cls = { 'new': 'new', 'like_new': 'like-new', 'good': 'good', 'fair': 'fair', 'used': 'used' }[cond] || 'used';
  return { text: map[cond] || map['used'], cls };
}
function getPriceTypeBadge(pt) {
  if (pt === 'negotiable') return { text: t('negotiable'), cls: 'negotiable' };
  return { text: t('fixedPrice'), cls: 'fixed' };
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
// POST AD — upload, then MiniKit pay, then publish
// ==========================================
let isPosting = false;

async function handlePostAd(e) {
  e.preventDefault();
  if (isPosting) return;
  if (!requireWallet()) return;

  const postBtn = document.getElementById('postAdSubmit');
  const setStage = (label) => {
    if (postBtn) { postBtn.disabled = true; postBtn.classList.add('is-loading'); postBtn.textContent = label; }
  };
  const resetBtn = () => {
    if (postBtn) { postBtn.disabled = false; postBtn.classList.remove('is-loading'); postBtn.textContent = t('postAdBtn'); }
  };
  if (!checkRateLimit('postAd', 10000)) { await showNeonPopup(t('slowDown'), t('postAdRate'), 'OK'); return; }
  if (!supabase) { await showNeonPopup(t('genericError'), t('dbUnavailable'), 'OK'); return; }

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

  const fileInput = document.getElementById('imageInput');
  const files = fileInput.files;
  if (files.length === 0) { await showNeonPopup(t('imageMissing'), t('imageMissingDesc'), 'OK'); return; }
  if (files.length > 4) { await showNeonPopup(t('limitReached'), t('limitReachedDesc'), 'OK'); return; }
  for (let f of files) { if (f.size > 5 * 1024 * 1024) {    await showNeonPopup(t('fileTooLarge'), t('fileTooLargeDesc'), 'OK'); return; } }

  if (!checkWorldAppEnvironment()) { return; }

  // The charge is disclosed before anything is uploaded, so cancelling costs
  // nothing and never leaves orphaned photos behind.
  const payConfirmed = await showNeonPopup(t('payConfirmTitle'), t('payConfirmDesc'), 'OK', 'confirm');
  if (!payConfirmed) return;

  isPosting = true;

  // Photos are uploaded BEFORE payment. A failed upload must never cost WLD.
  setStage(t('uploadingPhotos'));
  const imageUrls = ['', '', '', ''];
  for (let i = 0; i < files.length; i++) {
    try {
      const cf = await compressImage(files[i]);
      const fn = `${Date.now()}_${randomAlphaNumeric(8)}.jpg`;
      const { error: ue } = await supabase.storage.from('listing').upload(fn, cf);
      if (ue) {
        resetBtn(); isPosting = false;
        await showNeonPopup(t('uploadFailed'), t('uploadFailedDesc'), 'OK');
        return;
      }
      const { data: pd } = supabase.storage.from('listing').getPublicUrl(fn);
      imageUrls[i] = pd.publicUrl;
    } catch (imgErr) {
      resetBtn(); isPosting = false;
      await showNeonPopup(t('uploadFailed'), t('uploadFailedDesc'), 'OK');
      return;
    }
  }

  // Pin the ad to the typed address when GPS was never captured, so listings
  // are not published with someone else's coordinates.
  if (currentLat == null || currentLng == null) {
    setStage(t('detecting'));
    const geo = await forwardGeocode(addrV.clean);
    if (geo) saveGeo(geo.lat, geo.lng, addrV.clean);
  }

  // MINIKIT COMMAND: Pay the 1 WLD listing fee
  setStage(t('confirmingPayment'));
  let paymentSuccessful = false;
  let payErrorCode = '';
  const paymentRef = randomAlphaNumeric(16);
  try {
    const WLD_SYMBOL = (Tokens && Tokens.WLD) || 'WLD';
    const tokenAmount = tokenToDecimals ? tokenToDecimals(1, WLD_SYMBOL).toString() : '1000000000000000000';
    // The payment sheet is interactive, so allow two minutes; a command that
    // never answers must still end in a visible error instead of a dead button.
    const payResult = await withTimeout(MiniKit.commandsAsync.pay({
      reference: paymentRef, to: ADMIN_WALLET,
      tokens: [{ symbol: WLD_SYMBOL, token_amount: tokenAmount }],
      description: 'Listing Fee: 1 WLD',
    }), 120000, 'pay').catch((err) => ({ error: err }));
    const finalPayload = payResult && payResult.finalPayload;
    if (payResult && payResult.error) throw payResult.error;
    paymentSuccessful = (finalPayload?.status === 'success');
    if (!paymentSuccessful && finalPayload && finalPayload.error_code) payErrorCode = String(finalPayload.error_code);
  } catch (err) {
    paymentSuccessful = false;
    payErrorCode = err && err.message ? String(err.message).slice(0, 80) : '';
  }

  if (!paymentSuccessful) {
    resetBtn();
    isPosting = false;
    const detail = payErrorCode ? ` (${payErrorCode})` : '';
    await showNeonPopup(t('paymentFailed'), t('paymentFailedDesc') + escapeHtml(detail), 'OK');
    return;
  }

  setStage(t('publishing'));

  const listingPayload = {
    seller_address: userWallet, seller_name: ownDisplayName(),
    title: titleV.clean, description: descV.clean, price: priceV.clean,
    category: document.getElementById('category').value,
    country: document.getElementById('adCountry').value, address: addrV.clean,
    lat: currentLat, lng: currentLng,
    condition: document.getElementById('adCondition').value || 'used',
    price_type: document.getElementById('priceType').value || 'fixed',
    image1: imageUrls[0], image2: imageUrls[1], image3: imageUrls[2], image4: imageUrls[3],
    status: 'active'
  };

  let { data: insertedRows, error: insertError } = await supabase.from('listings').insert([listingPayload]).select('id');
  if (insertError && insertError.message && (insertError.message.includes('condition') || insertError.message.includes('price_type') || insertError.message.includes('column'))) {
    delete listingPayload.condition;
    delete listingPayload.price_type;
    const retry = await supabase.from('listings').insert([listingPayload]).select('id');
    insertedRows = retry.data;
    insertError = retry.error;
  }

  resetBtn();
  isPosting = false;

  if (insertError) {
    // The user already paid: hand them a reference they can quote to support.
    await showNeonPopup(t('publishFailed'), t('publishFailedDesc', { ref: paymentRef }), 'OK');
    return;
  }

  // SOW is credited by the database, never by the browser: the RPC derives the
  // wallet from the listing row and records one ledger entry per listing, so a
  // retry, double tap or forged request cannot mint balance.
  const newAdId = insertedRows && insertedRows[0] ? insertedRows[0].id : await findLatestAdId(titleV.clean);
  let award = null;
  if (newAdId != null) {
    try {
      const { data: awardData, error: awardError } = await supabase.rpc('award_sow_for_listing', { p_ad_id: newAdId });
      if (!awardError && awardData) award = awardData;
    } catch (e) {}
  }

  if (award && award.balance != null) setSowBalance(award.balance);
  else updateSowBadge();

  const earnedCoin = award && award.awarded === true;
  await showNeonPopup(t('adPosted'), t('adPostedDesc') + (earnedCoin ? '<br><span class="sow-earned-text">' + escapeHtml(t('sowEarned')) + '</span>' : ''), 'OK', 'alert', true);
  document.getElementById('adForm').reset();
  resetPhotoPreviews();
  invalidateFeedCache();
  window.switchTab('screenHome');
  // Ask for notifications after a real action instead of on launch.
  setTimeout(requestNotificationPermissions, 1200);
}

// ==========================================
// CONNECTION DIAGNOSTICS
// ==========================================
// Safety net for a server that accepts the connection but never answers; a
// dead host fails on its own after the client library's internal retries.
const FEED_TIMEOUT_MS = 10000;

// Separates "your connection is down" from "the backend is missing", so the
// feed stops blaming the user's wifi for a server-side failure.
function describeFeedFailure(err) {
  const code = String((err && (err.code || err.status)) || '').trim();
  const message = String((err && (err.message || err.error_description || err.hint)) || err || '').trim();
  const probe = (code + ' ' + message).toLowerCase();
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { kind: 'offline', code: 'OFFLINE', message, retryable: true };
  }
  if (/abort|timeout|timed out/.test(probe)) {
    return { kind: 'timeout', code: code || 'TIMEOUT', message, retryable: true };
  }
  if (!code || /failed to fetch|networkerror|network error|load failed|err_name|enotfound|econn|dns/.test(probe)) {
    return { kind: 'unreachable', code: code || 'UNREACHABLE', message, retryable: true };
  }
  if (code === 'PGRST205' || /schema cache|does not exist|relation .* does not exist/.test(probe)) {
    return { kind: 'schema', code, message, retryable: false };
  }
  return { kind: 'server', code, message, retryable: /^5/.test(code) };
}

function feedErrorState(diag) {
  const title = diag.kind === 'offline' ? t('youOffline')
    : diag.kind === 'unreachable' ? t('connTitleUnreachable')
    : diag.kind === 'timeout' ? t('connTitleTimeout')
    : (diag.kind === 'schema' || diag.kind === 'server') ? t('genericError')
    : t('networkError');
  const detail = diag.kind === 'offline' ? t('connOffline')
    : diag.kind === 'timeout' ? t('connTimeout')
    : diag.kind === 'unreachable' ? t('connUnreachable')
    : diag.kind === 'schema' ? t('connSchema')
    : t('connServer');
  const ref = diag.code ? ' (' + diag.code + ')' : '';
  // The retry button must bypass the cache window, otherwise a failure that is
  // still inside it would redraw the old cards and look like nothing happened.
  return emptyState(title, detail + ref, t('retry'), 'window.fetchListings({ force: true })');
}

// ==========================================
// FETCH LISTINGS
// ==========================================
// The feed paints from a cached copy first and refreshes behind it. Before this,
// every launch fired 3 identical listing queries (boot, wallet refresh, location
// grant), each one replaced the grid with skeletons, and the cards waited for a
// second users-table round trip before they could be drawn.
const FEED_COLUMNS = 'id,seller_address,seller_name,title,price,category,country,lat,lng,condition,price_type,image1,created_at,status';
const FEED_LIMIT = 60;
const FEED_CACHE_KEY = 'ws_feed_v1';
const FEED_FRESH_MS = 20000;
const CARD_IMAGE_WIDTH = 480;

let feedState = { key: '', at: 0, items: null };
let feedInFlight = { key: '', promise: null };

function feedFilters() {
  const countryEl = document.getElementById('countryFilter');
  const categoryEl = document.getElementById('categoryFilter');
  const rangeEl = document.getElementById('distanceRange');
  const searchEl = document.getElementById('searchInput');
  const country = (countryEl && countryEl.value) || 'ALL';
  const category = (categoryEl && categoryEl.value) || 'ALL';
  const radius = rangeEl ? (parseInt(rangeEl.value, 10) || 50) : 50;
  const search = searchEl ? searchEl.value.trim().toLowerCase() : '';
  return { country, category, radius, search, key: [country, category, search, radius].join('|') };
}

function readFeedCache() {
  if (feedState.items) return feedState;
  try {
    const raw = sessionStorage.getItem(FEED_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items)) {
        feedState = {
          key: String(parsed.key || ''),
          at: Number(parsed.at) || 0,
          items: parsed.items,
          query: String(parsed.query || ''),
        };
        return feedState;
      }
    }
  } catch (e) {}
  return null;
}

function writeFeedCache(key, items, query) {
  feedState = { key: key, at: Date.now(), items: items, query: query || '' };
  try { sessionStorage.setItem(FEED_CACHE_KEY, JSON.stringify(feedState)); } catch (e) {}
}

// Posting, deleting or selling changes the feed, so the cached copy must not keep
// showing the old row for up to 20 seconds after the user acted on it.
function invalidateFeedCache() {
  feedState = { key: '', at: 0, items: null };
  try { sessionStorage.removeItem(FEED_CACHE_KEY); } catch (e) {}
}

// A card image is at most ~320px wide. Supabase Storage can resize on request,
// so the grid must not download the full-size upload for every listing.
function cardImageUrl(url, width) {
  return buildCardImageUrl(url, width);
}
window.cardImageUrl = cardImageUrl;

function buildCardImageUrl(url, width) {
  const raw = String(url || '');
  if (!/^https?:\/\//i.test(raw)) return raw;
  if (raw.indexOf('/storage/v1/object/public/') !== -1) {
    const sized = raw.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    return sized + (sized.indexOf('?') === -1 ? '?' : '&')
      + 'width=' + width + '&height=' + width + '&resize=cover&quality=70';
  }
  return raw;
}

// Distance filtering only applies once we actually know where the user is.
// Listings without coordinates are never hidden by the radius filter.
function visibleFeedItems(items, filters) {
  return (items || []).filter((item) => {
    if (filters.search && !String(item.title || '').toLowerCase().includes(filters.search)) return false;
    const hasUserLocation = currentLat != null && currentLng != null;
    if (!hasUserLocation) return true;
    const itemLat = item.lat != null && item.lat !== '' && isFinite(Number(item.lat)) ? Number(item.lat) : null;
    const itemLng = item.lng != null && item.lng !== '' && isFinite(Number(item.lng)) ? Number(item.lng) : null;
    if (itemLat == null || itemLng == null) return true;
    const realDist = calculateDistance(currentLat, currentLng, itemLat, itemLng);
    if (realDist == null) return true;
    item.calculatedDistance = realDist;
    return realDist <= filters.radius;
  });
}

const FEED_FALLBACK_THUMB = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 96 96%22%3E%3Crect width=%2296%22 height=%2296%22 fill=%22%23f1f1ec%22/%3E%3Crect x=%2224%22 y=%2226%22 width=%2248%22 height=%2240%22 rx=%226%22 fill=%22none%22 stroke=%22%23c9c9c0%22 stroke-width=%223%22/%3E%3Ccircle cx=%2237%22 cy=%2239%22 r=%224%22 fill=%22none%22 stroke=%22%23c9c9c0%22 stroke-width=%223%22/%3E%3Cpath d=%22M28 60l12-12 9 9 7-7 12 12%22 fill=%22none%22 stroke=%22%23c9c9c0%22 stroke-width=%223%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E';

function listingCardHtml(item) {
  const hasPhoto = !!(item.image1 && String(item.image1).startsWith('http'));
  const thumbImg = hasPhoto ? escapeAttr(cardImageUrl(item.image1, CARD_IMAGE_WIDTH)) : FEED_FALLBACK_THUMB;
  const sellerName = resolveSellerName(item);
  const dName = escapeHtml(sellerName);
  const dInitial = escapeHtml(sellerName.trim().charAt(0).toUpperCase() || 'U');
  const iTitle = escapeHtml(item.title);
  const iPrice = escapeHtml(item.price);
  const iId = escapeAttr(item.id);
  const cBadge = getConditionBadge(item.condition);
  const pBadge = getPriceTypeBadge(item.price_type);
  const posted = timeAgo(item.created_at);
  const distLabel = typeof item.calculatedDistance === 'number' ? `<span class="card-distance">${item.calculatedDistance} km</span>` : '';
  // Lazy + async so a long feed does not block the first visible cards.
  const imgAttrs = hasPhoto ? ' loading="lazy" decoding="async"' : '';
  return `
      <div class="listing-card" onclick="window.openAdDetails('${iId}')">
        <div class="card-media">
          <img src="${thumbImg}" class="card-thumb" alt="${iTitle}"${imgAttrs} onerror="this.onerror=null;this.src='${FEED_FALLBACK_THUMB}'">
          <span class="badge badge-${cBadge.cls}">${cBadge.text}</span>
          <button onclick="event.stopPropagation(); window.shareAd('${escapeAttr(item.title)}', '${escapeAttr(item.price)}')" class="card-quick-action" aria-label="${t('share')}"><svg viewBox="0 0 24 24"><circle cx="18" cy="5.5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="18.5" r="2.6"/><path d="m8.3 10.7 7.4-3.9M8.3 13.3l7.4 3.9"/></svg></button>
        </div>
        <div class="card-info">
          <div class="card-price-row">
            <p class="card-price">${iPrice}<span class="card-unit">WLD</span></p>
            <span class="badge badge-${pBadge.cls}">${pBadge.text}</span>
          </div>
          <h3 class="card-title">${iTitle}</h3>
          <div class="card-meta">
            <span class="card-seller" data-seller-wallet="${escapeAttr(item.seller_address)}" data-seller-name="${escapeAttr(item.seller_name)}"><span class="card-avatar">${dInitial}</span><span>${dName}</span></span>
            <span class="card-meta-right">${distLabel}<span class="card-time">${posted}</span></span>
          </div>
        </div>
      </div>
    `;
}

function paintFeed(items, filters) {
  const container = document.getElementById('listingsContainer');
  if (!container) return;
  const filteredData = visibleFeedItems(items, filters);
  const feedCount = document.getElementById('feedCount');
  if (feedCount) feedCount.textContent = filteredData.length ? String(filteredData.length) : '';

  if (filteredData.length === 0) {
    container.innerHTML = (items && items.length)
      ? emptyState(t('noListingsNearby', { km: filters.radius }), '', t('widenRadius'), 'window.widenRadius()')
      : emptyState(t('noListings'), '', t('postFirstAd'), "window.switchTab('screenPost')");
    hideSplash();
    return;
  }

  container.innerHTML = filteredData.map(listingCardHtml).join('');
  hideSplash();
  // The users table is the source of truth for seller names, but a slow or failed
  // lookup must not delay the cards: patch the names once they arrive.
  refreshSellerNames();
}

// Replaces the name text inside every card, keeping the DOM (and scroll) intact.
async function refreshSellerNames() {
  const container = document.getElementById('listingsContainer');
  if (!container) return;
  const wallets = Array.from(container.querySelectorAll('[data-seller-wallet]'))
    .map((el) => el.getAttribute('data-seller-wallet'))
    .filter(Boolean);
  const before = JSON.stringify(userNamesCache);
  await loadUserNames(wallets);
  if (JSON.stringify(userNamesCache) === before) return;
  container.querySelectorAll('[data-seller-wallet]').forEach((el) => {
    const name = resolveSellerName({
      seller_address: el.getAttribute('data-seller-wallet'),
      seller_name: el.getAttribute('data-seller-name'),
    });
    const text = el.querySelector('span:last-child');
    if (text && text.textContent !== name) text.textContent = name;
  });
}

async function fetchListings(options) {
  const opts = options || {};
  const container = document.getElementById('listingsContainer');
  if (!container) return;
  if (!supabase) { container.innerHTML = emptyState(t('dbUnavailable')); hideSplash(); return; }
  const filters = feedFilters();
  const cached = readFeedCache();
  const cacheMatchesQuery = !!(cached && cached.items && cached.items.length
    && cached.query === [filters.country, filters.category].join('|'));

  if (cacheMatchesQuery) {
    // Instant paint from the copy on the device; search and radius are applied
    // locally, so typing in the search box does not need a round trip.
    paintFeed(cached.items, filters);
  } else {
    container.innerHTML = showSkeleton(4);
  }

  const isFresh = !!(cached && cached.key === filters.key && (Date.now() - cached.at) < FEED_FRESH_MS);
  if (isFresh && !opts.force) {
    if (!cacheMatchesQuery) paintFeed(cached.items || [], filters);
    hideSplash();
    return;
  }
  if (!opts.force && feedInFlight.promise && feedInFlight.key === filters.key) {
    return feedInFlight.promise;
  }
  // A retry, a new post or a delete asks for fresh rows, so seller names are
  // re-read too instead of being served from a cache that predates the change.
  if (opts.force) userNamesFetchedAt = 0;

  const request = (async () => {
    let query = supabase.from('listings').select(FEED_COLUMNS).eq('status', 'active');
    // An empty value means the select has no valid option selected; treat it as
    // "all" instead of querying category=eq. (which silently returns nothing).
    if (filters.country && filters.country !== 'ALL') query = query.eq('country', filters.country);
    if (filters.category && filters.category !== 'ALL') query = query.eq('category', filters.category);
    query = query.order('created_at', { ascending: false }).limit(FEED_LIMIT);

    let data, error, thrown = null;
    try {
      const timed = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout && typeof query.abortSignal === 'function')
        ? query.abortSignal(AbortSignal.timeout(FEED_TIMEOUT_MS))
        : query;
      const result = await timed;
      data = result.data;
      error = result.error;
    } catch (netErr) {
      thrown = netErr;
    }

    if (error || thrown) {
      const diag = describeFeedFailure(error || thrown);
      // supabase-js already retries a failed fetch a few times internally, so a
      // second retry here would only keep the skeleton on screen for 15s.
      console.error('[FEED] listings query failed:', diag.kind, diag.code, diag.message);
      container.innerHTML = feedErrorState(diag);
      hideSplash();
      return;
    }

    const items = data || [];
    writeFeedCache(filters.key, items, [filters.country, filters.category].join('|'));
    paintFeed(items, filters);
  })();

  feedInFlight = { key: filters.key, promise: request };
  try {
    return await request;
  } finally {
    if (feedInFlight.promise === request) feedInFlight = { key: '', promise: null };
  }
}

// The empty-state retry button runs inline HTML, so the handler has to exist on
// window: a module-scoped function is invisible to onclick attributes.
window.fetchListings = fetchListings;


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
  const sellerLabel = resolveSellerName(data);
  const dName = escapeHtml(sellerLabel);
  const sAddr = data.seller_address;
  const cBadge = getConditionBadge(data.condition);
  const pBadge = getPriceTypeBadge(data.price_type);
  const posted = timeAgo(data.created_at);
  const dist = data.calculatedDistance ? ` (~${escapeHtml(data.calculatedDistance)} km)` : '';
  const verifiedBadge = isVerified ? `<span class="verify-badge">${t('verified')}</span>` : '';
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
      <div class="detail-section"><b>${t('location')}:</b> ${escapeHtml(data.address || t('notSpecified'))}</div>
      <div class="detail-seller-bar">
        <div>
          <span class="detail-seller-label">${t('seller')}</span>
          <h4 class="detail-seller-name">${dName}</h4>
        </div>
        <button class="btn-mark-sold btn-reviews" onclick="window.openReviews('${escapeAttr(sAddr)}', '${escapeAttr(sellerLabel)}')">${t('reviews')}</button>
      </div>
      <hr class="detail-divider">
      <h4 class="detail-section-title">${t('photosTap', { n: allImages.length })}</h4>
      <div class="detail-images-scroll">${imagesHtml}</div>
      <h4 class="detail-section-title">${t('description')}</h4>
      <p class="detail-section detail-description">${escapeHtml(data.description)}</p>
      <div class="detail-action-bar">
        <button class="btn-chat-seller btn-back" onclick="document.getElementById('adDetailsModal').style.display='none';">${t('back')}</button>
        <button class="btn-chat-seller" onclick="window.openChat('${escapeAttr(sAddr)}', '${escapeAttr(data.title)}', '${escapeAttr(sellerLabel)}'); document.getElementById('adDetailsModal').style.display='none';">${t('chatSeller')}</button>
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
  document.getElementById('chatTitle').innerText = t('chatWith', { name: sellerName || 'User' });
  const chatBox = document.getElementById('chatMessages');
  chatBox.innerHTML = `<p class="loading-placeholder">${t('loadChat')}</p>`;
  document.getElementById('chatModal').style.display = 'flex';
  document.querySelector('#chatModal .modal-content').style.animation = 'slideInUp 0.35s ease';
  // The conversation is filtered on the server: downloading the whole chats
  // table would hand every user every message ever sent.
  const sellerWalletKey = String(sellerWallet || '');
  const chatQuery = supabase.from('chats').select('*')
    .eq('ad_title', adTitle)
    .or(`and(sender.eq.${userWallet},receiver.eq.${sellerWalletKey}),and(sender.eq.${sellerWalletKey},receiver.eq.${userWallet})`)
    .order('created_at', { ascending: true })
    .limit(500);
  const { data, error } = await chatQuery;
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
  if (error) { await showNeonPopup(t('genericError'), t('genericErrorDesc'), 'OK'); return; }
  // Push notifications are sent by the Developer Portal API, not by a MiniKit
  // client command (there is no commandsAsync.sendNotification in 1.9.6), so the
  // message is stored only and the dead call is gone.
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
  if (error || !reviews || reviews.length === 0) { container.innerHTML = emptyState(t('noReviews')); return; }
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
  const { error } = await supabase.from('reviews').insert([{ seller_address: window.targetSellerAddress, buyer_address: userWallet, buyer_name: ownDisplayName(), rating, comment }]);
  if (!error) { document.getElementById('reviewComment').value = ''; await showNeonPopup('Success', 'Review submitted!', 'OK'); window.openReviews(window.targetSellerAddress, 'Seller'); }
  else { await showNeonPopup(t('genericError'), t('genericErrorDesc'), 'OK'); }
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

  statsContainer.innerHTML = `<div class="admin-stats-grid"><div class="detail-section"><b class="admin-stat-number admin-stat-indigo">${totalListings || 0}</b><span class="admin-stat-label">${t('activeAds')}</span></div><div class="detail-section"><b class="admin-stat-number admin-stat-success">${totalUsers || 0}</b><span class="admin-stat-label">${t('users')}</span></div><div class="detail-section"><b class="admin-stat-number admin-stat-warning">${totalChats || 0}</b><span class="admin-stat-label">${t('messages')}</span></div></div>`;

  const { data: listings } = await supabase.from('listings').select('*').neq('status', 'deleted').order('created_at', { ascending: false });
  if (!listings || listings.length === 0) { listingsContainer.innerHTML = emptyState(t('noListingsFound')); return; }

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
    invalidateFeedCache();
    window.openAdminPanel();
    fetchListings();
  }
};

// ==========================================
// MY ADS
// ==========================================
window.openMyAdsScreen = async function() {
  if (!userWallet) {
    document.getElementById('myAdsContainer').innerHTML = emptyState(t('walletNotConnected'), t('connectToAccess'));
    document.getElementById('myAdsBalanceCard').innerHTML = '';
    return;
  }
  const container = document.getElementById('myAdsContainer');
  container.innerHTML = showSkeleton(3);

  const { data: balData } = await supabase.from('sow_balances').select('balance').eq('wallet_address', balanceKey(userWallet)).single();
  const earnedSow = balData ? balData.balance : 0;

  document.getElementById('myAdsBalanceCard').innerHTML = `<div class="sow-stats-inner"><div class="sow-stats-left"><span class="sow-stats-icon">SOW</span><div><p class="sow-stats-label">${t('yourSowBalance')}</p><p class="sow-stats-value">${earnedSow}</p></div></div><button onclick="window.openLeaderboard()" class="sow-stats-lead-btn">${t('rankings')}</button></div>`;

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
  if (!html) html = emptyState('No ads yet. Post your first ad!');
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
      invalidateFeedCache();
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
  if (!soldOk) { try { const { data: updateData, error: updateErr } = await supabase.from('listings').update({ status: 'sold' }).eq('id', id).eq('seller_address', userWallet).select('id, status'); if (!updateErr && updateData && updateData.length > 0) soldOk = true; } catch (e) {} }

  if (soldOk) {
    const { data: verifyData } = await supabase.from('listings').select('status').eq('id', id).single();
    if (verifyData && verifyData.status === 'sold') {
      await showNeonPopup('Sold', 'Ad marked as sold. Your SOW coins are safe!', 'OK');
      invalidateFeedCache();
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
  if (balError || !balances || balances.length === 0) { container.innerHTML = emptyState(t('noSowData')); return; }
  // Balance rows are keyed lowercase while users keep their checksummed
  // address, so match case-insensitively instead of dropping every name.
  const wallets = balances.map(b => balanceKey(b.wallet_address)).filter(Boolean);
  const userMap = {};
  if (wallets.length) {
    const orFilter = wallets.slice(0, 50).map(w => `wallet_address.ilike.${w}`).join(',');
    const { data: usersData } = await supabase.from('users').select('wallet_address, username').or(orFilter);
    if (usersData) { usersData.forEach(u => { userMap[balanceKey(u.wallet_address)] = u.username; }); }
  }

  const rankLabels = ['1st', '2nd', '3rd'];
  container.innerHTML = balances.map((item, index) => {
    const isTop3 = index < 3;
    const username = escapeHtml(userMap[balanceKey(item.wallet_address)] || 'Unknown User');
    const bal = escapeHtml(item.balance);
    const rankText = isTop3 ? rankLabels[index] : '#' + (index + 1);
    const lbInitial = escapeHtml((userMap[balanceKey(item.wallet_address)] || 'U').trim().charAt(0).toUpperCase() || 'U');
    return `<div class="lb-item${isTop3 ? ' top-3' : ''}${index === 0 ? ' top-1' : ''}"><div class="lb-info-row"><span class="lb-rank">${rankText}</span><span class="lb-avatar">${lbInitial}</span><div><h4 class="lb-name">${username}</h4></div></div><div class="lb-right"><div class="lb-balance">${bal}</div><div class="lb-balance-label">SOW</div></div></div>`;
  }).join('');
};

// ==========================================
// SOW BALANCE DISPLAY (reads only; credits come from the database)
// ==========================================
// sow_balances keys are stored lowercased by the award function, while World
// returns a checksummed address, so balance lookups must normalise.
function balanceKey(wallet) {
  return String(wallet || '').toLowerCase();
}

function setSowBalance(balance) {
  const n = Number(balance);
  if (!isFinite(n)) return;
  const statsCard = document.getElementById('sowStatsCard');
  const homeCount = document.getElementById('homeSowCount');
  if (statsCard) statsCard.style.display = 'block';
  if (homeCount) homeCount.textContent = n;
}

window.updateSowBadge = updateSowBadge;

async function updateSowBadge() {
  if (!userWallet) return;
  try {
    const { data: balData } = await supabase.from('sow_balances').select('balance').eq('wallet_address', balanceKey(userWallet)).single();
    setSowBalance(balData ? balData.balance : 0);
  } catch (e) {}
}

// Used only when the insert response is empty (RLS without returning rows).
// The RPC still validates that the listing is fresh, active and uncredited.
async function findLatestAdId(title) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('id')
      .eq('seller_address', userWallet)
      .eq('title', title)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return (!error && data) ? data.id : null;
  } catch (e) { return null; }
}

// ==========================================
// LEGAL & DATA CONTROLS
// ==========================================
// Reviewers look for a reachable support address, readable terms and a privacy
// policy that matches what the app actually stores. Everything below is kept in
// sync with the data the app really writes.
const SUPPORT_EMAIL = 'airdrophubgroup@gmail.com';
const APP_VERSION = '1.3.1';

const LEGAL_COPY = {
  terms: () => `
    <h2 class="legal-title">${t('termsTitle')}</h2>
    <p class="legal-meta">WantSell · v${APP_VERSION}</p>
    <h3>1. What WantSell is</h3>
    <p>WantSell is a peer-to-peer classifieds marketplace that runs inside World App. Sellers list their own items and buyers contact them directly. WantSell does not own, inspect, ship or insure any item, and does not handle payment between buyer and seller.</p>
    <h3>2. Listing fee</h3>
    <p>Publishing an ad costs 1 WLD, charged before the ad is published and sent to the WantSell wallet. The fee covers publishing only and is not refundable once the ad goes live. If a payment succeeds but the ad cannot be saved, contact support with the payment reference shown on screen and we will restore or refund it.</p>
    <h3>3. Listing rules</h3>
    <p>Listings must describe a real item you are allowed to sell, with honest photos, price and condition. Prohibited: weapons, drugs, stolen or counterfeit goods, regulated services, adult content, and anything illegal where you live. Phone numbers, messaging handles and external links are not allowed in listings, because they move deals outside the app where nothing can be reported. Ads that break these rules can be removed without refund.</p>
    <h3>4. SOW coins</h3>
    <p>SOW is a free in-app reward for posting. It has no monetary value, cannot be bought, sold, transferred or exchanged for WLD, and may be adjusted if abuse is detected.</p>
    <h3>5. Safety</h3>
    <p>Deal locally, meet in public places, inspect the item before paying, and never send money in advance to a stranger. You are responsible for your own transactions.</p>
    <h3>6. Changes and contact</h3>
    <p>We may update these terms as the app changes; the current version is always available in Profile. Questions: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
  `,
  privacy: () => `
    <h2 class="legal-title">${t('privacyTitle')}</h2>
    <p class="legal-meta">WantSell · v${APP_VERSION}</p>
    <h3>What we collect</h3>
    <ul>
      <li><b>Wallet address</b> — read from World App when you connect. Used to identify your account and your listings.</li>
      <li><b>Display name</b> — the name you choose or that World App provides.</li>
      <li><b>Listing content</b> — title, description, price, category, country, the address text you type, and up to four photos you upload.</li>
      <li><b>Messages and reviews</b> — chat you send to other users and ratings you leave.</li>
      <li><b>Approximate location</b> — only after you tap and accept the location prompt. Used to sort listings by distance.</li>
    </ul>
    <h3>What we do not do</h3>
    <p>No advertising or analytics trackers, no contact list or photo-library access beyond the photos you select, and we never sell data.</p>
    <h3>Where it is stored</h3>
    <p>Listings, photos, chats, reviews and profiles are stored in Supabase (database and object storage); the app itself is served from Vercel. Data is transmitted over HTTPS.</p>
    <h3>What other people can see</h3>
    <p>Your display name, listing text and photos, chats you send, and reviews are visible to other users. Your wallet address is stored to attribute listings but is not published as contact information.</p>
    <h3>How long we keep it</h3>
    <p>Until you delete it. Deleting an ad hides it immediately and removes its photos. Data deletion removes your listings, chats, reviews and profile row.</p>
    <h3>Your choices</h3>
    <p>Location is optional: you can skip GPS and type a city instead. To access, correct or delete your data use <b>${t('deleteData')}</b> in Profile, or email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>. We answer deletion requests within 30 days.</p>
    <h3>Age</h3>
    <p>WantSell is for users 18 and older.</p>
    <p>Contact: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
  `,
};

window.openLegal = function (kind) {
  const body = document.getElementById('legalBody');
  const title = document.getElementById('legalModalTitle');
  if (!body) return;
  const isPrivacy = kind === 'privacy';
  if (title) title.textContent = isPrivacy ? t('privacyTitle') : t('termsTitle');
  body.innerHTML = isPrivacy ? LEGAL_COPY.privacy() : LEGAL_COPY.terms();
  body.scrollTop = 0;
  document.getElementById('legalModal').style.display = 'flex';
};

// Two-step: hide the user's listings right away, then hand them a prefilled
// request so the stored profile, chats and reviews can be removed server side.
window.requestDataDeletion = async function () {
  const ok = await showNeonPopup(t('deleteData'), t('deleteDataDesc', { email: SUPPORT_EMAIL }), 'OK', 'confirm');
  if (!ok) return;
  const wallet = userWallet || 'unknown';
  if (userWallet) {
    try { await supabase.from('listings').update({ status: 'deleted' }).eq('seller_address', userWallet); } catch (e) {}
  }
  try {
    const keys = Object.keys(localStorage).filter((k) => /^(wantsell|userWallet|currentUsername|worldIdVerified)/.test(k));
    keys.forEach((k) => localStorage.removeItem(k));
  } catch (e) {}
  showToast(t('deleteDataSent'));
  const subject = encodeURIComponent('WantSell data deletion request');
  const bodyText = encodeURIComponent('Please delete all WantSell data for wallet: ' + wallet);
  window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${bodyText}`;
};

// ==========================================
// PROFILE
// ==========================================
window.renderProfile = async function() {
  const container = document.getElementById('profileContainer');
  if (!userWallet || !currentUsername) {
    container.innerHTML = `<div class="text-center py-20 color-muted"><p class="profile-wallet-icon">W</p><p class="profile-title">${t('walletNotConnected')}</p><p class="profile-subtitle">${t('connectToAccess')}</p></div>`;
    return;
  }
  const { data: balData } = await supabase.from('sow_balances').select('balance').eq('wallet_address', balanceKey(userWallet)).single();
  const earnedSow = balData ? balData.balance : 0;
  const isAdmin = userWallet.toLowerCase() === ADMIN_WALLET.toLowerCase();
  const verifiedHtml = isVerified ? `<span class="verify-badge verify-badge-inline">${t('verified')}</span>` : '';  container.innerHTML = `
    <div class="profile-card">
      <div class="profile-hero">
        <div class="profile-avatar">${escapeHtml((currentUsername || 'U').trim().charAt(0).toUpperCase() || 'U')}</div>
        <div>
          <p class="profile-label">${t('profile')}</p>
          <h3 class="profile-name">${escapeHtml(currentUsername)}${verifiedHtml}</h3>
          <p class="profile-wallet" title="${escapeAttr(userWallet)}">${escapeHtml(userWallet.substring(0,6) + '...' + userWallet.substring(userWallet.length-4))}</p>
        </div>
      </div>
      <div class="profile-balance-section">
        <p class="profile-label">${t('yourSowBalance')}</p>
        <p class="sow-stats-value">${earnedSow}</p>
      </div>
    </div>

    <div class="profile-actions">
      <button onclick="window.openLeaderboard()" class="btn-profile-action btn-leaderboard">
        <svg viewBox="0 0 24 24"><path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M17 5h2.5a2.5 2.5 0 0 1-2.5 2.5M7 5H4.5A2.5 2.5 0 0 0 7 7.5"/></svg>
        <span class="action-text">${t('viewLeaderboard')}</span>
        <svg class="row-chevron" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>
      </button>
      <button onclick="window.verifyWorldID().then(v => { if(v) { isVerified=true; window.renderProfile(); } })" class="btn-profile-action btn-verify">
        <svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.5-3 7.8-7 10-4-2.2-7-5.5-7-10V6Z"/><path d="m9 12 2 2 4-4"/></svg>
        <span class="action-text">${t('verifyAction')}</span>
        <svg class="row-chevron" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>
      </button>
      <a href="mailto:${SUPPORT_EMAIL}" class="btn-profile-action btn-support">
        <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>
        <span class="action-text">${t('support')}</span>
        <svg class="row-chevron" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>
      </a>
      <button onclick="window.openLegal('terms')" class="btn-profile-action btn-legal">
        <svg viewBox="0 0 24 24"><path d="M6 3.5h9l4 4v13H6z"/><path d="M15 3.5v4h4M9 12h7M9 15.5h7"/></svg>
        <span class="action-text">${t('termsTitle')}</span>
        <svg class="row-chevron" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>
      </button>
      <button onclick="window.openLegal('privacy')" class="btn-profile-action btn-legal">
        <svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.5-3 7.8-7 10-4-2.2-7-5.5-7-10V6Z"/><path d="M12 9.5v4M12 16h.01"/></svg>
        <span class="action-text">${t('privacyTitle')}</span>
        <svg class="row-chevron" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>
      </button>
      <button onclick="window.requestDataDeletion()" class="btn-profile-action btn-legal">
        <svg viewBox="0 0 24 24"><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13.5h9L17.5 7"/><path d="M10.5 11v6M13.5 11v6"/></svg>
        <span class="action-text">${t('deleteData')}</span>
        <svg class="row-chevron" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>
      </button>
      ${isAdmin ? `<button onclick="window.openAdminPanel()" class="btn-profile-action btn-admin">
        <svg viewBox="0 0 24 24"><path d="M12 3.5 20 8v8l-8 4.5L4 16V8Z"/><path d="M4 8l8 4.5L20 8M12 12.5v8"/></svg>
        <span class="action-text">${t('adminPanel')}</span>
        <svg class="row-chevron" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>
      </button>` : ''}
    </div>
    <p class="profile-version">WantSell v${APP_VERSION}</p>
  `;
};
