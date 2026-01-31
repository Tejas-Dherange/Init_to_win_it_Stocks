import React from 'react';
import clsx from 'clsx';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
    header?: React.ReactNode;
    footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
    children,
    className,
    hoverable = false,
    header,
    footer,
}) => {
    return (
        <div
            className={clsx(
                'bg-white rounded-lg shadow-soft border border-gray-100',
                hoverable && 'transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer',
                className
            )}
        >
            {header && (
                <div className="px-6 py-4 border-b border-gray-100">
                    {header}
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
            {footer && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
