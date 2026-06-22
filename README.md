# 🐑 Pastor Caótico

**Autor:** Agustín Minetti  
**Materia:** Desarrollo Tecnologico 2
**Año:** 2026

---

## 📖 Descripción
Pastor Caótico es un videojuego top-down de acción y arcade desarrollado con Phaser 4.  
Controlás a Rex, un perro que debe arrear a su rebaño dentro del corral antes de que una tormenta eléctrica o un lobo feroz acabe con las ovejas.

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
Empujá a las ovejas dentro del corral mordiéndolas antes de que se acabe el tiempo, los rayos las fulminen o que el lobo se las coma. Completá los 3 niveles con al menos 1 vida para ganar.

---

## ⚙️ Mecánicas principales
- **Morder ovejas:** al colisionar con una oveja, Rex la empuja en la dirección en que se mueve.
- **Rayos:** caen en posiciones fijas con advertencia visual previa (círculo rojo parpadeante).
- **Cooldown de mordisco:** cada oveja tiene un cooldown de 2 segundos para no perder puntos continuamente.

---
## 📊 Sistema de puntos y vidas

### Suma puntos
- Oveja metida al corral: **+100 pts**
- Recoger paraguas (☂️): **+20 pts**
- Recoger casco (⛑️): **+30 pts**

### Resta puntos
- Morder oveja fuera del corral: **-50 pts**
- Oveja fulminada por rayo: **-100 pts**
- Oveja comida por el lobo (nivel 3): **-75 pts**

### Resta vidas
- Rex alcanzado por un rayo: **-1 vida**
- Rex tocado por el lobo (nivel 3): **-1 vida**

### Game Over
- Si Rex llega a 0 vidas en cualquier nivel.
- Si no se salvan las ovejas necesarias antes de que se acabe el tiempo.

---

## 🗺️ Niveles

### Nivel 1 — Campo Abierto ⚡
- **Ovejas:** 5 (hay que salvar 3)
- **Tiempo:** 60 segundos
- **Peligros:** rayos cada 5 segundos
- **Objetivo:** meter 4 ovejas al corral

### Nivel 2 — Granja con Obstáculos 🌧
- **Ovejas:** 6 (hay que salvar 4)
- **Tiempo:** 75 segundos
- **Peligros:** rayos cada 3 segundos, charcos que ralentizan a Rex
- **Objetivo:** meter 5 ovejas al corral

### Nivel 3 — Tormenta Total 🐺
- **Ovejas:** 9 (hay que salvar 5)
- **Tiempo:** 90 segundos
- **Peligros:** rayos cada 2 segundos + el Lobo
- **Objetivo:** meter 5 ovejas al corral y sobrevivir al Lobo

---

## 🐺 NPCs
### Ovejas
- Se mueven de forma errática y huyen de Rex cuando se acerca.
- Al ser mordidas reciben un impulso en la dirección del movimiento de Rex.
- Al entrar al corral quedan protegidas y muestran su sprite de "salvada".
- Si un rayo cae sobre ellas, muestran su sprite de "fulminada" y se pierden puntos.

### El Lobo (Nivel 3)
- NPC enemigo no controlado por el jugador.
- Patrulla el mapa y persigue ovejas o a Rex si están cerca.
- Si toca a Rex: **-1 vida** (con cooldown de 1 segundo).
- Si alcanza a una oveja: la elimina y resta **-75 pts**.
- No puede ser eliminado.
- Tiene un aura roja visible para advertir su peligro.

---

## 🛠️ Tecnologías utilizadas

- [Phaser 4] — motor de videojuegos
- JavaScript ES6+
- Tiled — editor de mapas
- Visual Studio Code
- Git + GitHub
- GitHub Pages 
- ClaudeAi

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