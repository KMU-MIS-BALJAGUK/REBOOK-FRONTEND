import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommunityAiTopicSet } from '../model/communityAiTopic.types';

type Props = {
  bookTitle: string;
  status: CommunityAiTopicSet['status'];
  topicSet: CommunityAiTopicSet | null;
  errorMessage?: string | null;
  onGenerate: () => void;
};

export function CommunityAiTopicsPanel({ bookTitle, status, topicSet, errorMessage, onGenerate }: Props) {
  const isBusy = status === 'loading';
  const hasGenerated = status === 'success' && Boolean(topicSet);
  const isGenerateDisabled = isBusy || hasGenerated;

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>COMMUNITY AI TOPICS</Text>
        <Text style={styles.title}>{bookTitle} 커뮤니티에서 바로 던질 만한 주제를 생성합니다.</Text>
        <Text style={styles.body}>
          흐름은 생성 요청, 상태 조회, 주제 세트 표시로 분리되어 있습니다. 이 화면에서는 최초 생성과 결과 조회만 다룹니다.
        </Text>
      </View>

      <View style={styles.flowCard}>
        <Text style={styles.sectionLabel}>생성 흐름</Text>
        <View style={styles.flowStep}>
          <Text style={styles.flowIndex}>01</Text>
          <Text style={styles.flowText}>책 기준으로 AI 주제 생성 요청</Text>
        </View>
        <View style={styles.flowStep}>
          <Text style={styles.flowIndex}>02</Text>
          <Text style={styles.flowText}>상태/주제 세트 조회로 결과 확인</Text>
        </View>
        <TouchableOpacity style={[styles.generateButton, isGenerateDisabled && styles.generateButtonDisabled]} disabled={isGenerateDisabled} onPress={onGenerate}>
          {isBusy ? <ActivityIndicator color="#111" size="small" /> : <Text style={styles.generateButtonText}>{hasGenerated ? '주제 세트 생성 완료' : '주제 세트 만들기'}</Text>}
        </TouchableOpacity>
      </View>

      {status === 'idle' ? (
        <StateCard title="아직 생성된 커뮤니티 주제가 없어요." body="책을 기준으로 커뮤니티에서 이야기할 만한 주제 세트를 먼저 생성해보세요." />
      ) : null}

      {status === 'loading' ? (
        <StateCard
          title="AI가 커뮤니티 주제를 정리하고 있어요."
          body="생성 요청 이후에는 조회 API를 폴링하면서 상태와 결과를 갱신하는 구조로 연결할 수 있습니다."
          tone="blue"
        />
      ) : null}

      {status === 'error' ? (
        <StateCard
          title="커뮤니티 주제 생성에 실패했어요."
          body={errorMessage ?? '네트워크 상태 또는 서버 처리 결과를 확인해주세요.'}
          tone="red"
        />
      ) : null}

      {status === 'empty' ? (
        <StateCard
          title="생성은 완료됐지만 주제 세트가 비어 있어요."
          body="응답은 정상이어도 결과가 비어 있을 수 있습니다. 이 화면에서는 재생성을 제공하지 않습니다."
          tone="yellow"
        />
      ) : null}

      {status === 'success' && topicSet ? (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.sectionLabel}>생성 결과</Text>
            <Text style={styles.summaryText}>{topicSet.topicCount ?? 0}개의 커뮤니티 주제 생성 완료</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>상태</Text>
              <Text style={styles.metaValue}>{topicSet.fetchStatus ?? '-'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>생성 시각</Text>
              <Text style={styles.metaValue}>{topicSet.generatedAt ?? '-'}</Text>
            </View>
            {topicSet.lastRunStatus ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>마지막 실행</Text>
                <Text style={styles.metaValue}>{topicSet.lastRunStatus}</Text>
              </View>
            ) : null}
          </View>

          {topicSet.featuredQuote ? (
            <View style={styles.summaryCard}>
              <Text style={styles.sectionLabel}>대표 문장</Text>
              <Text style={styles.summaryText}>“{topicSet.featuredQuote.quoteText}”</Text>
            </View>
          ) : null}

          <View style={styles.topicList}>
            {topicSet.topics.map((topic, index) => (
              <View key={topic.id} style={styles.topicCard}>
                <View style={styles.topicTop}>
                  <Text style={styles.topicIndex}>{String(index + 1).padStart(2, '0')}</Text>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                </View>
                <Text style={styles.topicDescription}>{topic.description}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

function StateCard({
  title,
  body,
  tone = 'default',
}: {
  title: string;
  body: string;
  tone?: 'default' | 'blue' | 'red' | 'yellow';
}) {
  return (
    <View
      style={[
        styles.stateCard,
        tone === 'blue' && styles.stateCardBlue,
        tone === 'red' && styles.stateCardRed,
        tone === 'yellow' && styles.stateCardYellow,
      ]}
    >
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  hero: {
    borderWidth: 1.5,
    borderColor: '#111',
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 8,
  },
  eyebrow: { fontSize: 10, color: '#111', fontWeight: '900', letterSpacing: 0.8 },
  title: { fontSize: 20, lineHeight: 27, color: '#111', fontWeight: '900' },
  body: { fontSize: 12, lineHeight: 18, color: '#66707a' },
  flowCard: {
    borderWidth: 1.5,
    borderColor: '#111',
    backgroundColor: '#fff',
    padding: 14,
    gap: 10,
  },
  sectionLabel: { fontSize: 11, color: '#111', fontWeight: '900' },
  flowStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  flowIndex: { fontSize: 10, color: '#66707a', fontWeight: '900' },
  flowText: { fontSize: 12, color: '#111', fontWeight: '700' },
  generateButton: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: '#111',
    backgroundColor: '#44c3f3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  generateButtonDisabled: { opacity: 0.7 },
  generateButtonText: { fontSize: 14, color: '#111', fontWeight: '900' },
  stateCard: {
    borderWidth: 1.5,
    borderColor: '#111',
    backgroundColor: '#fff',
    padding: 14,
    gap: 8,
  },
  stateCardBlue: { backgroundColor: '#eef8fd' },
  stateCardRed: { backgroundColor: '#fff' },
  stateCardYellow: { backgroundColor: '#fff' },
  stateTitle: { fontSize: 16, lineHeight: 22, color: '#171512', fontWeight: '900' },
  stateBody: { fontSize: 12, lineHeight: 18, color: '#66707a' },
  summaryCard: {
    borderWidth: 1.5,
    borderColor: '#111',
    backgroundColor: '#fff',
    padding: 14,
    gap: 8,
  },
  summaryText: { fontSize: 14, lineHeight: 21, color: '#171512', fontWeight: '700' },
  generatedAt: { fontSize: 10, color: '#66707a' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  metaLabel: { fontSize: 11, color: '#66707a', fontWeight: '700' },
  metaValue: { fontSize: 12, color: '#171512', fontWeight: '800' },
  topicList: { gap: 10 },
  topicCard: {
    borderWidth: 1.5,
    borderColor: '#111',
    backgroundColor: '#fff',
    padding: 14,
    gap: 10,
  },
  topicTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topicIndex: { fontSize: 11, color: '#111', fontWeight: '900', backgroundColor: '#44c3f3', paddingHorizontal: 7, paddingVertical: 5, overflow: 'hidden' },
  topicTitle: { flex: 1, fontSize: 16, color: '#171512', fontWeight: '900' },
  topicDescription: { fontSize: 12, lineHeight: 19, color: '#66707a' },
  promptWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  promptChip: { borderWidth: 1, borderColor: '#111', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 7 },
  promptChipText: { fontSize: 11, color: '#111', fontWeight: '700' },
});
