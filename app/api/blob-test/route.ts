import { NextResponse } from "next/server"
import { put, list } from "@vercel/blob"

export async function GET() {
  try {
    // Intentar listar los blobs para verificar la conexión
    const blobs = await list()

    return NextResponse.json({
      success: true,
      message: "Conexión con Vercel Blob establecida correctamente",
      blobCount: blobs.blobs.length,
      hasMore: blobs.hasMore,
    })
  } catch (error) {
    console.error("Error al conectar con Vercel Blob:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al conectar con Vercel Blob",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    // Crear un pequeño blob de prueba
    const testBlob = await put("test/connection-test.txt", "Este es un archivo de prueba para verificar la conexión", {
      access: "public",
    })

    return NextResponse.json({
      success: true,
      message: "Blob de prueba creado correctamente",
      url: testBlob.url,
    })
  } catch (error) {
    console.error("Error al crear blob de prueba:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear blob de prueba",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
