import LogoutButton from "@/components/LogoutButton";

export default function BlockedPage() {
  return (
    <div className="card banner blocked">
      <h2>No puedes votar</h2>
      <p>
        No puedes votar ya que no te encuentras en la región de Antioquia. Si tienes
        un VPN desactívalo y presiona{" "}
        <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>.
      </p>
      <div className="blocked-actions">
        <a href="/vote" className="btn">
          Intentar nuevamente
        </a>
        <LogoutButton variant="ghost" />
      </div>
    </div>
  );
}
