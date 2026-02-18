<?php

namespace App\Controller;

use App\Model\Vote;
use App\Service\GeoService;

class VoteController
{
    private Vote $voteModel;
    private GeoService $geo;
    private string $clientIp;

    public function __construct(Vote $voteModel, GeoService $geo, string $clientIp)
    {
        $this->voteModel = $voteModel;
        $this->geo = $geo;
        $this->clientIp = $clientIp;
    }

    public function form(): void
    {
        if (empty($_SESSION['user_email'])) {
            header('Location: /');
            exit;
        }
        if ($this->voteModel->hasVoted($_SESSION['user_email'])) {
            header('Location: /thanks');
            exit;
        }
        $options = $this->voteModel->getOptions();
        $layout = file_get_contents(__DIR__ . '/../View/layouts/main.php');
        $content = file_get_contents(__DIR__ . '/../View/pages/vote.php');
        $content = str_replace('{{OPTIONS}}', $this->renderOptions($options), $content);
        echo str_replace('{{CONTENT}}', $content, $layout);
    }

    public function submit(): void
    {
        if (empty($_SESSION['user_email'])) {
            header('Location: /');
            exit;
        }
        $optionId = (int) ($_POST['option_id'] ?? 0);
        if ($optionId < 1 || $optionId > 5) {
            header('Location: /vote');
            exit;
        }
        if (!$this->geo->isAntioquia($this->clientIp)) {
            $layout = file_get_contents(__DIR__ . '/../View/layouts/main.php');
            $content = file_get_contents(__DIR__ . '/../View/pages/blocked.php');
            echo str_replace('{{CONTENT}}', $content, $layout);
            exit;
        }
        if ($this->voteModel->hasVoted($_SESSION['user_email'])) {
            header('Location: /thanks');
            exit;
        }
        $this->voteModel->cast($_SESSION['user_email'], $optionId);
        header('Location: /thanks');
        exit;
    }

    public function thanks(): void
    {
        $layout = file_get_contents(__DIR__ . '/../View/layouts/main.php');
        $content = file_get_contents(__DIR__ . '/../View/pages/thanks.php');
        echo str_replace('{{CONTENT}}', $content, $layout);
    }

    private function renderOptions(array $options): string
    {
        $html = '<div class="options-grid">';
        foreach ($options as $opt) {
            $html .= sprintf(
                '<label class="option-card"><input type="radio" name="option_id" value="%d" required><span class="option-label">%s</span></label>',
                $opt['id'],
                htmlspecialchars($opt['name'])
            );
        }
        return $html . '</div>';
    }
}
