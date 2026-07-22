# Keeper Go

Aplicación móvil para el acompañamiento en salud mental con enfoque preventivo, inclusivo y equitativo, utilizando tecnologías emergentes para generar un impacto social significativo.

---

## Tabla de Contenidos

- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Tecnologías](#-tecnologías)
- [Equipo](#-equipo)
- [Licencia](#-licencia)

---

## Requisitos

- Node.js (v18 o superior)
- npm o yarn
- Expo CLI
- Cuenta de Firebase

---

## Instalación

Clonar el repositorio e instalar dependencias:

```bash
git clone https://github.com/lyan-dev-mm/KeeperGo-App.git
cd KeeperGo-App
npm install
```

# Configuración de Firebase
1. Crear un proyecto en Firebase Console

2. Agregar una app para Android y otra para iOS

3. Descargar los archivos de configuración:

* google-services.json (Android)

* GoogleService-Info.plist (iOS)

4. Colocar ambos archivos en la raíz del proyecto

5. Ejecutar la aplicación
```bash
npx expo start
```
6. Escanear el código QR con Expo Go (Android/iOS)

* Presionar w para abrir en navegador

# Estructura del Proyecto
```text
KeeperGo-App/
├── app/                          # Navegación principal (Expo Router)
│   ├── (auth)/                   # Pantallas de autenticación
│   ├── (tabs)/                   # Pantallas principales
│   └── _layout.jsx               # Layout raíz
│
├── src/
│   ├── domain/                   # Modelos y lógica de negocio
│   │   ├── entities/             # Entidades del sistema
│   │   ├── usecases/             # Casos de uso
│   │   └── repositories/         # Interfaces de repositorios
│   │
│   ├── data/                     # Implementación de repositorios
│   │   └── repositories/
│   │
│   ├── presentation/             # Componentes, contextos y hooks
│   │   ├── components/
│   │   ├── contexts/
│   │   └── hooks/
│   │
│   └── infrastructure/           # Servicios externos
│       ├── firebase/
│       ├── api/
│       └── storage/
│
├── constants/                    # Constantes globales
├── assets/                       # Recursos (imágenes, fuentes, animaciones)
├── app.json                      # Configuración de Expo
├── package.json                  # Dependencias
└── tsconfig.json                 # Configuración de TypeScript
```
# Tecnologías

| Tecnología           | Versión | Propósito                                    |
|----------------------|---------|----------------------------------------------|
| **Expo**             | SDK 54  | Framework para React Native                  |
| **React Native**     | 0.81.0  | Desarrollo multiplataforma                   |
| **React**            | 19.1.0  | Interfaz de usuario                          |
| **Firebase**         | 19.x    | Autenticación, base de datos, notificaciones |
| **Expo Router**      | 3.x     | Navegación basada en archivos                |
| **React Navigation** | 6.x     | Navegación entre pantallas                   |
| **TypeScript**       | 5.x     | Tipado estático                              |

# Equipo
* Lyan	- Desarrollador
* Juan Francisco	- Desarrollador
* Mariel - Desarrolladora
* Manuel - Desarrollador
* M.A  - Desarrollador

# Licencia
Proyecto desarrollado con fines académicos.
