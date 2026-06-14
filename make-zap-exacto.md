# Make.com / Zapier — Escenario EXACTO Post-Pago COCO GO

Este documento describe **exactamente** qué construir en Make.com (recomendado, más barato) o Zapier para la entrega automatizada después de la compra.

Prioridad: **menor costo posible** + confiable + fácil de mantener.

## Plataforma recomendada

- **Make.com** (antes Integromat): plan free incluye 1000 operaciones/mes — más que suficiente para empezar.
- Alternativa: Zapier Free (15 tasks/mes) o Starter.
- Si usas **Gumroad** como checkout: tiene webhooks nativos de "sale".
- Si usas **Stripe**: usa "Checkout Session Completed" + "Payment Intent Succeeded".
- Si usas Lemon Squeezy o Payhip: también tienen webhooks limpios.

## Escenario general (3-5 módulos)

### 1. Trigger: "Sale / Payment Successful"

**Make.com:**
- Webhook → "Custom webhook" (o módulo nativo de Gumroad / Stripe / Lemon).
- Copia la URL del webhook y pégala en la configuración de webhooks de tu procesador de pagos.

**Datos importantes que necesitas recibir:**
- `email` del comprador
- `name` / `full_name`
- `product_id` o `product_name` (para soportar múltiples productos en el futuro)
- `order_id` / `sale_id` (para trazabilidad)
- `created_at` o timestamp

Ejemplo de payload Gumroad (simplificado):
```json
{
  "sale_id": "abc123",
  "email": "pablo@ejemplo.com",
  "full_name": "Pablo Ompre",
  "product_name": "COCO GO Fundamentos",
  "price": 37,
  "currency": "USD"
}
```

### 2. (Opcional pero recomendado) Buscar / validar el producto

- Si vendes varios productos, agrega un filtro:
  - Solo continuar si `product_name` contiene "COCO GO" o `product_id` == "tu-id".

### 3. Enviar Email (el corazón del flujo)

**Módulo recomendado en Make:**
- "Email" → "Send an Email" (usa SMTP de Brevo / SendGrid free tier / Gmail / o el propio de Make).

**Configuración exacta:**

- **To**: `{{email}}` (del trigger)
- **Subject**: `Tu acceso a COCO GO Fundamentos ya está listo`
- **Content type**: HTML
- **HTML Body**: pega el contenido de `email-postpago.html` (el archivo que está en este repo).

**Variables que debes reemplazar en la plantilla antes de pegarla:**
- `{{nombre}}` → mapea a `full_name` o `name` del trigger (usa el primer nombre si quieres: `{{split(full_name; " ")[1]}}` o similar).
- Los links de Google Drive / Dropbox / S3:
  - Crea carpetas separadas por producto o una carpeta compartida con "anyone with the link".
  - Pega los enlaces reales en los 3 lugares de la plantilla.

**Headers recomendados (anti-spam):**
- From: `COCO GO <hola@coco-go.com>` (o el email que uses)
- Reply-To: `hola@coco-go.com`

### 4. (Opcional pero potente) Acciones post-entrega

- Agregar tag/contacto en Brevo / Mailchimp / ConvertKit (free tier).
- Enviar mensaje de bienvenida a un canal de Discord/Telegram/Slack (si tienes comunidad).
- Crear fila en Google Sheets "Ventas" (email + fecha + producto) para tracking manual.
- Incrementar contador de ventas (Google Sheets o Airtable).

### 5. Manejo de errores (importante)

- Agrega un "Error handler" al final del escenario.
- Si falla el envío de email → notificar a ti por Telegram / Email / Slack con los datos del comprador para que lo resuelvas manualmente en < 5 minutos.

## Pasos exactos para crear el escenario (Make.com)

1. Crea nuevo Scenario.
2. Agrega módulo Trigger: Webhook → Custom webhook → "Create a webhook" → copia la URL.
3. Ve a tu procesador de pagos (Gumroad/Stripe/etc) y pega esa URL en "Webhooks" / "After purchase" / "Sale events".
4. Haz una compra de prueba (usa modo sandbox o una venta de $1 si es Stripe).
5. Vuelve a Make → "Run once" y verifica que lleguen los datos correctamente.
6. Agrega módulo Email → "Send an Email".
7. Pega la plantilla HTML completa (reemplaza los links de Drive por los reales).
8. Mapea las variables:
   - Email → `email`
   - Nombre → `full_name` (o `name`)
9. Prueba completa: compra real de $1 o usa el "Test" de Make con datos ficticios.
10. Activa el scenario (toggle ON).
11. (Opcional) Agrega los módulos de "Añadir a lista" + "Google Sheets row".

## Alternativa súper simple (si no quieres webhooks todavía)

Usa **Gumroad** + su email de post-purchase nativo + adjunta o linkea los archivos directamente en Gumroad.
Luego, cuando vendas más, migra el flujo a Make para branding 100% propio (email con tu logo, copy exacto, etc.).

El escenario de Make es lo que da el "toque premium" que pide el usuario.

## Checklist antes de lanzar

- [ ] Webhook probado con venta real
- [ ] Email HTML se ve bien en Gmail + Apple Mail + Outlook (usa el archivo `email-postpago.html` y pruébalo)
- [ ] Links de descarga funcionan y no expiran (usa "anyone with the link" o pre-signed URLs)
- [ ] Error handler configurado + notificación a ti
- [ ] Test completo: comprar → esperar email → abrir links
- [ ] Guardar el scenario con nombre claro: "COCO GO - Post-pago Fundamentos v1"

## Notas de costo

- Make free: ~1000 ops/mes → decenas de ventas por mes sin problema.
- Brevo (ex Sendinblue) free: 300 emails/día → más que suficiente.
- Google Drive: gratis para archivos pequeños/medianos.
- Total real: $0 hasta que escales fuerte.

---

Este documento + `email-postpago.html` + `index.html` cumplen con los 3 entregables solicitados (HTML sales page, email post-pago, Zap/Make exacto) en el orden decidido (primero infraestructura GitHub + página, luego los assets de entrega).

Cuando quieras cambiar precio, links, copy o agregar más productos, todo está centralizado aquí.
