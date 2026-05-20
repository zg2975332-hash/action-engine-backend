import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

import { AppHeader } from '@/components/AppHeader';
import { GlassView } from '@/components/GlassView';
import { Colors, Shadows, FontFamily, FontSize } from '@/constants/theme';
import { useAnalysis } from '@/context/AnalysisContext';
import { SkeletonLoader, SkeletonStepCard } from '@/components/SkeletonLoader'; // ADDED

const STEP_NAMES = [
  { icon: 'search' as const, title: 'Content Understanding', desc: 'Tokenizing payload, identifying entities and domain context across the corpus.' },
  { icon: 'sun' as const, title: 'Insight Extraction', desc: 'Surfacing causal signals, anomalies and KPIs worth acting on.' },
  { icon: 'zap' as const, title: 'Impact Analysis', desc: 'Modeling downstream consequences across revenue, ops and customer trust.' },
  { icon: 'target' as const, title: 'Action Generation', desc: 'Drafting prioritized, executable actions with cost/benefit estimates.' },
  { icon: 'send' as const, title: 'Simulation Execution', desc: 'Running sandboxed what-if loops against synthetic environments.' },
  { icon: 'bar-chart-2' as const, title: 'Outcome Visualization', desc: 'Composing the before/after report and confidence interval bands.' },
] as const;

