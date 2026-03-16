---
description: Configuración y accesos rápidos para el tablero Trello de InscribCórdoba
---

# Trello InscribCórdoba - Guía de Referencia Técnica

Este repositorio de configuración permite el acceso inmediato a los identificadores críticos del tablero del proyecto.

## 📋 Información General
- **Nombre del Tablero:** InscribCórdoba
- **ID del Tablero:** `68c17b5877d8df9f2dad244a`
- **Organización ID:** `67ef0ba5ebdc8bf0594379ba`

## 📑 Listas (Columnas) - IDs Rápidos
Utilice estos IDs para consultas directas sobre las tarjetas:

- **Backlog / Requerimientos:** `68c17b67719c6c401962ed6b`
- **Sprint 2 [64h / 80h]:** `69b18d7dc10ef532b2adce60`
- **Sprint 1 - En Curso:** `68c17b7a404feb8f1a843e76`
- **Sprint 1 - En QA:** `6915fea90fb641ee6dedb0fa`
- **En Producción:** `68c1835102ee116b60a2122f`
- **Documentos Terminados:** `691f02e0ac8db5dbad227851`

## 🔑 Credenciales
Las credenciales de API se encuentran gestionadas centralmente en:
`C:\Users\chris\.gemini\settings.json`

> **Nota para el Agente:** Siempre valida primero los IDs en este archivo antes de realizar llamadas genéricas a la API de Trello para ahorrar tokens y tiempo de respuesta.

## 📍 Acciones Frecuentes
1. **Analizar Backlog:** `GET /lists/68c17b67719c6c401962ed6b/cards`
2. **Ver Sprint Actual:** `GET /lists/69b18d7dc10ef532b2adce60/cards`
3. **Mover a Producción:** `PUT /cards/{id}?idList=68c1835102ee116b60a2122f`

## Cuando te pida actualizar el tablero de trello debes hacer lo siguiente:

- En el titulo busca la parte donde dice por ejemplo [Est: 12h] y le pongas por ejemplo la hora real "[Real: 8h]"correcta, lo demás del titulo debe quedar igual. 

- Al final de la descripción de la tarjeta debes colocar: tiempo que llevó aplicar los cambios, espeficación de los cambios realizados, pruebas necesarias para el personal de QA. 

- En comentario debes agregar el commit que la vincula. 
