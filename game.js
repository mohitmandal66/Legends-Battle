/* =========================================================
   BATTLE LEGENDS
   50 LEVEL GAME
========================================================= */

"use strict";


/* =========================================================
   DOM
========================================================= */

const homeScreen = document.getElementById("homeScreen");
const levelScreen = document.getElementById("levelScreen");
const battleScreen = document.getElementById("battleScreen");

const battleButton = document.getElementById("battleButton");
const levelBackButton = document.getElementById("levelBackButton");

const levelsGrid = document.getElementById("levelsGrid");

const totalKillsEl = document.getElementById("totalKills");
const currentLevelEl = document.getElementById("currentLevel");
const totalStarsEl = document.getElementById("totalStars");
const unlockedLevelsEl = document.getElementById("unlockedLevels");

const levelKillsEl = document.getElementById("levelKills");
const levelStarsEl = document.getElementById("levelStars");

const battleGun = document.getElementById("battleGun");

const battleExit = document.getElementById("battleExit");

const camera = document.getElementById("camera");
const world = document.getElementById("world");
const panorama = document.getElementById("panorama");
const enemyLayer = document.getElementById("enemyLayer");
const projectileLayer = document.getElementById("projectileLayer");
const snowLayer = document.getElementById("snowLayer");

const crosshair = document.getElementById("crosshair");
const scopeOverlay = document.getElementById("scopeOverlay");

const battleLevelEl = document.getElementById("battleLevel");
const mapNameEl = document.getElementById("mapName");

const remainingEnemiesEl =
    document.getElementById("remainingEnemies");

const totalEnemiesEl =
    document.getElementById("totalEnemies");

const battleKillsEl =
    document.getElementById("battleKills");

const healthFill =
    document.getElementById("healthFill");

const healthText =
    document.getElementById("healthText");

const star1 = document.getElementById("star1");
const star2 = document.getElementById("star2");
const star3 = document.getElementById("star3");

const battleIntro =
    document.getElementById("battleIntro");

const introLevel =
    document.getElementById("introLevel");

const introMap =
    document.getElementById("introMap");

const introEnemies =
    document.getElementById("introEnemies");

const startBattleButton =
    document.getElementById("startBattleButton");

const victoryOverlay =
    document.getElementById("victoryOverlay");

const defeatOverlay =
    document.getElementById("defeatOverlay");

const victoryLevel =
    document.getElementById("victoryLevel");

const victoryKills =
    document.getElementById("victoryKills");

const victoryHealth =
    document.getElementById("victoryHealth");

const victoryStar1 =
    document.getElementById("victoryStar1");

const victoryStar2 =
    document.getElementById("victoryStar2");

const victoryStar3 =
    document.getElementById("victoryStar3");

const nextLevelButton =
    document.getElementById("nextLevelButton");

const victoryLevelsButton =
    document.getElementById("victoryLevelsButton");

const retryButton =
    document.getElementById("retryButton");

const defeatLevelsButton =
    document.getElementById("defeatLevelsButton");

const defeatLevel =
    document.getElementById("defeatLevel");

const muzzleFlash =
    document.getElementById("muzzleFlash");


/* =========================================================
   GAME CONFIG
========================================================= */

const GAME = {

    maxLevel: 50,

    playerHealth: 100,

    normalEnemyHP: 4,

    bossHP: 15,

    enemyDamage: 0.5,

    bossDamage: 1,

    normalAttackInterval: 3000,

    bossAttackInterval: 2200,

    cameraZoom: 3,

    selectedGun: "gun1.png",

    projectileImage: "assets/arrow.png"

};


/* =========================================================
   EXACT DESERT POSITIONS FROM YOUR IMAGE
========================================================= */

const DESERT_POSITIONS = [

    { x: 17, y: 64 },

    { x: 32, y: 57 },

    { x: 79, y: 73 },

    { x: 98, y: 67 },

    { x: 68, y: 94 }

];


/* =========================================================
   SNOW POSITIONS
========================================================= */

const SNOW_POSITIONS = [

    { x: 10, y: 76 },

    { x: 25, y: 66 },

    { x: 39, y: 54 },

    { x: 52, y: 60 },

    { x: 67, y: 73 },

    { x: 81, y: 65 },

    { x: 93, y: 72 }

];


/* =========================================================
   BOSS POSITIONS
========================================================= */

