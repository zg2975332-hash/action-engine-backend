import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from 'expo-document-picker';

import { AppHeader } from '@/components/AppHeader';
import { GlassView } from '@/components/GlassView';
import { NeonBorderView } from '@/components/NeonBorderView';
import { Colors, Shadows, FontFamily, FontSize, Gradients } from '@/constants/theme';
import { useAnalysis } from '@/context/AnalysisContext';
import { analyzeContent, healthCheck } from '@/services/api';

const tabs = [
  { id: 'text' as const, label: 'Text', icon: 'file-text' as const },
  { id: 'pdf' as const, label: 'PDF Upload', icon: 'upload' as const },
  { id: 'url' as const, label: 'URL', icon: 'link-2' as const },
];

const samples = [
  { icon: 'trending-down' as const, color: Colors.warning, text: 'Sales report showing 25% decline in Lahore region. Q3 revenue dropped from $500K to $375K due to supply chain delays affecting 12 key SKUs. Customer satisfaction scores fell 8 points. Regional team reports increased competitor activity.' },
  { icon: 'droplet' as const, color: Colors.primary, text: 'Fuel prices increased by Rs. 15 per liter nationwide. Logistics companies report 12% rise in delivery costs. E-commerce platforms seeing 8% drop in orders due to higher shipping fees. Government considering subsidy for essential goods transport.' },
  { icon: 'cloud-rain' as const, color: Colors.secondary, text: 'Flood warning issued for Karachi region. 3 major warehouses at risk of damage. Insurance claims expected to rise 40%. Supply routes from port disrupted, affecting 200+ businesses. Emergency procurement needed for 50,000 relief packages.' },
];

