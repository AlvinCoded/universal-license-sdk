<?php

declare(strict_types=1);

namespace UniversalLicense\Models;

/**
 * Organization Model
 * 
 * Represents an organization that owns licenses.
 * 
 * @package UniversalLicense\Models
 */
class Organization
{
    public int $id;
    public string $orgCode;
    public string $orgName;
    public string $ownerName;
    public ?string $ownerEmail;
    public ?string $orgType;
    public ?string $address;
    public ?string $phone;
    public ?string $country;
    public ?string $region;
    public \DateTime $createdAt;
    public \DateTime $updatedAt;
    
    // Computed fields
    public ?int $activeLicenseCount;
    
    /**
     * Create Organization instance from API response array
     * 
     * @param array<string, mixed> $data API response data
     * @return self
     */
    public static function fromArray(array $data): self
    {
        $org = new self();
        
        $org->id = (int) ($data['id'] ?? 0);
        $org->orgCode = (string) ($data['org_code'] ?? $data['orgCode'] ?? '');
        $org->orgName = (string) ($data['org_name'] ?? $data['orgName'] ?? '');
        $org->ownerName = (string) ($data['owner_name'] ?? $data['ownerName'] ?? '');
        $org->ownerEmail = isset($data['owner_email']) || isset($data['ownerEmail']) 
            ? (string) ($data['owner_email'] ?? $data['ownerEmail']) 
            : null;
        $org->orgType = isset($data['org_type']) || isset($data['orgType']) 
            ? (string) ($data['org_type'] ?? $data['orgType']) 
            : null;
        $org->address = isset($data['address']) ? (string) $data['address'] : null;
        $org->phone = isset($data['phone']) ? (string) $data['phone'] : null;
        $org->country = isset($data['country']) ? (string) $data['country'] : null;
        $org->region = isset($data['region']) ? (string) $data['region'] : null;
        
        $org->createdAt = new \DateTime($data['created_at'] ?? $data['createdAt'] ?? 'now');
        $org->updatedAt = new \DateTime($data['updated_at'] ?? $data['updatedAt'] ?? 'now');
        
        $org->activeLicenseCount = isset($data['active_license_count']) || isset($data['activeLicenseCount']) 
            ? (int) ($data['active_license_count'] ?? $data['activeLicenseCount']) 
            : null;
        
        return $org;
    }
    
    /**
     * Convert Organization to array
     * 
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'orgCode' => $this->orgCode,
            'orgName' => $this->orgName,
            'ownerName' => $this->ownerName,
            'ownerEmail' => $this->ownerEmail,
            'orgType' => $this->orgType,
            'address' => $this->address,
            'phone' => $this->phone,
            'country' => $this->country,
            'region' => $this->region,
            'createdAt' => $this->createdAt->format('c'),
            'updatedAt' => $this->updatedAt->format('c'),
            'activeLicenseCount' => $this->activeLicenseCount,
        ];
    }
}