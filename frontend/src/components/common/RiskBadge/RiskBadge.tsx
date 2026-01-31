import React from 'react';
import clsx from 'clsx';

interface RiskBadgeProps {
    level: 'low' | 'medium' | 'high' | 'critical';
    score: number;
    showScore?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
    level,
    score,
    showScore = true,
    size = 'md',
}) => {
    const levelConfig = {
        low: {
            label: 'Low Risk',
            className: 'bg-risk-low-light text-risk-low-dark border border-risk-low',
        },
        medium: {
            label: 'Medium Risk',
            className: 'bg-risk-medium-light text-risk-medium-dark border border-risk-medium',
        },
        high: {
            label: 'High Risk',
            className: 'bg-risk-high-light text-risk-high-dark border border-risk-high',
        },
        critical: {
            label: 'Critical Risk',
            className: 'bg-risk-critical-light text-risk-critical-dark border border-risk-critical',
        },
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    const config = levelConfig[level];

    return (
        <span
            className={clsx(
                'inline-flex items-center rounded-full font-semibold',
                config.className,
                sizeClasses[size]
            )}
        >
            {config.label}
            {showScore && (
                <span className="ml-1.5 font-mono">
                    {(score * 100).toFixed(0)}%
                </span>
            )}
        </span>
    );
};

export default RiskBadge;
