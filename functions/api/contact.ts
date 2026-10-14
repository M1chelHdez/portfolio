
interface Env {
  RESEND_API_KEY: string;
  CONTACT_TO: string;
}

interface ContactMessage {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  website?: string;
}

function jsonResponse(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export const onRequestPost: PagesFunction<Env> = async ({
  request,
  env,
}) => {
  if (!env.RESEND_API_KEY || !env.CONTACT_TO) {
    return jsonResponse(
      { message: "El servicio de contacto no está configurado." },
      500,
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return jsonResponse({ message: "Formato no válido." }, 415);
  }

  let data: ContactMessage;

  try {
    data = await request.json() as ContactMessage;
  } catch {
    return jsonResponse({ message: "No se pudo leer el mensaje." }, 400);
  }

  // Campo trampa para bots. Debe permanecer vacío.
  if (data.website) {
    return jsonResponse({ message: "Solicitud no válida." }, 400);
  }

  const name = data.name?.trim() ?? "";
  const email = data.email?.trim() ?? "";
  const subject = data.subject?.trim() ?? "";
  const message = data.message?.trim() ?? "";

  if (
    name.length < 2 ||
    name.length > 100 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    subject.length < 3 ||
    subject.length > 150 ||
    message.length < 10 ||
    message.length > 5000
  ) {
    return jsonResponse(
      { message: "Revisa los campos e inténtalo nuevamente." },
      400,
    );
  }

  const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]!);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portafolio <onboarding@resend.dev>",
        to: [env.CONTACT_TO],
        reply_to: email,
        subject: `[Portafolio] ${subject}`,
        text: [
          `Nombre: ${name}`,
          `Correo: ${email}`,
          `Asunto: ${subject}`,
          "",
          "Mensaje:",
          message,
        ].join("\n"),
        html: `
          <h2>Nuevo mensaje desde tu portafolio</h2>
          <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
          <p><strong>Correo:</strong> ${escapeHtml(email)}</p>
          <p><strong>Asunto:</strong> ${escapeHtml(subject)}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
        `,
      }),
    });

    if (!response.ok) {
      // No registrar la API Key ni el contenido privado del mensaje.
      console.error("Resend rechazó el envío. Estado:", response.status);

      return jsonResponse(
        { message: "No se pudo enviar el mensaje. Inténtalo más tarde." },
        502,
      );
    }

    return jsonResponse({
      message: "Tu mensaje se envió correctamente.",
    });
  } catch {
    return jsonResponse(
      { message: "Error de conexión. Inténtalo más tarde." },
      502,
    );
  }
};
