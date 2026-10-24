/**
 * HARSHU COMPUTERS & ELECTRONICS - FLAGSHIP 3D ENGINE & REACT BITS ANIMATIONS
 * 
 * Included Features:
 * 1. Dedicated Three.js 3D Device Studio Stage with OrbitControls (iPhone 16 Pro, MacBook Pro, Gaming Rig)
 * 2. Instant Procedural Fallback Mesh (Guarantees 100% Device Visibility from millisecond 0)
 * 3. DRACOLoader & MeshoptDecoder configured GLTFLoader
 * 4. React Bits: TargetCursor (Rotating Brackets, Magnetic Snap & Parallax Reticle)
 * 5. React Bits: GlowCursor (Trailing Golden Particle Trail)
 * 6. React Bits: RotatingText (Dynamic cycling text with sliding gold pill)
 * 7. React Bits: ScrollReveal (Word-by-word blur-to-focus reveal)
 * 8. React Bits: ScrollVelocity (Infinite velocity-skewed ticker ribbon)
 * 9. React Bits: 3D Infinite Spiral Gallery (Hardware Ecosystem)
 */

/* ==========================================================================
   GLOBAL VARIABLES & INITIALIZATION
   ========================================================================== */
let scene, camera, renderer, controls;
let currentLoadedMesh = null;
let proceduralFallbackMesh = null;
let currentModelType = 'phone';
let isUserInteracting = false;
let idleTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initSwarmCursor();
  initRotatingText();
  initScrollReveal();
  initScrollVelocity();
  init3DWorld();
  initOrbitImages();
  initScrollStack();
});

/* ==========================================================================
   1. THREE.JS 3D DEVICE STUDIO STAGE
   ========================================================================== */
function init3DWorld() {
  const canvas = document.getElementById('canvas3d');
  const container = document.getElementById('stage-canvas-wrapper');
  if (!canvas || !container || typeof THREE === 'undefined') return;

  const width = container.clientWidth || 500;
  const height = container.clientHeight || 480;

  // 1. Scene & Perspective Camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 0.2, 4.2);

  // 2. High-Performance WebGL Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 3. OrbitControls for Smooth 360 Inspection
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = true;
    controls.minDistance = 2.2;
    controls.maxDistance = 6.5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.maxPolarAngle = Math.PI - 0.2;
    controls.minPolarAngle = 0.2;

    controls.addEventListener('start', () => {
      isUserInteracting = true;
      controls.autoRotate = false;
    });

    controls.addEventListener('end', () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        isUserInteracting = false;
        controls.autoRotate = true;
      }, 3500);
    });
  }

  // 4. Dramatic Luxury Black & Gold Studio Lighting
  const ambientLight = new THREE.AmbientLight(0xfff8eb, 0.85);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
  keyLight.position.set(4, 5, 4);
  scene.add(keyLight);

  const goldRimLight = new THREE.DirectionalLight(0xd4af37, 3.8);
  goldRimLight.position.set(-4, -2, -3.5);
  scene.add(goldRimLight);

  const softFrontLight = new THREE.DirectionalLight(0xffffff, 1.2);
  softFrontLight.position.set(0, 0, 4);
  scene.add(softFrontLight);

  const subtleFloorLight = new THREE.PointLight(0xd4af37, 1.5, 8);
  subtleFloorLight.position.set(0, -2, 0);
  scene.add(subtleFloorLight);

  // 5. Create Procedural Photorealistic iPhone Geometry IMMEDIATELY
  // This guarantees a glorious 3D smartphone is visible with 0 millisecond delay!
  createProceduralSmartphone();

  // 6. Asynchronously Load High-Res GLTF Model
  loadModel('phone');

  // 7. Responsive Resize within Container
  const resizeObserver = new ResizeObserver(() => {
    if (!container || !camera || !renderer) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  resizeObserver.observe(container);

  // 8. Render Animation Loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    if (controls) {
      controls.update();
    }

    // Subtle breathing float when not dragging
    if (currentLoadedMesh && !isUserInteracting) {
      currentLoadedMesh.position.y = Math.sin(elapsedTime * 1.5) * 0.05;
    }

    renderer.render(scene, camera);
  }
  animate();
}

/**
 * Procedural Realistic Smartphone
 * Instant visible 3D mesh while network loads GLB
 */
function createProceduralSmartphone() {
  const group = new THREE.Group();

  // 1. Sleek Titanium Outer Chassis
  const bodyGeo = new THREE.BoxGeometry(1.2, 2.45, 0.12, 10, 10, 5);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1f242b,
    metalness: 0.92,
    roughness: 0.22,
    envMapIntensity: 1.5
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(bodyMesh);

  // 2. Pure Black OLED Glass Screen
  const screenGeo = new THREE.PlaneGeometry(1.14, 2.38);
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 0.1,
    metalness: 0.95,
    emissive: 0x111111,
    emissiveIntensity: 0.3
  });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.z = 0.062;
  group.add(screenMesh);

  // 3. Dynamic Island Pill
  const pillGeo = new THREE.PlaneGeometry(0.24, 0.055);
  const pillMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const pillMesh = new THREE.Mesh(pillGeo, pillMat);
  pillMesh.position.set(0, 1.05, 0.063);
  group.add(pillMesh);

  // 4. Luxury Gold Chamfer Rim Frame
  const rimGeo = new THREE.BoxGeometry(1.22, 2.47, 0.02);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.98,
    roughness: 0.15
  });
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  group.add(rimMesh);

  // 5. Triple Camera Island on Back
  const bumpGeo = new THREE.BoxGeometry(0.52, 0.52, 0.05);
  const bumpMat = new THREE.MeshStandardMaterial({
    color: 0x181a1f,
    metalness: 0.9,
    roughness: 0.2
  });
  const bumpMesh = new THREE.Mesh(bumpGeo, bumpMat);
  bumpMesh.position.set(-0.28, 0.88, -0.075);
  group.add(bumpMesh);

  // 3 Camera Lenses with Golden Rings
  const lensPositions = [
    [-0.38, 0.98, -0.1],
    [-0.18, 0.98, -0.1],
    [-0.28, 0.78, -0.1]
  ];
  lensPositions.forEach(pos => {
    const lensGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 24);
    lensGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.98,
      roughness: 0.1
    });
    const lensMesh = new THREE.Mesh(lensGeo, ringMat);
    lensMesh.position.set(pos[0], pos[1], pos[2]);
    group.add(lensMesh);
  });

  group.rotation.set(0.12, -0.38, 0);
  proceduralFallbackMesh = group;
  currentLoadedMesh = group;
  scene.add(group);
}

/**
 * Configure GLTFLoader with DRACOLoader and MeshoptDecoder
 */
function getGLTFLoader() {
  if (typeof THREE.GLTFLoader === 'undefined') return null;

  const loader = new THREE.GLTFLoader();

  // Configure DRACOLoader
  if (typeof THREE.DRACOLoader !== 'undefined') {
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);
  }

  // Configure MeshoptDecoder
  if (typeof window.MeshoptDecoder !== 'undefined') {
    loader.setMeshoptDecoder(window.MeshoptDecoder);
  }

  return loader;
}

/**
 * Load True 3D GLB Model or Custom High-Tech Rig
 */
function loadModel(type) {
  currentModelType = type;

  // Update switcher button states
  document.querySelectorAll('.switcher-btn').forEach(btn => btn.classList.remove('active'));
  const btnId = (type === 'phone') ? 'btn-phone' : (type === 'macbook') ? 'btn-macbook' : 'btn-rig';
  const activeBtn = document.getElementById(btnId);
  if (activeBtn) activeBtn.classList.add('active');

  // If gaming rig is selected, build the liquid-cooled PC rig scene
  if (type === 'rig') {
    createLiquidGamingRig();
    return;
  }

  const loader = getGLTFLoader();
  if (!loader) return;

  // Use iphone14.glb (clean uncompressed standard GLTF) or mac.glb
  const filePath = (type === 'phone') ? 'assets/iphone14.glb' : 'assets/mac.glb';

  loader.load(
    filePath,
    (gltf) => {
      // Remove previous mesh
      if (currentLoadedMesh) {
        scene.remove(currentLoadedMesh);
      }
      if (proceduralFallbackMesh && currentLoadedMesh !== proceduralFallbackMesh) {
        scene.remove(proceduralFallbackMesh);
      }

      const model = gltf.scene;

      // Auto-compute bounding box to normalize scale precisely
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      
      const desiredScale = (type === 'phone' ? 2.5 : 2.2) / maxDim;
      model.scale.set(desiredScale, desiredScale, desiredScale);

      // Re-center model geometry pivot
      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.x = -center.x * desiredScale;
      model.position.y = -center.y * desiredScale;
      model.position.z = -center.z * desiredScale;

      const pivotGroup = new THREE.Group();
      pivotGroup.add(model);
      pivotGroup.rotation.set(0.12, -0.4, 0);

      currentLoadedMesh = pivotGroup;

      // Enhance materials for metallic luxury reflections
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.roughness = Math.min(child.material.roughness || 0.3, 0.4);
            child.material.metalness = Math.max(child.material.metalness || 0.6, 0.85);
          }
        }
      });

      scene.add(currentLoadedMesh);
      console.log(`Loaded 3D ${type} model successfully!`);
    },
    (progress) => {
      if (progress.total > 0) {
        console.log(`Loading 3D: ${(progress.loaded / progress.total * 100).toFixed(0)}%`);
      }
    },
    (error) => {
      console.warn(`GLB load notice for ${type}: using procedural enhanced model`, error);
      // Fallback is already displayed gracefully!
    }
  );
}

/**
 * 3D Apex Liquid Gaming PC Model (Procedural High-Tech Hardware)
 */
function createLiquidGamingRig() {
  if (currentLoadedMesh) scene.remove(currentLoadedMesh);

  const group = new THREE.Group();

  // Glass & Titanium PC Case
  const caseGeo = new THREE.BoxGeometry(1.6, 2.2, 1.8);
  const caseMat = new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    transmission: 0.65,
    opacity: 0.9,
    transparent: true,
    roughness: 0.1,
    metalness: 0.8
  });
  const caseMesh = new THREE.Mesh(caseGeo, caseMat);
  group.add(caseMesh);

  // Chassis Metal Frame
  const frameGeo = new THREE.BoxGeometry(1.64, 2.24, 1.84);
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    wireframe: true,
    metalness: 0.95
  });
  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  group.add(frameMesh);

  // Giant GPU (RTX 4090) with Gold Trim
  const gpuGeo = new THREE.BoxGeometry(1.2, 0.35, 0.8);
  const gpuMat = new THREE.MeshStandardMaterial({
    color: 0x181818,
    metalness: 0.9,
    roughness: 0.2
  });
  const gpuMesh = new THREE.Mesh(gpuGeo, gpuMat);
  gpuMesh.position.set(0, -0.2, 0.1);
  group.add(gpuMesh);

  // Glowing Liquid Cooling Tubes
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.4, 0.6, 0),
    new THREE.Vector3(-0.2, 0.2, 0.3),
    new THREE.Vector3(0.3, 0.0, 0.2),
    new THREE.Vector3(0.5, -0.6, 0)
  ]);
  const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.045, 12, false);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    emissive: 0xd4af37,
    emissiveIntensity: 0.6,
    roughness: 0.2
  });
  const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
  group.add(tubeMesh);

  group.rotation.set(0.18, -0.5, 0);
  currentLoadedMesh = group;
  scene.add(group);
}

/**
 * Reset 3D Camera & Controls to Front Showcase Angle
 */
function reset3DCamera() {
  if (!camera || !controls) return;
  camera.position.set(0, 0.2, 4.2);
  controls.target.set(0, 0, 0);
  controls.update();
  if (currentLoadedMesh) {
    currentLoadedMesh.rotation.set(0.12, -0.38, 0);
  }
}

/* ==========================================================================
   2. MULTILINGUAL TRANSLATION ENGINE (ENGLISH, MARATHI, HINDI)
   ========================================================================== */
let currentLang = 'en';
let rotatingTimer = null;