const BOSS_POSITIONS = [

    { x: 15, y: 78 },

    { x: 32, y: 72 },

    { x: 50, y: 75 },

    { x: 68, y: 70 },

    { x: 84, y: 76 },

    { x: 94, y: 65 }

];


/* =========================================================
   SAVE DATA
========================================================= */

const DEFAULT_SAVE = {

    highestUnlocked: 1,

    totalKills: 0,

    totalStars: 0,

    selectedGun: "gun1.png",

    completedLevels: {},

    bestStars: {}

};


let saveData = loadSave();


function loadSave() {

    try {

        const saved =
            localStorage.getItem("battleLegendsSave");

        if (!saved) {

            return {
                ...DEFAULT_SAVE,
                completedLevels: {},
                bestStars: {}
            };

        }

        const parsed = JSON.parse(saved);

        return {

            ...DEFAULT_SAVE,
            ...parsed,

            completedLevels:
                parsed.completedLevels || {},

            bestStars:
                parsed.bestStars || {}

        };

    } catch (error) {

        console.warn("Save data error:", error);

        return {
            ...DEFAULT_SAVE,
            completedLevels: {},
            bestStars: {}
        };

    }

}


function saveGame() {

    localStorage.setItem(
        "battleLegendsSave",
        JSON.stringify(saveData)
    );

}


/* =========================================================
   GAME STATE
========================================================= */

let currentLevel = 1;

let playerHealth = 100;

let battleKills = 0;

let enemies = [];

let projectiles = [];

let enemyTimers = [];

let gameRunning = false;

let battleStarted = false;

let zooming = false;

let mouseX = window.innerWidth / 2;

let mouseY = window.innerHeight / 2;

let worldOffset = 0;


/* =========================================================
   LEVEL INFORMATION
========================================================= */

function getMapType(level) {

    if (level <= 10) {

        return "snow";

    }

    if (level <= 39) {

        return "desert";

    }

    return "boss";

}


function getMapName(level) {

    if (level <= 10) {

        return "SNOW VALLEY";

    }

    if (level <= 39) {

        return "DESERT KINGDOM";

    }

    return "RAKSHAS ARENA";

}


function isBossLevel(level) {

    return level >= 40;

}


/*
    Requested boss progression:

    Level 40 = 1 Rakshas
    Level 41 = 2
    ...
    Level 49 = 10
    Level 50 = 12

    Level 50 is intentionally special to give
    exactly 12 Rakshas as requested.
*/

function getBossCount(level) {

    if (level === 40) {

        return 1;

    }

    if (level >= 41 && level <= 49) {

        return level - 39;

    }

    if (level === 50) {

        return 12;

    }

    return 0;

}


function getEnemyCount(level) {

    if (isBossLevel(level)) {

        return getBossCount(level);

    }

    return level;

}


/* =========================================================
   NORMAL ENEMY ASSETS
========================================================= */

const NORMAL_ENEMIES = [

    "character1.png",
    "character2.png",
    "character3.png",
    "character4.png",
    "character5.png",
    "character6.png"

];


/* =========================================================
   UPDATE DASHBOARD
========================================================= */

function updateDashboard() {

    totalKillsEl.textContent =
        saveData.totalKills;

    currentLevelEl.textContent =
        saveData.highestUnlocked;

    totalStarsEl.textContent =
        saveData.totalStars;

    unlockedLevelsEl.textContent =
        `${saveData.highestUnlocked} / ${GAME.maxLevel}`;

    levelKillsEl.textContent =
        saveData.totalKills;

    levelStarsEl.textContent =
        saveData.totalStars;

}


/* =========================================================
   SCREEN NAVIGATION
========================================================= */

function showScreen(screen) {

    homeScreen.classList.remove("active");
    levelScreen.classList.remove("active");
    battleScreen.classList.remove("active");

    screen.classList.add("active");

}


/* =========================================================
   HOME
========================================================= */

battleButton.addEventListener("click", () => {

    updateDashboard();

    renderLevels();

    showScreen(levelScreen);

});


levelBackButton.addEventListener("click", () => {

    showScreen(homeScreen);

    updateDashboard();

});


battleExit.addEventListener("click", () => {

    stopBattle();

    renderLevels();

    showScreen(levelScreen);

});


/* =========================================================
   GUN SELECTOR
========================================================= */