export default function Process() {
  const router = useRouter();
  const analysis = useAnalysis();
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [showDrawer, setShowDrawer] = useState(false);

  const isRealData = analysis.traces.length > 0 && !analysis.isLoading;
  const isDone = isRealData && analysis.insights.length > 0;

  // Ping ring animation for active step
  const pingScale = useSharedValue(1);
  const pingOpacity = useSharedValue(0.7);

  useEffect(() => {
    pingScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(2.4, { duration: 1600, easing: Easing.bezier(0, 0, 0.2, 1) }),
      ),
      -1,
    );
    pingOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 0 }),
        withTiming(0, { duration: 1600, easing: Easing.bezier(0, 0, 0.2, 1) }),
      ),
      -1,
    );
  }, []);

  const pingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pingScale.value }],
    opacity: pingOpacity.value,
  }));

  // Animated progress when loading
  useEffect(() => {
    if (analysis.isLoading) {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 95) return 95; // Hold at 95% until real data arrives
          return p + 0.8;
        });
        setActive((a) => {
          const target = Math.floor((progress / 100) * 6);
          return Math.min(target, 5);
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [analysis.isLoading, progress]);

  // When real data arrives, complete the animation
  useEffect(() => {
    if (isDone) {
      setActive(5);
      setProgress(100);
      // Navigate to results after a short delay
      const t = setTimeout(() => router.push('/results'), 1200);
      return () => clearTimeout(t);
    }
  }, [isDone]);

  // If there's an error, stay on this screen and show it
  useEffect(() => {
    if (analysis.error) {
      setProgress(0);
      setActive(0);
    }
  }, [analysis.error]);

  const overallPercent = isDone ? 100 : Math.round(progress);
  const runId = analysis.runId || 'af_pending';

  // Build trace logs from real data or show loading traces
  const traceLogs = analysis.traces.length > 0
    ? analysis.traces.map((t) => {
        const ts = t.timestamp.toFixed(3);
        if (t.type === 'tool_call') return `[${ts}] tool.call → ${t.tool || 'unknown'}`;
        return `[${ts}] ${t.agent} → ${(t.content || '').substring(0, 80)}`;
      }).slice(0, 12)
    : [
        '[00:00.012] agent.bootstrap → mesh online',
        '[00:00.318] content_parser → analyzing input...',
        `[loading] waiting for Antigravity pipeline...`,
      ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500).easing(Easing.bezier(0.2, 0.8, 0.2, 1) as any)}>
          <AppHeader subtitle="Agent Orchestration" />

          <View style={styles.headerSection}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.pageTitle}>
                  Agents in <Text style={{ color: Colors.primary }}>flight</Text>
                </Text>
                <Text style={styles.pageSubtitle}>6-phase autonomous reasoning pipeline</Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowDrawer(true)}
                activeOpacity={0.7}
              >
                <GlassView style={styles.logBtn}>
                  <Feather name="terminal" size={12} color={Colors.primary} />
                  <Text style={styles.logBtnText}>Agent Logs</Text>
                </GlassView>
              </TouchableOpacity>
            </View>

            {/* Error display */}
            {analysis.error && (
              <GlassView strong style={[styles.progressCard, { borderColor: Colors.destructive, borderWidth: 1 }]}>
                <Text style={{ color: Colors.destructive, fontFamily: FontFamily.sans, fontSize: 13 }}>
                  ⚠ {analysis.error}
                </Text>
                <TouchableOpacity onPress={() => router.push('/')} style={{ marginTop: 8 }}>
                  <Text style={{ color: Colors.primary, fontFamily: FontFamily.sans, fontSize: 12 }}>
                    ← Go back and try again
                  </Text>
                </TouchableOpacity>
              </GlassView>
            )}

            {/* Overall progress */}
            <GlassView strong style={styles.progressCard}>
              <View style={styles.progressRow}>
                <Text style={styles.phaseLabel}>
                  {analysis.isLoading ? `PHASE ${active + 1}/6` : isDone ? 'COMPLETE' : 'PHASE 1/6'}
                </Text>
                <Text style={styles.phasePercent}>{overallPercent}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={['#00F0FF', '#B847FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${overallPercent}%` as any }]}
                />
              </View>
              <Text style={styles.traceText}>
                Antigravity trace · run_id{' '}
                <Text style={styles.traceId}>{runId}</Text>
              </Text>
            </GlassView>
          </View>

          {/* Timeline */}
          <View style={styles.timeline}>
            {/* Vertical line */}
            <LinearGradient
              colors={[Colors.primaryAlpha40, Colors.secondaryAlpha15, 'transparent']}
              style={styles.timelineLine}
            />

            {STEP_NAMES.map((s, i) => {
              const status = isDone ? 'done' : i < active ? 'done' : i === active ? 'running' : 'pending';
              const isOpen = openStep === i;

              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setOpenStep(isOpen ? null : i)}
                  activeOpacity={0.7}
                >
                  <GlassView strong={isOpen} style={styles.stepCard}>
                    {/* Node */}
                    <View style={styles.nodeWrap}>
                      {status === 'running' ? (
                        <LinearGradient
                          colors={['#00F0FF', '#B847FF']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[styles.node, styles.nodeRunning]}
                        >
                          <Feather name={s.icon} size={20} color={Colors.primaryForeground} />
                        </LinearGradient>
                      ) : (
                        <View
                          style={[
                            styles.node,
                            status === 'done' && styles.nodeDone,
                            status === 'pending' && styles.nodePending,
                          ]}
                        >
                          {status === 'done' ? (
                            <Feather name="check" size={20} color={Colors.success} />
                          ) : (
                            <Feather name={s.icon} size={20} color={Colors.mutedForeground} />
                          )}
                        </View>
                      )}
                      {status === 'running' && (
                        <Animated.View style={[styles.nodePing, pingStyle]} />
                      )}
                    </View>

                    {/* Content */}
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>{s.title}</Text>
                      <Text style={styles.stepStatus}>
                        {status === 'done' && (
                          <Text style={{ color: Colors.success }}>● COMPLETED</Text>
                        )}
                        {status === 'running' && (
                          <Text style={{ color: Colors.primary }}>● IN PROGRESS</Text>
                        )}
                        {status === 'pending' && (
                          <Text style={{ color: Colors.mutedForeground }}>○ PENDING</Text>
                        )}
                      </Text>

                      {/* ADDED: Skeleton loaders for pending/running states */}
                      {isOpen && status !== 'done' && (
                        <View style={styles.stepExpanded}>
                          <SkeletonLoader width="100%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
                          <SkeletonLoader width="85%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
                          <SkeletonLoader width="70%" height={14} borderRadius={4} style={{ marginBottom: 12 }} />
                          
                          {status === 'running' && (
                            <View style={styles.stepProgressTrack}>
                              <LinearGradient
                                colors={['#00F0FF', '#B847FF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.stepProgressFill, { width: `${progress % 100}%` as any }]}
                              />
                            </View>
                          )}
                          
                          <View style={styles.tagRow}>
                            <SkeletonLoader width={80} height={20} borderRadius={10} />
                            <SkeletonLoader width={70} height={20} borderRadius={10} />
                            <SkeletonLoader width={90} height={20} borderRadius={10} />
                          </View>
                        </View>
                      )}

                      {isOpen && status === 'done' && (
                        <View style={styles.stepExpanded}>
                          <Text style={styles.stepDesc}>{s.desc}</Text>
                          <View style={styles.tagRow}>
                            {['llm.reason', 'tool.call', 'memory.write'].map((t) => (
                              <View key={t} style={styles.tag}>
                                <Text style={styles.tagText}>{t}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>

                    <Feather
                      name="chevron-right"
                      size={16}
                      color={Colors.mutedForeground}
                      style={{
                        marginTop: 8,
                        transform: [{ rotate: isOpen ? '90deg' : '0deg' }],
                      }}
                    />
                  </GlassView>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Skip button */}
          <View style={styles.skipSection}>
            <TouchableOpacity
              onPress={() => router.push('/results')}
              activeOpacity={0.7}
            >
              <GlassView strong style={styles.skipBtn}>
                <Text style={styles.skipBtnText}>Skip to Results</Text>
                <Feather name="arrow-right" size={16} color={Colors.primary} />
              </GlassView>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Agent Trace Drawer (Modal) */}
      <Modal
        visible={showDrawer}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDrawer(false)}
      >
        <TouchableOpacity
          style={styles.drawerOverlay}
          activeOpacity={1}
          onPress={() => setShowDrawer(false)}
        >
          <View style={styles.drawerContent} onStartShouldSetResponder={() => true}>
            <View style={styles.drawerHeader}>
              <View>
                <Text style={styles.drawerTitle}>Agent Trace</Text>
                <Text style={styles.drawerSubtitle}>ANTIGRAVITY REASONING · {runId}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDrawer(false)}>
                <GlassView style={styles.drawerClose}>
                  <Text style={styles.drawerCloseText}>Close</Text>
                </GlassView>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.terminal} showsVerticalScrollIndicator={false}>
              {traceLogs.map((l, i) => (
                <Animated.Text
                  key={i}
                  entering={FadeInUp.delay(i * 60).duration(300)}
                  style={[styles.termLine, {
                    color: l.includes('[ok]') || l.includes('complete')
                      ? Colors.success
                      : l.includes('tool.call')
                        ? Colors.warning
                        : l.includes('[trace]') || l.includes('forecast')
                          ? Colors.primary
                          : Colors.foregroundAlpha80,
                  }]}
                >
                  {l}
                </Animated.Text>
              ))}
              {analysis.isLoading && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={{ color: Colors.primary, fontFamily: FontFamily.mono, fontSize: 11 }}>
                    pipeline running...
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  headerSection: { paddingHorizontal: 20, paddingTop: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: {
    fontFamily: FontFamily.display, fontSize: FontSize['2xl'], fontWeight: '700',
    color: Colors.foreground, lineHeight: 28,
  },
  pageSubtitle: { fontFamily: FontFamily.sans, fontSize: 12, color: Colors.mutedForeground, marginTop: 4 },
  logBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 9999,
    paddingHorizontal: 12, paddingVertical: 6, minHeight: 48,
  },
  logBtnText: {
    fontFamily: FontFamily.sans, fontSize: FontSize['10'], fontWeight: '600',
    color: Colors.foreground, textTransform: 'uppercase', letterSpacing: 1.2,
  },
  progressCard: { marginTop: 16, borderRadius: 16, padding: 16 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  phaseLabel: { fontFamily: FontFamily.mono, fontSize: 12, color: Colors.mutedForeground },
  phasePercent: { fontFamily: FontFamily.mono, fontSize: 12, color: Colors.primary },
  progressTrack: { marginTop: 8, height: 6, borderRadius: 9999, backgroundColor: Colors.muted, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 9999 },
  traceText: { fontFamily: FontFamily.sans, fontSize: FontSize['11'], color: Colors.mutedForeground, marginTop: 8 },
  traceId: { fontFamily: FontFamily.mono, color: Colors.foregroundAlpha80 },
  timeline: { marginTop: 24, paddingHorizontal: 20, position: 'relative' },
  timelineLine: { position: 'absolute', left: 34, top: 8, bottom: 8, width: 1 },
  stepCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: 16, padding: 12, marginBottom: 12,
  },
  nodeWrap: { position: 'relative', flexShrink: 0 },
  node: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nodeDone: { backgroundColor: Colors.successAlpha15 },
  nodeRunning: { ...Shadows.glowPrimary },
  nodePending: { backgroundColor: Colors.muted },
  nodePing: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 12, backgroundColor: Colors.primaryAlpha40,
  },
  stepContent: { flex: 1, minWidth: 0 },
  stepTitle: { fontFamily: FontFamily.sans, fontSize: 13, fontWeight: '600', color: Colors.foreground },
  stepStatus: {
    fontFamily: FontFamily.mono, fontSize: FontSize['11'],
    textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 2,
  },
  stepExpanded: { marginTop: 12 },
  stepDesc: { fontFamily: FontFamily.sans, fontSize: 12.5, lineHeight: 20, color: Colors.foregroundAlpha85 },
  stepProgressTrack: {
    marginTop: 10, height: 4, borderRadius: 9999,
    backgroundColor: Colors.muted, overflow: 'hidden',
  },
  stepProgressFill: { height: '100%', borderRadius: 9999 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { backgroundColor: Colors.card, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontFamily: FontFamily.mono, fontSize: FontSize['10'], color: Colors.mutedForeground },
  skipSection: { marginTop: 24, paddingHorizontal: 20 },
  skipBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14, minHeight: 48,
  },
  skipBtnText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: '600', color: Colors.foreground },
  drawerOverlay: { flex: 1, backgroundColor: Colors.blackAlpha70, justifyContent: 'flex-end' },
  drawerContent: {
    backgroundColor: 'rgba(17,20,31,0.95)', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: Colors.whiteAlpha10, padding: 20, maxHeight: '80%',
  },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  drawerTitle: { fontFamily: FontFamily.display, fontSize: FontSize.lg, fontWeight: '700', color: Colors.foreground },
  drawerSubtitle: {
    fontFamily: FontFamily.sans, fontSize: FontSize['10'], color: Colors.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  drawerClose: { borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 4 },
  drawerCloseText: { fontFamily: FontFamily.sans, fontSize: 12, color: Colors.foreground },
  terminal: { marginTop: 16, borderRadius: 12, backgroundColor: Colors.blackAlpha50, padding: 12, maxHeight: 300 },
  termLine: { fontFamily: FontFamily.mono, fontSize: FontSize['11'], lineHeight: 20 },
});
