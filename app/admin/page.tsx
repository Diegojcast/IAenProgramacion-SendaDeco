export default function AdminHomePage() {
  return (
    <div className="max-w-lg space-y-2">
      <h1 className="font-serif text-2xl font-semibold">Panel administración</h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Área reservada para gestión de pedidos y catálogo. La interfaz y las APIs
        protegidas se implementarán en una siguiente iteración; la lógica de
        negocio vive en <code className="text-xs bg-muted px-1 rounded">/lib</code> y los tipos en{" "}
        <code className="text-xs bg-muted px-1 rounded">/types</code>.
      </p>
    </div>
  )
}