const gunChoices =
    document.querySelectorAll(".gun-choice");


gunChoices.forEach(button => {

    button.addEventListener("click", () => {

        gunChoices.forEach(item => {

            item.classList.remove("selected");

        });

        button.classList.add("selected");

        const gun =
            button.dataset.gun;

        GAME.selectedGun = gun;

        saveData.selectedGun = gun;

        saveGame();

        battleGun.src =
            `assets/${gun}`;

    });

});


function loadSelectedGun() {

    GAME.selectedGun =
        saveData.selectedGun ||
        "gun1.png";

    battleGun.src =
        `assets/${GAME.selectedGun}`;

    gunChoices.forEach(button => {

        button.classList.toggle(
            "selected",
            button.dataset.gun === GAME.selectedGun
        );

    });

}


/* =========================================================
   LEVEL GRID
========================================================= */

function renderLevels() {

    levelsGrid.innerHTML = "";

    for (
        let level = 1;
        level <= GAME.maxLevel;
        level++
    ) {

        const button =
            document.createElement("button");

        button.className =
            "level-button";

        const unlocked =
            level <= saveData.highestUnlocked;

        const completed =
            !!saveData.completedLevels[level];

        const boss =
            level >= 40;

        if (unlocked) {

            button.classList.add("unlocked");

        } else {

            button.classList.add("locked");

        }

        if (completed) {

            button.classList.add("completed");

        }

        if (boss) {

            button.classList.add("boss-level");

        }


        let stars = "";

        const earnedStars =
            saveData.bestStars[level] || 0;

        if (earnedStars > 0) {

            stars =
                "★".repeat(earnedStars) +
                "☆".repeat(3 - earnedStars);

        } else {

            stars = "☆☆☆";

        }


        button.innerHTML = `

            ${
                !unlocked
                    ? `<span class="lock-icon">🔒</span>`
                    : ""
            }

            <span class="level-number">
                ${level}
            </span>

            <span class="level-type">
                ${
                    boss
                        ? "RAKSHAS"
                        : getMapType(level).toUpperCase()
                }
            </span>

            <span class="level-stars">
                ${stars}
            </span>

        `;


        if (unlocked) {

            button.addEventListener(
                "click",
                () => openLevel(level)
            );

        }


        levelsGrid.appendChild(button);

    }

}


/* =========================================================
   OPEN LEVEL
========================================================= */

function openLevel(level) {

    if (
        level < 1 ||
        level > GAME.maxLevel
    ) {

        return;

    }

    if (
        level >
        saveData.highestUnlocked
    ) {

        return;

    }

    currentLevel = level;

    prepareBattle();

    showScreen(battleScreen);

}


/* =========================================================
   PREPARE BATTLE
========================================================= */

function prepareBattle() {

    stopBattle();

    clearBattleWorld();

    currentLevel =
        Math.max(
            1,
            Math.min(
                GAME.maxLevel,
                currentLevel
            )
        );

    playerHealth =
        GAME.playerHealth;

    battleKills = 0;

    battleStarted = false;

    battleLevelEl.textContent =
        currentLevel;

    mapNameEl.textContent =
        getMapName(currentLevel);

    const enemyCount =
        getEnemyCount(currentLevel);

    remainingEnemiesEl.textContent =
        enemyCount;

    totalEnemiesEl.textContent =
        enemyCount;

    battleKillsEl.textContent =
        "0";

    updateHealthUI();

    updateStarsUI(0);

    setupMap();

    setupSnow();

    introLevel.textContent =
        `LEVEL ${currentLevel}`;

    introMap.textContent =
        getMapName(currentLevel);

    introEnemies.textContent =
        isBossLevel(currentLevel)
            ? `${enemyCount} RAKSHAS`
            : `${enemyCount} ENEMY${enemyCount === 1 ? "" : "IES"}`;

    battleIntro.classList.remove("hidden");

    victoryOverlay.classList.add("hidden");

    defeatOverlay.classList.add("hidden");

    loadSelectedGun();

}


/* =========================================================
   MAP
========================================================= */

function setupMap() {

    const map =
        getMapType(currentLevel);

    if (map === "snow") {

        panorama.style.backgroundImage =
            "url('assets/panorama-snow.jpg')";

    }

    else if (map === "desert") {

        panorama.style.backgroundImage =
            "url('assets/panorama-desert.jpg')";

    }

    else {

        panorama.style.backgroundImage =
            "url('assets/panorama-boss.jpg')";

    }

}