const ROTATING_TEXTS = {
  en: [
    'iPhone & 5G Mobiles',
    'HP & Dell Laptops',
    'Full Desktop Sets',
    '30-Min Fast Repairs',
    'Printers, Inks & Accessories'
  ],
  mr: [
    'आयफोन व 5G मोबाईल्स',
    'एचपी व डेल लॅपटॉप्स',
    'संपूर्ण कॉम्प्युटर सेट्स',
    '३० मिनिटांत लॅपटॉप रिपेअर',
    'प्रिंटर, शाई व ॲक्सेसरीज'
  ],
  hi: [
    'आईफोन और 5G मोबाइल',
    'एचपी और डेल लैपटॉप्स',
    'पूरा कंप्यूटर सेट',
    '३० मिनट में लैपटॉप रिपेयर',
    'प्रिंटर, इंक और एक्सेसरीज'
  ]
};

const TRANSLATIONS = {
  en: {
    meta_title: 'Harshu Computers & Electronics | Best Mobiles, Laptops & Repairs - Yeola',
    brand_name: 'Harshu Computers & Electronics',
    nav_overview: 'Overview',
    nav_studio: '3D View',
    nav_components: 'Parts',
    nav_inventory: 'Products',
    nav_location: 'Location',
    btn_whatsapp: 'Order on WhatsApp',
    hero_badge: '⭐ 5.0 Star Rated Shop • Yeola, Maharashtra',
    hero_title: 'Best Mobiles, Laptops & Computer Repairs in Yeola',
    hero_title_sub: 'Guaranteed Best Local Prices • Genuine Brand Warranty • 100% Tested',
    rotating_label: 'Available at Shop:',
    hero_desc: "Welcome to Harshu Computers! Yeola's trusted shop for new & second-hand laptops, smartphones, custom computers, and instant repairs near Samarth Mobile, Erandgaon Road.",
    btn_explore_catalog: 'View Products & Prices',
    btn_whatsapp_inquiry: 'Chat on WhatsApp',
    metric_rating_val: '5.0 ★',
    metric_rating_lbl: 'Justdial 5-Star Rating',
    metric_warranty_val: '100%',
    metric_warranty_lbl: 'Genuine Brand Warranty',
    metric_speed_val: '30 Min',
    metric_speed_lbl: 'Fast Repair & Upgrades',
    switcher_phone: '📱 Mobile',
    switcher_laptop: '💻 Laptop',
    switcher_pc: '⚡ Desktop PC',
    switcher_reset: '↺ Reset',
    vel_1: 'HARSHU COMPUTERS YEOLA',
    vel_2: 'BEST MOBILES & LAPTOPS',
    vel_3: '30-MINUTE FAST REPAIRS',
    vel_4: 'ORIGINAL ACCESSORIES',
    vel_5: 'JUSTDIAL 5.0 RATED',
    vel_sub1: 'NEAR SAMARTH MOBILE • ERANDGAON ROAD',
    vel_sub2: 'GENUINE BILL & BRAND WARRANTY',
    vel_sub3: 'LOWEST LOCAL PRICES IN YEOLA',
    orbit_tag: 'Original Spare Parts',
    orbit_title: 'Tested Genuine Computer & Mobile Parts',
    orbit_desc: 'We use only 100% original screens, fast SSD storage, RAM, batteries, and cooling fans to ensure your devices last long without trouble.',
    orbit_core_badge: '100% TESTED & GUARANTEED',
    orbit_core_title: 'Quality Parts & Accessories',
    orbit_core_desc: 'Tap any part to see details',
    catalog_tag: 'Store Products',
    catalog_title: 'Browse Mobiles, Laptops & Services',
    catalog_desc: 'Clear transparent pricing with official bill and shop guarantee.',
    filter_all: 'All Products',
    filter_smartphones: '📱 Mobiles',
    filter_laptops: '💻 Laptops',
    filter_tablets: '📟 Tablets',
    filter_peripherals: '⌨️ Accessories',
    filter_rigs: '⚡ Desktop PCs',
    c_price_from: 'Starting From',
    c_price_set: 'Complete Set From',
    c_price_service: 'Service Fee From',
    btn_order_wa: 'Order on WhatsApp',
    btn_book_repair: 'Book Fast Repair',
    c1_badge: 'iPhone, Samsung, Vivo, Oppo',
    c1_cat: 'Brand New 5G Mobiles',
    c1_title: 'iPhone & Top 5G Android Phones',
    c1_s1: 'Available: iPhone 16/15, Samsung Galaxy, OnePlus, Vivo, Oppo, Realme',
    c1_s2: 'All 5G models with fast charging & crystal clear cameras',
    c1_s3: 'Free tempered glass & back cover with every new phone',
    c1_s4: '1-Year official brand warranty with GST bill',
    c1_price: '₹8,999 - ₹1,34,900',
    c2_badge: 'New & Second Hand Laptops',
    c2_cat: 'Laptops for Study, Shop & Office',
    c2_title: 'HP, Dell, Lenovo & Apple Laptops',
    c2_s1: 'Intel Core i3 / i5 / i7 and AMD Ryzen processors',
    c2_s2: 'Fast SSD storage: Starts and shuts down in just 5 seconds',
    c2_s3: 'Installed with Windows 11, MS Office, Antivirus & Tally',
    c2_s4: 'Tested second-hand laptops available at low budget with warranty',
    c2_price: '₹14,500 - ₹1,85,000',
    c3_badge: 'Best for Online Study',
    c3_cat: 'Educational & Business Tablets',
    c3_title: 'iPads & Android Study Tablets',
    c3_s1: 'Big crisp touch display for reading, school work & YouTube',
    c3_s2: 'Long-lasting battery keeps working all day on single charge',
    c3_s3: 'Supports stylus pen for drawing, writing & shop billing',
    c3_s4: 'Original brand warranty & pre-installed learning apps',
    c3_price: '₹11,999 - ₹89,900',
    c4_badge: 'Ready-to-Use Full Set',
    c4_cat: 'Complete Computer Sets',
    c4_title: 'Desktop PCs & Office Computers',
    c4_s1: 'Full set includes LED monitor, CPU cabinet, keyboard & mouse',
    c4_s2: 'Perfect for GST billing, Tally, schools, offices & cyber cafes',
    c4_s3: 'Fast Intel Core processor with 8GB/16GB RAM & 512GB SSD',
    c4_s4: '1-Year comprehensive shop warranty & local Yeola service',
    c4_price: '₹16,500 - ₹95,000',
    c5_badge: '100% Original Quality',
    c5_cat: 'Computer & Mobile Accessories',
    c5_title: 'Keyboards, Mouse, WiFi & Cables',
    c5_s1: 'Wireless & wired mouse, durable keyboards for daily typing',
    c5_s2: 'HP, Canon, Epson printer ink bottles, cartridges & cables',
    c5_s3: 'Fast mobile chargers, power banks, pen drives & OTG adapters',
    c5_s4: 'Immediate replacement warranty on accessories',
    c5_price: '₹150 - ₹4,500',
    c6_badge: '30-Min Fast Repair',
    c6_cat: 'Quick Repair & Speedup Lab',
    c6_title: '30-Minute Laptop & PC Speed Upgrade',
    c6_s1: 'Make slow laptops 10x faster: Upgrade old hard disk to NVMe SSD',
    c6_s2: 'Laptop screen change, battery replacement & keyboard fixing',
    c6_s3: 'Windows formatting, virus removal & genuine software setup',
    c6_s4: 'Your personal photos, files & data are kept 100% safe',
    c6_price: '₹299 - ₹4,499',
    nav_store: 'Our Store',
    gallery_tag: 'Our Physical Store',
    gallery_title: 'Real Store, Real People, Trusted Service',
    gallery_desc: 'See inside our Yeola shop. Welcoming thousands of happy customers with 100% genuine products, live testing, and expert computer technicians.',
    store_badge_1: '📍 Sales & Service Desk',
    store_cap_title_1: 'Dedicated Sales & Repair Counter',
    store_cap_desc_1: 'Walk in for immediate 30-minute laptop upgrades, SSD replacements, and mobile screen repairs with face-to-face service.',
    store_badge_2: '⭐ Happy Customers',
    store_cap_title_2: 'Trusted by 5,000+ Locals in Yeola',
    store_cap_desc_2: 'From students and cyber cafe owners to local businesses, our customers enjoy verified brand warranties, GST bills, and friendly local service.',
    contact_tag: 'Direct Visit',
    contact_title: 'Visit Harshu Computers in Yeola',
    contact_desc: 'Conveniently located on Manmad Road near Samarth Mobile. Open all 7 days of the week from 9:00 AM to 9:00 PM. Call or visit anytime!',
    info_address_title: 'Shop Address',
    info_address_text: 'Near Samarth Mobile, Manmad Road, Erandgaon Jeur, Yeola - 423401, Maharashtra',
    info_hours_title: 'Shop Timings',
    info_hours_text: 'Monday to Sunday: 09:00 AM – 09:00 PM (Open All 7 Days)',
    info_rating_title: 'Justdial 5-Star Rated',
    info_rating_text: '5.0 / 5.0 Star Rating on Justdial • Trusted Local Store',
    btn_maps: 'Open in Google Maps',
    btn_whatsapp_store: 'Chat on WhatsApp',
    footer_copy: '© 2026 Harshu Computers & Electronics. All rights reserved. • Erandgaon Jeur, Yeola, Maharashtra - 423401',
    footer_tag1: '⭐ 5.0 Rating on Justdial',
    footer_tag2: 'Open Today until 9:00 PM'
  },
  mr: {
    meta_title: 'हर्षू कॉम्प्युटर्स आणि इलेक्ट्रॉनिक्स | मोबाईल्स, लॅपटॉप्स आणि जलद रिपेअर - येवला',
    brand_name: 'हर्षू कॉम्प्युटर्स अँड इलेक्ट्रॉनिक्स',
    nav_overview: 'माहिती',
    nav_studio: '3D मॉडेल',
    nav_components: 'सुटे भाग',
    nav_inventory: 'प्रॉडक्ट्स',
    nav_store: 'दुकान',
    nav_location: 'पत्ता',
    btn_whatsapp: 'व्हॉट्सॲपवर ऑर्डर करा',
    hero_badge: '⭐ ५.० स्टार मानांकन दुकान • येवला, महाराष्ट्र',
    hero_title: 'येवला शहरातील सर्वात उत्तम मोबाईल, लॅपटॉप व कॉम्प्युटर दुकान',
    hero_title_sub: 'खात्रीशीर कमी भाव • कंपनी वॉरंटी • १००% ओरिजिनल प्रॉडक्ट्स',
    rotating_label: 'दुकानात उपलब्ध:',
    hero_desc: 'हर्षू कॉम्प्युटर्समध्ये आपले सहर्ष स्वागत! येवला शहरात नवीन व सेकण्ड हँड लॅपटॉप, 5G मोबाईल्स, संपूर्ण कॉम्प्युटर आणि अवघ्या ३० मिनिटांत जलद रिपेअरिंग. समर्थ मोबाईल शेजारी, एरंडगाव रोड.',
    btn_explore_catalog: 'प्रॉडक्ट्स व किमती पहा',
    btn_whatsapp_inquiry: 'व्हॉट्सॲपवर बोला',
    metric_rating_val: '५.० ★',
    metric_rating_lbl: 'जस्टडायल ५-स्टार रेटिंग',
    metric_warranty_val: '१००%',
    metric_warranty_lbl: 'पक्की कंपनी वॉरंटी',
    metric_speed_val: '३० मिनिट',
    metric_speed_lbl: 'फास्ट रिपेअरिंग सर्व्हिस',
    switcher_phone: '📱 मोबाईल',
    switcher_laptop: '💻 लॅपटॉप',
    switcher_pc: '⚡ कॉम्प्युटर',
    switcher_reset: '↺ मूळ स्थिती',
    vel_1: 'हर्षू कॉम्प्युटर्स येवला',
    vel_2: 'उत्तम मोबाईल व लॅपटॉप्स',
    vel_3: '३० मिनिटांत फास्ट रिपेअर',
    vel_4: 'ओरिजिनल ॲक्सेसरीज',
    vel_5: 'जस्टडायल ५.० स्टार दुकान',
    vel_sub1: 'समर्थ मोबाईल शेजारी • एरंडगाव रोड, येवला',
    vel_sub2: 'पक्के जीएसटी बिल व वॉरंटी',
    vel_sub3: 'येवल्यात सर्वात माफक भाव',
    orbit_tag: 'ओरिजिनल सुटे भाग',
    orbit_title: '१००% ओरिजिनल कॉम्प्युटर व मोबाईल पार्ट्स',
    orbit_desc: 'आम्ही फक्त ओरिजिनल डिस्प्ले, जलद SSD, रॅम आणि बॅटरी वापरतो, ज्यामुळे तुमचा फोन व लॅपटॉप अनेक वर्षे सुरळीत चालतो.',
    orbit_core_badge: '१००% टेस्टेड व गॅरंटीड',
    orbit_core_title: 'उत्कृष्ट पार्ट्स व ॲक्सेसरीज',
    orbit_core_desc: 'तपशील पाहण्यासाठी कोणत्याही भागावर क्लिक करा',
    catalog_tag: 'दुकानातील प्रॉडक्ट्स',
    catalog_title: 'मोबाईल्स, लॅपटॉप्स आणि सर्व्हिसेस',
    catalog_desc: 'पक्क्या बिलासह व खात्रीशीर दुकानाच्या गॅरंटीसह योग्य किमती.',
    filter_all: 'सर्व प्रॉडक्ट्स',
    filter_smartphones: '📱 मोबाईल्स',
    filter_laptops: '💻 लॅपटॉप्स',
    filter_tablets: '📟 टॅब्लेट्स',
    filter_peripherals: '⌨️ ॲक्सेसरीज',
    filter_rigs: '⚡ कॉम्प्युटर सेट',
    c_price_from: 'किंमत सुरू',
    c_price_set: 'संपूर्ण सेट सुरू',
    c_price_service: 'सर्व्हिस फी सुरू',
    btn_order_wa: 'व्हॉट्सॲपवर ऑर्डर करा',
    btn_book_repair: 'रिपेअरिंग बुक करा',
    c1_badge: 'आयफोन, सॅमसंग, विवो, ओप्पो',
    c1_cat: 'नवीन 5G स्मार्टफोन्स',
    c1_title: 'आयफोन आणि सर्व आघाडीचे 5G मोबाईल्स',
    c1_s1: 'उपलब्ध: iPhone 16/15, Samsung Galaxy, OnePlus, Vivo, Oppo, Realme',
    c1_s2: 'सर्व 5G मॉडेल्स - सुपरफास्ट चार्जिंग आणि उत्कृष्ट कॅमेरा',
    c1_s3: 'प्रत्येक नवीन मोबाईलसोबत टेम्पर्ड ग्लास आणि बॅक कव्हर फ्री',
    c1_s4: '१ वर्षाची कंपनी वॉरंटी व पक्के बिल',
    c1_price: '₹८,९९९ - ₹१,३४,९००',
    c2_badge: 'नवीन व सेकंड हँड लॅपटॉप्स',
    c2_cat: 'अभ्यास, दुकान व ऑफिससाठी लॅपटॉप',
    c2_title: 'HP, Dell, Lenovo आणि ॲपल लॅपटॉप्स',
    c2_s1: 'Intel Core i3 / i5 / i7 व AMD Ryzen प्रोसेसर पर्याय',
    c2_s2: 'सुपरफास्ट SSD: लॅपटॉप ५ सेकंदात चालू आणि बंद होतो',
    c2_s3: 'Windows 11, MS Office, Antivirus व Tally इन्स्टॉल केलेले',
    c2_s4: 'कमी बजेटमध्ये उत्तम सेकंड हँड लॅपटॉप वॉरंटीसह उपलब्ध',
    c2_price: '₹१४,५०० - ₹१,८५,०००',
    c3_badge: 'अभ्यासासाठी सर्वात उत्तम',
    c3_cat: 'शिक्षण व व्यवसायासाठी टॅब्लेट',
    c3_title: 'आयपॅड व अँड्रॉइड स्टडी टॅब्लेट्स',
    c3_s1: 'ऑनलाइन क्लासेस, वाचन व युट्यूबसाठी मोठा व स्वच्छ स्क्रीन',
    c3_s2: 'दमदार बॅटरी - दिवसभर अखंड चालते',
    c3_s3: 'चित्रकला, सही व दुकान बिलांसाठी पेन (Stylus) सपोर्ट',
    c3_s4: 'ओरिजिनल कंपनी वॉरंटी व अभ्यासाचे ॲप्स तयार',
    c3_price: '₹११,९९९ - ₹८९,९००',
    c4_badge: 'वापरासाठी सज्ज पूर्ण सेट',
    c4_cat: 'संपूर्ण कॉम्प्युटर सेट्स',
    c4_title: 'डेस्कटॉप पीसी व ऑफिस कॉम्प्युटर',
    c4_s1: 'पूर्ण सेट: LED मॉनिटर, CPU, कीबोर्ड, माऊस व केबल्स',
    c4_s2: 'दुकान बिलिंग, टॅली, शाळा, ग्राहक सेवा केंद्र व ऑफिससाठी योग्य',
    c4_s3: 'फास्ट Intel प्रोसेसर, 8GB/16GB रॅम व 512GB SSD',
    c4_s4: '१ वर्षाची संपूर्ण वॉरंटी व येवल्यात जागेवर सर्व्हिस',
    c4_price: '₹१६,५०० - ₹९५,०००',
    c5_badge: '१००% ओरिजिनल क्वालिटी',
    c5_cat: 'कॉम्प्युटर व मोबाईल ॲक्सेसरीज',
    c5_title: 'कीबोर्ड, माऊस, वायफाय व केबल्स',
    c5_s1: 'वायरलेस व वायर्ड माऊस, रोजच्या कामासाठी मजबूत कीबोर्ड',
    c5_s2: 'HP, Canon, Epson प्रिंटर शाईच्या बाटल्या (Inks) व केबल्स',
    c5_s3: 'फास्ट मोबाईल चार्जर, पॉवर बँक, पेन ड्राइव्ह व ओटीजी',
    c5_s4: 'खराब झाल्यास त्वरित बदलून मिळण्याची खात्री',
    c5_price: '₹१५० - ₹४,५००',
    c6_badge: '३० मिनिटांत फास्ट रिपेअर',
    c6_cat: 'जलद दुरुस्ती व स्पीडअप लॅब',
    c6_title: '३० मिनिटांत लॅपटॉप व पीसी स्पीड अपग्रेड',
    c6_s1: 'हळू चालणारा लॅपटॉप १० पट जलद करा: जुनी हार्ड डिस्क बदलून SSD बसवा',
    c6_s2: 'लॅपटॉप स्क्रीन बदलणे, नवीन बॅटरी बसवणे व कीबोर्ड दुरुस्ती',
    c6_s3: 'विंडोज फॉरमॅटिंग, व्हायरस काढणे व ओरिजिनल सॉफ्टवेअर',
    c6_s4: 'तुमचे फोटो, फाइल्स आणि डेटा १००% सुरक्षित ठेवला जातो',
    c6_price: '₹२९९ - ₹४,४९९',
    gallery_tag: 'प्रत्यक्ष दुकान',
    gallery_title: 'येवला शहरातील आपले विश्वासू दुकान व समाधानी ग्राहक',
    gallery_desc: 'हर्षू कॉम्प्युटर्सचे प्रत्यक्ष दुकान आणि हजारो समाधानी ग्राहकांचा विश्वास. १००% ओरिजिनल सामान, समोरासमोर काम आणि पक्के बिल.',
    store_badge_1: '📍 सर्व्हिस व सेल्स काउंटर',
    store_cap_title_1: 'सुसज्ज सर्व्हिस व विक्री काउंटर',
    store_cap_desc_1: '३० मिनिटांत लॅपटॉप स्पीड अपग्रेड, नवीन SSD बसवणे आणि मोबाईल दुरुस्तीसाठी त्वरित समोरासमोर सर्व्हिस.',
    store_badge_2: '⭐ समाधानी ग्राहक',
    store_cap_title_2: 'येवल्यातील ५०००+ ग्राहकांचा अतूट विश्वास',
    store_cap_desc_2: 'विद्यार्थी, व्यापारी व दुकानदारांसाठी उत्कृष्ट लॅपटॉप, कॉम्प्युटर आणि गॅरंटीड आफ्टर-सेल्स सपोर्ट.',
    contact_tag: 'दुकानाला भेट द्या',
    contact_title: 'हर्षू कॉम्प्युटर्सला येवल्यात भेट द्या',
    contact_desc: 'मनमाड रोडवर समर्थ मोबाईल शेजारी सहज पोहोचण्याजोगे ठिकाण. आठवड्याचे सातही दिवस सकाळी ९:०० ते रात्री ९:०० वाजेपर्यंत चालू.',
    info_address_title: 'दुकानाचा पत्ता',
    info_address_text: 'समर्थ मोबाईल शेजारी, मनमाड रोड, एरंडगाव जेऊर, येवला - ४२३४०१, महाराष्ट्र',
    info_hours_title: 'दुकानाची वेळ',
    info_hours_text: 'सोमवार ते रविवार: सकाळी ०९:०० ते रात्री ०९:०० (सातही दिवस चालू)',
    info_rating_title: 'जस्टडायल ५-स्टार मानांकन',
    info_rating_text: '५.० / ५.० स्टार रेटिंग • ग्राहकांचे विश्वासू दुकान',
    btn_maps: 'गुगल मॅप्सवर पत्ता पहा',
    btn_whatsapp_store: 'व्हॉट्सॲपवर संपर्क करा',
    footer_copy: '© २०२६ हर्षू कॉम्प्युटर्स अँड इलेक्ट्रॉनिक्स. सर्व हक्क राखीव. • एरंडगाव जेऊर, येवला, महाराष्ट्र - ४२३४०१',
    footer_tag1: '⭐ ५.० स्टार रेटिंग Justdial वर',
    footer_tag2: 'आज रात्री ९:०० वाजेपर्यंत चालू'
  },
  hi: {
    meta_title: 'हर्षू कंप्यूटर्स एंड इलेक्ट्रॉनिक्स | सबसे बढ़िया मोबाइल, लैपटॉप और रिपेयरिंग - येवला',
    brand_name: 'हर्षू कंप्यूटर्स एंड इलेक्ट्रॉनिक्स',
    nav_overview: 'जानकारी',
    nav_studio: '3D व्यू',
    nav_components: 'स्पेयर पार्ट्स',
    nav_inventory: 'प्रोडक्ट्स',
    nav_store: 'हमारी दुकान',
    nav_location: 'लोकेशन',
    btn_whatsapp: 'व्हाट्सएप पर ऑर्डर करें',
    hero_badge: '⭐ ५.० स्टार रेटिंग दुकान • येवला, महाराष्ट्र',
    hero_title: 'येवला में सबसे बढ़िया मोबाइल, लैपटॉप और कंप्यूटर की दुकान',
    hero_title_sub: 'सबसे कम दाम की गारंटी • पक्की कंपनी वारंटी • १००% ओरिजिनल सामान',
    rotating_label: 'दुकान में उपलब्ध:',
    hero_desc: 'हर्षू कंप्यूटर्स में आपका स्वागत है! येवला में नए और सेकंड-हैंड लैपटॉप, 5G मोबाइल, कंप्यूटर सेट और सिर्फ ३० मिनट में रिपेयरिंग। समर्थ मोबाइल के पास, एरंडगांव रोड।',
    btn_explore_catalog: 'प्रोडक्ट्स और दाम देखें',
    btn_whatsapp_inquiry: 'व्हाट्सएप पर बात करें',
    metric_rating_val: '५.० ★',
    metric_rating_lbl: 'जस्टडायल ५-स्टार रेटिंग',
    metric_warranty_val: '१००%',
    metric_warranty_lbl: 'ओरिजिनल कंपनी वारंटी',
    metric_speed_val: '३० मिनट',
    metric_speed_lbl: 'तेज़ रिपेयर और अपग्रेड',
    switcher_phone: '📱 मोबाइल',
    switcher_laptop: '💻 लैपटॉप',
    switcher_pc: '⚡ कंप्यूटर',
    switcher_reset: '↺ रीसेट',
    vel_1: 'हर्षू कंप्यूटर्स येवला',
    vel_2: 'बेस्ट मोबाइल और लैपटॉप्स',
    vel_3: '३० मिनट में फास्ट रिपेयर',
    vel_4: 'ओरिजिनल एक्सेसरीज',
    vel_5: 'जस्टडायल ५.० स्टार रेटिंग',
    vel_sub1: 'समर्थ मोबाइल के पास • एरंडगांव रोड, येवला',
    vel_sub2: 'जीएसटी बिल और कंपनी वारंटी',
    vel_sub3: 'येवला में सबसे कम दाम',
    orbit_tag: 'ओरिजिनल स्पेयर पार्ट्स',
    orbit_title: 'जांचे हुए ओरिजिनल कंप्यूटर और मोबाइल पार्ट्स',
    orbit_desc: 'हम केवल १००% ओरिजिनल डिस्प्ले, तेज़ SSD, रैम और बैटरी लगाते हैं ताकि आपका डिवाइस सालों-साल बिना परेशानी चले।',
    orbit_core_badge: '१००% टेस्टेड और गारंटीड',
    orbit_core_title: 'क्वालिटी पार्ट्स और एक्सेसरीज',
    orbit_core_desc: 'जानकारी देखने के लिए किसी भी पार्ट पर क्लिक करें',
    catalog_tag: 'दुकान के प्रोडक्ट्स',
    catalog_title: 'मोबाइल, लैपटॉप और रिपेयरिंग सेवाएं',
    catalog_desc: 'पक्के बिल और दुकान की गारंटी के साथ एकदम सही दाम।',
    filter_all: 'सभी प्रोडक्ट्स',
    filter_smartphones: '📱 मोबाइल',
    filter_laptops: '💻 लैपटॉप्स',
    filter_tablets: '📟 टैबलेट्स',
    filter_peripherals: '⌨️ एक्सेसरीज',
    filter_rigs: '⚡ कंप्यूटर सेट',
    c_price_from: 'कीमत शुरू',
    c_price_set: 'पूरा सेट शुरू',
    c_price_service: 'सर्विस फीस शुरू',
    btn_order_wa: 'व्हाट्सएप पर ऑर्डर करें',
    btn_book_repair: 'रिपेयरिंग बुक करें',
    c1_badge: 'आईफोन, सैमसंग, विवो, ओप्पो',
    c1_cat: 'नए 5G स्मार्टफोन्स',
    c1_title: 'आईफोन और सभी टॉप 5G मोबाइल फोन्स',
    c1_s1: 'उपलब्ध: iPhone 16/15, Samsung Galaxy, OnePlus, Vivo, Oppo, Realme',
    c1_s2: 'सभी 5G मॉडल - सुपरफास्ट चार्जिंग और बेहतरीन कैमरा',
    c1_s3: 'हर नए फोन के साथ टेम्पर्ड ग्लास और बैक कवर बिल्कुल फ्री',
    c1_s4: '१ साल की कंपनी वारंटी और पक्का जीएसटी बिल',
    c1_price: '₹८,९९९ - ₹१,३४,९००',
    c2_badge: 'नए और सेकंड-हैंड लैपटॉप्स',
    c2_cat: 'पढ़ाई, दुकान और ऑफिस के लिए लैपटॉप',
    c2_title: 'HP, Dell, Lenovo और एप्पल लैपटॉप्स',
    c2_s1: 'Intel Core i3 / i5 / i7 और AMD Ryzen प्रोसेसर विकल्प',
    c2_s2: 'सुपरफास्ट SSD: लैपटॉप ५ सेकंड में ऑन और ऑफ हो जाता है',
    c2_s3: 'Windows 11, MS Office, Antivirus और Tally इंस्टाल किया हुआ',
    c2_s4: 'कम बजट में अच्छी कंडीशन वाले सेकंड-हैंड लैपटॉप वारंटी के साथ',
    c2_price: '₹१४,५०० - ₹१,८५,०००',
    c3_badge: 'ऑनलाइन पढ़ाई के लिए सबसे बढ़िया',
    c3_cat: 'एजुकेशन और बिजनेस टैबलेट्स',
    c3_title: 'आईपैड और एंड्रॉइड स्टडी टैबलेट्स',
    c3_s1: 'पढ़ाई, नोट्स और यूट्यूब देखने के लिए बड़ी और साफ टच स्क्रीन',
    c3_s2: 'दमदार बैटरी - एक बार चार्ज करने पर पूरा दिन चलती है',
    c3_s3: 'ड्राइंग, लिखावट और बिलिंग के लिए पेन (Stylus) सपोर्ट',
    c3_s4: 'ओरिजिनल कंपनी वारंटी और पढ़ाई के जरूरी ऐप्स रेडी',
    c3_price: '₹११,९९९ - ₹८९,९००',
    c4_badge: 'इस्तेमाल के लिए तैयार पूरा सेट',
    c4_cat: 'कंप्यूटर का पूरा सेट',
    c4_title: 'डेस्कटॉप पीसी और ऑफिस कंप्यूटर',
    c4_s1: 'फुल सेट: LED मॉनिटर, CPU कैबिनेट, कीबोर्ड, माउस और तारें',
    c4_s2: 'दुकान बिलिंग, टैली, स्कूल, सीएससी सेंटर और ऑफिस के लिए बेस्ट',
    c4_s3: 'फास्ट Intel प्रोसेसर, 8GB/16GB रैम और 512GB SSD स्टोरेज',
    c4_s4: '१ साल की फुल वारंटी और येवला में लोकल सर्विस सपोर्ट',
    c4_price: '₹१६,५०० - ₹९५,०००',
    c5_badge: '१००% ओरिजिनल क्वालिटी',
    c5_cat: 'कंप्यूटर और मोबाइल एक्सेसरीज',
    c5_title: 'कीबोर्ड, माउस, वाईफाई और केबल्स',
    c5_s1: 'वायरलेस और वायर्ड माउस, रोज़ाना काम के लिए टिकाऊ कीबोर्ड',
    c5_s2: 'HP, Canon, Epson प्रिंटर इंक बॉटल्स, कार्ट्रिज और केबल्स',
    c5_s3: 'फास्ट मोबाइल चार्जर, पावर बैंक, पेन ड्राइव और ओटीजी एडाप्टर',
    c5_s4: 'खराब होने पर तुरंत रिप्लेसमेंट वारंटी की सुविधा',
    c5_price: '₹१५० - ₹४,५००',
    c6_badge: '३० मिनट में तेज़ रिपेयरिंग',
    c6_cat: 'फास्ट रिपेयर और स्पीडअप लैब',
    c6_title: '३० मिनट में लैपटॉप और पीसी स्पीड अपग्रेड',
    c6_s1: 'धीमे लैपटॉप को १० गुना तेज़ बनाएं: पुरानी हार्ड डिस्क हटाकर SSD लगाएं',
    c6_s2: 'लैपटॉप स्क्रीन चेंज, नई बैटरी लगाना और कीबोर्ड रिपेयर',
    c6_s3: 'विंडोज़ फॉर्मेटिंग, वायरस हटाना और ओरिजिनल सॉफ्टवेयर सेटअप',
    c6_s4: 'आपके पर्सनल फोटो, फाइल्स और डेटा १००% सुरक्षित रहते हैं',
    c6_price: '₹२९९ - ₹४,४९९',
    gallery_tag: 'दुकान की झलक',
    gallery_title: 'येवला में अपनी भरोसेमंद दुकान और खुश ग्राहक',
    gallery_desc: 'हर्षू कंप्यूटर्स की असली दुकान और हजारों संतुष्ट ग्राहकों का भरोसा। १००% ओरिजिनल सामान, सामने काम और पक्का बिल।',
    store_badge_1: '📍 सर्विस और सेल्स काउंटर',
    store_cap_title_1: 'सेल्स एवं रिपेयर काउंटर',
    store_cap_desc_1: '३० मिनट में लैपटॉप स्पीड अपग्रेड, SSD लगवाना और मोबाइल रिपेयरिंग के लिए डायरेक्ट इन-स्टोर सर्विस।',
    store_badge_2: '⭐ खुश ग्राहक',
    store_cap_title_2: 'येवला के ५०००+ ग्राहकों का पक्का भरोसा',
    store_cap_desc_2: 'छात्रों, व्यापारियों और ऑफिसों के लिए बेहतरीन लैपटॉप, कंप्यूटर और पूरे साल का लोकल सपोर्ट।',
    contact_tag: 'दुकान पर पधारें',
    contact_title: 'हर्षू कंप्यूटर्स पर आएं - येवला',
    contact_desc: 'मनमाड रोड पर समर्थ मोबाइल के पास। हफ्ते के सातों दिन सुबह ९:०० बजे से रात ९:०० बजे तक खुला है। कभी भी फोन करें या आएं!',
    info_address_title: 'दुकान का पता',
    info_address_text: 'समर्थ मोबाइल के पास, मनमाड रोड, एरंडगांव जेऊर, येवला - ४२३४०१, महाराष्ट्र',
    info_hours_title: 'दुकान का समय',
    info_hours_text: 'सोमवार से रविवार: सुबह ०९:०० से रात ०९:०० (सातों दिन खुली)',
    info_rating_title: 'जस्टडायल ५-स्टार रेटिंग',
    info_rating_text: '५.० / ५.० स्टार रेटिंग • भरोसेमंद स्थानीय दुकान',
    btn_maps: 'गूगल मैप्स पर रास्ता देखें',
    btn_whatsapp_store: 'व्हाट्सएप पर संपर्क करें',
    footer_copy: '© २०२६ हर्षू कंप्यूटर्स एंड इलेक्ट्रॉनिक्स. सर्वाधिकार सुरक्षित. • एरंडगांव जेऊर, येवला, महाराष्ट्र - ४२३४०१',
    footer_tag1: '⭐ Justdial पर ५.० रेटिंग',
    footer_tag2: 'आज रात ९:०० बजे तक खुला है'
  }
};

