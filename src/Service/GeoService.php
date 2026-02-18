<?php

namespace App\Service;

class GeoService
{
    public function isAntioquia(string $clientIp): bool
    {
        $json = @file_get_contents("https://get.geojs.io/v1/ip/geo/{$clientIp}.json");
        $data = $json ? json_decode($json, true) : null;
        return ($data['region'] ?? '') === 'Antioquia';
    }
}