/* =========================================================
   START BATTLE
========================================================= */

startBattleButton.addEventListener(
    "click",
    startBattle
);


function startBattle() {

    battleIntro.classList.add("hidden");

    battleStarted = true;

    gameRunning = true;

    playerHealth =
        GAME.playerHealth;

    battleKills = 0;

    updateHealthUI();

    updateStarsUI(0);

    createEnemies();

    startEnemyAttacks();

    centerWorld();

}


/* =========================================================
   CREATE ENEMIES
========================================================= */

function createEnemies() {

    clearEnemies();

    const count =
        getEnemyCount(currentLevel);

    const boss =
        isBossLevel(currentLevel);

    for (
        let i = 0;
        i < count;
        i++
    ) {

        createEnemy(i, boss);

    }

    remainingEnemiesEl.textContent =
        count;

}


/* =========================================================
   CREATE ENEMY
========================================================= */

function createEnemy(index, boss) {

    const enemy =
        document.createElement("div");

    enemy.className =
        "enemy";

    if (boss) {

        enemy.classList.add(
            "boss-enemy"
        );

    }


    const image =
        document.createElement("img");


    if (boss) {

        image.src =
            "assets/rakshas.png";

    } else {

        image.src =
            `assets/${
                NORMAL_ENEMIES[
                    index %
                    NORMAL_ENEMIES.length
                ]
            }`;

    }


    image.draggable = false;


    const health =
        document.createElement("div");

    health.className =
        "enemy-health";


    const healthFill =
        document.createElement("div");

    healthFill.className =
        "enemy-health-fill";


    health.appendChild(
        healthFill
    );


    const name =
        document.createElement("div");

    name.className =
        "enemy-name";

    name.textContent =
        boss
            ? `RAKSHAS ${index + 1}`
            : `ENEMY ${index + 1}`;


    enemy.appendChild(
        health
    );

    enemy.appendChild(
        name
    );

    enemy.appendChild(
        image
    );


    const position =
        getEnemyPosition(
            index,
            boss
        );


    enemy.style.left =
        `${position.x}%`;

    enemy.style.top =
        `${position.y}%`;


    const enemyData = {

        element: enemy,

        hp:
            boss
                ? GAME.bossHP
                : GAME.normalEnemyHP,

        maxHP:
            boss
                ? GAME.bossHP
                : GAME.normalEnemyHP,

        alive: true,

        boss: boss,

        healthFill: healthFill,

        index: index,

        x: position.x,

        y: position.y

    };


    enemy.dataset.index =
        index;


    enemy.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            if (
                gameRunning &&
                enemyData.alive
            ) {

                damageEnemy(
                    enemyData,
                    1
                );

            }

        }
    );


    enemyLayer.appendChild(
        enemy
    );

    enemies.push(
        enemyData
    );

}


/* =========================================================
   POSITION GENERATOR
========================================================= */

function getEnemyPosition(
    index,
    boss
) {

    let positions;

    if (boss) {

        positions =
            BOSS_POSITIONS;

    }

    else if (
        getMapType(currentLevel) ===
        "snow"
    ) {

        positions =
            SNOW_POSITIONS;

    }

    else {

        positions =
            DESERT_POSITIONS;

    }


    const base =
        positions[
            index % positions.length
        ];


    /*
       For levels with many enemies,
       repeat the marked positions but
       offset them slightly.
    */

    const cycle =
        Math.floor(
            index / positions.length
        );


    let offsetX = 0;
    let offsetY = 0;


    if (cycle > 0) {

        offsetX =
            ((cycle * 5) % 15) -
            7;

        offsetY =
            ((cycle * 4) % 10) -
            5;

    }


    return {

        x: Math.max(
            4,
            Math.min(
                96,
                base.x + offsetX
            )
        ),

        y: Math.max(
            35,
            Math.min(
                92,
                base.y + offsetY
            )
        )

    };

}


/* =========================================================
   DAMAGE ENEMY
========================================================= */

