# Backend

Backend del **Enterprise Operations Management System**.  
Este servicio expone la API REST del sistema y concentra la lógica de negocio, seguridad, persistencia de datos y tareas en segundo plano.

El backend forma parte de una aplicación fullstack y **no está diseñado para ser utilizado de forma independiente**.

---

## Responsabilidades

- Exponer endpoints REST para los distintos dominios del sistema
- Autenticación y autorización basada en roles
- Validación de datos y reglas de negocio
- Persistencia y acceso a datos
- Ejecución de tareas programadas y scripts administrativos
- Integración con servicios externos (correo, base de datos, etc.)

---

## Stack Tecnológico

- **Node.js**
- **TypeScript**
- **Express**
- **TypeORM**
- **PostgreSQL**
- **Passport / JWT**
- **Node-cron**
- **Nodemailer**

---

## Estructura del Proyecto

```text
src/
├── auth/           # autenticación y autorización
├── config/         # configuración del sistema y variables de entorno
├── controllers/    # controladores de endpoints
├── data/           # acceso y configuración de fuentes de datos
├── entity/         # entidades del dominio (typeorm)
├── handlers/       # manejo de errores y respuestas
├── helpers/        # funciones auxiliares
├── middlewares/    # middlewares de express
├── routes/         # definición de rutas
├── scripts/        # scripts administrativos y tareas puntuales
├── services/       # lógica de negocio
├── test/           # pruebas automatizadas
├── types/          # tipos y definiciones compartidas
├── utils/          # utilidades generales
├── validations/    # validaciones de datos y esquemas
└── server.ts       # punto de entrada del servidor
```

La estructura está organizada por responsabilidad, separando claramente rutas, controladores, servicios y lógica transversal, con el objetivo de mantener un código modular, mantenible y escalable.

---

## Variables de Entorno

El backend requiere variables de entorno para su correcto funcionamiento, entre ellas:

- Conexión a base de datos
- Claves JWT
- Configuración de correo
- Entorno de ejecución (NODE_ENV)

Estas variables no se versionan y deben definirse localmente.

---

## Scripts Disponibles

- ```npm run dev``` — levanta el servidor en modo desarrollo
- ```npm run build``` — compila el proyecto
- ```npm run start``` — ejecuta la versión compilada
- ```npm run test``` — ejecuta las pruebas

Scripts adicionales para tareas administrativas y mantenimiento.

---

## Notas

Este backend está en evolución constante como parte del laboratorio técnico Dev Lab. Algunas decisiones técnicas pueden cambiar a medida que el sistema se reestructura y se incorporan mejores prácticas.

Su propósito principal es demostrativo y formativo, enfocado en arquitectura, diseño y calidad de código.
