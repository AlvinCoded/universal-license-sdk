<?php

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upgrade Required</title>
    <style>
        /* Same base styles as feature-denied.blade.php */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
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
            text-align: center;
        }
        
        .icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
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
            margin-bottom: 16px;
        }
        
        p {
            font-size: 16px;
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        
        .tier-comparison {
            display: flex;
            gap: 16px;
            margin-bottom: 32px;
            justify-content: center;
        }
        
        .tier-badge {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            border-radius: 12px;
            flex: 1;
            max-width: 200px;
        }
        
        .tier-badge.current {
            background: #f7fafc;
            border: 2px solid #cbd5e0;
        }
        
        .tier-badge.required {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: 2px solid #667eea;
        }
        
        .tier-label {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            opacity: 0.7;
        }
        
        .tier-name {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .tier-icon {
            font-size: 32px;
            margin-bottom: 8px;
        }
        
        .arrow {
            display: flex;
            align-items: center;
            font-size: 32px;
            color: #cbd5e0;
        }
        
        .required .arrow {
            color: white;
        }
        
        .info-box {
            background: #f0f4ff;
            border-left: 4px solid #667eea;
            padding: 20px;
            border-radius: 8px;
            text-align: left;
            margin-bottom: 32px;
        }
        
        .info-box h3 {
            font-size: 16px;
            font-weight: 600;
            color: #4c51bf;
            margin-bottom: 12px;
        }
        
        .info-box p {
            color: #5a67d8;
            margin: 0;
            font-size: 14px;
        }
        
        .benefits {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
            text-align: left;
        }
        
        .benefits h3 {
            font-size: 16px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 16px;
        }
        
        .benefits ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 12px;
        }
        
        .benefits li {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px;
            background: white;
            border-radius: 8px;
            font-size: 14px;
            color: #4a5568;
        }
        
        .benefits li:before {
            content: "✓";
            color: #10b981;
            font-weight: bold;
            font-size: 18px;
            flex-shrink: 0;
        }
        
        .actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            text-decoration: none;
            transition: all 0.2s;
            cursor: pointer;
            border: none;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            flex: 1;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
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
        <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 10h7c-.53 4.12-3.28 7.79-7 8.94V4l7 3.11V12h-7z"/>
            </svg>
        </div>
        
        <h1>📈 Upgrade Required</h1>
        
        <p>This feature requires a higher tier license plan. Upgrade your subscription to access advanced features and capabilities.</p>
        
        <div class="tier-comparison">
            <div class="tier-badge current">
                <div class="tier-label">Your Current Tier</div>
                <div class="tier-icon">🥉</div>
                <div class="tier-name">{{ strtoupper($currentTier ?? 'Standard') }}</div>
            </div>
            
            <div class="arrow">→</div>
            
            <div class="tier-badge required">
                <div class="tier-label">Upgrade To</div>
                <div class="tier-icon">{{ $requiredTier === 'enterprise' ? '🏆' : '🥇' }}</div>
                <div class="tier-name">{{ strtoupper($requiredTier ?? 'Pro') }}</div>
            </div>
        </div>
        
        <div class="info-box">
            <h3>{{ $message }}</h3>
            <p>Unlock this feature and many more by upgrading to {{ strtoupper($requiredTier ?? 'Pro') }} tier.</p>
        </div>
        
        <div class="benefits">
            <h3>What You'll Get with {{ strtoupper($requiredTier ?? 'Pro') }}</h3>
            <ul>
                <li>
                    <span>
                        <strong>Advanced Features</strong><br>
                        Access to all premium functionality
                    </span>
                </li>
                <li>
                    <span>
                        <strong>Priority Support</strong><br>
                        Get help when you need it most
                    </span>
                </li>
                <li>
                    <span>
                        <strong>Higher Limits</strong><br>
                        More users, storage, and capacity
                    </span>
                </li>
                <li>
                    <span>
                        <strong>Enhanced Security</strong><br>
                        Enterprise-grade protection
                    </span>
                </li>
            </ul>
        </div>
        
        <div class="actions">
            <a href="https://your-license-portal.com/upgrade?to={{ $requiredTier }}" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 8L22 12L18 16"/>
                    <path d="M2 12H22"/>
                </svg>
                Upgrade to {{ ucfirst($requiredTier ?? 'Pro') }}
            </a>
            <a href="/" class="btn btn-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Go Home
            </a>
        </div>
    </div>
</body>
</html>