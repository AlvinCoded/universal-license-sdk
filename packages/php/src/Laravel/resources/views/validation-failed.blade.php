<?php

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>License Validation Failed</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 700px;
            width: 100%;
            padding: 48px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 32px;
        }
        
        .icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
        }
        
        .icon svg {
            width: 40px;
            height: 40px;
            fill: white;
        }
        
        h1 {
            font-size: 28px;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 8px;
        }
        
        .subtitle {
            font-size: 16px;
            color: #718096;
        }
        
        .error-box {
            background: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 24px;
        }
        
        .error-box h3 {
            font-size: 16px;
            font-weight: 600;
            color: #991b1b;
            margin-bottom: 8px;
        }
        
        .error-box p {
            font-size: 14px;
            color: #7f1d1d;
            line-height: 1.6;
        }
        
        .details {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
        }
        
        .details h3 {
            font-size: 14px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            font-size: 14px;
            color: #718096;
            font-weight: 500;
        }
        
        .detail-value {
            font-size: 14px;
            color: #2d3748;
            font-weight: 600;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .badge-error {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .badge-warning {
            background: #fef3c7;
            color: #92400e;
        }
        
        .features-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .features-list li {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 0;
            font-size: 14px;
            color: #4a5568;
        }
        
        .features-list li:before {
            content: "✗";
            color: #dc2626;
            font-weight: bold;
        }
        
        .actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 32px;
        }
        
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            text-decoration: none;
            transition: all 0.2s;
            cursor: pointer;
            border: none;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            flex: 1;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(240, 147, 251, 0.3);
        }
        
        .btn-secondary {
            background: #e2e8f0;
            color: #4a5568;
        }
        
        .btn-secondary:hover {
            background: #cbd5e0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
            </div>
            
            <h1>⚠️ License Validation Failed</h1>
            <p class="subtitle">Your license could not be validated</p>
        </div>
        
        <div class="error-box">
            <h3>Validation Error</h3>
            <p>{{ $message }}</p>
        </div>
        
        @if($result)
            <div class="details">
                <h3>Validation Details</h3>
                
                @if($result->currentTier && $result->requiredTier)
                    <div class="detail-row">
                        <span class="detail-label">Current Tier</span>
                        <span class="detail-value">
                            <span class="badge badge-warning">{{ strtoupper($result->currentTier) }}</span>
                        </span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Required Tier</span>
                        <span class="detail-value">
                            <span class="badge badge-error">{{ strtoupper($result->requiredTier) }}</span>
                        </span>
                    </div>
                @endif
                
                @if($result->missingFeatures && count($result->missingFeatures) > 0)
                    <div class="detail-row">
                        <span class="detail-label">Missing Features</span>
                        <div>
                            <ul class="features-list">
                                @foreach($result->missingFeatures as $feature)
                                    <li>{{ $feature }}</li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                @endif
            </div>
        @endif
        
        <div class="actions">
            <a href="https://your-license-portal.com/upgrade" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 8L22 12L18 16"/>
                    <path d="M2 12H22"/>
                </svg>
                Upgrade License
            </a>
            <a href="/" class="btn btn-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Go Home
            </a>
        </div>
    </div>
</body>
</html>