/**
 * Automatically detect user's device/system default language
 * Supports Marathi (mr, mr-IN), Hindi (hi, hi-IN), and English fallback
 */
function detectDeviceLanguage() {
  const browserLangs = navigator.languages || [navigator.language || navigator.userLanguage || 'en'];
  
  for (let l of browserLangs) {
    if (!l) continue;
    const lower = String(l).toLowerCase();
    if (lower.startsWith('mr')) return 'mr'; // Marathi (उदा. mr, mr-IN)
    if (lower.startsWith('hi')) return 'hi'; // Hindi (उदा. hi, hi-IN)
  }
  
  return 'en';
}

/**
 * Change the active language across the entire website
 * @param {string} lang - 'en' | 'mr' | 'hi'
 * @param {boolean} isManual - true if triggered by user clicking a language button
 */
function setLanguage(lang, isManual = false) {
  if (!TRANSLATIONS[lang]) lang = 'en';
  currentLang = lang;

  // 1. Update Active Buttons
  const buttons = {
    en: document.getElementById('btn-lang-en'),
    mr: document.getElementById('btn-lang-mr'),
    hi: document.getElementById('btn-lang-hi')
  };

  Object.keys(buttons).forEach(k => {
    if (buttons[k]) {
      if (k === lang) {
        buttons[k].classList.add('active');
      } else {
        buttons[k].classList.remove('active');
      }
    }
  });

  // 2. Set Document Language
  document.documentElement.lang = lang;

  // 3. Update all data-i18n elements
  const elements = document.querySelectorAll('[data-i18n]');
  const dict = TRANSLATIONS[lang];

  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict && dict[key] !== undefined) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = dict[key];
      } else {
        el.innerHTML = dict[key];
      }
    }
  });

  // 4. Update Rotating Text with active language list
  updateRotatingTextLanguage();

  // 5. Update Orbit Component tooltips
  if (typeof updateOrbitTooltips === 'function') {
    updateOrbitTooltips(lang);
  }

  // 6. Save preference
  try {
    localStorage.setItem('harshu_lang', lang);
    if (isManual) {
      localStorage.setItem('harshu_lang_manual', 'true');
    }
  } catch (e) {}
}

