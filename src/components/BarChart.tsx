import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface BarData {
    label: string;
    value: number;
    isToday?: boolean;
}

interface Props {
    data: BarData[];
    height?: number;
    barColor?: string;
    todayColor?: string;
    showGoalLine?: boolean;
    goal?: number;
    goalColor?: string;
    formatValue?: (v: number) => string;
}

export default function BarChart({
    data,
    height = 200,
    barColor = '#6b7280',
    todayColor = '#ff6b35',
    showGoalLine = false,
    goal = 0,
    goalColor = '#22c55e',
    formatValue,
}: Props) {
    const { colors } = useTheme();
    const maxValue = Math.max(...data.map((d) => d.value), goal || 0, 1);
    const barWidth = Math.min(32, (300 - data.length * 4) / data.length);
    const chartWidth = data.length * (barWidth + 8);
    const padding = 4;

    return (
        <View style={{ alignItems: 'center' }}>
            <View style={{ height, width: '100%', paddingHorizontal: 8 }}>
                <Svg width="100%" height={height} viewBox={`0 0 ${chartWidth + padding * 2} ${height}`}>
                    {data.map((item, i) => {
                        const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 40) : 0;
                        const x = padding + i * (barWidth + 8);
                        const y = height - 24 - barHeight;
                        const color = item.isToday ? todayColor : barColor;

                        return (
                            <Rect
                                key={i}
                                x={x}
                                y={y}
                                width={barWidth}
                                height={Math.max(barHeight, 2)}
                                rx={barWidth / 4}
                                fill={color}
                            />
                        );
                    })}

                    {showGoalLine && goal > 0 && (
                        <Line
                            x1={0}
                            y1={height - 24 - (goal / maxValue) * (height - 40)}
                            x2={chartWidth + padding * 2}
                            y2={height - 24 - (goal / maxValue) * (height - 40)}
                            stroke={goalColor}
                            strokeWidth={1.5}
                            strokeDasharray="6,4"
                            opacity={0.6}
                        />
                    )}
                </Svg>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: 8 }}>
                {data.map((item, i) => (
                    <Text
                        key={i}
                        style={{
                            color: item.isToday ? todayColor : colors.textTertiary,
                            fontSize: 10,
                            fontWeight: item.isToday ? '700' : '500',
                            textAlign: 'center',
                            flex: 1,
                        }}
                    >
                        {item.label}
                    </Text>
                ))}
            </View>
        </View>
    );
}
