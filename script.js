// Создание звездного фона
function createStarfield() {
    const container = document.getElementById('starfield');
    const starCount = 400;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Размер звезды
        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Позиция
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Длительность анимации
        star.style.setProperty('--duration', `${5 + Math.random() * 10}s`);
        
        // Начальная задержка
        star.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(star);
    }
}

// 3D Модель Земли
function initEarthModel() {
    const container = document.getElementById('earth-container');
    if (!container || container.clientWidth === 0) return;
    
    // Fallback для браузеров без WebGL
    if (!THREE.WebGLRenderer.isWebGLAvailable()) {
        const fallback = document.createElement('div');
        fallback.innerHTML = `
            <div style="text-align:center;padding:20px;color:white;">
                <i class="fas fa-globe-americas" style="font-size:5rem;margin-bottom:1rem;"></i>
                <h3>3D Земля не поддерживается в вашем браузере</h3>
                <p>Пожалуйста, обновите браузер или используйте другое устройство</p>
            </div>
        `;
        container.appendChild(fallback);
        return;
    }
    
    // Создаем сцену
    const scene = new THREE.Scene();
    scene.background = null;
    
    // Создаем камеру
    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 15;
    
    // Создаем рендерер
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Добавляем освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Загрузка текстур с обработкой ошибок
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg', undefined, undefined, (err) => {
        console.error('Error loading earth texture:', err);
    });
    
    const earthBumpMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg', undefined, undefined, (err) => {
        console.error('Error loading bump map:', err);
    });
    
    const earthSpecularMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg', undefined, undefined, (err) => {
        console.error('Error loading specular map:', err);
    });
    
    const cloudsTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png', undefined, undefined, (err) => {
        console.error('Error loading clouds texture:', err);
    });
    
    // Создаем Землю
    const createEarth = () => {
        const group = new THREE.Group();
        
        // Геометрия Земли
        const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
        
        // Материал Земли
        const earthMaterial = new THREE.MeshPhongMaterial({ 
            map: earthTexture,
            bumpMap: earthBumpMap,
            bumpScale: 0.05,
            specularMap: earthSpecularMap,
            specular: new THREE.Color(0x333333),
            shininess: 5
        });
        
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        group.add(earth);
        
        // Облака
        const cloudsGeometry = new THREE.SphereGeometry(5.05, 64, 64);
        const cloudsMaterial = new THREE.MeshPhongMaterial({
            map: cloudsTexture,
            transparent: true,
            opacity: 0.8
        });
        
        const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
        group.add(clouds);
        
        return group;
    };
    
    const earth = createEarth();
    scene.add(earth);
    
    // Добавляем звезды на задний план
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2,
        sizeAttenuation: true
    });
    
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    // Добавляем элементы управления
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = true;
    controls.minDistance = 8;
    controls.maxDistance = 30;
    
    // Анимация
    const animate = () => {
        requestAnimationFrame(animate);
        
        // Вращение Земли
        earth.rotation.y += 0.002;
        
        controls.update();
        renderer.render(scene, camera);
    };
    
    animate();
    
    // Обработка изменения размера окна
    const handleResize = () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
}

// Навигация по страницам и функциональность
document.addEventListener('DOMContentLoaded', function() {
    // Показываем прелоадер
    const preloader = document.getElementById('preloader');
    
    // Создание звездного фона
    createStarfield();
    
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeMenuBtn = document.querySelector('.close-menu-btn');
    const sidebarMenu = document.querySelector('.sidebar-menu');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Переключение темы
    themeToggle.addEventListener('click', function() {
        // Добавляем класс для анимации
        this.classList.add('animate');
        
        // Переключаем тему
        document.body.classList.toggle('light-theme');
        
        // Убираем класс анимации после завершения
        setTimeout(() => {
            this.classList.remove('animate');
        }, 500);
    });
    
    // Открытие бокового меню
    mobileMenuBtn.addEventListener('click', function() {
        sidebarMenu.classList.add('active');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Закрытие бокового меню
    function closeMenu() {
        sidebarMenu.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    closeMenuBtn.addEventListener('click', closeMenu);
    sidebarOverlay.addEventListener('click', closeMenu);
    
    // Навигация по страницам
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Убираем активный класс у всех ссылок
            navLinks.forEach(l => l.classList.remove('active'));
            // Добавляем активный класс текущей ссылке
            this.classList.add('active');
            
            // Скрываем все страницы
            pages.forEach(page => page.classList.remove('active'));
            
            // Показываем выбранную страницу
            const pageId = this.getAttribute('data-page');
            document.getElementById(pageId).classList.add('active');
            
            // Закрываем боковое меню
            closeMenu();
            
            // Прокрутка наверх страницы
            window.scrollTo(0, 0);
        });
    });
    
    // Анимация при скролле
    const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    animateOnScrollElements.forEach(element => {
        observer.observe(element);
    });
    
    // Скрытие прелоадера после полной загрузки страницы
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }, 1000);
    });
    
    // Инициализация 3D модели Земли
    initEarthModel();
    
    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Анимация элементов при скролле
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature, .value-card, .leader');
        elements.forEach(el => {
            const position = el.getBoundingClientRect();
            if (position.top < window.innerHeight * 0.85) {
                el.style.animationPlayState = 'running';
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
    
    // Интерактивная карта
    const mapPlaceholder = document.querySelector('.map-placeholder');
    if (mapPlaceholder) {
        mapPlaceholder.innerHTML = `
            <div class="map-interactive">
                <div class="map-point" style="top: 45%; left: 48%;">
                    <div class="pulse"></div>
                    <div class="point"></div>
                    <div class="map-tooltip">Болашак Колледж</div>
                </div>
            </div>
            <p>Нажмите для просмотра карты</p>
        `;
        
        mapPlaceholder.addEventListener('click', () => {
            alert("Открывается интерактивная карта...");
            // Здесь будет код для открытия настоящей карты
        });
    }
});