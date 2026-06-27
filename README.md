# 🐑 Pastor Caótico

**Autor:** Agustín Minetti  
**Materia:** Desarrollo Tecnológico 2  
**Año:** 2026

---

## 📖 Descripción

Pastor Caótico es un videojuego top-down de acción y arcade desarrollado con Phaser 3.  
Controlás a Rex, un perro ovejero que debe arrear a su rebaño dentro del corral antes de que una tormenta eléctrica fulmine a las ovejas o un lobo feroz se las coma.

---

## 💡 Concepto — "Está mal, pero no tan mal"

La acción principal del jugador es **morder a las ovejas** para empujarlas hacia el corral.  
Morder a un animal está mal. Pero en este contexto, es la única forma de moverlas antes de que los rayos las fulminen o el lobo se las coma.  
**Está mal morderlas... pero no tan mal si con eso las salvás.**

---

## 🎮 Controles

| Acción | Tecla |
|--------|-------|
| Mover arriba | `W` / `↑` |
| Mover abajo | `S` / `↓` |
| Mover izquierda | `A` / `←` |
| Mover derecha | `D` / `→` |
| Morder oveja | Colisión automática al tocarla |

---

## 🎯 Objetivo

Empujá a las ovejas dentro del corral mordiéndolas antes de que se acabe el tiempo, los rayos las fulminen o el lobo se las coma. Completá los 3 niveles con al menos 1 vida para ganar.

---

## ⚙️ Mecánicas principales

- **Morder ovejas:** al colisionar con una oveja, Rex la empuja en la dirección en que se mueve.
- **Rayos:** caen en posiciones fijas con advertencia visual previa (círculo rojo parpadeante). Si movés la oveja antes de que caiga el rayo, se salva.
- **Corral:** zona segura donde las ovejas quedan protegidas de los rayos y el lobo.
- **Charcos (nivel 2):** ralentizan a Rex al 40% de su velocidad durante 2 segundos al pisarlos.
- **Cooldown de mordisco:** cada oveja tiene un cooldown de 2 segundos para no perder puntos continuamente.

---

## 📊 Sistema de puntos y vidas

### ✅ Suma puntos
- Oveja metida al corral: **+100 pts**
- Recoger paraguas (☂️): **+20 pts**
- Recoger casco (⛑️): **+30 pts**

### ❌ Resta puntos
- Morder oveja fuera del corral: **-10 pts** (cooldown 2 seg)
- Morder oveja dentro del corral: **-30 pts** (cooldown 2 seg)
- Oveja fulminada por rayo: **-50 pts**
- Oveja comida por el lobo (nivel 3): **-75 pts**

### 💔 Resta vidas
- Rex alcanzado por un rayo: **-1 vida**
- Rex tocado por el lobo (nivel 3): **-1 vida** (cooldown 1 seg)

### 💀 Game Over
- Si Rex llega a 0 vidas en cualquier nivel.
- Si no se salvan las ovejas necesarias antes de que se acabe el tiempo.

---

## 🗺️ Niveles

### Nivel 1 — Campo Abierto ⚡
Campo verde abierto con el corral en la esquina superior derecha. Sin obstáculos internos.
- **Ovejas:** 5 (hay que salvar 4)
- **Tiempo:** 60 segundos
- **Peligros:** rayos cada 5 segundos
- **Objetivo:** meter 4 de 5 ovejas al corral

### Nivel 2 — Granja con Obstáculos 🌧
Granja con charcos que ralentizan a Rex. Corral en la zona central derecha.
- **Ovejas:** 7 (hay que salvar 5)
- **Tiempo:** 75 segundos
- **Peligros:** rayos cada 3 segundos, charcos que ralentizan a Rex
- **Objetivo:** meter 5 de 7 ovejas al corral

### Nivel 3 — Tormenta Total 🐺
Campo con obstáculos y el corral en la esquina inferior izquierda. El lobo patrulla sin descanso.
- **Ovejas:** 9 (hay que salvar 5)
- **Tiempo:** 90 segundos
- **Peligros:** rayos cada 2 segundos + el Lobo
- **Objetivo:** meter 5 de 9 ovejas al corral y sobrevivir al Lobo

---

## 🐾 NPCs

### Ovejas
- Se mueven de forma errática y huyen de Rex cuando se acerca a menos de 70px.
- Al ser mordidas reciben un impulso en la dirección del movimiento de Rex.
- Al entrar al corral quedan protegidas y muestran su sprite de "salvada".
- Si un rayo cae sobre ellas, muestran su sprite de "fulminada" y se pierden puntos.
- Cada oveja tiene un cooldown de 2 segundos para no descontar puntos continuamente.

### 🐺 El Lobo (Nivel 3)
El Lobo es el único NPC no controlado por el jugador en el último nivel.
- Patrulla el mapa con IA propia y actualiza su objetivo cada 2.5 segundos.
- Persigue la oveja más cercana a menos de 200px, o a Rex si está más cerca.
- Si toca a Rex: **-1 vida** (con cooldown de 1 segundo para no descontar continuamente).
- Si alcanza a una oveja: la elimina del mapa y resta **-75 pts** al jugador.
- No puede ser eliminado ni detenido por el jugador.
- Tiene un aura roja visible para advertir su presencia y peligro.

---

## 🌐 Link al juego publicado
(https://agustin-minetti.github.io/-Trabajo-pr-ctico---Medio-termino/)

---

## 🚀 Cómo ejecutar el juego localmente

1. Cloná el repositorio:
```bash
git clone https://github.com/Agustin-Minetti/-Trabajo-pr-ctico---Medio-termino.git
```
2. Abrí la carpeta en Visual Studio Code
3. Instalá la extensión **Live Server**
4. Click derecho en `index.html` → **Open with Live Server**
5. El juego se abre automáticamente en el navegador

---

## 🛠️ Tecnologías utilizadas

- [Phaser 4](https://phaser.io/) — motor de videojuegos HTML5
- JavaScript ES6+
- [Tiled](https://www.mapeditor.org/) — editor de mapas
- Visual Studio Code + Live Server
- Git + GitHub
- GitHub Pages — despliegue

---

## 📁 Estructura del proyecto

```
-TRABAJO-PRACTICO---MEDIO-TERMINO/
├── index.html
├── README.md
├── src/
│   ├── main.js
│   ├── scenes/
│   │   ├── MenuScene.js
│   │   ├── Level1Scene.js
│   │   ├── Level2Scene.js
│   │   ├── Level3Scene.js
│   │   ├── GameOverScene.js
│   │   └── VictoryScene.js
│   └── utils/
│       └── ScoreManager.js
├── assets/
│   ├── sprites/
│   │   ├── perro.png
│   │   ├── oveja.png
│   │   └── lobo.png
│   └── tilemaps/
│       ├── tilemap.png
│       ├── level1.json
│       ├── level1.tmx
│       ├── level2.json
│       ├── level2.tmx
│       ├── level3.json
│       └── level3.tmx
└── docs/
    └── GDD_PastorCaotico.docx
```