function damageEnemy(
    enemy,
    damage
) {

    if (
        !enemy.alive ||
        !gameRunning
    ) {

        return;

    }


    enemy.hp -= damage;


    const percentage =
        Math.max(
            0,
            enemy.hp /
            enemy.maxHP *
            100
        );


    enemy.healthFill.style.width =
        `${percentage}%`;


    enemy.element.classList.add(
        "hit"
    );


    setTimeout(() => {

        if (
            enemy.element
        ) {

            enemy.element.classList.remove(
                "hit"
            );

        }

    }, 100);


    if (enemy.hp <= 0) {

        killEnemy(enemy);

    }

}


/* =========================================================
   KILL ENEMY
========================================================= */

function killEnemy(enemy) {

    if (!enemy.alive) {

        return;

    }

    enemy.alive = false;

    enemy.element.style.pointerEvents =
        "none";

    enemy.element.style.opacity =
        "0";

    enemy.element.style.transform =
        "translate(-50%, -100%) scale(.65)";

    enemy.element.style.transition =
        "opacity .2s, transform .2s";


    battleKills++;

    saveData.totalKills++;

    battleKillsEl.textContent =
        battleKills;


    const aliveEnemies =
        enemies.filter(
            item => item.alive
        ).length;


    remainingEnemiesEl.textContent =
        aliveEnemies;


    saveGame();


    setTimeout(() => {

        enemy.element.remove();

    }, 220);


    if (
        aliveEnemies <= 0
    ) {

        setTimeout(
            victory,
            350
        );

    }

}


/* =========================================================
   ENEMY ATTACK SYSTEM
========================================================= */

function startEnemyAttacks() {

    clearEnemyTimers();


    enemies.forEach(enemy => {

        const interval =
            enemy.boss
                ? GAME.bossAttackInterval
                : GAME.normalAttackInterval;


        const timer =
            setInterval(() => {

                if (
                    gameRunning &&
                    enemy.alive
                ) {

                    enemyAttack(enemy);

                }

            }, interval);


        enemyTimers.push(timer);

    });

}


/* =========================================================
   ENEMY ATTACK
========================================================= */

function enemyAttack(enemy) {

    if (!enemy.alive) {

        return;

    }


    createEnemyProjectile(
        enemy
    );


    const damage =
        enemy.boss
            ? GAME.bossDamage
            : GAME.enemyDamage;


    setTimeout(() => {

        if (
            gameRunning &&
            enemy.alive
        ) {

            damagePlayer(
                damage
            );

        }

    }, 450);

}


/* =========================================================
   ENEMY PROJECTILE
========================================================= */

function createEnemyProjectile(enemy) {

    const projectile =
        document.createElement("img");

    projectile.className =
        "projectile";

    projectile.src =
        GAME.projectileImage;


    projectile.style.left =
        `${enemy.x}%`;

    projectile.style.top =
        `${enemy.y - 10}%`;


    projectileLayer.appendChild(
        projectile
    );


    const startX =
        world.offsetWidth *
        enemy.x /
        100;


    const startY =
        window.innerHeight *
        enemy.y /
        100;


    const endX =
        worldOffset +
        window.innerWidth / 2;


    const endY =
        window.innerHeight -
        80;


    const duration =
        550;


    const startTime =
        performance.now();


    function animateProjectile(
        now
    ) {

        if (
            !projectile.isConnected
        ) {

            return;

        }


        const progress =
            Math.min(
                1,
                (now - startTime) /
                duration
            );


        const x =
            startX +
            (endX - startX) *
            progress;


        const y =
            startY +
            (endY - startY) *
            progress;


        projectile.style.left =
            `${x}px`;

        projectile.style.top =
            `${y}px`;

        projectile.style.transform =
            `rotate(20deg)`;


        if (
            progress < 1 &&
            gameRunning
        ) {

            requestAnimationFrame(
                animateProjectile
            );

        }

        else {

            projectile.remove();

        }

    }


    requestAnimationFrame(
        animateProjectile
    );

}


/* =========================================================
   PLAYER SHOOT
========================================================= */

function shoot() {

    if (
        !gameRunning ||
        !battleStarted
    ) {

        return;

    }


    muzzleFlash.classList.add(
        "active"
    );


    setTimeout(() => {

        muzzleFlash.classList.remove(
            "active"
        );

    }, 70);


    /*
       Convert mouse screen coordinates
       into world coordinates.
    */

    const target =
        screenToWorld(
            mouseX,
            mouseY
        );


    const hit =
        findEnemyUnderAim(
            target.x,
            target.y
        );


    if (hit) {

        damageEnemy(
            hit,
            1
        );

    }

}


