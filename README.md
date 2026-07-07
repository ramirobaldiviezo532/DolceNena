# Dolce Nena by Andrea — sitio web

Sitio estático (HTML/CSS/JS puro, sin build). Primer avance: hero de marca con la
imagen de Dolce Nena, nav y sección de catálogo con contenido de relleno
(lorem ipsum) para definir la estructura.

## Estructura

```
dolce-nena-site/
├── index.html
├── css/style.css
├── js/script.js
└── assets/
    ├── hero.jpg          ← imagen hero (la que compartiste)
    └── favicon-*.png     ← ícono recortado del monograma DN
```

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (público, o privado si tienes plan Pro).
2. Sube el **contenido de esta carpeta** a la raíz del repo (no la carpeta
   `dolce-nena-site` en sí, sino lo que hay adentro: `index.html`, `css/`, `js/`, `assets/`).
   - Vía web: "Add file → Upload files" y arrastra todo.
   - Vía terminal:
     ```bash
     cd dolce-nena-site
     git init
     git add .
     git commit -m "Primer avance: hero Dolce Nena"
     git branch -M main
     git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
     git push -u origin main
     ```
3. En el repo, ve a **Settings → Pages**.
4. En "Build and deployment", selecciona **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
5. Guarda. En un par de minutos el sitio queda publicado en
   `https://TU-USUARIO.github.io/TU-REPO/`.

## Qué falta (próximos pasos)

- Reemplazar las 6 tarjetas GT1–GT6 con fotos y textos reales de cada galleta.
- Lógica de "Armar tu pack": selector de cantidades por tipo de galleta y
  cálculo automático del descuento (3 → 10%, 5 → 12%, 8 → 15%).
- Conectar los botones "WhatsApp · Comprar" para que abran `wa.me` con el
  mensaje predeterminado del pedido (Caso 1: galleta suelta / Caso 2: pack armado),
  y luego redirijan fuera de la página como indica el diagrama de flujo.
- Contenido real de "Nosotros" y datos de contacto en el footer.
