import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface Props {
    size?: number;
    strokeWidth?: number;
    progress: number; // 0..1
    color?: string;
    label?: string;
    sublabel?: string;
}

export default function CircularProgress({
    size = 100,
    strokeWidth = 8,
    progress,
    color = '#22c55e',
    label,
    sublabel,
}: Props) {
    const { colors } = useTheme();
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const clamped = Math.max(0, Math.min(1, progress));
    const strokeDashoffset = circumference - clamped * circumference;

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} style={{ position: 'absolute' }}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colors.borderLight}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>
            <View style={{ alignItems: 'center' }}>
                {label && <Text style={{ color: colors.text, fontWeight: '800', fontSize: 18 }}>{label}</Text>}
                {sublabel && <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 2 }}>{sublabel}</Text>}
            </View>
        </View>
    );
}
