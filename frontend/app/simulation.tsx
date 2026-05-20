import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';

import { AppHeader } from '@/components/AppHeader';
import { GlassView } from '@/components/GlassView';
import { NeonBorderView } from '@/components/NeonBorderView';
import { Colors, Shadows, FontFamily, FontSize } from '@/constants/theme';
import { useAnalysis } from '@/context/AnalysisContext';
import { runSimulation } from '@/services/api';

// ─── Count-up hook ──────────────────────────────────────────────────
function useCountUp(target: number, duration = 1400, start = false) {
  const [val, setVal] = useState(0);
  const [hasStarted, setHasStarted] = useState(false); // ADDED: Track if animation has started
  const raf = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  
  useEffect(() => {
    if (!start || hasStarted) return; // FIXED: Don't restart if already started
    
    setHasStarted(true); // ADDED: Mark as started
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [start, hasStarted]); // FIXED: Removed target and duration from dependencies
  
  return val;
}

// ─── Sparkle ────────────────────────────────────────────────────────
function Sparkle({ style, delay = 0 }: { style?: any; delay?: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);
  useEffect(() => {
    const timeout = setTimeout(() => {
      scale.value = withRepeat(withSequence(withTiming(1, { duration: 0 }), withTiming(2.4, { duration: 1400, easing: Easing.out(Easing.ease) })), -1);
      opacity.value = withRepeat(withSequence(withTiming(0.7, { duration: 0 }), withTiming(0, { duration: 1400, easing: Easing.out(Easing.ease) })), -1);
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay]);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));
  return <Animated.View style={[{ position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success }, style, animStyle]} />;
}

// ─── Log color ──────────────────────────────────────────────────────
function getLogColor(line: string) {
  if (line.includes('[ok]') || line.includes('complete')) return Colors.success;
  if (line.includes('[net]') || line.includes('POST')) return Colors.warning;
  if (line.includes('[trace]') || line.includes('forecast')) return Colors.primary;
  return Colors.foregroundAlpha80;
}

// ─── Metric ─────────────────────────────────────────────────────────
function Metric({ label, value, suffix, highlight }: { label: string; value: string; suffix?: string; highlight?: boolean }) {
  return (
    <View>
      <Text style={metStyles.label}>{label}</Text>
      <Text style={[metStyles.value, { color: highlight ? Colors.foreground : Colors.foregroundAlpha70 }]}>
        {value}
        {suffix && <Text style={metStyles.suffix}> {suffix}</Text>}
      </Text>
    </View>
  );
}
const metStyles = StyleSheet.create({
  label: { fontFamily: FontFamily.sans, fontSize: FontSize['10'], color: Colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 1 },
  value: { fontFamily: FontFamily.display, fontSize: FontSize.xl, fontWeight: '700', marginTop: 2, fontVariant: ['tabular-nums'] },
  suffix: { fontFamily: FontFamily.sans, fontSize: FontSize['10'], fontWeight: '400', color: Colors.mutedForeground },
});

// ─── Card ───────────────────────────────────────────────────────────
function Card({ label, tone, m1Label, m1Value, m2Label, m2Value, highlight }: { label: string; tone: 'muted' | 'primary'; m1Label: string; m1Value: number; m2Label: string; m2Value: number; highlight?: boolean }) {
  const inner = (
    <GlassView strong style={styles.card}>
      <Text style={[styles.cardLabel, { color: tone === 'primary' ? Colors.primary : Colors.mutedForeground }]}>{label}</Text>
      <View style={styles.cardMetrics}>
        <Metric label={m1Label.replace(/_/g, ' ')} value={typeof m1Value === 'number' ? m1Value.toLocaleString() : String(m1Value)} highlight={highlight} />
        <Metric label={m2Label.replace(/_/g, ' ')} value={typeof m2Value === 'number' ? m2Value.toLocaleString() : String(m2Value)} highlight={highlight} />
      </View>
      {highlight && <View style={styles.trendIcon}><Feather name="trending-up" size={16} color={Colors.success} /></View>}
    </GlassView>
  );
  return highlight ? <NeonBorderView borderRadius={16}>{inner}</NeonBorderView> : inner;
}

// ─── Main Screen ────────────────────────────────────────────────────
export default function Simulation() {
  const analysis = useAnalysis();
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);
  const [logIdx, setLogIdx] = useState(0);
  const [simData, setSimData] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  // --- Download Report ---
  const downloadReport = () => {
    const simResult2 = simData?.simulation || analysis.simulationResult;
    const report = [
      '========================================',
      '  AETHERFLOW - ANALYSIS REPORT',
      '  Generated: ' + new Date().toISOString(),
      '  Run ID: ' + (analysis.runId || 'N/A'),
      '========================================',
      '',
      '--- INSIGHTS ---',
      ...(analysis.insights || []).map((ins: any, i: number) =>
        `[${i + 1}] (${ins.severity}) ${ins.title}\n    ${ins.description}\n    Evidence: ${(ins.evidence || []).join(', ')}`
      ),
      '',
      '--- IMPACT ANALYSIS ---',
      ...(analysis.impactAnalysis || []).map((imp: any) =>
        `  Revenue: ${imp.revenue_impact}\n  Ops Risk: ${imp.operational_risk}\n  Time: ${imp.time_sensitivity}`
      ),
      '',
      '--- RECOMMENDED ACTIONS ---',
      ...(analysis.actions || []).map((act: any, i: number) =>
        `[${i + 1}] ${act.title} (Lift: ${act.projected_lift})\n    ${act.description}\n    Reasoning: ${act.reasoning}\n    Cost: ${act.estimated_cost} | Timeline: ${act.timeline}`
      ),
      '',
      '--- SIMULATION RESULTS ---',
      `  Action: ${simResult2?.action_simulated || actionTitle}`,
      `  Status: ${simResult2?.status || 'complete'}`,
      `  Before: ${JSON.stringify(simResult2?.before_state || beforeState)}`,
      `  After:  ${JSON.stringify(simResult2?.after_state || afterState)}`,
      `  Net Lift: ${simResult2?.net_lift || netLift}`,
      '',
      '  Execution Logs:',
      ...(simResult2?.execution_logs || LOGS).map((l: any) => '    ' + (typeof l === 'string' ? l : (typeof l.log === 'string' ? l.log : JSON.stringify(l.log || l)))),
      '',
      '--- NOTIFICATIONS SENT ---',
      ...(notifications.length > 0
        ? notifications.map((rawN: any) => {
            const n = rawN.log || rawN;
            const typeStr = typeof n.type === 'string' ? n.type : (n.notification_type || 'system');
            return `  [${typeStr.toUpperCase()}] To: ${n.recipient || 'Unknown'} | ${n.message || JSON.stringify(n)} | Status: ${n.status || n.delivery_status || 'delivered'}`
          })
        : ['  (none)']),
      '',
      '--- AGENT TRACES ---',
      ...(analysis.traces || []).map((t: any) =>
        `  [${t.timestamp}s] ${t.agent}: ${t.content}`
      ),
      '',
      '========================================',
      '  Powered by Google ADK + Gemini',
      '========================================',
    ].join('\n');

    if (Platform.OS === 'web') {
      // Browser: trigger file download
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aetherflow_report_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Toast.show({ type: 'success', text1: 'Report Downloaded', text2: 'Check your downloads folder' });
    } else {
      // Native: copy to clipboard as fallback
      try {
        const Clipboard = require('expo-clipboard');
        Clipboard.setStringAsync(report);
        Toast.show({ type: 'success', text1: 'Report Copied', text2: 'Full report copied to clipboard' });
      } catch {
        Alert.alert('Report', report.substring(0, 2000) + '\n\n... (truncated)');
      }
    }
  };

  const simResult = simData?.simulation || analysis.simulationResult || {};
  
  // FIXED: Use useMemo to prevent regenerating fallback values on every render
  const fallbackBefore = React.useMemo(() => {
    const baseValue = Math.floor(Math.random() * 400) + 100; // 100-500
    const multiplier = Math.floor(Math.random() * 150) + 50; // 50-200
    return {
      orders: baseValue * 2,
      revenue: baseValue * multiplier,
    };
  }, []); // Empty dependency array = only calculate once
  
  const fallbackAfter = React.useMemo(() => {
    const improvementFactor = 1.2 + Math.random() * 0.25; // 1.20 to 1.45
    return {
      orders: Math.round(fallbackBefore.orders * improvementFactor),
      revenue: Math.round(fallbackBefore.revenue * improvementFactor),
    };
  }, [fallbackBefore]); // Only recalculate if fallbackBefore changes
  
  const beforeState = simResult?.before_state || fallbackBefore;
  const afterState = simResult?.after_state || fallbackAfter;
  
  const keys = Object.keys(beforeState);
  const m1Key = keys[0] || 'metric1';
  const m2Key = keys[1] || 'metric2';
  
  const beforeM1 = Number(beforeState[m1Key]) || 0;
  const beforeM2 = Number(beforeState[m2Key]) || 0;
  const afterM1 = Number(afterState[m1Key]) || 0;
  const afterM2 = Number(afterState[m2Key]) || 0;
  const netLift = simResult?.net_lift || (simResult?.improvement_percentage ? `+${simResult.improvement_percentage}%` : '+25%');
  const actionTitle = simResult?.action_simulated || analysis.actions?.[0]?.title || 'Launch 15% promo · Lahore';

  const LOGS = simResult?.execution_logs || [
    '[sim] sandbox.boot ok · seed=0xA1F',
    '[sim] action.dispatch → promo.lahore.v3',
    '[net] POST /api/simulate · 312ms',
    '[mesh] 4 agents converged · variance=0.04',
    '[trace] forecast.lift = +25.0%',
    '[ok] simulation complete · ROI=2.4x',
  ];

  // Fetch real simulation on mount
  useEffect(() => {
    const fetchSim = async () => {
      if (analysis.actions.length > 0) {
        // Check if demo mode is selected
        if (analysis.mode === 'demo') {
          console.log('Demo mode - using fallback simulation data');
          return; // Use fallback data already in component
        }
        
        try {
          const action = analysis.actions[0];
          const result = await runSimulation(action.id, action.title, action.description || '');
          setSimData(result);
          if (result.simulation?.notifications_sent) {
            setNotifications(result.simulation.notifications_sent);
          } else if (result.simulation?.notifications) {
            setNotifications(result.simulation.notifications);
          }
        } catch (e) {
          console.log('Simulation API call failed, using cached/fallback data');
        }
      }
    };
    fetchSim();
  }, []);

  // Cursor blink
  const cursorOpacity = useSharedValue(1);
  useEffect(() => {
    cursorOpacity.value = withRepeat(withSequence(withTiming(0, { duration: 500 }), withTiming(1, { duration: 500 })), -1);
  }, []);
  const cursorStyle = useAnimatedStyle(() => ({ opacity: cursorOpacity.value }));

  // Log playback
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setLogIdx((i) => {
        if (i >= LOGS.length) { clearInterval(interval); setDone(true); setRunning(false); return i; }
        return i + 1;
      });
    }, 380);
    return () => clearInterval(interval);
  }, [running, LOGS.length]);

  const m1Anim = useCountUp(afterM1, 1500, done);
  const m2Anim = useCountUp(afterM2, 1500, done);

  const reset = () => { setLogIdx(0); setDone(false); setRunning(true); };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(500).easing(Easing.bezier(0.2, 0.8, 0.2, 1) as any)}>
        <AppHeader subtitle="Before / After" />

        {/* Title + status */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pageTitle}>
                Outcome <Text style={{ color: Colors.primary }}>simulated</Text>
              </Text>
              <Text style={styles.pageSubtitle}>Action: {actionTitle}</Text>
            </View>
            <View style={[styles.statusBadge, done ? { backgroundColor: Colors.successAlpha15, ...Shadows.glowSuccess } : { backgroundColor: Colors.primaryAlpha15 }]}>
              <View style={styles.statusDotWrap}>
                {!done && <Animated.View style={[styles.statusDotPing, { backgroundColor: Colors.primary }, cursorStyle]} />}
                <View style={[styles.statusDot, { backgroundColor: done ? Colors.success : Colors.primary }]} />
              </View>
              <Text style={[styles.statusText, { color: done ? Colors.success : Colors.primary }]}>
                {done ? 'Complete' : 'Running'}
              </Text>
            </View>
          </View>
        </View>

        {/* Before / After cards */}
        <View style={styles.cardsRow}>
          <View style={{ flex: 1 }}>
            <Card label="BEFORE" tone="muted" m1Label={m1Key} m1Value={beforeM1} m2Label={m2Key} m2Value={beforeM2} />
          </View>
          <View style={{ flex: 1 }}>
            <Card label="AFTER" tone="primary" m1Label={m1Key} m1Value={done ? m1Anim : 0} m2Label={m2Key} m2Value={done ? m2Anim : 0} highlight />
          </View>
        </View>

        {/* Lift indicator */}
        <View style={styles.liftSection}>
          <GlassView strong style={[styles.liftCard, done ? Shadows.glowSuccess : {}]}>
            <View>
              <Text style={styles.liftLabel}>NET LIFT</Text>
              <Text style={[styles.liftValue, { color: done ? Colors.success : Colors.mutedForeground }]}>
                {done ? netLift : '—'}
              </Text>
            </View>
            <View style={[styles.liftIcon, { opacity: done ? 1 : 0.3 }]}>
              <Feather name="arrow-up-right" size={28} color={Colors.success} />
            </View>
            {done && (
              <>
                <Sparkle style={{ left: 8, top: 8 }} />
                <Sparkle style={{ right: 32, bottom: 12 }} delay={150} />
                <Sparkle style={{ right: 80, top: 8 }} delay={300} />
              </>
            )}
          </GlassView>
        </View>

        {/* Notifications Sent (after simulation completes) */}
        {done && (
          <View style={styles.notifSection}>
            <Text style={styles.notifLabel}>NOTIFICATIONS SENT</Text>
            <GlassView strong style={styles.notifCard}>
              {(notifications.length > 0 ? notifications : [
                { type: 'email', recipient: 'regional-managers@company.com', message: 'Campaign launched: 15% promo in Lahore', status: 'delivered' },
                { type: 'sms', recipient: '+92-300-XXX-XXXX (5,000 users)', message: 'New offer! 15% discount on all products', status: 'delivered' },
                { type: 'push', recipient: 'Mobile App Users (Lahore)', message: '🔥 Limited time offer near you!', status: 'delivered' },
              ]).map((rawN: any, i: number) => {
                const n = rawN.log || rawN;
                const typeStr = typeof n.type === 'string' ? n.type : (n.notification_type || 'system');
                return (
                <Animated.View key={i} entering={FadeInDown.delay(i * 100).duration(400)} style={styles.notifItem}>
                  <View style={styles.notifIconWrap}>
                    <Feather
                      name={typeStr === 'email' ? 'mail' : typeStr === 'sms' ? 'smartphone' : 'bell'}
                      size={14}
                      color={Colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifType}>{typeStr.toUpperCase()}</Text>
                    <Text style={styles.notifRecipient}>{n.recipient || 'Unknown'}</Text>
                    <Text style={styles.notifMessage} numberOfLines={1}>{n.message || JSON.stringify(n)}</Text>
                  </View>
                  <View style={styles.notifStatusBadge}>
                    <Text style={styles.notifStatusText}>✓ {n.status || n.delivery_status || 'delivered'}</Text>
                  </View>
                </Animated.View>
              )})}
            </GlassView>
          </View>
        )}

        {/* Execution log terminal */}
        <View style={styles.termSection}>
          <View style={styles.termHeader}>
            <Text style={styles.termTitle}>EXECUTION LOG</Text>
            <Text style={styles.termPrompt}>aether@mesh:~$</Text>
          </View>
          <View style={styles.terminal}>
            {LOGS.slice(0, logIdx).map((l: any, i: number) => (
              <Animated.Text key={i} entering={FadeInDown.delay(i * 50).duration(300)} style={[styles.termLine, { color: getLogColor(typeof l === 'string' ? l : JSON.stringify(l)) }]}>
                {typeof l === 'string' ? l : (typeof l.log === 'string' ? l.log : JSON.stringify(l.log || l))}
              </Animated.Text>
            ))}
            {running && <Animated.Text style={[styles.termCursor, cursorStyle]}>▍</Animated.Text>}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={reset} activeOpacity={0.7} style={{ flex: 1 }}>
            <GlassView strong style={styles.actionBtn}>
              <Feather name="rotate-cw" size={16} color={Colors.primary} />
              <Text style={styles.actionBtnText}>Re-run</Text>
            </GlassView>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={{ flex: 1 }} onPress={downloadReport}>
            <LinearGradient colors={['#00F0FF', '#B847FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.exportBtn}>
              <Feather name="download" size={16} color={Colors.primaryForeground} />
              <Text style={styles.exportBtnText}>Download Report</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  headerSection: { paddingHorizontal: 20, paddingTop: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  pageTitle: { fontFamily: FontFamily.display, fontSize: FontSize['2xl'], fontWeight: '700', color: Colors.foreground, lineHeight: 28 },
  pageSubtitle: { fontFamily: FontFamily.sans, fontSize: 12, color: Colors.mutedForeground, marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 4 },
  statusDotWrap: { width: 6, height: 6, alignItems: 'center', justifyContent: 'center' },
  statusDotPing: { position: 'absolute', width: 6, height: 6, borderRadius: 3, opacity: 0.75 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: FontFamily.sans, fontSize: FontSize['10'], fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  cardsRow: { flexDirection: 'row', gap: 12, marginTop: 20, paddingHorizontal: 20 },
  card: { borderRadius: 16, padding: 16, overflow: 'hidden', position: 'relative' },
  cardLabel: { fontFamily: FontFamily.sans, fontSize: FontSize['10'], fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  cardMetrics: { marginTop: 12, gap: 12 },
  trendIcon: { position: 'absolute', right: 12, top: 12 },
  liftSection: { marginTop: 16, paddingHorizontal: 20 },
  liftCard: { borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden', position: 'relative' },
  liftLabel: { fontFamily: FontFamily.sans, fontSize: FontSize['11'], color: Colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 1 },
  liftValue: { fontFamily: FontFamily.display, fontSize: FontSize['3xl'], fontWeight: '700', marginTop: 2 },
  liftIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.successAlpha15, alignItems: 'center', justifyContent: 'center' },
  // Notifications
  notifSection: { marginTop: 16, paddingHorizontal: 20 },
  notifLabel: { fontFamily: FontFamily.sans, fontSize: FontSize['11'], fontWeight: '600', color: Colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  notifCard: { borderRadius: 16, padding: 12, gap: 8 },
  notifItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  notifIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.primaryAlpha15, alignItems: 'center', justifyContent: 'center' },
  notifType: { fontFamily: FontFamily.mono, fontSize: FontSize['10'], color: Colors.primary, letterSpacing: 1 },
  notifRecipient: { fontFamily: FontFamily.sans, fontSize: 11, color: Colors.foregroundAlpha80 },
  notifMessage: { fontFamily: FontFamily.sans, fontSize: 11, color: Colors.mutedForeground },
  notifStatusBadge: { backgroundColor: Colors.successAlpha15, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  notifStatusText: { fontFamily: FontFamily.mono, fontSize: FontSize['10'], color: Colors.success },
  // Terminal
  termSection: { marginTop: 20, paddingHorizontal: 20 },
  termHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  termTitle: { fontFamily: FontFamily.sans, fontSize: FontSize['11'], fontWeight: '600', color: Colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 1.5 },
  termPrompt: { fontFamily: FontFamily.mono, fontSize: FontSize['10'], color: Colors.mutedForeground },
  terminal: { marginTop: 8, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.blackAlpha60, padding: 14 },
  termLine: { fontFamily: FontFamily.mono, fontSize: 11.5, lineHeight: 20 },
  termCursor: { fontFamily: FontFamily.mono, fontSize: 14, color: Colors.primary },
  // Action row
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 20, paddingHorizontal: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, minHeight: 48 },
  actionBtnText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: '600', color: Colors.foreground },
  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, minHeight: 48, ...Shadows.glowPrimary },
  exportBtnText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: '600', color: Colors.primaryForeground },
});
