import * as THREE from 'three';
import { CameraViewMode, FountainTheme } from '../types';

export class FountainScene {
  private container: HTMLDivElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private frameId: number = 0;
  private clock: THREE.Clock;
  private isSoftwareGl: boolean;

  // Particle systems
  private centerGeyserParticles!: THREE.Points;
  private centerGeyserGeometry!: THREE.BufferGeometry;
  private centerGeyserPositions!: Float32Array;
  private centerGeyserVelocities!: Float32Array;
  private centerGeyserLife!: Float32Array;
  private centerCount = 3000;

  // Dancing arch jets
  private archParticles!: THREE.Points;
  private archGeometry!: THREE.BufferGeometry;
  private archPositions!: Float32Array;
  private archVelocities!: Float32Array;
  private archLife!: Float32Array;
  private archCount = 4000;

  // Mist & Fog screen
  private mistParticles!: THREE.Points;
  private mistGeometry!: THREE.BufferGeometry;
  private mistPositions!: Float32Array;
  private mistCount = 2000;

  // Laser projection hologram on water curtain
  private laserPlane!: THREE.Mesh;
  private laserCanvas!: HTMLCanvasElement;
  private laserCtx!: CanvasRenderingContext2D;
  private laserTexture!: THREE.CanvasTexture;
  private laserBeamMeshGroup: THREE.Group = new THREE.Group();

  // Water surface plane
  private waterMesh!: THREE.Mesh;
  private waterMaterial!: THREE.MeshStandardMaterial;

  // Lights
  private keyLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private underwaterLights: THREE.PointLight[] = [];

  // Current animation state
  private targetHeight = 15; // in meters (5..100)
  private currentHeight = 15;
  private playerName: string = 'NGUYỄN VĂN AN';
  private currentTheme!: FountainTheme;
  private currentCameraMode: CameraViewMode = 'front_vip';
  private targetCameraPos = new THREE.Vector3(0, 16, 70);
  private targetCameraLookAt = new THREE.Vector3(0, 32, 0);
  private currentCameraLookAt = new THREE.Vector3(0, 32, 0);

  // Mouse interaction for orbit
  private isPointerDown = false;
  private pointerStartX = 0;
  private pointerStartY = 0;
  private orbitAngleY = 0;
  private orbitAngleX = 0.2;
  private orbitDistance = 75;

  constructor(container: HTMLDivElement, theme: FountainTheme, initialPlayerName: string) {
    this.container = container;
    this.currentTheme = theme;
    this.playerName = initialPlayerName || 'NGUYỄN VĂN AN';
    this.clock = new THREE.Clock();

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(new THREE.Color(this.currentTheme.fogColor), 0.007);

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.5, 600);
    this.camera.position.set(0, 16, 70);

    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 4. Build 3D World
    this.setupLighting();
    this.setupBackdropAndBasin();
    this.setupWaterSurface();
    this.setupWaterParticles();
    this.setupLaserProjection();
    this.setupShoreLaserTowers();
    this.bindEvents();

    // Set initial camera view
    this.setCameraMode('front_vip');

