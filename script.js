let screenSize;
let flowField;
let particles = [];

const settings = {
    count: 200,
    xStep: 0.1,
    yStep: 0.1,
    zStep: 0.005,
    cellForce: 5,
    cellSize: 30,
    maxSpeed: 15,
    opacity: 5,
    invertColors: false,
    backgroundColor: 20,
    particleColor: 255,
    showMagic: true,
    showField: false,
    showFPS: false,
    clear: clearCanvas,
};

const gui = new dat.GUI();

function updateScreenSize() {
    const bodyRect = document.body.getBoundingClientRect();
    screenSize = {
        width: bodyRect.width,
        height: bodyRect.height,
    };
    resizeCanvas(screenSize.width, screenSize.height)
    clearCanvas();
}

function generateGUISettings() {
    gui.add(settings, 'count', 1, 300).step(1);
    gui.add(settings, 'xStep', 0.01, 0.5).step(0.01);
    gui.add(settings, 'yStep', 0.01, 0.5).step(0.01);
    gui.add(settings, 'zStep', 0.001, 0.02).step(0.001);
    gui.add(settings, 'cellForce', 0.01, 10).step(0.01);
    gui.add(settings, 'cellSize', 10, 200).step(10);
    gui.add(settings, 'maxSpeed', 1, 50).step(1);
    gui.add(settings, 'opacity', 1, 30).step(1);
    gui.add(settings, 'invertColors').onChange(() => {
        const temp = settings.backgroundColor;
        settings.backgroundColor = settings.particleColor;
        settings.particleColor = temp;
        clearCanvas();
    });
    gui.add(settings, 'showMagic').onChange(clearCanvas);
    gui.add(settings, 'showField');
    gui.add(settings, 'showFPS');
    gui.add(settings, 'clear');
}

function generateFlowField() {
    const noiseSettings = {
        xStep: settings.xStep,
        yStep: settings.yStep,
        zStep: settings.zStep,
    };
    flowField = new FlowField(noiseSettings);
}

function generateParticles(count) {
    for (let i = 0; i < count; i++) {
        particles.push(
            new Particle(
                random(screenSize.width),
                random(screenSize.height)
            )
        );
    }
}

function setup() {
    createCanvas();
    updateScreenSize();

    window.addEventListener('resize', updateScreenSize);

    generateGUISettings();
    generateFlowField();
    generateParticles(settings.count);

    clearCanvas();
    draw();
}

function clearCanvas() {
    noStroke();
    fill(settings.backgroundColor);
    rect(0, 0, screenSize.width, screenSize.height);
}

function drawFPS() {
    textSize(32);
    noStroke();
    fill('#ed225d');
    text(Math.floor(frameRate()), 10, 35);
}

function drawFlowField() {
    noFill();
    stroke(255, 100);
    strokeWeight(2);

    const cellSize = settings.cellSize;
    const lineLength = cellSize / 2;
    const fieldSize = {
        width: Math.ceil(screenSize.width / cellSize),
        height: Math.ceil(screenSize.height / cellSize),
    };
    for (let y = 0; y < fieldSize.height; y++) {
        for (let x = 0; x < fieldSize.width; x++) {
            const angle = flowField.getCellNoiseAngle(x, y);

            push();
            translate(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
            rotate(angle);
            line(0, 0, lineLength, 0)
            pop()
        }
    }
}

function drawParticles() {
    settings.showMagic
        ? particles.forEach(particle => particle.drawMagic(settings.particleColor, settings.opacity))
        : particles.forEach(particle => particle.draw(settings.particleColor));
}

function draw() {
    !settings.showMagic && clearCanvas();

    settings.showField && drawFlowField();
    drawParticles();

    settings.showFPS && drawFPS();

    update();
}

function applyEdges(particle) {
    const { x, y } = particle.position;
    const { width, height } = screenSize;
    if (x < 0) particle.position.x = width;
    if (x > width) particle.position.x = 0;
    if (y < 0) particle.position.y = height;
    if (y > height) particle.position.y = 0;
}

function applyFlowField(particle) {
    const { cellForce, cellSize } = settings;
    const cellX = Math.ceil(particle.position.x / cellSize);
    const cellY = Math.ceil(particle.position.y / cellSize);
    const angle = flowField.getCellNoiseAngle(cellX, cellY);
    const force = p5.Vector.fromAngle(angle).setMag(cellForce);
    particle.applyForce(force);
}

function limitSpeed(particle) {
    particle.speed.limit(settings.maxSpeed);
}

function updateParticlesCount() {
    const currentCount = particles.length;
    const newCount = settings.count;

    if (newCount < currentCount) {
        particles = particles.slice(0, newCount);
    } else if (newCount > currentCount) {
        generateParticles(newCount - currentCount);
    }
}

function udpateFlowField() {
    const noiseSettings = {
        xStep: settings.xStep,
        yStep: settings.yStep,
        zStep: settings.zStep,
    };
    flowField.updateSettings(noiseSettings);
    flowField.updateZOffset();
}

function updateParticles() {
    particles.forEach(particle => {
        applyFlowField(particle);
        applyEdges(particle);
        limitSpeed(particle);
        particle.update();
    });
}

function update() {
    updateParticlesCount();
    udpateFlowField();
    updateParticles();
}