/* =========================================================
   FIND ENEMY UNDER AIM
========================================================= */

function findEnemyUnderAim(
    worldX,
    worldY
) {

    let closest = null;

    let closestDistance =
        Infinity;


    enemies.forEach(enemy => {

        if (
            !enemy.alive
        ) {

            return;

        }


        const enemyX =
            world.offsetWidth *
            enemy.x /
            100;


        const enemyY =
            window.innerHeight *
            enemy.y /
            100;


        const width =
            enemy.boss
                ? 180
                : 90;


        const height =
            enemy.boss
                ? 280
                : 150;


        const dx =
            worldX - enemyX;

        const dy =
            worldY - enemyY;


        const inside =
            Math.abs(dx) <
            width / 2 &&
            Math.abs(dy) <
            height;


        if (inside) {

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance <
                closestDistance
            ) {

                closestDistance =
                    distance;

                closest =
                    enemy;

            }

        }

    });


    return closest;

}


/* =========================================================
   PLAYER DAMAGE
========================================================= */

function damagePlayer(
    amount
) {

    if (
        !gameRunning
    ) {

        return;

    }


    playerHealth -= amount;

    playerHealth =
        Math.max(
            0,
            playerHealth
        );


    updateHealthUI();


    if (
        playerHealth <= 0
    ) {

        defeat();

    }

}


/* =========================================================
   HEALTH UI
========================================================= */

function updateHealthUI() {

    const health =
        Math.round(
            playerHealth
        );


    healthFill.style.width =
        `${health}%`;

    healthText.textContent =
        `${health}%`;


    if (
        health > 60
    ) {

        healthFill.style.background =
            "#5fc77b";

    }

    else if (
        health > 30
    ) {

        healthFill.style.background =
            "#e5ad58";

    }

    else {

        healthFill.style.background =
            "#d95e55";

    }

}


/* =========================================================
   STAR SYSTEM
========================================================= */

function calculateStars() {

    if (
        playerHealth > 75
    ) {

        return 3;

    }

    if (
        playerHealth >= 35
    ) {

        return 2;

    }

    if (
        playerHealth > 0
    ) {

        return 1;

    }

    return 0;

}


function updateStarsUI(stars) {

    const elements =
        [star1, star2, star3];


    elements.forEach(
        (element, index) => {

            element.classList.toggle(
                "active",
                index < stars
            );

        }
    );

}


/* =========================================================
   VICTORY
========================================================= */

function victory() {

    if (
        !gameRunning
    ) {

        return;

    }


    gameRunning = false;

    battleStarted = false;

    clearEnemyTimers();


    const stars =
        calculateStars();


    const oldStars =
        saveData.bestStars[
            currentLevel
        ] || 0;


    if (
        stars > oldStars
    ) {

        const difference =
            stars - oldStars;

        saveData.totalStars +=
            difference;

        saveData.bestStars[
            currentLevel
        ] = stars;

    }


    saveData.completedLevels[
        currentLevel
    ] = true;


    if (
        currentLevel <
        GAME.maxLevel
    ) {

        saveData.highestUnlocked =
            Math.max(
                saveData.highestUnlocked,
                currentLevel + 1
            );

    }


    saveGame();


    victoryLevel.textContent =
        `LEVEL ${currentLevel}`;


    victoryKills.textContent =
        battleKills;


    victoryHealth.textContent =
        `${Math.round(playerHealth)}%`;


    setResultStars(
        stars
    );


    nextLevelButton.style.display =
        currentLevel <
        GAME.maxLevel
            ? "block"
            : "none";


    victoryOverlay.classList.remove(
        "hidden"
    );

}


/* =========================================================
   RESULT STARS
========================================================= */

function setResultStars(
    stars
) {

    const elements = [

        victoryStar1,
        victoryStar2,
        victoryStar3

    ];


    elements.forEach(
        (element, index) => {

            element.classList.toggle(
                "active",
                index < stars
            );

        }
    );

}


/* =========================================================
   DEFEAT
========================================================= */

function defeat() {

    if (
        !gameRunning
    ) {

        return;

    }


    gameRunning = false;

    battleStarted = false;

    clearEnemyTimers();


    defeatLevel.textContent =
        `LEVEL ${currentLevel}`;


    defeatOverlay.classList.remove(
        "hidden"
    );

}


