import { RegisterForm } from "@/components/register-form"

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Crear Cuenta</h1>
        {/*<RegisterForm />*/}
        <h3 className="text-3xl text-red-600 font-bold text-center mb-8">Los registros estan deshabilitados</h3>
      </div>
    </div>
  )
}
