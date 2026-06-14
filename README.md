# COCO GO Marketing — Venta Directa & Fundamentos

Repositorio público para el sitio de marketing y conversión de **COCO GO**.

- **Sitio publicado (gratis):** https://coco-go.github.io/coco-go-marketing/
- Hosting: GitHub Pages (sin costo).
- Actualizaciones: edita `index.html` (o agrega assets) y haz push a `main`. Pages se actualiza en ~30-90 segundos.

## Orden de ejecución (esta sesión)

1. Repos creados con PAT temporal (coco-go-marketing público + coco-go-producto privado).
2. Este sitio de ventas (HTML standalone de alta conversión).
3. Email post-pago exacto (ver `email-postpago.html`).
4. Automatización Make/Zapier exacta (ver `make-zap-exacto.md`).

Todo con el **menor costo posible**: GitHub Pages + herramientas free tier (Gumroad/Lemon + Make free o Zapier free tier).

## Dominio propio (cuando quieras)

Opción recomendada de bajo costo:
- Compra un dominio barato (.com / .io / .go si disponible) en Namecheap, Porkbun o Google Domains (~8-12 USD primer año).
- En GitHub → Settings → Pages → Custom domain: escribe `www.tudominio.com` o `tudominio.com`.
- En tu registrador agrega:
  - Para apex: registros A apuntando a las IPs de GitHub Pages (ver docs).
  - O simplemente usa subdominio `go.tudominio.com` con CNAME `COCO-GO.github.io`.
- Agrega un archivo `CNAME` en la raíz de este repo con el dominio (ej: `coco-go.com`).

Por ahora usamos la URL gratuita de GitHub Pages (suficiente y profesional).

## Estructura actual

- `index.html` — Landing / página de ventas completa (Tailwind vía CDN, mobile-first, lista para convertir).
- `email-postpago.html` — Plantilla lista para copiar al escenario de automatización (HTML email responsive).
- `make-zap-exacto.md` — Especificación paso a paso exacta para Make.com o Zapier (trigger de pago → email con assets).

## Flujo post-pago (resumen)

1. Usuario compra en Gumroad / Stripe / Lemon Squeezy (o la plataforma que uses).
2. Webhook / evento de "sale" llega a Make o Zapier.
3. Escenario busca el email del comprador + producto.
4. Envía email con la plantilla de este repo + links de descarga (Drive, Dropbox, S3 pre-firmado, o lo que uses).
5. (Opcional) agrega tag en lista de correo (Brevo/Mailchimp free), invita a canal, etc.

Todo está documentado en `make-zap-exacto.md`.

## Cómo actualizar el sitio

```bash
# Clona o trabaja local
git clone https://github.com/COCO-GO/coco-go-marketing.git
cd coco-go-marketing

# Edita index.html (o agrega imágenes en /assets si decides)
git add .
git commit -m "feat: nuevo headline + testimonial"
git push
# Espera 1 minuto y recarga https://coco-go.github.io/coco-go-marketing/
```

## Notas de costo (prioridad del usuario)

- Hosting de la landing: $0 (GitHub Pages).
- Email automation: Make free tier (o Zapier free) + cuenta SMTP gratis (Brevo / Gmail) o la propia de Gumroad.
- Archivos del producto: Google Drive (gratis) o Dropbox con link "cualquiera con el enlace".
- Dominio propio: opcional, aplazado hasta que vendas lo suficiente (prioridad: cero gasto ahora).

## Repos relacionados

- Público (este): `coco-go-marketing` → sitio + plantillas de marketing y entrega.
- Privado: `coco-go-producto` → fuente de verdad de los archivos que se entregan post-pago (PDFs masters, plantillas .xlsx, etc.). No exponer nunca.

---

**Usa el PAT solo en esta sesión.** Revócalo después desde GitHub → Settings → Developer settings → Personal access tokens.

COCO GO — Fundamentos que generan resultados.