function initLanguage() {
  let preferredLang = null;
  let isManual = false;

  try {
    const saved = localStorage.getItem('harshu_lang');
    const manualFlag = localStorage.getItem('harshu_lang_manual');
    if (saved && manualFlag === 'true') {
      preferredLang = saved;
      isManual = true;
    }
  } catch (e) {}

  // If user hasn't explicitly clicked a button before, auto-detect device language
  if (!preferredLang) {
    preferredLang = detectDeviceLanguage();
  }

  setLanguage(preferredLang, isManual);

  // Auto-adapt if device language changes in OS/browser settings
  window.addEventListener('languagechange', () => {
    try {
      const manual = localStorage.getItem('harshu_lang_manual');
      if (manual !== 'true') {
        setLanguage(detectDeviceLanguage(), false);
      }
    } catch (e) {}
  });
}

/* ==========================================================================
   3. REACT BITS: ROTATING TEXT (DYNAMIC PRODUCT CYCLING)
   ========================================================================== */
let rotatingIndex = 0;

function updateRotatingTextLanguage() {
  const container = document.getElementById('rotating-text-box');
  if (!container) return;
  const list = ROTATING_TEXTS[currentLang] || ROTATING_TEXTS.en;
  rotatingIndex = 0;
  container.innerHTML = `<span class="rotating-item current">${list[0]}</span>`;
}