/* =========================================================
   RETRY
========================================================= */

retryButton.addEventListener(
    "click",
    () => {

        defeatOverlay.classList.add(
            "hidden"
        );

        prepareBattle();

    }
);


/* =========================================================
   NEXT LEVEL
========================================================= */

nextLevelButton.addEventListener(
    "click",
    () => {

        victoryOverlay.classList.add(
            "hidden"
        );

        if (
            currentLevel <
            GAME.maxLevel
        ) {

            currentLevel++;

            prepareBattle();

        }

    }
);


/* =========================================================
   RESULT LEVEL SELECT
========================================================= */

victoryLevelsButton.addEventListener(
    "click",
    () => {

        stopBattle();

        victoryOverlay.classList.add(
            "hidden"
        );

        renderLevels();

        updateDashboard();

        showScreen(levelScreen);

    }
);


defeatLevelsButton.addEventListener(
    "click",
    () => {

        stopBattle();

        defeatOverlay.classList.add(
            "hidden"
        );

        renderLevels();

        updateDashboard();

        showScreen(levelScreen);

    }
);


/* =========================================================
   CLEAR WORLD
========================================================= */

function clearBattleWorld() {

    enemyLayer.innerHTML = "";

    projectileLayer.innerHTML = "";

    enemies = [];

    projectiles = [];

}


/* =========================================================
   CLEAR ENEMIES
========================================================= */

function clearEnemies() {

    enemyLayer.innerHTML = "";

    enemies = [];

}


/* =========================================================
   CLEAR TIMERS
========================================================= */

function clearEnemyTimers() {

    enemyTimers.forEach(
        timer => clearInterval(timer)
    );

    enemyTimers = [];

}


/* =========================================================
   STOP BATTLE
========================================================= */

function stopBattle() {

    gameRunning = false;

    battleStarted = false;

    clearEnemyTimers();

    clearBattleWorld();

    zooming = false;

    camera.style.transform =
        "scale(1)";

    scopeOverlay.classList.remove(
        "active"
    );

}


/* =========================================================
   WORLD CENTER
========================================================= */

function centerWorld() {

    updateWorldSize();

    worldOffset =
        Math.max(
            0,
            (world.offsetWidth -
                window.innerWidth) / 2
        );

    world.style.transform =
        `translateX(${-worldOffset}px)`;

}


/* =========================================================
   WORLD SIZE
========================================================= */

function updateWorldSize() {

    /*
       World is 400vw from CSS.
       We calculate actual maximum
       camera movement dynamically.
    */

    const maxOffset =
        Math.max(
            0,
            world.offsetWidth -
            window.innerWidth
        );


    if (
        worldOffset >
        maxOffset
    ) {

        worldOffset =
            maxOffset;

    }

}


/* =========================================================
   MOUSE AIM
========================================================= */

window.addEventListener(
    "mousemove",
    event => {

        mouseX =
            event.clientX;

        mouseY =
            event.clientY;


        crosshair.style.left =
            `${mouseX}px`;

        crosshair.style.top =
            `${mouseY}px`;


        if (
            gameRunning &&
            !zooming
        ) {

            updateCameraParallax();

        }


        if (
            zooming
        ) {

            updateZoom();

        }

    }
);


/* =========================================================
   CAMERA PARALLAX
========================================================= */

function updateCameraParallax() {

    if (
        !battleScreen.classList.contains(
            "active"
        )
    ) {

        return;

    }


    updateWorldSize();


    const normalized =
        mouseX /
        window.innerWidth;


    const maxOffset =
        Math.max(
            0,
            world.offsetWidth -
            window.innerWidth
        );


    worldOffset =
        normalized *
        maxOffset;


    world.style.transform =
        `translateX(${-worldOffset}px)`;

}


/* =========================================================
   ZOOM
========================================================= */

function updateZoom() {

    if (!zooming) {

        return;

    }


    const rect =
        camera.getBoundingClientRect();


    const originX =
        mouseX;

    const originY =
        mouseY;


    camera.style.transformOrigin =
        `${originX}px ${originY}px`;

    camera.style.transform =
        `scale(${GAME.cameraZoom})`;

}


/* =========================================================
   MOUSE SHOOT
========================================================= */

