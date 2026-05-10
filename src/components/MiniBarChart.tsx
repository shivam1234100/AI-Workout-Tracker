import React from 'react';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface MiniBarChartProps {
    data: number[];
    labels?: string[];
    height?: number;
    barColor?: string;
    activeBarColor?: string;
    activeBarColorEnd?: string;
}

export default function MiniBarChart({
    data,
    labels,
    height = 90,
    barColor,
    activeBarColor,
    activeBarColorEnd,
}: MiniBarChartProps) {
    const { isDark, colors } = useTheme();
    const maxVal = Math.max(...data, 1);
    const barWidth = 22;
    const gap = 10;
    const totalWidth = data.length * barWidth + (data.length - 1) * gap;
    const defaultBar = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const defaultActive = '#10b981';
    const defaultActiveEnd = '#0d9488';

    return (
        <View style={{ alignItems: 'center' }}>
            <Svg width={totalWidth} height={height}>
                <Defs>
                    <LinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={activeBarColor || defaultActive} stopOpacity="1" />
                        <Stop offset="1" stopColor={activeBarColorEnd || defaultActiveEnd} stopOpacity="0.7" />
                    </LinearGradient>
                </Defs>
                {data.map((val, i) => {
                    const barH = val > 0 ? Math.max((val / maxVal) * (height - 20), 6) : 6;
                    const x = i * (barWidth + gap);
                    const y = height - 20 - barH;
                    const isActive = val > 0;
                    return (
                        <Rect
                            key={i}
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barH}
                            rx={6}
                            fill={isActive ? 'url(#barGradient)' : (barColor || defaultBar)}
                        />
                    );
                })}
            </Svg>
            {labels && (
                <View style={{ flexDirection: 'row', width: totalWidth, justifyContent: 'space-between', marginTop: 6 }}>
                    {labels.map((l, i) => (
                        <Text key={i} style={{ color: data[i] > 0 ? (activeBarColor || defaultActive) : colors.textTertiary, fontSize: 10, fontWeight: data[i] > 0 ? '700' : '500', width: barWidth, textAlign: 'center' }}>
                            {l}
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );
}