function initRotatingText() {
  const container = document.getElementById('rotating-text-box');
  if (!container) return;

  if (rotatingTimer) clearInterval(rotatingTimer);

  updateRotatingTextLanguage();

  rotatingTimer = setInterval(() => {
    const list = ROTATING_TEXTS[currentLang] || ROTATING_TEXTS.en;
    const prev = container.querySelector('.rotating-item.current');
    rotatingIndex = (rotatingIndex + 1) % list.length;
    
    const next = document.createElement('span');
    next.className = 'rotating-item enter';
    next.textContent = list[rotatingIndex];
    container.appendChild(next);

    // Force reflow
    void next.offsetWidth;

    if (prev) {
      prev.className = 'rotating-item exit';
      setTimeout(() => {
        if (prev.parentNode === container) {
          container.removeChild(prev);
        }
      }, 450);
    }
    next.className = 'rotating-item current';
  }, 2600);
}

/* ==========================================================================
   5. REACT BITS: SCROLL REVEAL (WORD-BY-WORD BLUR-TO-FOCUS REVEAL)
   ========================================================================== */
function initScrollReveal() {
  const elements = document.querySelectorAll('.scroll-reveal-text');

  elements.forEach((el) => {
    // Split text content into word spans while preserving HTML tags if any
    const rawText = el.innerText;
    const words = rawText.split(/\s+/);
    el.innerHTML = words.map(w => `<span class="scroll-reveal-word">${w}</span>`).join(' ');
  });

  const wordSpans = document.querySelectorAll('.scroll-reveal-word');

  function checkReveal() {
    const windowH = window.innerHeight;
    wordSpans.forEach((span) => {
      const rect = span.getBoundingClientRect();
      if (rect.top < windowH * 0.9 && rect.bottom > 0) {
        span.classList.add('revealed');
        // Add subtle gold tint to flagship words
        const text = span.textContent.toLowerCase();
        if (text.includes('titanium') || text.includes('velocity') || text.includes('harshu') || text.includes('yeola') || text.includes('apple')) {
          span.classList.add('highlighted');
        }
      }
    });
  }

  window.addEventListener('scroll', checkReveal, { passive: true });
  checkReveal();
}

/* ==========================================================================
   6. REACT BITS: SCROLL VELOCITY (INFINITE TICKER WITH DYNAMIC SKEW)
   ========================================================================== */
function initScrollVelocity() {
  const row1 = document.getElementById('velocity-row-1');
  const row2 = document.getElementById('velocity-row-2');
  if (!row1 || !row2) return;

  const scroller1 = row1.querySelector('.velocity-scroller');
  const scroller2 = row2.querySelector('.velocity-scroller');

  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  let targetSkew = 0;
  let currentSkew = 0;

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    scrollVelocity = currentY - lastScrollY;
    lastScrollY = currentY;

    targetSkew = Math.max(Math.min(scrollVelocity * 0.18, 12), -12);
  }, { passive: true });

  function renderVelocity() {
    requestAnimationFrame(renderVelocity);
    currentSkew += (targetSkew - currentSkew) * 0.1;
    targetSkew *= 0.94; // Decay back to upright

    if (scroller1) {
      scroller1.style.transform = `skewX(${-currentSkew}deg)`;
    }
    if (scroller2) {
      scroller2.style.transform = `skewX(${currentSkew}deg)`;
    }
  }
  renderVelocity();
}


/* ==========================================================================
   8. REACT BITS: SCROLL STACK COMPONENT (CURATED INVENTORY)
   ========================================================================== */
function initScrollStack() {
  const root = document.getElementById('catalog-scroll-stack');
  const inner = document.getElementById('scroll-stack-inner');
  const end = document.getElementById('scroll-stack-end');
  if (!root || !inner || !end) return;

  const slots = Array.from(inner.querySelectorAll('[data-stack-slot]'));
  if (!slots.length) return;

  const getSettings = () => {
    const isMobile = window.innerWidth < 768;
    const isSmall = window.innerWidth < 480;
    return {
      itemDistance: isSmall ? 150 : (isMobile ? 180 : 300),
      itemStackDistance: isSmall ? 12 : (isMobile ? 16 : 28),
      stackPosition: isSmall ? '64px' : (isMobile ? '72px' : '14%'),
      itemScale: isMobile ? 0.025 : 0.045,
      baseScale: isMobile ? 0.92 : 0.8,
      dimAmount: 0.20,
      blurAmount: isMobile ? 0.5 : 1.5,
      tiltAmount: isMobile ? 0.8 : 2.5,
      rotationAmount: isMobile ? 0.4 : 1.2,
      holdDistance: isMobile ? 90 : 240,
      useWindowScroll: true
    };
  };

  let settings = getSettings();

  const resolveOffset = (value, size) => {
    if (typeof value === 'number') return value;
    const text = String(value).trim();
    if (text.endsWith('%')) return (parseFloat(text) / 100) * size;
    return parseFloat(text) || 0;
  };

  // Configure sticky positions, bottom margins, z-indexes, and spacing between slots
  const layoutSlots = () => {
    settings = getSettings();
    slots.forEach((slot, index) => {
      slot.style.top = `calc(${settings.stackPosition} + ${index * settings.itemStackDistance}px)`;
      slot.style.marginBottom = `${(slots.length - 1 - index) * settings.itemStackDistance}px`;
      slot.style.zIndex = index + 1;

      if (index > 0) {
        const prev = slot.previousElementSibling;
        const gap = Math.max(30, settings.itemDistance - (slots.length - index) * settings.itemStackDistance);
        if (prev && prev.classList.contains('scroll-stack__spacer')) {
          prev.style.height = `${gap}px`;
        } else {
          const spacer = document.createElement('div');
          spacer.className = 'scroll-stack__spacer';
          spacer.setAttribute('aria-hidden', 'true');
          spacer.style.height = `${gap}px`;
          inner.insertBefore(spacer, slot);
        }
      }
    });

    end.style.height = `${settings.holdDistance}px`;
  };

  layoutSlots();

  let frame = 0;
  const update = () => {
    frame = 0;
    const viewHeight = window.innerHeight;
    const stackTop = resolveOffset(settings.stackPosition, viewHeight);
    const offset = settings.itemStackDistance;
    const heights = slots.map(slot => slot.offsetHeight);
    const tops = slots.map(slot => slot.getBoundingClientRect().top);

    const depths = slots.map(() => 0);
    for (let j = 1; j < slots.length; j++) {
      const pinBefore = stackTop + (j - 1) * offset;
      const start = pinBefore + heights[j - 1];
      const span = Math.max(1, start - pinBefore - offset);
      const cover = Math.min(1, Math.max(0, (start - tops[j]) / span));
      for (let i = 0; i < j; i++) depths[i] += cover;
    }

    const dimStep = Math.min(Math.max(settings.dimAmount, 0), 1);
    slots.forEach((slot, i) => {
      const card = slot.querySelector('.scroll-stack-card');
      if (!card) return;
      const depth = depths[i];
      const lean = Math.min(depth, 1);
      const scale = Math.max(Math.min(settings.baseScale, 1), 1 - depth * settings.itemScale);
      const tilt = -lean * settings.tiltAmount;
      const turn = lean * settings.rotationAmount * (i % 2 ? -1 : 1);
      const blur = depth * settings.blurAmount;
      const dim = 1 - Math.pow(1 - dimStep, depth);

      const transform = depth < 0.0005
        ? ''
        : `perspective(1200px) rotateX(${tilt.toFixed(2)}deg) rotate(${turn.toFixed(2)}deg) scale(${scale.toFixed(4)})`;

      card.style.transform = transform;
      card.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : '';
      card.style.setProperty('--scroll-stack-dim', dim.toFixed(3));
    });
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => {
    layoutSlots();
    schedule();
  }, { passive: true });
  update();
}

/* ==========================================================================
   9. CATALOG FILTERING & QUICK NAVIGATION
   ========================================================================== */