    // Start render loop
    this.animate();
  }

  // Atmospheric Lighting
  private setupLighting() {
    this.hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x0f172a, 0.9);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(new THREE.Color(this.currentTheme.primaryColor), 2.2);
    this.keyLight.position.set(25, 45, 30);
    this.keyLight.castShadow = !this.isSoftwareGl;
    if (this.keyLight.shadow) {
      this.keyLight.shadow.mapSize.width = 1024;
      this.keyLight.shadow.mapSize.height = 1024;
      this.keyLight.shadow.camera.near = 0.5;
      this.keyLight.shadow.camera.far = 150;
      const d = 50;
      this.keyLight.shadow.camera.left = -d;
      this.keyLight.shadow.camera.right = d;
      this.keyLight.shadow.camera.top = d;
      this.keyLight.shadow.camera.bottom = -d;
      this.keyLight.shadow.bias = -0.0005;
    }
    this.scene.add(this.keyLight);

    // Concentric underwater RGB floodlights
    const lightAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    lightAngles.forEach((ang) => {
      const radius = 18;
      const pl = new THREE.PointLight(new THREE.Color(this.currentTheme.secondaryColor), 3.5, 45);
      pl.position.set(Math.cos(ang) * radius, 0.8, Math.sin(ang) * radius);
      this.scene.add(pl);
      this.underwaterLights.push(pl);
    });

    // Center geyser underglow light
    const centerLight = new THREE.PointLight(new THREE.Color(this.currentTheme.primaryColor), 6.0, 70);
    centerLight.position.set(0, 1.5, 0);
    this.scene.add(centerLight);
    this.underwaterLights.push(centerLight);
  }

  // Lagoon Basin & Night Scenery
  private setupBackdropAndBasin() {
    // 1. Procedural circular stone rim & amphitheater basin
    const basinGroup = new THREE.Group();

    // Outer stone wall
    const outerRingGeo = new THREE.CylinderGeometry(42, 44, 2.8, 64, 1, true);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.15,
    });
    const outerWall = new THREE.Mesh(outerRingGeo, stoneMat);
    outerWall.position.y = 1.0;
    basinGroup.add(outerWall);

    // Decorative luminous LED ring along the stone rim
    const rimLedGeo = new THREE.TorusGeometry(43.2, 0.45, 16, 64);
    const rimLedMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.currentTheme.primaryColor),
    });
    const rimLed = new THREE.Mesh(rimLedGeo, rimLedMat);
    rimLed.rotation.x = Math.PI / 2;
    rimLed.position.y = 2.45;
    basinGroup.add(rimLed);

    // Inner underwater nozzle rings
    const nozzleMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.3,
      metalness: 0.85,
    });

    // Center mega-nozzle manifold
    const centerNozzleGeo = new THREE.CylinderGeometry(2.5, 3.2, 1.8, 32);
    const centerNozzle = new THREE.Mesh(centerNozzleGeo, nozzleMat);
    centerNozzle.position.y = 0.9;
    basinGroup.add(centerNozzle);

    // Ring 1 & Ring 2 nozzle jets
    const ringRadii = [8, 16, 26, 36];
    ringRadii.forEach((r, idx) => {
      const count = 12 * (idx + 1);
      const jetGeo = new THREE.CylinderGeometry(0.2, 0.35, 0.8, 8);
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2;
        const jet = new THREE.Mesh(jetGeo, nozzleMat);
        jet.position.set(Math.cos(theta) * r, 0.4, Math.sin(theta) * r);
        jet.rotation.z = Math.sin(theta) * 0.15;
        jet.rotation.x = Math.cos(theta) * 0.15;
        basinGroup.add(jet);
      }
    });

    this.scene.add(basinGroup);

    // 2. Distant Skyline Billboard / Panorama
    // Load generated high-fidelity asset
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/src/assets/images/fountain_backdrop_night_1793121571983.jpg',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const skyGeo = new THREE.CylinderGeometry(220, 220, 110, 48, 1, true, 0, Math.PI * 2);
        const skyMat = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide,
          fog: false,
        });
        const skyMesh = new THREE.Mesh(skyGeo, skyMat);
        skyMesh.position.y = 35;
        this.scene.add(skyMesh);
      },
      undefined,
      () => {
        // Fallback procedural starry night sky
        const starsGeo = new THREE.BufferGeometry();
        const starPos = [];
        for (let i = 0; i < 2000; i++) {
          const x = (Math.random() - 0.5) * 400;
          const y = 20 + Math.random() * 150;
          const z = (Math.random() - 0.5) * 400;
          starPos.push(x, y, z);
        }
        starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({ color: 0x93c5fd, size: 1.5 });
        this.scene.add(new THREE.Points(starsGeo, starMat));
      }
    );
  }

  // Water Surface with gentle ripples
  private setupWaterSurface() {
    const waterGeo = new THREE.CircleGeometry(42, 64);
    this.waterMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.currentTheme.waterColor),
      roughness: 0.1,
      metalness: 0.65,
      transparent: true,
      opacity: 0.92,
    });
    this.waterMesh = new THREE.Mesh(waterGeo, this.waterMaterial);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.y = 0.1;
    this.waterMesh.receiveShadow = !this.isSoftwareGl;
    this.scene.add(this.waterMesh);
  }

  // Create procedural soft droplet sprite texture
  private createDropletTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(180, 230, 255, 0.85)');
    grad.addColorStop(0.8, 'rgba(100, 200, 255, 0.3)');
    grad.addColorStop(1, 'rgba(0, 100, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // Setup multi-tiered water particle physics
  private setupWaterParticles() {
    const dropletTex = this.createDropletTexture();

    // 1. Center Super Geyser (Shoots vertically to max height)
    this.centerGeyserGeometry = new THREE.BufferGeometry();
    this.centerGeyserPositions = new Float32Array(this.centerCount * 3);
    this.centerGeyserVelocities = new Float32Array(this.centerCount * 3);
    this.centerGeyserLife = new Float32Array(this.centerCount);

    for (let i = 0; i < this.centerCount; i++) {
      this.resetCenterParticle(i, true);
    }

    this.centerGeyserGeometry.setAttribute('position', new THREE.BufferAttribute(this.centerGeyserPositions, 3));
    const centerMat = new THREE.PointsMaterial({
      size: 1.8,
      map: dropletTex,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: new THREE.Color(this.currentTheme.primaryColor),
    });
    this.centerGeyserParticles = new THREE.Points(this.centerGeyserGeometry, centerMat);
    this.scene.add(this.centerGeyserParticles);

    // 2. Dancing Arch & Fan Jets
    this.archGeometry = new THREE.BufferGeometry();
    this.archPositions = new Float32Array(this.archCount * 3);
    this.archVelocities = new Float32Array(this.archCount * 3);
    this.archLife = new Float32Array(this.archCount);

    for (let i = 0; i < this.archCount; i++) {
      this.resetArchParticle(i, true);
    }

    this.archGeometry.setAttribute('position', new THREE.BufferAttribute(this.archPositions, 3));
    const archMat = new THREE.PointsMaterial({
      size: 1.4,
      map: dropletTex,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: new THREE.Color(this.currentTheme.secondaryColor),
    });
    this.archParticles = new THREE.Points(this.archGeometry, archMat);
    this.scene.add(this.archParticles);

    // 3. Dense Illuminated Mist & Fog Curtain (Where the laser hits!)
    this.mistGeometry = new THREE.BufferGeometry();
    this.mistPositions = new Float32Array(this.mistCount * 3);
    for (let i = 0; i < this.mistCount; i++) {
      this.mistPositions[i * 3 + 0] = (Math.random() - 0.5) * 24;
      this.mistPositions[i * 3 + 1] = 6 + Math.random() * 45;
      this.mistPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    this.mistGeometry.setAttribute('position', new THREE.BufferAttribute(this.mistPositions, 3));
    const mistMat = new THREE.PointsMaterial({
      size: 4.5,
      map: dropletTex,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: new THREE.Color(this.currentTheme.laserColor),
    });
    this.mistParticles = new THREE.Points(this.mistGeometry, mistMat);
    this.scene.add(this.mistParticles);
  }

  private resetCenterParticle(i: number, randomizeY = false) {
    const spread = 2.4;
    this.centerGeyserPositions[i * 3 + 0] = (Math.random() - 0.5) * spread;
    this.centerGeyserPositions[i * 3 + 2] = (Math.random() - 0.5) * spread;

    // Upward launch velocity determined by current fountain height
    // V = sqrt(2 * g * h)
    const baseSpeed = Math.sqrt(2 * 19.6 * Math.max(8, this.currentHeight));
    const speedVariation = baseSpeed * (0.85 + Math.random() * 0.3);

    this.centerGeyserVelocities[i * 3 + 0] = (Math.random() - 0.5) * 1.5;
    this.centerGeyserVelocities[i * 3 + 1] = speedVariation;
    this.centerGeyserVelocities[i * 3 + 2] = (Math.random() - 0.5) * 1.5;

    if (randomizeY) {
      this.centerGeyserPositions[i * 3 + 1] = Math.random() * this.currentHeight * 0.9;
    } else {
      this.centerGeyserPositions[i * 3 + 1] = 1.0;
    }
    this.centerGeyserLife[i] = 1.0;
  }

  private resetArchParticle(i: number, randomize = false) {
    // 3 rings of arch nozzles
    const ring = i % 3;
    const ringRadius = ring === 0 ? 12 : ring === 1 ? 22 : 32;
    const nozzleIndex = Math.floor(i / 3) % 24;
    const theta = (nozzleIndex / 24) * Math.PI * 2;

    const originX = Math.cos(theta) * ringRadius;
    const originZ = Math.sin(theta) * ringRadius;

    this.archPositions[i * 3 + 0] = originX;
    this.archPositions[i * 3 + 2] = originZ;

    // Inward/outward velocity vector
    const inwardSpeed = (ringRadius * 0.45) * (0.8 + Math.random() * 0.4);
    const dir = ring % 2 === 0 ? -1 : 1; // alternating criss-cross arches
    const normalX = Math.cos(theta) * dir;
    const normalZ = Math.sin(theta) * dir;

    // Arch height scales with singing power
    const archH = Math.max(5, this.currentHeight * 0.45);
    const verticalSpeed = Math.sqrt(2 * 18 * archH);

    this.archVelocities[i * 3 + 0] = normalX * inwardSpeed + (Math.random() - 0.5) * 1.5;
    this.archVelocities[i * 3 + 1] = verticalSpeed * (0.8 + Math.random() * 0.35);
    this.archVelocities[i * 3 + 2] = normalZ * inwardSpeed + (Math.random() - 0.5) * 1.5;

    if (randomize) {
      this.archPositions[i * 3 + 1] = Math.random() * archH * 0.8;
    } else {
      this.archPositions[i * 3 + 1] = 0.5;
    }
    this.archLife[i] = 1.0;
  }

  // Laser projection hologram canvas mapped onto water curtain
  private setupLaserProjection() {
    this.laserCanvas = document.createElement('canvas');
    this.laserCanvas.width = 1024;
    this.laserCanvas.height = 512;
    this.laserCtx = this.laserCanvas.getContext('2d')!;

    this.updateLaserHologramCanvas();

    this.laserTexture = new THREE.CanvasTexture(this.laserCanvas);
    this.laserTexture.colorSpace = THREE.SRGBColorSpace;

    const planeGeo = new THREE.PlaneGeometry(36, 18);
    const planeMat = new THREE.MeshBasicMaterial({
      map: this.laserTexture,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.laserPlane = new THREE.Mesh(planeGeo, planeMat);
    this.laserPlane.position.set(0, 24, 0);
    this.scene.add(this.laserPlane);
  }

  // Redraw laser hologram text on water screen
  public updateLaserHologramCanvas() {
    const ctx = this.laserCtx;
    const w = this.laserCanvas.width;
    const h = this.laserCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Hologram frame & gridlines
    const laserColor = this.currentTheme.laserColor;
    ctx.strokeStyle = laserColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = laserColor;
    ctx.shadowBlur = 25;

    // Outer cybernetic targeting brackets
    const pad = 24;
    const len = 48;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(pad, pad + len);
    ctx.lineTo(pad, pad);
    ctx.lineTo(pad + len, pad);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(w - pad - len, pad);
    ctx.lineTo(w - pad, pad);
    ctx.lineTo(w - pad, pad + len);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(pad, h - pad - len);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(pad + len, h - pad);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(w - pad - len, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.lineTo(w - pad, h - pad - len);
    ctx.stroke();

    // Horizontal scanning laser lines
    const scanY = (Date.now() * 0.12) % h;
    const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
    scanGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    scanGrad.addColorStop(0.5, `${laserColor}88`);
    scanGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanY - 15, w, 30);

    // Decorative top kicker
    ctx.font = '700 24px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = laserColor;
    ctx.shadowBlur = 18;
    ctx.fillText('⚡ CHIẾU SÁNG LASER NHẠC NƯỚC ⚡', w / 2, 70);

    // Subtitle theme badge
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = this.currentTheme.primaryColor;
    ctx.fillText(`CHỦ ĐỀ: ${this.currentTheme.name.toUpperCase()}`, w / 2, 108);

    // Hero Player Name Projection (Giant & Vibrant!)
    ctx.font = '900 68px "Cinzel", "Plus Jakarta Sans", serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = laserColor;
    ctx.shadowBlur = 40;
    ctx.fillText(this.playerName.toUpperCase(), w / 2, 230);

    // Chromatic offset glow for laser hologram realism
    ctx.font = '900 68px "Cinzel", "Plus Jakarta Sans", serif';
    ctx.fillStyle = laserColor;
    ctx.shadowBlur = 20;
    ctx.fillText(this.playerName.toUpperCase(), w / 2 + 2, 230 + 1);

    // Current record height & decibel reading
    ctx.font = '700 32px "JetBrains Mono", monospace';
    ctx.fillStyle = '#fef08a'; // golden yellow
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 16;
    ctx.fillText(`CỘT NƯỚC: ${this.currentHeight.toFixed(1)}m | VANG DỘI: ${(35 + (this.currentHeight / 100) * 65).toFixed(0)} dB`, w / 2, 320);

    // Motivational slogan
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowColor = laserColor;
    ctx.shadowBlur = 12;
    ctx.fillText('HÁT CÀNG TO — NƯỚC CÀNG CAO — RINH VOUCHER THƯỢNG HẠNG', w / 2, 380);

    // Water droplet refraction sparkles
    for (let i = 0; i < 35; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : laserColor;
      ctx.fillRect(rx, ry, 2.5, 2.5);
    }

    if (this.laserTexture) {
      this.laserTexture.needsUpdate = true;
    }
  }

  // Shore laser projectors with sweeping collimated beams
  private setupShoreLaserTowers() {
    this.scene.add(this.laserBeamMeshGroup);
    const towerAngles = [-Math.PI / 4, - (3 * Math.PI) / 4, Math.PI / 4, (3 * Math.PI) / 4];
    const towerRadius = 45;

    const beamMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.currentTheme.laserColor),
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    towerAngles.forEach((ang) => {
      const tx = Math.cos(ang) * towerRadius;
      const tz = Math.sin(ang) * towerRadius;

      // Projector tripod tower
      const towerGroup = new THREE.Group();
      towerGroup.position.set(tx, 0, tz);

      const baseGeo = new THREE.CylinderGeometry(0.8, 1.4, 3.5, 8);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 1.75;
      towerGroup.add(base);

      // Rotating head
      const headGeo = new THREE.SphereGeometry(1.2, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.9 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 3.6;
      towerGroup.add(head);

      // Emitter lens
      const lensGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
      const lensMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(this.currentTheme.laserColor) });
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.position.set(0, 3.6, 1.0);
      lens.rotation.x = Math.PI / 2;
      towerGroup.add(lens);

      this.scene.add(towerGroup);

      // Laser beam cone geometry pointing to the center water wall
      const beamGeo = new THREE.CylinderGeometry(0.08, 1.8, 55, 12, 1, true);
      beamGeo.translate(0, 27.5, 0); // pivot at base
      beamGeo.rotateX(Math.PI / 2);

      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.position.set(tx, 3.6, tz);
      this.laserBeamMeshGroup.add(beamMesh);
    });
  }

  // Camera views
  public setCameraMode(mode: CameraViewMode) {
    this.currentCameraMode = mode;
    switch (mode) {
      case 'front_vip':
        this.targetCameraPos.set(0, 14, 68);
        this.targetCameraLookAt.set(0, 28, 0);
        break;
      case 'drone':
        this.targetCameraPos.set(45, 65, 75);
        this.targetCameraLookAt.set(0, 20, 0);
        break;
      case 'laser_focus':
        this.targetCameraPos.set(0, 22, 34);
        this.targetCameraLookAt.set(0, 24, 0);
        break;
      case 'top_down':
        this.targetCameraPos.set(0, 110, 5);
        this.targetCameraLookAt.set(0, 0, 0);
        break;
      case 'orbit':
        // Orbit mode keeps current distance
        break;
    }
  }

  // Update target height from microphone / singer
  public setVocalPower(heightMeters: number) {
    this.targetHeight = Math.max(6, Math.min(100, heightMeters));
  }

  public setPlayerName(name: string) {
    this.playerName = name.trim() || 'NGUYỄN VĂN AN';
    this.updateLaserHologramCanvas();
  }

  public setTheme(theme: FountainTheme) {
    this.currentTheme = theme;
    this.scene.fog = new THREE.FogExp2(new THREE.Color(this.currentTheme.fogColor), 0.007);
    this.keyLight.color.set(this.currentTheme.primaryColor);
    this.waterMaterial.color.set(this.currentTheme.waterColor);

    (this.centerGeyserParticles.material as THREE.PointsMaterial).color.set(this.currentTheme.primaryColor);
    (this.archParticles.material as THREE.PointsMaterial).color.set(this.currentTheme.secondaryColor);
    (this.mistParticles.material as THREE.PointsMaterial).color.set(this.currentTheme.laserColor);

    this.underwaterLights.forEach((pl, idx) => {
      pl.color.set(idx === this.underwaterLights.length - 1 ? this.currentTheme.primaryColor : this.currentTheme.secondaryColor);
    });

    this.laserBeamMeshGroup.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        (child.material as THREE.MeshBasicMaterial).color.set(this.currentTheme.laserColor);
      }
    });

    this.updateLaserHologramCanvas();
  }

  private bindEvents() {
    window.addEventListener('resize', this.onResize);
    this.container.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    this.container.addEventListener('wheel', this.onWheel, { passive: true });
  }

  private onResize = () => {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onPointerDown = (e: PointerEvent) => {
    this.isPointerDown = true;
    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown) return;
    const dx = e.clientX - this.pointerStartX;
    const dy = e.clientY - this.pointerStartY;
    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;

    if (this.currentCameraMode !== 'orbit') {
      this.currentCameraMode = 'orbit';
    }

    this.orbitAngleY -= dx * 0.006;
    this.orbitAngleX = Math.max(0.05, Math.min(Math.PI / 2 - 0.05, this.orbitAngleX + dy * 0.006));
  };

  private onPointerUp = () => {
    this.isPointerDown = false;
  };

  private onWheel = (e: WheelEvent) => {
    if (this.currentCameraMode !== 'orbit') {
      this.currentCameraMode = 'orbit';
    }
    this.orbitDistance = Math.max(25, Math.min(130, this.orbitDistance + e.deltaY * 0.05));
  };

  private animate = () => {
    this.frameId = requestAnimationFrame(this.animate);

    const dt = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // Smooth height dampening with momentum
    this.currentHeight = THREE.MathUtils.damp(this.currentHeight, this.targetHeight, 5.0, dt);

    // 1. Update Center Super Geyser Particles
    const gravity = -26.0;
    const cPos = this.centerGeyserPositions;
    const cVel = this.centerGeyserVelocities;

    for (let i = 0; i < this.centerCount; i++) {
      const idx = i * 3;
      cVel[idx + 1] += gravity * dt;
      cPos[idx + 0] += cVel[idx + 0] * dt;
      cPos[idx + 1] += cVel[idx + 1] * dt;
      cPos[idx + 2] += cVel[idx + 2] * dt;

      // Particle hit water surface or fell below basin
      if (cPos[idx + 1] < 0.2) {
        this.resetCenterParticle(i);
      }
    }
    this.centerGeyserGeometry.attributes.position.needsUpdate = true;

    // 2. Update Dancing Arch Jets
    const aPos = this.archPositions;
    const aVel = this.archVelocities;
    for (let i = 0; i < this.archCount; i++) {
      const idx = i * 3;
      aVel[idx + 1] += gravity * dt;
      aPos[idx + 0] += aVel[idx + 0] * dt;
      aPos[idx + 1] += aVel[idx + 1] * dt;
      aPos[idx + 2] += aVel[idx + 2] * dt;

      if (aPos[idx + 1] < 0.2) {
        this.resetArchParticle(i);
      }
    }
    this.archGeometry.attributes.position.needsUpdate = true;

    // 3. Swirling Mist & Fog Particles
    const mPos = this.mistPositions;
    for (let i = 0; i < this.mistCount; i++) {
      const idx = i * 3;
      mPos[idx + 1] += Math.sin(time * 2 + i) * 0.08;
      mPos[idx + 0] += Math.cos(time * 1.5 + i) * 0.06;
      // Keep mist bounded near water curtain height
      const targetMistTop = this.currentHeight * 0.75 + 10;
      if (mPos[idx + 1] > targetMistTop) {
        mPos[idx + 1] = 4;
      }
    }
    this.mistGeometry.attributes.position.needsUpdate = true;

    // 4. Update Laser Plane Position & Vibration
    if (this.laserPlane) {
      // Float height matches current water spray crest
      const targetPlaneY = Math.max(16, this.currentHeight * 0.55);
      this.laserPlane.position.y = THREE.MathUtils.damp(this.laserPlane.position.y, targetPlaneY, 4.0, dt);

      // Subtle water ripple undulation on the hologram plane
      this.laserPlane.position.x = Math.sin(time * 3) * 0.4;
      this.laserPlane.scale.setScalar(1 + (this.currentHeight / 100) * 0.4);

      // Face the camera comfortably
      this.laserPlane.lookAt(this.camera.position.x, this.laserPlane.position.y, this.camera.position.z);
    }

    // 5. Update Shore Laser Beams aiming directly at the water curtain hologram
    const aimTarget = new THREE.Vector3(0, this.laserPlane.position.y, 0);
    this.laserBeamMeshGroup.children.forEach((beam) => {
      if (beam instanceof THREE.Mesh) {
        beam.lookAt(aimTarget);
      }
    });

    // 6. Redraw Laser Hologram scanlines periodically (~15fps for efficiency)
    if (Math.floor(time * 20) % 2 === 0) {
      this.updateLaserHologramCanvas();
    }

    // 7. Water surface ripple animation
    if (this.waterMaterial) {
      const shimmer = 0.88 + Math.sin(time * 4) * 0.08;
      this.waterMaterial.opacity = shimmer;
    }

    // 8. Camera Choreography & Damping
    if (this.currentCameraMode === 'orbit') {
      const cx = Math.sin(this.orbitAngleY) * Math.cos(this.orbitAngleX) * this.orbitDistance;
      const cy = Math.sin(this.orbitAngleX) * this.orbitDistance;
      const cz = Math.cos(this.orbitAngleY) * Math.cos(this.orbitAngleX) * this.orbitDistance;
      this.camera.position.set(cx, Math.max(4, cy), cz);
      this.camera.lookAt(0, Math.min(40, this.currentHeight * 0.4), 0);
    } else {
      // Smoothly interpolate to preset camera position and lookAt
      this.camera.position.lerp(this.targetCameraPos, dt * 2.8);
      this.currentCameraLookAt.lerp(this.targetCameraLookAt, dt * 2.8);
      this.camera.lookAt(this.currentCameraLookAt);
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onResize);
    this.container.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    this.container.removeEventListener('wheel', this.onWheel);

    this.centerGeyserGeometry.dispose();
    this.archGeometry.dispose();
    this.mistGeometry.dispose();
    this.waterMaterial.dispose();
    this.renderer.dispose();

    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
