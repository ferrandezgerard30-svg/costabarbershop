# La Costa Barbershop — sitio web

Web estática (HTML + CSS + JS puro, **sin librerías ni CDNs**, funciona offline) para
**La Costa Barbershop**, Fuengirola. Lista para publicar en GitHub Pages, Netlify o cualquier hosting.

## Estructura
```
index.html          Inicio (héroe, servicios, showcase, trabajos, reseñas, nosotros, cómo llegar)
servicios.html      Carta completa de precios
galeria.html        Galería (mosaico + lightbox + filtro)
contacto.html       Contacto, cómo llegar y horario
assets/css/main.css Estilos y tokens de diseño
assets/js/main.js   Animaciones (preloader, cursor, reveals, carruseles, tilt, etc.)
assets/fonts/       Tipografías locales (Anton + Archivo)
assets/img/         Imágenes .webp, favicon y og:image
.nojekyll           Evita el procesado Jekyll en GitHub Pages
```

## Publicar en 3 pasos (GitHub Pages)
1. Crea un repositorio nuevo en GitHub y sube **todo el contenido de esta carpeta** (no la carpeta, su interior).
2. En el repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/root`. Guarda.
3. Espera 1–2 min. Tu web estará en `https://TU-USUARIO.github.io/TU-REPO/`.

> Alternativa aún más rápida: arrastra la carpeta a **app.netlify.com/drop**.

## Editar los datos (buscar y reemplazar)
Todo el texto está en los `.html`. Para cambiar datos, usa buscar/reemplazar:

| Qué cambiar        | Busca esto                                   |
| ------------------ | -------------------------------------------- |
| Teléfono           | `628170672` (y `628&nbsp;17&nbsp;06&nbsp;72`)|
| Instagram          | `lacostabarbershop2024`                      |
| Dirección          | `Jes&uacute;s Cautivo, 5`                     |
| Valoración/reseñas | `5,0` y `239`                                |
| Precios            | están en `servicios.html`                    |
| Horario            | busca `data-hours` en `index.html`/`contacto.html` |

### Añadir o cambiar reseñas
En `index.html`, sección `id="resenas"`, duplica un bloque `<article class="review">…</article>`
y cambia el texto, el nombre y la inicial del avatar.

### Cambiar imágenes
Sustituye los archivos en `assets/img/` manteniendo el **mismo nombre** (`.webp` recomendado).
Para regenerar el `og:image` o el favicon, reemplaza `og.jpg` / `favicon-*.png` por los tuyos.

## Notas
- Respeta `prefers-reduced-motion` (versión con menos movimiento) y funciona sin JS.
- El enlace de reservas de **Booksy** no estaba disponible públicamente: los botones usan
  teléfono e Instagram. Cuando tengas la URL de Booksy, añádela como `href` en los botones
  “Reservar” / tarjeta “Booksy”.