// Fallback data when backend is unavailable
const FALLBACK_RESPONSE = {
  run_id: 'af_demo01',
  processing_time: '4.3s',
  traces: [
    { agent: 'content_parser', timestamp: 0.2, type: 'reasoning' as const, content: 'Parsing input text, identifying domain as business/sales...' },
    { agent: 'content_parser', timestamp: 0.8, type: 'reasoning' as const, content: 'Extracted 4 key facts, 3 entities, 2 anomalies' },
    { agent: 'insight_extractor', timestamp: 1.2, type: 'reasoning' as const, content: 'Identified revenue collapse pattern in Lahore region' },
    { agent: 'impact_analyzer', timestamp: 2.0, type: 'reasoning' as const, content: 'Quantified $312K revenue shortfall, 8-point trust decline' },
    { agent: 'action_generator', timestamp: 2.8, type: 'reasoning' as const, content: 'Generated 3 prioritized actions with cost/benefit analysis' },
    { agent: 'simulation_engine', timestamp: 3.5, type: 'tool_call' as const, tool: 'mock_api_call', content: 'Tool called: mock_api_call' },
    { agent: 'simulation_engine', timestamp: 3.8, type: 'tool_call' as const, tool: 'generate_notification', content: 'Tool called: generate_notification' },
    { agent: 'simulation_engine', timestamp: 4.0, type: 'tool_call' as const, tool: 'update_dashboard', content: 'Tool called: update_dashboard' },
    { agent: 'outcome_visualizer', timestamp: 4.3, type: 'reasoning' as const, content: 'Compiled final report: +25% lift, 94% confidence' },
  ],
  parsed_content: {},
  insights: [
    { id: 'insight_1', severity: 'High' as const, title: 'Revenue collapse in Lahore region', description: 'Orders declined 25% correlating with supply chain disruption in Q2. Projected $312K shortfall this quarter.', evidence: ['25% order decline', 'Supply chain delays', 'Q3 revenue $375K vs $500K'], icon: 'trending-down' },
    { id: 'insight_2', severity: 'Medium' as const, title: 'Inventory misalignment across 12 SKUs', description: 'Top-selling SKUs approaching 7-day depletion while low-demand items remain over-stocked.', evidence: ['12 SKUs at risk', 'Inventory imbalance'], icon: 'alert-triangle' },
    { id: 'insight_3', severity: 'Low' as const, title: 'Competitor market capture opportunity', description: 'Regional competitor activity increased but customer loyalty metrics remain stable — window for counter-action.', evidence: ['Competitor activity up', 'Loyalty stable'], icon: 'activity' },
  ],
  impact_analysis: [
    { insight_id: 'insight_1', revenue_impact: 'Projected $312K shortfall this quarter', operational_risk: 'Supply chain for 12 SKUs at risk of depletion within 7 days', customer_trust: 'Customer satisfaction score expected to drop 8 points', time_sensitivity: 'Critical - action needed within 48 hours', cascade_effects: ['Regional team morale decline', 'Competitor market capture'], impact_summary: 'Lahore revenue collapse threatens $312K quarterly loss with cascading ops and trust effects' },
  ],
  actions: [
    { id: 'action_1', title: 'Launch 15% targeted promo in Lahore', description: 'Deploy a time-limited regional discount campaign targeting the Lahore market.', projected_lift: '+25%', reasoning: 'Step-by-step: 1) Orders declined 25% in Lahore. 2) Impact analysis shows $312K revenue loss. 3) Historical data shows regional promos recover 60-80% of lost orders. 4) A 15% discount balances margin preservation with volume recovery.', priority: 'High', simulation_target: { metric: 'monthly_sales', before_value: 1000, projected_after: 1250, unit: 'units' }, estimated_cost: '$15,000', timeline: '7-14 days' },
    { id: 'action_2', title: 'Auto-rebalance inventory to top SKUs', description: 'Redistribute stock from over-supplied items to high-demand SKUs.', projected_lift: '+12%', reasoning: 'Inventory data shows 12 fast-moving SKUs near depletion while slow movers are overstocked.', priority: 'Medium', simulation_target: { metric: 'inventory_efficiency', before_value: 60, projected_after: 85, unit: '%' }, estimated_cost: '$5,000', timeline: '3 days' },
    { id: 'action_3', title: 'Shift 30% ad spend to organic channels', description: 'Redirect paid social budget to organic referral programs.', projected_lift: '+9%', reasoning: 'Paid social CAC up 18% while organic referrals are underutilized. Shifting budget improves ROI.', priority: 'Low', simulation_target: { metric: 'cac', before_value: 45, projected_after: 35, unit: 'USD' }, estimated_cost: '$2,000', timeline: '14 days' },
  ],
  simulation_result: {
    action_simulated: 'Launch 15% targeted promo in Lahore',
    status: 'complete',
    execution_logs: ['[sim] sandbox.boot ok', '[sim] action.dispatch -> promo.lahore.v3', '[net] POST /api/campaigns/create 312ms', '[mesh] 4 agents converged', '[trace] forecast.lift = +25.0%', '[ok] simulation complete ROI=2.4x'],
    before_state: { sales: 1000, revenue: 50000 },
    after_state: { sales: 1250, revenue: 62500 },
    net_lift: '+25%',
    api_calls: [], notifications: [], dashboard_updates: [],
  },
  final_outcome: {
    run_id: 'af_demo01', confidence_score: 94, processing_time: '4.3s',
    summary: 'Analysis identified critical revenue decline in Lahore region and generated a targeted promotional campaign projected to recover 25% of lost sales.',
    before_state: { sales: 1000, revenue: 50000, description: 'Pre-action baseline' },
    after_state: { sales: 1250, revenue: 62500, description: 'Projected post-campaign' },
    net_lift_percent: 25, roi_estimate: '2.4x', system_changes: ['Campaign created', 'Notifications sent', 'Dashboard updated'],
    agent_pipeline: [
      { step: 1, agent: 'Content Parser', status: 'complete', duration: '0.8s' },
      { step: 2, agent: 'Insight Extractor', status: 'complete', duration: '1.2s' },
      { step: 3, agent: 'Impact Analyzer', status: 'complete', duration: '0.9s' },
      { step: 4, agent: 'Action Generator', status: 'complete', duration: '1.1s' },
      { step: 5, agent: 'Simulation Engine', status: 'complete', duration: '1.5s' },
      { step: 6, agent: 'Outcome Visualizer', status: 'complete', duration: '0.6s' },
    ],
  },
};

type TabId = (typeof tabs)[number]['id'];

