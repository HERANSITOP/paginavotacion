# Votación UNAL

Plataforma para votar sobre mecanismos asamblearios. Solo pueden participar personas con correo @unal.edu.co y que se conecten desde Antioquia.

---

## ¿Qué hace esta plataforma?

- Los usuarios inician sesión con su correo de Google (@unal.edu.co).
- Pueden elegir entre 5 opciones de mecanismo (Anormalidad académica, Asamblea escalonada, Asamblea permanente, Paro, Normalidad).
- Solo se permite votar si la conexión proviene de Antioquia.
- Los resultados se muestran en la página principal para todos.
- **El voto es anónimo:** En los resultados no se muestra quién votó por qué opción. Solo se guarda un hash irreversible del correo para evitar votos duplicados. Nadie puede saber quién votó por cada opción. El hash se aplica en `src/Model/Vote.php` (al verificar si ya votó y al registrar el voto) mediante `src/Service/HashService.php`.

---

## DISCLAIMER LEGAL

**1. Carácter no vinculante:** Los resultados de esta votación tienen carácter exclusivamente informativo y no constituyen, por sí mismos, una decisión oficial sobre el mecanismo a adoptar, salvo validación expresa en asamblea.

**2. No afiliación institucional:** Este sitio web es una iniciativa independiente y no está afiliado, administrado, respaldado ni representa oficialmente a la Universidad Nacional de Colombia.

**3. Uso voluntario:** La participación en esta plataforma es voluntaria y su utilización implica la aceptación de este aviso.

**4. Disponibilidad del servicio:** No se garantiza la disponibilidad continua, ausencia de errores o ininterrupción del servicio.

**5. Contacto:** Para reportes o incidencias, escribir a unalvotacion@proton.me.

---

## ¿Dónde pedir ayuda?

Si ves errores o algo no funciona, escribe a **unalvotacion@proton.me**.