window.addEventListener(
    "mousedown",
    event => {

        if (
            event.button === 0 &&
            battleScreen.classList.contains(
                "active"
            )
        ) {

            shoot();

        }


        if (
            event.button === 2 &&
            battleScreen.classList.contains(
                "active"
            )
        ) {

            event.preventDefault();

            zooming = true;

            scopeOverlay.classList.add(
                "active"
            );

            updateZoom();

        }

    }
);


/* =========================================================
   RIGHT CLICK RELEASE
========================================================= */

window.addEventListener(
    "mouseup",
    event => {

        if (
            event.button === 2
        ) {

            zooming = false;

            scopeOverlay.classList.remove(
                "active"
            );

            camera.style.transform =
                "scale(1)";

        }

    }
);


/* =========================================================
   PREVENT RIGHT CLICK MENU
========================================================= */

window.addEventListener(
    "contextmenu",
    event => {

        if (
            battleScreen.classList.contains(
                "active"
            )
        ) {

            event.preventDefault();

        }

    }
);


/* =========================================================
   SPACE = HOLD ZOOM
========================================================= */

window.addEventListener(
    "keydown",
    event => {

        if (
            event.code === "Space" &&
            battleScreen.classList.contains(
                "active"
            )
        ) {

            event.preventDefault();

            if (
                !zooming
            ) {

                zooming = true;

                scopeOverlay.classList.add(
                    "active"
                );

                updateZoom();

            }

        }

    }
);


window.addEventListener(
    "keyup",
    event => {

        if (
            event.code === "Space"
        ) {

            zooming = false;

            scopeOverlay.classList.remove(
                "active"
            );

            camera.style.transform =
                "scale(1)";

        }

    }
);


/* =========================================================
   SCREEN TO WORLD
========================================================= */

function screenToWorld(
    screenX,
    screenY
) {

    /*
       Convert screen position to
       position inside the 400vw world.
    */

    const scale =
        zooming
            ? GAME.cameraZoom
            : 1;


    const cameraCenterX =
        window.innerWidth / 2;

    const cameraCenterY =
        window.innerHeight / 2;


    const adjustedX =
        cameraCenterX +
        (
            screenX -
            cameraCenterX
        ) /
        scale;


    const adjustedY =
        cameraCenterY +
        (
            screenY -
            cameraCenterY
        ) /
        scale;


    const worldX =
        adjustedX +
        worldOffset;


    const worldY =
        adjustedY;


    return {

        x: worldX,

        y: worldY

    };

}


/* =========================================================
   SNOW PARTICLES
========================================================= */

function setupSnow() {

    snowLayer.innerHTML = "";


    if (
        getMapType(currentLevel) !==
        "snow"
    ) {

        return;

    }


    const count = 110;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const particle =
            document.createElement("span");

        particle.className =
            "snow-particle";


        particle.style.left =
            `${Math.random() * 100}%`;


        particle.style.top =
            `${Math.random() * 100}%`;


        particle.style.width =
            `${2 + Math.random() * 4}px`;


        particle.style.height =
            particle.style.width;


        particle.style.animationDuration =
            `${4 + Math.random() * 8}s`;


        particle.style.animationDelay =
            `${Math.random() * -8}s`;


        snowLayer.appendChild(
            particle
        );

    }

}


/* =========================================================
   RESET SAVE
========================================================= */

document
    .getElementById("resetButton")
    .addEventListener(
        "click",
        () => {

            const confirmReset =
                confirm(
                    "Reset all levels, kills and stars?"
                );


            if (
                !confirmReset
            ) {

                return;

            }


            saveData = {

                ...DEFAULT_SAVE,

                completedLevels: {},

                bestStars: {}

            };


            GAME.selectedGun =
                "gun1.png";


            saveGame();

            loadSelectedGun();

            updateDashboard();

            renderLevels();

        }
    );


/* =========================================================
   WINDOW RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        updateWorldSize();

        if (
            battleScreen.classList.contains(
                "active"
            )
        ) {

            if (
                !zooming
            ) {

                updateCameraParallax();

            } else {

                updateZoom();

            }

        }

    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

function init() {

    loadSelectedGun();

    updateDashboard();

    renderLevels();

    showScreen(homeScreen);

    crosshair.style.left =
        `${mouseX}px`;

    crosshair.style.top =
        `${mouseY}px`;

}


init();