export default function InputHub() {
  const router = useRouter();
  const analysis = useAnalysis();
  const [tab, setTab] = useState<TabId>('text');
  const [content, setContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [pdfBase64, setPdfBase64] = useState('');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [isRomanUrdu, setIsRomanUrdu] = useState(false); // ADDED: Roman Urdu toggle state
  
  // Get mode from context
  const currentMode = analysis.mode;

  // Check backend health on mount
  useEffect(() => {
    healthCheck().then(setBackendOnline);
  }, []);

  // Pulse glow animation for CTA
  const pulseGlow = useSharedValue(0);
  useEffect(() => {
    pulseGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, []);

  const ctaGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.4 + pulseGlow.value * 0.3,
    shadowRadius: 20 + pulseGlow.value * 44,
  }));

  // PDF picker
  const handlePickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setPdfName(file.name);
        setContent(`[PDF uploaded: ${file.name}]`);
        Toast.show({ type: 'success', text1: 'PDF Loaded', text2: file.name });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not pick PDF file' });
    }
  };

  const handleTransform = async () => {
    let inputContent = '';
    let inputType = tab;

    if (tab === 'url') {
      inputContent = urlInput;
    } else if (tab === 'pdf') {
      inputContent = pdfName || content;
    } else {
      inputContent = content;
    }

    if (!inputContent.trim() && !pdfBase64) {
      Toast.show({ type: 'error', text1: 'No content', text2: 'Please enter some content to analyze.' });
      return;
    }

    analysis.setLoading(true);
    analysis.setContent(inputContent, tab);

    // Navigate to process screen immediately (shows loading animation)
    router.push('/process');

    try {
      // Check if user selected demo mode
      if (currentMode === 'demo') {
        console.log('Demo mode selected, using fallback data');
        Toast.show({
          type: 'info',
          text1: 'Demo Mode',
          text2: 'Using simulated AI data',
        });
        
        // Simulate a delay to show the process animation
        await new Promise((r) => setTimeout(r, 3000));
        analysis.setResults(FALLBACK_RESPONSE as any);
        return;
      }
      
      // Try the real backend API
      const result = await analyzeContent(
        inputContent,
        tab,
        tab === 'pdf' ? pdfBase64 : undefined,
        isRomanUrdu, // ADDED: Pass Roman Urdu flag
      );
      analysis.setResults(result);
    } catch (err: any) {
      console.log('Backend unavailable, using demo data:', err.message);

      // Fallback to demo data — app still works fully!
      Toast.show({
        type: 'info',
        text1: 'Demo Mode',
        text2: 'Using simulated AI data (backend offline)',
      });

      // Simulate a delay to show the process animation
      await new Promise((r) => setTimeout(r, 3000));
      analysis.setResults(FALLBACK_RESPONSE as any);
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(500).easing(Easing.bezier(0.2, 0.8, 0.2, 1) as any)}>
        <AppHeader />

        {/* Hero */}
        <View style={styles.hero}>
          <GlassView style={styles.chip}>
            <Feather name="star" size={12} color={Colors.primary} />
            <Text style={styles.chipText}>CONTENT-TO-ACTION ENGINE</Text>
          </GlassView>

          <Text style={styles.heroTitle}>
            Paste any report,{'\n'}
            <Text style={styles.heroGradientText}>article, or news...</Text>
          </Text>

          <Text style={styles.heroDesc}>
            AetherFlow's autonomous agents extract insights, simulate impact, and execute
            actions — in seconds.
          </Text>

          {/* Backend status indicator */}
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: backendOnline === true ? Colors.success : backendOnline === false ? Colors.warning : Colors.mutedForeground }]} />
            <Text style={styles.statusText}>
              {backendOnline === true ? 'Backend Connected (Live AI)' : backendOnline === false ? 'Demo Mode (Offline)' : 'Checking backend...'}
            </Text>
          </View>
          
          {/* Mode Toggle */}
          <View style={styles.modeToggleContainer}>
            <Text style={styles.modeLabel}>Mode:</Text>
            <View style={styles.modeButtons}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => analysis.setMode('demo')}
                style={[
                  styles.modeButton,
                  currentMode === 'demo' && styles.modeButtonActive,
                ]}
              >
                <Feather 
                  name="play-circle" 
                  size={14} 
                  color={currentMode === 'demo' ? Colors.primaryForeground : Colors.mutedForeground} 
                />
                <Text style={[
                  styles.modeButtonText,
                  currentMode === 'demo' && styles.modeButtonTextActive,
                ]}>
                  Demo
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => analysis.setMode('real')}
                style={[
                  styles.modeButton,
                  currentMode === 'real' && styles.modeButtonActive,
                ]}
              >
                <Feather 
                  name="zap" 
                  size={14} 
                  color={currentMode === 'real' ? Colors.primaryForeground : Colors.mutedForeground} 
                />
                <Text style={[
                  styles.modeButtonText,
                  currentMode === 'real' && styles.modeButtonTextActive,
                ]}>
                  Real
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.section}>
          <GlassView style={styles.tabBar}>
            {tabs.map(({ id, label, icon }) => {
              const active = tab === id;
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => setTab(id)}
                  activeOpacity={0.7}
                  style={styles.tabBtn}
                >
                  {active && (
                    <LinearGradient
                      colors={['#00F0FF', '#B847FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[StyleSheet.absoluteFill, styles.tabActiveBg]}
                    />
                  )}
                  <Feather
                    name={icon}
                    size={14}
                    color={active ? Colors.primaryForeground : Colors.mutedForeground}
                    style={{ zIndex: 1 }}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: active ? Colors.primaryForeground : Colors.mutedForeground },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </GlassView>

          {/* Input zones */}
          <View style={styles.inputZone}>
            {tab === 'text' && (
              <>
                <NeonBorderView style={styles.textAreaWrap} borderRadius={16}>
                  <View style={styles.textAreaInner}>
                    <TextInput
                      value={content}
                      onChangeText={setContent}
                      placeholder={"Paste your content here...\n\ne.g. 'Q3 revenue dropped 18% in our Lahore branch due to supply chain delays...'"}
                      placeholderTextColor={Colors.mutedForeground}
                      multiline
                      style={styles.textArea}
                      textAlignVertical="top"
                    />
                  </View>
                </NeonBorderView>
                
                {/* ADDED: Roman Urdu Toggle */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsRomanUrdu(!isRomanUrdu)}
                  style={styles.romanUrduToggle}
                >
                  <View style={[styles.toggleTrack, isRomanUrdu && styles.toggleTrackActive]}>
                    <Animated.View
                      style={[
                        styles.toggleThumb,
                        {
                          transform: [{ translateX: isRomanUrdu ? 20 : 0 }],
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.toggleLabel}>
                    Roman Urdu {isRomanUrdu ? '(ON)' : '(OFF)'}
                  </Text>
                  <Text style={styles.toggleHint}>
                    {isRomanUrdu ? '✓ Will translate to English' : 'Use for: "mujhe sales report dekhni hai"'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {tab === 'pdf' && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.pdfZone}
                onPress={handlePickPDF}
              >
                <LinearGradient
                  colors={['#00F0FF', '#B847FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.pdfIcon}
                >
                  <Feather name={pdfName ? 'check' : 'upload'} size={24} color={Colors.primaryForeground} />
                </LinearGradient>
                <Text style={styles.pdfTitle}>
                  {pdfName || 'Tap to upload PDF'}
                </Text>
                <Text style={styles.pdfSub}>
                  {pdfName ? 'Tap to change file' : 'Select a PDF document · max 25MB'}
                </Text>
              </TouchableOpacity>
            )}

            {tab === 'url' && (
              <NeonBorderView borderRadius={16}>
                <View style={styles.urlRow}>
                  <View style={styles.urlIconWrap}>
                    <Feather name="link-2" size={16} color={Colors.primary} />
                  </View>
                  <TextInput
                    value={urlInput}
                    onChangeText={setUrlInput}
                    placeholder="https://example.com/article"
                    placeholderTextColor={Colors.mutedForeground}
                    style={styles.urlInput}
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                </View>
              </NeonBorderView>
            )}
          </View>
        </View>

        {/* Samples */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TRY A SAMPLE</Text>
          <View style={styles.sampleList}>
            {samples.map((s, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => { setTab('text'); setContent(s.text); }}
                activeOpacity={0.7}
              >
                <GlassView style={styles.sampleItem}>
                  <View style={[styles.sampleIcon, { backgroundColor: Colors.card }]}>
                    <Feather name={s.icon} size={16} color={s.color} />
                  </View>
                  <Text style={styles.sampleText} numberOfLines={2}>{s.text}</Text>
                  <Feather name="arrow-right" size={16} color={Colors.mutedForeground} />
                </GlassView>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={[styles.section, { marginTop: 28 }]}>
          <Animated.View style={[styles.ctaShadow, ctaGlowStyle]}>
            <TouchableOpacity
              onPress={handleTransform}
              activeOpacity={0.85}
              disabled={analysis.isLoading}
            >
              <LinearGradient
                colors={['#00F0FF', '#B847FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaBtn}
              >
                {analysis.isLoading ? (
                  <ActivityIndicator color={Colors.primaryForeground} />
                ) : (
                  <>
                    <Text style={styles.ctaText}>Transform to Action</Text>
                    <Feather name="arrow-right" size={16} color={Colors.primaryForeground} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.poweredBy}>
            POWERED BY ANTIGRAVITY AGENT MESH
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  hero: { paddingHorizontal: 20, paddingTop: 16 },
  chip: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    gap: 6, borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 4,
  },
  chipText: {
    fontFamily: FontFamily.sans, fontSize: FontSize['10'], fontWeight: '500',
    color: Colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 1.5,
  },
  heroTitle: {
    fontFamily: FontFamily.display, fontSize: 34, fontWeight: '700',
    lineHeight: 36, letterSpacing: -0.7, color: Colors.foreground, marginTop: 12,
  },
  heroGradientText: { color: Colors.primary },
  heroDesc: {
    fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 22,
    color: Colors.mutedForeground, marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: {
    fontFamily: FontFamily.mono, fontSize: FontSize['10'],
    color: Colors.mutedForeground, letterSpacing: 0.5,
  },
  section: { marginTop: 24, paddingHorizontal: 20 },
  tabBar: { flexDirection: 'row', borderRadius: 16, padding: 4 },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 10,
    minHeight: 48, overflow: 'hidden',
  },
  tabActiveBg: { borderRadius: 12, ...Shadows.glowPrimary },
  tabLabel: { fontFamily: FontFamily.sans, fontSize: 12, fontWeight: '500', zIndex: 1 },
  inputZone: { marginTop: 16 },
  textAreaWrap: { backgroundColor: Colors.card },
  textAreaInner: { backgroundColor: Colors.card, borderRadius: 15 },
  textArea: {
    height: 176, padding: 16, fontFamily: FontFamily.sans, fontSize: FontSize.sm,
    lineHeight: 22, color: Colors.foreground,
  },
  // ADDED: Roman Urdu Toggle Styles
  romanUrduToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.mutedForeground + '40',
    padding: 2,
  },
  toggleTrackActive: {
    backgroundColor: Colors.primary + '80',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.foreground,
  },
  toggleLabel: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.foreground,
  },
  toggleHint: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize['10'],
    color: Colors.mutedForeground,
  },
  pdfZone: {
    height: 176, alignItems: 'center', justifyContent: 'center', borderRadius: 16,
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.primaryAlpha40,
    backgroundColor: 'rgba(17,20,31,0.4)',
  },
  pdfIcon: {
    width: 56, height: 56, borderRadius: 16, alignItems: 'center',
    justifyContent: 'center', ...Shadows.glowPrimary,
  },
  pdfTitle: {
    fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: '600',
    color: Colors.foreground, marginTop: 12,
  },
  pdfSub: { fontFamily: FontFamily.sans, fontSize: 12, color: Colors.mutedForeground },
  urlRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.card, borderRadius: 15, paddingHorizontal: 6,
  },
  urlIconWrap: { paddingLeft: 12 },
  urlInput: {
    flex: 1, paddingHorizontal: 4, paddingVertical: 12,
    fontFamily: FontFamily.sans, fontSize: FontSize.sm, color: Colors.foreground,
  },
  sectionLabel: {
    fontFamily: FontFamily.sans, fontSize: FontSize['11'], fontWeight: '600',
    color: Colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 1.5,
    marginBottom: 10,
  },
  sampleList: { gap: 8 },
  sampleItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, minHeight: 48,
  },
  sampleIcon: {
    width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  sampleText: { flex: 1, fontFamily: FontFamily.sans, fontSize: 13, color: Colors.foregroundAlpha90 },
  ctaShadow: {
    borderRadius: 16, shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 }, elevation: 12,
  },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 16, paddingHorizontal: 24, paddingVertical: 16, minHeight: 48,
  },
  ctaText: {
    fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: '600',
    color: Colors.primaryForeground,
  },
  poweredBy: {
    fontFamily: FontFamily.sans, fontSize: FontSize['10'], fontWeight: '500',
    color: Colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 1.5,
    textAlign: 'center', marginTop: 12,
  },
  // Mode Toggle Styles
  modeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    paddingVertical: 8,
  },
  modeLabel: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.foreground,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modeButtonText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.mutedForeground,
  },
  modeButtonTextActive: {
    color: Colors.primaryForeground,
  },
});