function filterCatalog(category, btn) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const slots = Array.from(document.querySelectorAll('[data-stack-slot]'));
  if (category === 'all') {
    const firstSlot = slots[0];
    if (firstSlot) {
      firstSlot.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else {
    const targetSlot = document.querySelector(`[data-stack-slot][data-cat="${category}"]`);
    if (targetSlot) {
      targetSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const card = targetSlot.querySelector('.scroll-stack-card');
      if (card) {
        card.style.borderColor = 'var(--gold-bright)';
        card.style.boxShadow = '0 0 50px rgba(212, 175, 55, 0.4)';
        setTimeout(() => {
          card.style.borderColor = '';
          card.style.boxShadow = '';
        }, 1500);
      }
    }
  }
}

const ORBIT_PARTS = {
  en: [
    { src: 'assets/images/iphone.jpg', title: '5G Mobile Screen' },
    { src: 'assets/images/macbook.jpg', title: 'Laptop Full HD Screen' },
    { src: 'assets/images/gpu.jpg', title: 'High-Speed Graphics Card' },
    { src: 'assets/images/tablet.jpg', title: 'Touch Screen Glass' },
    { src: 'assets/images/repair.jpg', title: 'Superfast NVMe SSD' },
    { src: 'assets/images/hero_pc.jpg', title: 'PC Cooling Fan' },
    { src: 'assets/images/keyboard.jpg', title: 'Durable Typing Keyboard' },
    { src: 'assets/images/laptops.jpg', title: 'Durable Laptop Body' }
  ],
  mr: [
    { src: 'assets/images/iphone.jpg', title: '5G मोबाईल स्क्रीन' },
    { src: 'assets/images/macbook.jpg', title: 'लॅपटॉप फुल एचडी स्क्रीन' },
    { src: 'assets/images/gpu.jpg', title: 'फास्ट ग्राफिक्स कार्ड' },
    { src: 'assets/images/tablet.jpg', title: 'टॅब्लेट टच स्क्रीन' },
    { src: 'assets/images/repair.jpg', title: 'सुपरफास्ट SSD मेमरी' },
    { src: 'assets/images/hero_pc.jpg', title: 'सायलेंट कुलिंग फॅन' },
    { src: 'assets/images/keyboard.jpg', title: 'मजबूत टायपिंग कीबोर्ड' },
    { src: 'assets/images/laptops.jpg', title: 'टिकाऊ लॅपटॉप बॉडी' }
  ],
  hi: [
    { src: 'assets/images/iphone.jpg', title: '5G मोबाइल स्क्रीन' },
    { src: 'assets/images/macbook.jpg', title: 'लैपटॉप फुल एचडी स्क्रीन' },
    { src: 'assets/images/gpu.jpg', title: 'फास्ट ग्राफिक्स कार्ड' },
    { src: 'assets/images/tablet.jpg', title: 'टैबलेट टच स्क्रीन' },
    { src: 'assets/images/repair.jpg', title: 'सुपरफास्ट SSD स्टोरेज' },
    { src: 'assets/images/hero_pc.jpg', title: 'कूलिंग फैन' },
    { src: 'assets/images/keyboard.jpg', title: 'मजबूत टाइपिंग कीबोर्ड' },
    { src: 'assets/images/laptops.jpg', title: 'टिकाऊ लैपटॉप बॉडी' }
  ]
};

function updateOrbitTooltips(lang) {
  const parts = ORBIT_PARTS[lang] || ORBIT_PARTS.en;
  const items = document.querySelectorAll('.orbit-item');
  items.forEach((item, idx) => {
    if (parts[idx]) {
      item.setAttribute('data-cursor-label', parts[idx].title);
      const tt = item.querySelector('.orbit-item-tooltip');
      if (tt) tt.textContent = parts[idx].title;
    }
  });
}

function initOrbitImages() {
  const wrapper = document.getElementById('orbit-images-wrapper');
  const stage = document.getElementById('orbit-stage');
  if (!wrapper || !stage) return;

  const components = ORBIT_PARTS[currentLang] || ORBIT_PARTS.en;

  stage.innerHTML = '';
  const items = [];
  const total = components.length;

  components.forEach((comp, idx) => {
    const el = document.createElement('div');
    el.className = 'orbit-item cursor-target';
    el.setAttribute('data-cursor-label', comp.title);
    el.innerHTML = `
      <div class="orbit-item-img-box">
        <img src="${comp.src}" alt="${comp.title}" loading="lazy" />
      </div>
      <div class="orbit-item-tooltip">${comp.title}</div>
    `;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      rotateItemToFront(idx);
    });

    stage.appendChild(el);
    items.push(el);
  });

  // State variables for orbit dynamics
  let progress = 0;
  let targetProgress = 0;
  let velocity = 0;
  let isDragging = false;
  let startX = 0;
  let lastX = 0;
  let isHovered = false;
  let animationFrameId = null;

  const tiltAngle = -8 * (Math.PI / 180); // -8 degree tilt matching React Bits spec
  const cosTilt = Math.cos(tiltAngle);
  const sinTilt = Math.sin(tiltAngle);

  wrapper.addEventListener('mouseenter', () => { isHovered = true; });
  wrapper.addEventListener('mouseleave', () => { isHovered = false; });

  // Pointer drag interactions
  wrapper.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    lastX = e.clientX;
    wrapper.style.cursor = 'grabbing';
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastX;
    lastX = e.clientX;
    velocity = deltaX * 0.00035;
    progress += velocity;
  });

  window.addEventListener('pointerup', () => {
    if (isDragging) {
      isDragging = false;
      wrapper.style.cursor = '';
    }
  });

  function rotateItemToFront(targetIndex) {
    const currentAngle = (targetIndex / total) * 2 * Math.PI + progress;
    // Front position is theta = Math.PI / 2
    const targetTheta = Math.PI / 2;
    let diff = (targetTheta - currentAngle) % (2 * Math.PI);
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;
    
    velocity = diff * 0.08;
  }

  function renderOrbit() {
    const rect = wrapper.getBoundingClientRect();
    const w = rect.width || 1000;
    const h = rect.height || 460;

    const cx = w / 2;
    const cy = h / 2;
    const isMobile = w < 768;
    const isSmallMobile = w < 480;
    const itemSize = isSmallMobile ? 48 : (isMobile ? 58 : 76);
    // Scale radii with container
    const rx = Math.min(cx * (isSmallMobile ? 0.76 : (isMobile ? 0.82 : 0.88)), 440);
    const ry = Math.min(cy * (isMobile ? 0.54 : 0.62), 135);

    if (!isDragging) {
      // Natural orbit speed + velocity decay
      const normalSpeed = 0.00045;
      const effectiveSpeed = isHovered ? normalSpeed * 0.25 : normalSpeed;
      progress += effectiveSpeed + velocity;
      velocity *= 0.92; // smooth inertia friction
    }

    items.forEach((item, i) => {
      // theta along the ellipse
      const theta = (i / total) * 2 * Math.PI + progress;
      const unrotatedX = rx * Math.cos(theta);
      const unrotatedY = ry * Math.sin(theta);

      // Rotate with tilt
      const x = unrotatedX * cosTilt - unrotatedY * sinTilt;
      const y = unrotatedX * sinTilt + unrotatedY * cosTilt;

      // Depth perception: depth is sine of theta
      const depth = Math.sin(theta); // -1 (far back) to +1 (closest front)
      const depthNorm = (depth + 1) / 2; // 0 to 1

      const scale = 0.74 + 0.36 * depthNorm; // 0.74 back, 1.10 front
      const opacity = 0.40 + 0.60 * depthNorm; // dimmed in back, crisp in front

      // Passing behind/in front of center core (core z-index is 25)
      const zIndex = depth < -0.05 ? 10 : 35;

      const posX = cx + x - (itemSize / 2);
      const posY = cy + y - (itemSize / 2);

      item.style.transform = `translate3d(${posX.toFixed(1)}px, ${posY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
      item.style.opacity = opacity.toFixed(2);
      item.style.zIndex = zIndex;
    });

    animationFrameId = requestAnimationFrame(renderOrbit);
  }

  // Trigger render loop
  renderOrbit();
}

/* ==========================================================================
   11. REACT BITS: SWARM CURSOR (800 PARTICLES, WEBGL2 FLUID SIMULATION)
   ========================================================================== */
function initSwarmCursor() {
  const container = document.getElementById('swarm-cursor');
  const canvas = document.getElementById('swarm-cursor-canvas');
  if (!container || !canvas) return;

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false
  });
  if (!gl) {
    console.warn('WebGL2 not supported for SwarmCursor');
    return;
  }

  const MAX_PARTICLES = 2000;
  const INTRO_SECONDS = 1.4;
  const HIDDEN = 'swarm-cursor-hidden';
  const SHAPES = { dot: 0, square: 1, streak: 2 };
  const CELL = 16;
  const MAX_COLS = 72;
  const MAX_ROWS = 48;
  const PRESSURE_STEPS = 12;

  const VERTEX = `#version 300 es
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec4 aAgent;
layout(location = 2) in vec4 aLook;
layout(location = 3) in vec2 aExtra;
uniform vec2 uView;
out vec2 vLocal;
out vec2 vHalf;
out float vAlpha;
out float vTint;
out float vSoft;
out float vShape;

void main() {
  vec2 dir = aAgent.zw;
  vec2 side = vec2(-dir.y, dir.x);
  vec2 extent = aLook.xy * 0.5;
  vec2 pad = extent + 1.0 + aExtra.x * 1.5;
  vec2 local = aCorner * pad;
  vec2 center = aAgent.xy - dir * (extent.x - extent.y);
  vec2 pos = center + dir * local.x + side * local.y;
  vLocal = local;
  vHalf = extent;
  vAlpha = aLook.z;
  vTint = aLook.w;
  vSoft = aExtra.x;
  vShape = aExtra.y;
  vec2 clip = pos / uView * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;

  const FRAGMENT = `#version 300 es
precision highp float;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uRatio;
in vec2 vLocal;
in vec2 vHalf;
in float vAlpha;
in float vTint;
in float vSoft;
in float vShape;
out vec4 outColor;

void main() {
  float d;
  if (vShape > 0.5 && vShape < 1.5) {
    float corner = vHalf.y * 0.3;
    vec2 q = abs(vLocal) - vHalf + corner;
    d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - corner;
  } else {
    vec2 q = vLocal;
    q.x = max(abs(q.x) - (vHalf.x - vHalf.y), 0.0);
    d = length(q) - vHalf.y;
  }
  float edge = 0.6 / uRatio + vSoft;
  float cover = 1.0 - smoothstep(-edge, edge, d);
  float stretch = clamp(1.0 - vHalf.y / max(vHalf.x, 0.001), 0.0, 1.0);
  float head = clamp((vLocal.x + vHalf.x) / max(2.0 * vHalf.x, 0.001), 0.0, 1.0);
  cover *= mix(1.0, 0.12 + 0.88 * head * head, stretch);
  float alpha = cover * vAlpha;
  outColor = vec4(mix(uColor, uAccent, vTint) * alpha, alpha);
}`;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const compile = (gl, type, source) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    gl.deleteShader(shader);
    return null;
  };

  const link = gl => {
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return null;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return null;
    }
    const uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }
    return { program, uniforms };
  };

  const random = seed => {
    let state = seed >>> 0 || 1;
    return () => {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    };
  };

  const rectField = (x, y, hx, hy, r, out) => {
    const sx = x < 0 ? -1 : 1;
    const sy = y < 0 ? -1 : 1;
    const qx = Math.abs(x) - (hx - r);
    const qy = Math.abs(y) - (hy - r);
    if (qx > 0 && qy > 0) {
      const l = Math.hypot(qx, qy) || 1;
      out[0] = l - r;
      out[1] = (qx / l) * sx;
      out[2] = (qy / l) * sy;
    } else if (qx > qy) {
      out[0] = qx - r;
      out[1] = sx;
      out[2] = 0;
    } else {
      out[0] = qy - r;
      out[1] = 0;
      out[2] = sy;
    }
    return out;
  };

  const settings = {
    count: 800,
    size: 2.6,
    shape: 0,
    color: '#ffffff',
    accentColor: '#d4af37',
    spread: 90,
    speed: 1,
    swirl: 0.6,
    tail: 0.5,
    trail: 0.6,
    wander: 0.5,
    depth: 0.7,
    targets: 'a, button, [data-swarm-target], .cursor-target, .brand-badge, .nav-item, .filter-btn, .action-btn, .order-btn, .spec-tag, .orbit-item, .spiral-card',
    idle: 'roam',
    clickEffect: 'burst',
    hideCursor: false,
    intro: true,
    enabled: true,
    lightMode: false,
    dpr: window.devicePixelRatio || 1
  };

  const shader = link(gl);
  if (!shader) return;
  const u = shader.uniforms;

  const slots = MAX_PARTICLES + 1;
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const cornerBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const agentData = new Float32Array(slots * 4);
  const lookData = new Float32Array(slots * 4);
  const extraData = new Float32Array(slots * 2);

  const instanced = (location, width, data) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, width, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(location, 1);
    return buffer;
  };

  const agentBuffer = instanced(1, 4, agentData);
  const lookBuffer = instanced(2, 4, lookData);
  const extraBuffer = instanced(3, 2, extraData);
  gl.bindVertexArray(null);

  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const colorCache = new Map();
  const parse = value => {
    const key = String(value);
    const cached = colorCache.get(key);
    if (cached) return cached;
    let rgb = [1, 1, 1];
    if (probe) {
      probe.clearRect(0, 0, 1, 1);
      probe.fillStyle = '#000000';
      probe.fillStyle = key;
      probe.fillRect(0, 0, 1, 1);
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
      rgb = [r / 255, g / 255, b / 255];
    }
    colorCache.set(key, rgb);
    return rgb;
  };

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const view = { width: 1, height: 1, ratio: 1 };
  const px = new Float32Array(MAX_PARTICLES);
  const py = new Float32Array(MAX_PARTICLES);
  const pz = new Float32Array(MAX_PARTICLES);
  const vx = new Float32Array(MAX_PARTICLES);
  const vy = new Float32Array(MAX_PARTICLES);
  const vz = new Float32Array(MAX_PARTICLES);
  const home = new Float32Array(MAX_PARTICLES);
  const heft = new Float32Array(MAX_PARTICLES);
  const bob = new Float32Array(MAX_PARTICLES);
  const bobRate = new Float32Array(MAX_PARTICLES);
  const grain = new Float32Array(MAX_PARTICLES);
  const glint = new Float32Array(MAX_PARTICLES);
  const order = new Int32Array(MAX_PARTICLES);
  const field = [0, 0, 0];
  let cols = 1;
  let rows = 1;
  let cell = CELL;
  let flowX = new Float32Array(1);
  let flowY = new Float32Array(1);
  let lastX = new Float32Array(1);
  let lastY = new Float32Array(1);
  let pressure = new Float32Array(1);
  let divergence = new Float32Array(1);
  let curl = new Float32Array(1);
  const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, inside: false };
  const anchor = { x: window.innerWidth / 2, y: window.innerHeight / 2, lastX: 0, lastY: 0, moveX: 0, moveY: 0 };
  const ring = { active: false, x: 0, y: 0, hx: 0, hy: 0, corner: 0, spin: 1 };
  const burst = { age: 10 };
  const ping = { age: 10, x: 0, y: 0 };
  let hovered = null;
  let time = 0;
  let presence = 1;
  let introClock = settings.intro && !reduce ? 0 : 1;
  let raf = 0;
  let last = 0;
  let visible = true;
  let seeded = false;
  let hidden = false;
  let sorted = 0;

  const setHidden = value => {
    if (value === hidden) return;
    hidden = value;
    container.classList.toggle(HIDDEN, value);
  };

  const allocate = () => {
    const nextCols = clamp(Math.round(view.width / CELL), 8, MAX_COLS);
    const nextRows = clamp(Math.round(view.height / CELL), 8, MAX_ROWS);
    cell = Math.max(view.width / nextCols, view.height / nextRows);
    if (nextCols === cols && nextRows === rows) return;
    cols = nextCols;
    rows = nextRows;
    const total = cols * rows;
    flowX = new Float32Array(total);
    flowY = new Float32Array(total);
    lastX = new Float32Array(total);
    lastY = new Float32Array(total);
    pressure = new Float32Array(total);
    divergence = new Float32Array(total);
    curl = new Float32Array(total);
  };

  const sample = (values, x, y) => {
    let gx = x / cell - 0.5;
    let gy = y / cell - 0.5;
    if (gx < 0) gx = 0;
    else if (gx > cols - 1.001) gx = cols - 1.001;
    if (gy < 0) gy = 0;
    else if (gy > rows - 1.001) gy = rows - 1.001;
    const i = gx | 0;
    const j = gy | 0;
    const fx = gx - i;
    const fy = gy - j;
    const k = i + j * cols;
    return (
      (values[k] * (1 - fx) + values[k + 1] * fx) * (1 - fy) +
      (values[k + cols] * (1 - fx) + values[k + cols + 1] * fx) * fy
    );
  };

  const walls = (values, axis) => {
    for (let j = 1; j < rows - 1; j++) {
      const left = j * cols;
      const right = left + cols - 1;
      values[left] = axis === 1 ? -values[left + 1] : values[left + 1];
      values[right] = axis === 1 ? -values[right - 1] : values[right - 1];
    }
    for (let i = 1; i < cols - 1; i++) {
      const bottom = i + (rows - 1) * cols;
      values[i] = axis === 2 ? -values[i + cols] : values[i + cols];
      values[bottom] = axis === 2 ? -values[bottom - cols] : values[bottom - cols];
    }
    values[0] = 0.5 * (values[1] + values[cols]);
    values[cols - 1] = 0.5 * (values[cols - 2] + values[2 * cols - 1]);
    values[(rows - 1) * cols] = 0.5 * (values[(rows - 2) * cols] + values[(rows - 1) * cols + 1]);
    values[rows * cols - 1] = 0.5 * (values[rows * cols - 2] + values[(rows - 1) * cols - 1]);
  };

  const stir = (s, dt, ease) => {
    const radius = s.spread;
    const reach = radius * 2.2;
    const i0 = Math.max(1, Math.floor((anchor.x - reach) / cell));
    const i1 = Math.min(cols - 2, Math.ceil((anchor.x + reach) / cell));
    const j0 = Math.max(1, Math.floor((anchor.y - reach) / cell));
    const j1 = Math.min(rows - 2, Math.ceil((anchor.y + reach) / cell));
    const inv = 1 / (radius * radius * 0.55);
    const moving = Math.hypot(anchor.moveX, anchor.moveY);
    const grab = (1 - Math.exp(-dt * 20)) * clamp(moving / 240, 0, 1) * presence;
    const whirl = ring.active ? 0 : radius * (0.5 + 4 * (1 - ease)) * (0.35 + 0.65 * s.speed);
    const churn = s.wander * radius * 14 * (0.4 + 0.6 * s.speed);
    const fk = 1.4 / radius;
    const ft = time * 0.75 * (0.4 + 0.6 * s.speed);
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const k = i + j * cols;
        const x = (i + 0.5) * cell;
        const y = (j + 0.5) * cell;
        const rx = x - anchor.x;
        const ry = y - anchor.y;
        const d2 = rx * rx + ry * ry;
        const w = Math.exp(-d2 * inv);
        if (w < 0.003) continue;
        const d = Math.sqrt(d2) + 0.001;
        flowX[k] += (anchor.moveX - flowX[k]) * w * grab;
        flowY[k] += (anchor.moveY - flowY[k]) * w * grab;
        const reachOut = Math.min(1, d / (radius * 0.45));
        flowX[k] += (-ry / d) * whirl * reachOut * w * dt;
        flowY[k] += (rx / d) * whirl * reachOut * w * dt;
        const a1 = x * fk + ft;
        const b1 = y * fk * 1.1 - ft * 0.8;
        const a2 = y * fk * 1.7 + ft * 1.2 + 1.3;
        const b2 = x * fk * 1.3 - 0.7;
        const curlX = -Math.sin(a1) * Math.sin(b1) * 1.1 + 1.02 * Math.cos(a2) * Math.cos(b2);
        const curlY = -(Math.cos(a1) * Math.cos(b1) - 0.78 * Math.sin(a2) * Math.sin(b2));
        flowX[k] += curlX * churn * w * dt;
        flowY[k] += curlY * churn * w * dt;
      }
    }
    if (!ring.active) return;
    const band = Math.max(4, radius * 0.16);
    const margin = band + 24;
    const circulate = 230 * (0.4 + 0.6 * s.speed) * ring.spin;
    const r0 = Math.max(1, Math.floor((ring.x - ring.hx - margin) / cell));
    const r1 = Math.min(cols - 2, Math.ceil((ring.x + ring.hx + margin) / cell));
    const c0 = Math.max(1, Math.floor((ring.y - ring.hy - margin) / cell));
    const c1 = Math.min(rows - 2, Math.ceil((ring.y + ring.hy + margin) / cell));
    const rate = 1 - Math.exp(-dt * 6);
    for (let j = c0; j <= c1; j++) {
      for (let i = r0; i <= r1; i++) {
        const k = i + j * cols;
        rectField((i + 0.5) * cell - ring.x, (j + 0.5) * cell - ring.y, ring.hx, ring.hy, ring.corner, field);
        const off = field[0] - (5 + band * 0.5);
        const w = Math.exp(-(off * off) / (margin * margin * 0.35));
        if (w < 0.01) continue;
        flowX[k] += (-field[2] * circulate - flowX[k]) * w * rate;
        flowY[k] += (field[1] * circulate - flowY[k]) * w * rate;
      }
    }
  };

  const flow = (s, dt) => {
    const total = cols * rows;
    for (let j = 1; j < rows - 1; j++) {
      for (let i = 1; i < cols - 1; i++) {
        const k = i + j * cols;
        curl[k] = (flowY[k + 1] - flowY[k - 1] - flowX[k + cols] + flowX[k - cols]) * (0.5 / cell);
      }
    }
    const confine = s.swirl * cell * 9;
    for (let j = 2; j < rows - 2; j++) {
      for (let i = 2; i < cols - 2; i++) {
        const k = i + j * cols;
        const gx = Math.abs(curl[k + 1]) - Math.abs(curl[k - 1]);
        const gy = Math.abs(curl[k + cols]) - Math.abs(curl[k - cols]);
        const len = Math.hypot(gx, gy) + 1e-5;
        flowX[k] += (gy / len) * curl[k] * confine * dt;
        flowY[k] -= (gx / len) * curl[k] * confine * dt;
      }
    }
    lastX.set(flowX);
    lastY.set(flowY);
    const back = dt / cell;
    const fade = Math.exp(-dt / (0.35 + 1.5 * s.swirl));
    for (let j = 1; j < rows - 1; j++) {
      for (let i = 1; i < cols - 1; i++) {
        const k = i + j * cols;
        let x = i - back * lastX[k];
        let y = j - back * lastY[k];
        if (x < 0.5) x = 0.5;
        else if (x > cols - 1.5) x = cols - 1.5;
        if (y < 0.5) y = 0.5;
        else if (y > rows - 1.5) y = rows - 1.5;
        const i0 = x | 0;
        const j0 = y | 0;
        const fx = x - i0;
        const fy = y - j0;
        const a = i0 + j0 * cols;
        flowX[k] =
          ((lastX[a] * (1 - fx) + lastX[a + 1] * fx) * (1 - fy) +
            (lastX[a + cols] * (1 - fx) + lastX[a + cols + 1] * fx) * fy) *
          fade;
        flowY[k] =
          ((lastY[a] * (1 - fx) + lastY[a + 1] * fx) * (1 - fy) +
            (lastY[a + cols] * (1 - fx) + lastY[a + cols + 1] * fx) * fy) *
          fade;
      }
    }
    walls(flowX, 1);
    walls(flowY, 2);
    const h2 = cell * cell;
    for (let j = 1; j < rows - 1; j++) {
      for (let i = 1; i < cols - 1; i++) {
        const k = i + j * cols;
        divergence[k] = (flowX[k + 1] - flowX[k - 1] + flowY[k + cols] - flowY[k - cols]) * (0.5 / cell);
      }
    }
    pressure.fill(0, 0, total);
    walls(divergence, 0);
    for (let step = 0; step < PRESSURE_STEPS; step++) {
      for (let j = 1; j < rows - 1; j++) {
        for (let i = 1; i < cols - 1; i++) {
          const k = i + j * cols;
          pressure[k] =
            (pressure[k - 1] + pressure[k + 1] + pressure[k - cols] + pressure[k + cols] - h2 * divergence[k]) * 0.25;
        }
      }
      walls(pressure, 0);
    }
    for (let j = 1; j < rows - 1; j++) {
      for (let i = 1; i < cols - 1; i++) {
        const k = i + j * cols;
        flowX[k] -= (pressure[k + 1] - pressure[k - 1]) * (0.5 / cell);
        flowY[k] -= (pressure[k + cols] - pressure[k - cols]) * (0.5 / cell);
      }
    }
    walls(flowX, 1);
    walls(flowY, 2);
  };

  const crowd = new Int32Array(MAX_PARTICLES);
  let crowdHeads = new Int32Array(1);
  let crowdRows = 1;
  const push = (n, h) => {
    const gc = Math.max(1, Math.ceil(view.width / h) + 2);
    const gr = Math.max(1, Math.ceil(view.height / h) + 2);
    if (crowdHeads.length < gc * gr) crowdHeads = new Int32Array(gc * gr);
    crowdHeads.fill(-1, 0, gc * gr);
    crowdRows = gr;
    for (let i = 0; i < n; i++) {
      const cx = clamp(Math.floor(px[i] / h) + 1, 0, gc - 1);
      const cy = clamp(Math.floor(py[i] / h) + 1, 0, gr - 1);
      const key = cy * gc + cx;
      crowd[i] = crowdHeads[key];
      crowdHeads[key] = i;
    }
    return gc;
  };

  const move = (s, dt, ease) => {
    const n = s.count;
    const radius = s.spread;
    const loose = 1 - 0.6 * s.tail;
    const gather = 12 * loose * (0.2 + 0.8 * ease);
    const pull = 30 * loose * (0.2 + 0.8 * ease);
    const band = Math.max(4, radius * 0.16);
    const w = view.width;
    const h = view.height;
    const gap = radius * Math.sqrt(Math.PI / Math.max(n, 1)) * 1.6;
    const repel = 4000;
    const gc = push(n, gap);
    for (let i = 0; i < n; i++) {
      const x = px[i];
      const y = py[i];
      const k = 10 * (1 - 0.6 * s.tail * heft[i]);
      let ax = (sample(flowX, x, y) - vx[i]) * k;
      let ay = (sample(flowY, x, y) - vy[i]) * k;
      const cx = clamp(Math.floor(x / gap) + 1, 0, gc - 1);
      const cy = clamp(Math.floor(y / gap) + 1, 0, crowdRows - 1);
      for (let oy = -1; oy <= 1; oy++) {
        const row = cy + oy;
        if (row < 0 || row >= crowdRows) continue;
        for (let ox = -1; ox <= 1; ox++) {
          const col = cx + ox;
          if (col < 0 || col >= gc) continue;
          for (let j = crowdHeads[row * gc + col]; j !== -1; j = crowd[j]) {
            if (j === i) continue;
            const dx = x - px[j];
            const dy = y - py[j];
            const d2 = dx * dx + dy * dy;
            if (d2 >= gap * gap || d2 < 1e-6) continue;
            const d = Math.sqrt(d2);
            const q = 1 - d / gap;
            ax += (dx / d) * q * q * repel;
            ay += (dy / d) * q * q * repel;
          }
        }
      }
      if (ring.active) {
        rectField(x - ring.x, y - ring.y, ring.hx, ring.hy, ring.corner, field);
        const e = field[0] - (5 + band * home[i] * home[i]);
        const hold = e > 0 ? 70 : 140;
        ax -= field[1] * e * hold;
        ay -= field[2] * e * hold;
      } else {
        const dx = anchor.x - x;
        const dy = anchor.y - y;
        const d = Math.hypot(dx, dy) + 0.001;
        const over = Math.max(0, d - radius);
        ax += (dx / d) * (d * gather + over * pull);
        ay += (dy / d) * (d * gather + over * pull);
      }
      if (introClock >= 1) {
        if (x < 8) ax += (8 - x) * 30;
        else if (x > w - 8) ax -= (x - w + 8) * 30;
        if (y < 8) ay += (8 - y) * 30;
        else if (y > h - 8) ay -= (y - h + 8) * 30;
      }
      const lift = Math.sin(time * bobRate[i] + bob[i]) * radius * (ring.active ? 0.15 : 0.55);
      const az = (lift - pz[i]) * 36 - vz[i] * 9;
      vx[i] += ax * dt;
      vy[i] += ay * dt;
      vz[i] += az * dt;
      px[i] += vx[i] * dt;
      py[i] += vy[i] * dt;
      pz[i] += vz[i] * dt;
    }
  };

  const seed = () => {
    const rand = random(7);
    for (let i = 0; i < MAX_PARTICLES; i++) {
      home[i] = 0.08 + 0.92 * Math.sqrt(rand());
      heft[i] = rand() * rand();
      bob[i] = rand() * Math.PI * 2;
      bobRate[i] = 0.5 + rand() * 1.1;
      grain[i] = 0.55 + rand() * 0.9;
      glint[i] = rand() * 100;
    }
    seeded = true;
  };

  const place = gathered => {
    const s = settings;
    const rand = random(11);
    const reachOut = Math.hypot(view.width, view.height) * 0.5;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const a = rand() * Math.PI * 2;
      const r = gathered ? home[i] * s.spread : (0.35 + 0.65 * Math.sqrt(rand())) * reachOut;
      px[i] = anchor.x + Math.cos(a) * r;
      py[i] = anchor.y + Math.sin(a) * r;
      pz[i] = Math.sin(bob[i]) * s.spread * 0.55;
      vx[i] = 0;
      vy[i] = 0;
      vz[i] = 0;
    }
  };

  const findTarget = () => {
    if (!settings.targets || !pointer.inside) return null;
    const element = document.elementFromPoint(pointer.x, pointer.y);
    if (!element) return null;
    let match = null;
    try {
      match = element.closest(settings.targets);
    } catch {
      match = null;
    }
    return match;
  };

  const updateAnchor = (s, dt) => {
    const w = view.width;
    const h = view.height;
    if (hovered && hovered.isConnected) {
      const box = hovered.getBoundingClientRect();
      const radius = parseFloat(getComputedStyle(hovered).borderTopLeftRadius) || 0;
      ring.x = box.left + box.width / 2;
      ring.y = box.top + box.height / 2;
      ring.hx = box.width / 2;
      ring.hy = box.height / 2;
      ring.corner = Math.min(radius, ring.hx, ring.hy);
      if (!ring.active) {
        let turning = 0;
        for (let i = 0; i < s.count; i++) turning += (px[i] - ring.x) * vy[i] - (py[i] - ring.y) * vx[i];
        ring.spin = turning < 0 ? -1 : 1;
      }
      ring.active = true;
    } else {
      ring.active = false;
    }
    let goal = 1;
    if (pointer.inside) {
      anchor.x = pointer.x;
      anchor.y = pointer.y;
    } else if (s.idle === 'gather') {
      anchor.x = w * 0.5;
      anchor.y = h * 0.5;
    } else if (s.idle === 'hide') {
      goal = 0;
    } else {
      anchor.x = w * (0.5 + 0.3 * Math.sin(time * 0.21) + 0.06 * Math.sin(time * 0.53 + 1.7));
      anchor.y = h * (0.5 + 0.24 * Math.sin(time * 0.29 + 0.8) + 0.05 * Math.sin(time * 0.71));
    }
    if (dt > 0) {
      const moveX = clamp((anchor.x - anchor.lastX) / dt, -4000, 4000);
      const moveY = clamp((anchor.y - anchor.lastY) / dt, -4000, 4000);
      const blend = 1 - Math.exp(-dt * 30);
      anchor.moveX += (moveX - anchor.moveX) * blend;
      anchor.moveY += (moveY - anchor.moveY) * blend;
    }
    anchor.lastX = anchor.x;
    anchor.lastY = anchor.y;
    presence += (goal - presence) * (1 - Math.exp(-dt / 0.25));
  };

  const draw = () => {
    const s = settings;
    const n = s.count;
    const fade = introClock * introClock * (3 - 2 * introClock) * presence;
    const zr = Math.max(s.spread * 0.55, 10);
    if (sorted !== n) {
      for (let a = 0; a < n; a++) order[a] = a;
      sorted = n;
    }
    for (let a = 1; a < n; a++) {
      const value = order[a];
      const key = pz[value];
      let b = a - 1;
      while (b >= 0 && pz[order[b]] > key) {
        order[b + 1] = order[b];
        b--;
      }
      order[b + 1] = value;
    }
    const flash = burst.age < 1.2 ? Math.exp(-burst.age / 0.3) : 0;
    const front = ping.age * 520;
    let written = 0;
    for (let a = 0; a < n; a++) {
      const i = order[a];
      const near = clamp(pz[i] / zr, -1, 1);
      const scale = 1 + s.depth * 0.6 * near;
      const body = s.size * grain[i] * scale;
      const soft = s.depth * s.size * (s.lightMode ? 0.35 : 1.4) * Math.pow(Math.abs(near), 1.6);
      const flat = Math.hypot(vx[i], vy[i]);
      const dx = flat > 0.001 ? vx[i] / flat : 1;
      const dy = flat > 0.001 ? vy[i] / flat : 0;
      let wave = 0;
      if (ping.age < 1.6) {
        const offset = (Math.hypot(px[i] - ping.x, py[i] - ping.y) - front) / 40;
        wave = Math.exp(-offset * offset) * (1 - ping.age / 1.6);
      }
      const tint = Math.max(clamp((flat - 380) / 900, 0, 1), flash, wave);
      const width = body * (1 + wave * 0.8);
      let length = width + Math.min(flat * s.trail * 0.02, body * 14);
      if (s.shape === 2) length = width * 2.6 + Math.min(flat * s.trail * 0.03, body * 18);
      const twinkle = 0.86 + 0.14 * Math.sin(time * 3.1 + glint[i]);
      const dim = 1 - s.depth * 0.45 * Math.max(0, -near);
      const o = written * 4;
      agentData[o] = px[i];
      agentData[o + 1] = py[i];
      agentData[o + 2] = dx;
      agentData[o + 3] = dy;
      lookData[o] = length;
      lookData[o + 1] = width;
      lookData[o + 2] = clamp(0.95 * dim * (body / (body + soft)) * twinkle * (1 + wave * 0.4), 0, 1) * fade;
      lookData[o + 3] = tint;
      extraData[written * 2] = soft;
      extraData[written * 2 + 1] = s.shape;
      written++;
    }
    if (s.hideCursor && pointer.inside) {
      const o = written * 4;
      agentData[o] = pointer.x;
      agentData[o + 1] = pointer.y;
      agentData[o + 2] = 1;
      agentData[o + 3] = 0;
      lookData[o] = 6;
      lookData[o + 1] = 6;
      lookData[o + 2] = 1;
      lookData[o + 3] = 0;
      extraData[written * 2] = 0;
      extraData[written * 2 + 1] = 0;
      written++;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!s.enabled || !written) return;
    gl.useProgram(shader.program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, agentBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, agentData, 0, written * 4);
    gl.bindBuffer(gl.ARRAY_BUFFER, lookBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, lookData, 0, written * 4);
    gl.bindBuffer(gl.ARRAY_BUFFER, extraBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, extraData, 0, written * 2);
    gl.uniform2f(u.uView, view.width, view.height);
    gl.uniform3fv(u.uColor, parse(s.color));
    gl.uniform3fv(u.uAccent, parse(s.accentColor));
    gl.uniform1f(u.uRatio, view.ratio);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, written);
    gl.bindVertexArray(null);
  };

  const resize = () => {
    const s = settings;
    view.width = Math.max(1, window.innerWidth);
    view.height = Math.max(1, window.innerHeight);
    view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(view.width * view.ratio));
    canvas.height = Math.max(1, Math.round(view.height * view.ratio));
    allocate();
    if (!seeded) {
      seed();
      updateAnchor(s, 0);
      if (reduce) {
        anchor.x = view.width / 2;
        anchor.y = view.height / 2;
      }
      anchor.lastX = anchor.x;
      anchor.lastY = anchor.y;
      place(introClock >= 1);
    }
    draw();
    wake();
  };

  const frame = now => {
    raf = 0;
    if (!visible || document.hidden) return;
    const s = settings;
    const dt = last ? clamp((now - last) / 1000, 0.001, 1 / 30) : 1 / 60;
    last = now;
    if (!s.enabled || reduce) {
      setHidden(false);
      draw();
      return;
    }
    time += dt;
    burst.age += dt;
    ping.age += dt;
    if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);
    const ease = introClock * introClock * (3 - 2 * introClock);
    hovered = findTarget();
    updateAnchor(s, dt);
    setHidden(s.hideCursor && pointer.inside);
    stir(s, dt, ease);
    flow(s, dt);
    move(s, dt / 2, ease);
    move(s, dt / 2, ease);
    draw();
    raf = requestAnimationFrame(frame);
  };

  function wake() {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }

  const locate = event => {
    const x = event.clientX;
    const y = event.clientY;
    return { x, y, inside: x >= 0 && y >= 0 && x <= window.innerWidth && y <= window.innerHeight };
  };

  const onPointerMove = event => {
    const { x, y, inside } = locate(event);
    pointer.x = x;
    pointer.y = y;
    pointer.inside = inside;
    wake();
  };

  const onPointerDown = event => {
    const s = settings;
    const { x, y, inside } = locate(event);
    if (!inside || !s.enabled || reduce || s.clickEffect === 'none') return;
    const reachOut = s.spread * 2.2;
    if (s.clickEffect === 'pulse') {
      ping.x = x;
      ping.y = y;
      ping.age = 0;
    } else {
      burst.age = 0;
    }
    const kick = s.clickEffect === 'pulse' ? 160 : 780;
    for (let i = 0; i < s.count; i++) {
      const dx = px[i] - x;
      const dy = py[i] - y;
      const d = Math.hypot(dx, dy) || 1;
      if (d > reachOut) continue;
      const k = (1 - d / reachOut) * kick * (0.6 + 0.4 * grain[i]);
      vx[i] += (dx / d) * k;
      vy[i] += (dy / d) * k;
    }
    if (s.clickEffect === 'pulse') return;
    const twist = 520 * (time % 2 < 1 ? 1 : -1);
    const inv = 1 / (s.spread * s.spread);
    for (let j = 1; j < rows - 1; j++) {
      for (let i = 1; i < cols - 1; i++) {
        const k = i + j * cols;
        const rx = (i + 0.5) * cell - x;
        const ry = (j + 0.5) * cell - y;
        const d2 = rx * rx + ry * ry;
        const w = (Math.sqrt(d2) / s.spread) * Math.exp(-d2 * inv);
        if (w < 0.003) continue;
        const d = Math.sqrt(d2) + 0.001;
        flowX[k] += (-ry / d) * twist * w;
        flowY[k] += (rx / d) * twist * w;
      }
    }
    wake();
  };

  const onPointerUp = event => {
    if (event.pointerType !== 'mouse') pointer.inside = false;
  };

  const onPointerLeave = () => {
    pointer.inside = false;
  };

  const onVisibility = () => {
    last = 0;
    wake();
  };

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { passive: true });
  window.addEventListener('pointercancel', onPointerUp, { passive: true });
  document.documentElement.addEventListener('pointerleave', onPointerLeave);
  document.addEventListener('visibilitychange', onVisibility);

  resize();
}

