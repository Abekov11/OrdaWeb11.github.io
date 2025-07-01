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
    if (!container) return;
    
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
    
    // Создаем Землю
    const createEarth = () => {
        const group = new THREE.Group();
        
        // Геометрия Земли
        const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
        
        // Загрузка текстур
        const textureLoader = new THREE.TextureLoader();
        const earthTexture = textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
        const earthBumpMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
        const earthSpecularMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
        
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
            map: textureLoader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png'),
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
    
    // Инициализация обработчиков для мобильных устройств
    initTouchControls(container, camera, controls);
}

// Инициализация сенсорного управления для мобильных устройств
function initTouchControls(container, camera, controls) {
    let isDragging = false;
    let previousTouch = { x: 0, y: 0 };
    
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            previousTouch = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            e.preventDefault();
        }
    });
    
    container.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length === 1) {
            const deltaX = e.touches[0].clientX - previousTouch.x;
            const deltaY = e.touches[0].clientY - previousTouch.y;
            
            // Вращение камеры
            camera.rotation.y += deltaX * 0.01;
            camera.rotation.x += deltaY * 0.01;
            
            previousTouch = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            e.preventDefault();
        }
    });
    
    container.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    // Обработка масштабирования (зум)
    let initialDistance = 0;
    
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            e.preventDefault();
        }
    });
    
    container.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            
            const zoomSpeed = 0.05;
            const zoomDelta = (initialDistance - currentDistance) * zoomSpeed;
            
            // Применяем зум
            camera.position.z += zoomDelta;
            camera.position.z = Math.max(8, Math.min(30, camera.position.z));
            
            initialDistance = currentDistance;
            e.preventDefault();
        }
    });
}

// Создание 3D облаков для фона
function initClouds() {
    const container = document.getElementById('clouds-container');
    if (!container) return;
    
    // Создаем сцену
    const scene = new THREE.Scene();
    scene.background = null;
    
    // Создаем камеру
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 50;
    
    // Создаем рендерер
    const renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Создаем группу для облаков
    const cloudsGroup = new THREE.Group();
    scene.add(cloudsGroup);
    
    // Текстура облака
    const textureLoader = new THREE.TextureLoader();
    const cloudTexture = textureLoader.load('https://threejs.org/examples/textures/sprites/cloud.png');
    
    // Создаем несколько облаков (плоскостей с текстурой)
    const cloudCount = 30;
    for (let i = 0; i < cloudCount; i++) {
        const cloud = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshBasicMaterial({
                map: cloudTexture,
                transparent: true,
                opacity: 0.8
            })
        );
        
        // Случайная позиция
        cloud.position.x = Math.random() * 200 - 100;
        cloud.position.y = Math.random() * 100 - 50;
        cloud.position.z = Math.random() * 100 - 50;
        
        // Случайный размер
        const scale = 0.5 + Math.random() * 1.5;
        cloud.scale.set(scale, scale, 1);
        
        // Случайный поворот
        cloud.rotation.z = Math.random() * Math.PI;
        
        cloudsGroup.add(cloud);
    }
    
    // Анимация
    function animate() {
        requestAnimationFrame(animate);
        
        // Медленно вращаем группу облаков
        cloudsGroup.rotation.y += 0.0005;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Обработчик изменения размера окна
    function onWindowResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    window.addEventListener('resize', onWindowResize);
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
        
        // Если включен дневной режим, инициализируем облака
        if (document.body.classList.contains('light-theme') && !window.cloudsInitialized) {
            initClouds();
            window.cloudsInitialized = true;
        }
        
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
    
    // Скрытие прелоадера после загрузки страницы
    setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
    }, 2000);
    
    // Инициализация 3D модели Земли
    initEarthModel();
    
    // Инициализация облаков, если текущая тема дневная
    if (document.body.classList.contains('light-theme')) {
        initClouds();
        window.cloudsInitialized = true;
    }
});