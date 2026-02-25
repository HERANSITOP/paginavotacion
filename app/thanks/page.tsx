import LogoutButton from "@/components/LogoutButton";

export default function ThanksPage() {
  return (
    <div className="card">
      <span className="thanks-icon">🗳️</span>
      <h1>¡Voto registrado!</h1>
      <p>Tu participación ha sido registrada correctamente. Gracias por votar.</p>
      <LogoutButton />
    </div>
  );
}
