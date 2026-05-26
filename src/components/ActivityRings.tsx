import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface RingData {
    progress: number; // 0..1+
    color: string;
    bgColor: string;
}

interface Props {
    size?: number;
    strokeWidth?: number;
    rings: RingData[];
    centerLabel?: string;
    centerSublabel?: string;
}

export default function ActivityRings({
    size = 140,
    strokeWidth = 14,
    rings,
    centerLabel,
    centerSublabel,
}: Props) {
    const { colors } = useTheme();
    const center = size / 2;

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} style={{ position: 'absolute' }}>
                {rings.map((ring, i) => {
                    const radius = center - strokeWidth * (i + 0.5) - i * 4;
                    const circumference = 2 * Math.PI * radius;
                    const clamped = Math.max(0, Math.min(ring.progress, 2));
                    const strokeDashoffset = circumference - clamped * circumference;

                    return (
                        <React.Fragment key={i}>
                            <Circle
                                cx={center}
                                cy={center}
                                r={radius}
                                stroke={ring.bgColor}
                                strokeWidth={strokeWidth}
                                fill="none"
                            />
                            <Circle
                                cx={center}
                                cy={center}
                                r={radius}
                                stroke={ring.color}
                                strokeWidth={strokeWidth}
                                fill="none"
                                strokeDasharray={`${circumference} ${circumference}`}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                transform={`rotate(-90 ${center} ${center})`}
                            />
                        </React.Fragment>
                    );
                })}
            </Svg>
            <View style={{ alignItems: 'center' }}>
                {centerLabel && (
                    <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>
                        {centerLabel}
                    </Text>
                )}
                {centerSublabel && (
                    <Text style={{ color: colors.textTertiary, fontSize: 10, marginTop: 1 }}>
                        {centerSublabel}
                    </Text>
                )}
            </View>
        </View>
    );
}
