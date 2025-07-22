import { verificationCodes } from "../send-verification-code/route"

export async function POST(req: Request) {
  const { email, code } = await req.json()

  if (!email || !code) {
    return new Response(JSON.stringify({ error: "Email e código são obrigatórios." }), { status: 400 })
  }

  const storedData = verificationCodes.get(email)

  if (!storedData) {
    return new Response(JSON.stringify({ error: "Código não encontrado ou expirado." }), { status: 400 })
  }

  if (Date.now() > storedData.expiresAt) {
    verificationCodes.delete(email)
    return new Response(JSON.stringify({ error: "Código expirado. Solicite um novo código." }), { status: 400 })
  }

  if (storedData.code !== code) {
    return new Response(JSON.stringify({ error: "Código inválido." }), { status: 400 })
  }

  // Código válido - remover da memória
  verificationCodes.delete(email)

  return new Response(JSON.stringify({ message: "Código verificado com sucesso!" }), { status: 200 })
}
