<?php

namespace App\Controller;

use App\Model\Vote;

class HomeController
{
    public function __construct(private ?Vote $voteModel) {}

    public function index(): void
    {
        if (!empty($_SESSION['user_email_hash'])) {
            header('Location: /vote');
            exit;
        }
        $results = $this->voteModel ? $this->voteModel->getResults() : [];
        $total = array_sum(array_column($results, 'count'));
        $layout = file_get_contents(__DIR__ . '/../View/layouts/main.php');
        $content = file_get_contents(__DIR__ . '/../View/pages/home.php');
        $content = str_replace('{{ERROR}}', isset($_SESSION['error']) ? '<p class="error">' . htmlspecialchars($_SESSION['error']) . '</p>' : '', $content);
        $content = str_replace('{{RESULTS}}', $this->renderResults($results, $total), $content);
        unset($_SESSION['error']);
        echo str_replace('{{CONTENT}}', $content, $layout);
    }

    private function renderResults(array $results, int $total): string
    {
        if (empty($results)) {
            return '<p class="muted">Aún no hay votos.</p>';
        }
        $meta = [
            1 => [
                'desc' => 'Mecanismo que implica la continuidad de las clases, pero los y las docentes no pueden tomar asistencia ni realizar actividades evaluativas',
                'class' => 'Sí',
                'progress' => 'Sí',
                'eval' => 'No',
                'obs' => '',
            ],
            2 => [
                'desc' => 'Mecanismo por el cual se desarrollan alternadamente actividades académicas y sesiones de asamblea para analizar la evolución de las problemáticas. Mientras haya asamblea o actividades asamblearias no se dicta clase',
                'class' => 'Sí*',
                'progress' => 'Sí',
                'eval' => 'Sí',
                'obs' => '* Se pueden dictar clases siempre y cuando no haya asamblea o actividades asamblearias en el horario del curso',
            ],
            3 => [
                'desc' => 'Mecanismo que implica la suspensión de clases y evaluación para desarrollar actividades de movilización y discusión',
                'class' => 'No',
                'progress' => 'No',
                'eval' => 'No',
                'obs' => 'Estudiantes y docentes se pueden reunir en los espacios de clase voluntariamente para abordar la problemática y otros temas no impliquen avanzar con el curso ni evaluar',
            ],
            4 => [
                'desc' => 'Mecanismo por el cual se suspenden todas las actividades institucionales (académicas y/o administrativas) del estamento que se acoge a esta figura.',
                'class' => 'No',
                'progress' => 'No',
                'eval' => 'No',
                'obs' => 'Cuando es un paro de empleados administrativos no se afectan las clases',
            ],
            5 => [
                'desc' => 'Se siguen las fechas establecidas.',
                'class' => 'Sí',
                'progress' => 'Sí',
                'eval' => 'Sí',
                'obs' => '',
            ],
        ];

        $html = '<div class="results-table-wrap"><table class="results-table"><thead><tr><th>Mecanismo</th><th>Descripción</th><th>Votos</th><th>%</th><th>¿Se puede dictar clase?</th><th>¿Se puede avanzar en temas del curso?</th><th>¿Se puede evaluar?</th><th>Observaciones</th></tr></thead><tbody>';
        foreach ($results as $r) {
            $pct = $total > 0 ? round($r['count'] / $total * 100, 1) : 0;
            $info = $meta[(int) $r['id']] ?? ['desc' => '-', 'class' => '-', 'progress' => '-', 'eval' => '-', 'obs' => '-'];
            $classTag = $info['class'] === 'No' ? 'tag-no' : 'tag-yes';
            $progressTag = $info['progress'] === 'No' ? 'tag-no' : 'tag-yes';
            $evalTag = $info['eval'] === 'No' ? 'tag-no' : 'tag-yes';
            $html .= sprintf(
                '<tr><td class="mechanism">%s</td><td class="desc">%s</td><td><strong>%d</strong></td><td><span class="pct-badge">%s%%</span></td><td><span class="tag %s">%s</span></td><td><span class="tag %s">%s</span></td><td><span class="tag %s">%s</span></td><td class="obs">%s</td></tr>',
                htmlspecialchars($r['name']),
                htmlspecialchars($info['desc']),
                $r['count'],
                $pct,
                $classTag,
                htmlspecialchars($info['class']),
                $progressTag,
                htmlspecialchars($info['progress']),
                $evalTag,
                htmlspecialchars($info['eval']),
                htmlspecialchars($info['obs'])
            );
        }
        $html .= '</tbody></table></div>';
        return $html;
    }
}
