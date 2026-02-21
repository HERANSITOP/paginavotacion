<div class="card">
    <div class="title-row">
        <h1>Votación UNAL</h1>
        <a
            class="github-link"
            href="https://github.com/unalvotacion/paginavotacion"
            target="_blank"
            rel="noopener noreferrer"
        >GitHub</a>
        <button type="button" class="disclaimer-badge" id="open-disclaimer">(DISCLAIMER)</button>
    </div>
    {{ERROR}}
    <section class="results-section">
        <h2>Resultados</h2>
        {{RESULTS}}
    </section>
    <p>Inicia sesión con tu correo @unal.edu.co para votar.</p>
    <a href="/auth/google" class="btn">Iniciar con Google</a>
    <p class="support-note">Si ves algún problema, por favor escribe a <a href="mailto:unalvotacion@proton.me">unalvotacion@proton.me</a>.</p>
</div>

<div class="modal-backdrop" id="disclaimer-modal" role="dialog" aria-modal="true" aria-labelledby="disclaimer-title">
    <div class="modal-card">
        <div class="modal-header">
            <h2 id="disclaimer-title">DISCLAIMER LEGAL</h2>
            <button type="button" class="modal-close" id="close-disclaimer" aria-label="Cerrar">x</button>
        </div>
        <div class="modal-body">
            <p><strong>1. Carácter no vinculante:</strong> Los resultados de esta votación tienen carácter exclusivamente informativo y no constituyen, por sí mismos, una decisión oficial sobre el mecanismo a adoptar, salvo validación expresa en asamblea.</p>
            <p><strong>2. No afiliación institucional:</strong> Este sitio web es una iniciativa independiente y no está afiliado, administrado, respaldado ni representa oficialmente a la Universidad Nacional de Colombia.</p>
            <p><strong>3. Uso voluntario:</strong> La participación en esta plataforma es voluntaria y su utilización implica la aceptación de este aviso.</p>
            <p><strong>4. Disponibilidad del servicio:</strong> No se garantiza la disponibilidad continua, ausencia de errores o ininterrupción del servicio.</p>
            <p><strong>5. Contacto:</strong> Para reportes o incidencias, escribir a <a href="mailto:unalvotacion@proton.me">unalvotacion@proton.me</a>.</p>
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-modal" id="accept-disclaimer">Entendido</button>
        </div>
    </div>
</div>

<script>
    (function () {
        var modal = document.getElementById('disclaimer-modal');
        var openBtn = document.getElementById('open-disclaimer');
        var closeBtn = document.getElementById('close-disclaimer');
        var acceptBtn = document.getElementById('accept-disclaimer');

        function openModal() {
            modal.classList.remove('is-hidden');
        }

        function closeModal() {
            modal.classList.add('is-hidden');
        }

        openBtn.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);
        acceptBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });
    })();
</script>
