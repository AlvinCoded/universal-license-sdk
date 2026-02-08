<?php

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feature Access Denied</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%);
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
            max-width: 600px;
            width: 100%;
            padding: 48px;
            text-align: center;
        }
        
        .icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%);
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
        
        .warning-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            text-align: left;
            margin-bottom: 32px;
        }
        
        .warning-box h3 {
            font-size: 16px;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 12px;
        }
        
        .warning-box p {
            color: #78350f;
            margin: 0 0 16px 0;
            font-size: 14px;
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
            padding: 8px 12px;
            background: white;
            border-radius: 6px;
            margin-bottom: 8px;
            font-size: 14px;
            color: #92400e;
            font-weight: 500;
        }
        
        .features-list li:before {
            content: "🔒";
            font-size: 16px;
        }
        
        .comparison {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 32px;
            text-align: left;
        }
        
        .comparison h3 {
            font-size: 14px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .plan-features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
        }
        
        .plan-card {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            transition: all 0.2s;
        }
        
        .plan-card.current {
            border-color: #cbd5e0;
        }
        
        .plan-card.upgrade {
            border-color: #667eea;
            background: #f0f4ff;
        }
        
        .plan-name {
            font-size: 16px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 4px;
        }
        
        .plan-label {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
        }
        
        .current .plan-label {
            color: #718096;
        }
        
        .upgrade .plan-label {
            color: #667eea;
        }
        
        .feature-item {
            font-size: 13px;
            color: #4a5568;
            margin-bottom: 6px;
            padding-left: 20px;
            position: relative;
        }
        
        .feature-item.included:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
        }
        
        .feature-item.missing:before {
            content: "✗";
            position: absolute;
            left: 0;
            color: #dc2626;
            font-weight: bold;
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
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
        </div>
        
        <h1>🔒 Feature Not Available</h1>
        
        <p>This feature is not included in your current license plan. Upgrade your license to unlock this and more premium features.</p>
        
        <div class="warning-box">
            <h3>{{ $message }}</h3>
            
            @if(!empty($missingFeatures))
                <p><strong>You need access to:</strong></p>
                <ul class="features-list">
                    @foreach($missingFeatures as $feature)
                        <li>{{ ucwords(str_replace('_', ' ', preg_replace('/([A-Z])/', ' $1', $feature))) }}</li>
                    @endforeach
                </ul>
            @endif
        </div>
        
        <div class="comparison">
            <h3>Plan Comparison</h3>
            <div class="plan-features">
                <div class="plan-card current">
                    <div class="plan-name">Your Current Plan</div>
                    <div class="plan-label">Standard</div>
                    <div class="feature-item included">Basic features</div>
                    <div class="feature-item included">Standard support</div>
                    <div class="feature-item missing">Advanced reporting</div>
                    <div class="feature-item missing">Premium features</div>
                </div>
                
                <div class="plan-card upgrade">
                    <div class="plan-name">Recommended Plan</div>
                    <div class="plan-label">Pro / Enterprise</div>
                    <div class="feature-item included">All basic features</div>
                    <div class="feature-item included">Priority support</div>
                    <div class="feature-item included">Advanced reporting</div>
                    <div class="feature-item included">All premium features</div>
                </div>
            </div>
        </div>
        
        <div class="actions">
            <a href="https://your-license-portal.com/upgrade" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                Upgrade Now
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