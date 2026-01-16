# GPS – Business Process Management System

GPS (Gestión de Procesos de Software) Business Process Management System es un sistema full-stack de gestión empresarial diseñado para centralizar y digitalizar procesos internos críticos de una organización, con énfasis en recursos humanos, gestión de maquinaria, inventario y registro de operaciones.

Este proyecto forma parte del repositorio **Dev Lab** y corresponde a una reimplementación individual basada en un sistema académico desarrollado originalmente en equipo, con el objetivo de profundizar en decisiones arquitectónicas, calidad de código y buenas prácticas de ingeniería de software.

---

## 🎯 Propósito del Sistema

El objetivo principal de GPS es ofrecer una plataforma modular que permita:

- Digitalizar procesos operativos que normalmente se gestionan de forma manual o en planillas
- Centralizar información dispersa entre distintas áreas de la empresa
- Mejorar la trazabilidad, control y consistencia de los datos
- Facilitar la toma de decisiones mediante información estructurada

El dominio del sistema está inspirado en un entorno empresarial real, con especial foco en empresas de rubro operativo (construcción, logística, servicios).

---

## 🧩 Dominios Funcionales

El sistema está organizado en módulos independientes pero interoperables:

### Recursos Humanos

- Gestión de trabajadores
- Historial laboral y trazabilidad de cambios
- Contratos y documentación asociada
- Gestión de bonos, licencias y permisos
- Cálculo y visualización de remuneraciones

### Gestión de Maquinaria

- Registro y administración de maquinaria
- Órdenes de trabajo
- Estados de pago
- Historial de mantenciones
- Control de disponibilidad y costos

### Inventario y Operaciones

- Gestión de productos
- Control de entradas y salidas de inventario
- Registro de ventas y compras
- Relación entre inventario, clientes y proveedores

### Seguridad y Acceso

- Autenticación basada en JWT
- Control de acceso por roles
- Separación clara de permisos según responsabilidades

---

## 🏗️ Arquitectura General

Business Process Management System sigue una arquitectura **modular**, orientada a separar responsabilidades y reducir el acoplamiento entre dominios.

Principios clave:

- Separación entre lógica de negocio y capa de presentación
- Modularización por dominio funcional
- Validaciones de datos consistentes
- Persistencia centralizada
- Control de acceso transversal al sistema

La arquitectura fue diseñada para permitir:

- Evolución independiente de módulos
- Escalabilidad funcional
- Facilidad de mantenimiento

---

## 🧪 Contexto Académico y Reimplementación

El sistema original fue desarrollado como un proyecto académico grupal, siguiendo una metodología iterativa–incremental, con módulos asignados a distintos integrantes del equipo.

Esta versión corresponde a una **reimplementación individual** cuyo objetivo es:

- Reevaluar las decisiones técnicas originales
- Aplicar prácticas de desarrollo actuales
- Mejorar estructura, legibilidad y mantenibilidad del código
- Profundizar en aspectos de arquitectura y diseño
- Utilizar el sistema como laboratorio técnico dentro de *Dev Lab*

No se busca replicar exactamente el proyecto original, sino reinterpretarlo desde una perspectiva individual.

---

## 📚 Documentación

Cada módulo del sistema cuenta (o contará) con documentación que responde a:

- ¿Qué problema resuelve?
- ¿Por qué se implementó de esta forma?
- ¿Qué decisiones técnicas se tomaron?
- ¿Qué alternativas fueron descartadas y por qué?

La documentación es parte fundamental del proyecto,
no un complemento posterior.

---

## 🚫 Alcance del Proyecto

Este proyecto **no pretende** ser:

- Un sistema productivo listo para despliegue comercial
- Un tutorial paso a paso
- Un monolito cerrado
- Un simple CRUD sin contexto

Su propósito es **demostrativo, exploratorio y formativo**.

---

## 📌 Estado del Proyecto

En evolución activa dentro del laboratorio técnico *Dev Lab*. Algunos módulos pueden encontrarse en distintas etapas de madurez, lo cual es intencional y forma parte del enfoque experimental del repositorio.
