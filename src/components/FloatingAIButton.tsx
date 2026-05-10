import React, { useRef, useState, useEffect } from 'react';
import { Animated, PanResponder, Dimensions, TouchableWithoutFeedback, View } from 'react-native';
import { BrainCircuit } from 'lucide-react-native';
import { NavigationContainerRef } from '@react-navigation/native';
import { accent, shadows } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';

const SIZE = 56;
const MARGIN = 8;
const TAP_THRESHOLD = 6;

function getActiveRouteName(state: any): string | undefined {
    if (!state) return undefined;
    const route = state.routes[state.index];
    if (route.state) return getActiveRouteName(route.state);
    return route.name;
}

export default function FloatingAIButton({ navRef }: { navRef: React.RefObject<NavigationContainerRef<any>> }) {
    const { isAuthenticated } = useAuthStore();
    const { width, height } = Dimensions.get('window');

    const initial = { x: width - SIZE - 16, y: height - SIZE - 140 };
    const pan = useRef(new Animated.ValueXY(initial)).current;
    const offset = useRef({ ...initial });
    const startPos = useRef({ x: 0, y: 0 });
    const movedRef = useRef(false);

    const [routeName, setRouteName] = useState<string | undefined>(undefined);

    useEffect(() => {
        let unsub: (() => void) | undefined;
        const tryAttach = () => {
            const ref: any = navRef.current;
            if (!ref || !ref.isReady?.()) {
                // Retry once nav is ready
                const t = setTimeout(tryAttach, 200);
                unsub = () => clearTimeout(t);
                return;
            }
            const update = () => {
                try {
                    const state = ref.getRootState?.();
                    setRouteName(getActiveRouteName(state));
                } catch {}
            };
            update();
            unsub = ref.addListener('state', update);
        };
        tryAttach();
        return () => { unsub?.(); };
    }, [navRef, isAuthenticated]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2,
            onPanResponderGrant: () => {
                movedRef.current = false;
                startPos.current = { ...offset.current };
                pan.setOffset(offset.current);
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: (e, g) => {
                if (Math.abs(g.dx) > TAP_THRESHOLD || Math.abs(g.dy) > TAP_THRESHOLD) {
                    movedRef.current = true;
                }
                Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(e, g);
            },
            onPanResponderRelease: (_, g) => {
                pan.flattenOffset();
                let nx = startPos.current.x + g.dx;
                let ny = startPos.current.y + g.dy;
                nx = Math.max(MARGIN, Math.min(width - SIZE - MARGIN, nx));
                ny = Math.max(MARGIN + 40, Math.min(height - SIZE - MARGIN - 100, ny));
                offset.current = { x: nx, y: ny };
                Animated.spring(pan, { toValue: { x: nx, y: ny }, useNativeDriver: false, friction: 6 }).start();
            },
        })
    ).current;

    const handleTap = () => {
        if (movedRef.current) return;
        const ref: any = navRef.current;
        if (!ref || !ref.isReady?.()) return;
        try {
            ref.navigate('Main', { screen: 'AI' });
        } catch {
            try { ref.navigate('AI' as never); } catch {}
        }
    };

    if (!isAuthenticated) return null;
    if (routeName === 'AI') return null;

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={{
                position: 'absolute',
                left: pan.x,
                top: pan.y,
                width: SIZE,
                height: SIZE,
                zIndex: 9999,
                elevation: 20,
            }}
            pointerEvents="box-none"
        >
            <TouchableWithoutFeedback onPress={handleTap}>
                <View
                    style={{
                        width: SIZE,
                        height: SIZE,
                        borderRadius: SIZE / 2,
                        backgroundColor: accent.green,
                        alignItems: 'center',
                        justifyContent: 'center',
                        ...shadows.glow(accent.green),
                    }}
                >
                    <BrainCircuit size={26} color="white" />
                </View>
            </TouchableWithoutFeedback>
        </Animated.View>
    );
}
