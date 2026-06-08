import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FreeReadingReportResult, FreeReadingReportStatus } from '../model/freeReadingReport.types';

type Props = {
  status: FreeReadingReportStatus;
  report: FreeReadingReportResult | null;
  errorMessage?: string | null;
  onGenerate: () => void;
};

export function FreeReadingReportPanel({ status, report, errorMessage, onGenerate }: Props) {
  const isBusy = status === 'loading';
  const hasReport = status === 'success' && Boolean(report);

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>FREE READING REPORT</Text>
        <Text style={styles.title}>이번 달 내 독서를 한 번에 읽어주는 무료 리포트</Text>
        <Text style={styles.body}>
          흐름은 생성 요청과 상태/결과 조회로 분리되어 있습니다. 마이페이지에서 생성 후, 같은 자리에서 리포트 결과를 다시 확인하는 구조로 붙일 수 있습니다.
        </Text>
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.sectionLabel}>리포트 흐름</Text>
        <View style={styles.stepRow}>
          <Text style={styles.stepIndex}>01</Text>
          <Text style={styles.stepText}>무료 독서 리포트 생성 요청</Text>
        </View>
        <View style={styles.stepRow}>
          <Text style={styles.stepIndex}>02</Text>
          <Text style={styles.stepText}>상태와 결과 조회로 리포트 확인</Text>
        </View>
        <TouchableOpacity style={[styles.generateButton, (isBusy || hasReport) && styles.generateButtonDisabled]} disabled={isBusy || hasReport} onPress={onGenerate}>
          {isBusy ? (
            <ActivityIndicator color="#111" size="small" />
          ) : (
            <Text style={styles.generateButtonText}>{hasReport ? '리포트 생성 완료' : '무료 리포트 만들기'}</Text>
          )}
        </TouchableOpacity>
      </View>

      {status === 'idle' ? (
        <StateCard
          title="아직 생성된 무료 독서 리포트가 없어요."
          body="이번 달 저장 문장, 자주 남긴 감정과 키워드, 독서 흐름을 기준으로 무료 리포트를 만들어볼 수 있습니다."
        />
      ) : null}

      {status === 'loading' ? (
        <StateCard
          title="무료 독서 리포트를 생성하고 있어요."
          body="생성 요청 이후에는 상태/결과 조회 API를 다시 호출하면서 리포트 완성 여부를 확인하는 구조로 연결할 수 있습니다."
          tone="blue"
        />
      ) : null}

      {status === 'error' ? (
        <StateCard
          title="무료 독서 리포트 생성에 실패했어요."
          body={errorMessage ?? '네트워크 상태 또는 서버 처리 결과를 확인해주세요.'}
          tone="red"
        />
      ) : null}

      {status === 'success' && report ? (
        <>
          <View style={styles.reportCard}>
            <Text style={styles.sectionLabel}>리포트 요약</Text>
            <Text style={styles.reportHeadline}>{report.headline}</Text>
            <Text style={styles.reportSummary}>{report.summary}</Text>
            <Text style={styles.reportMeta}>
              reportId #{report.reportId} · {report.reportPeriod} · {report.status}
            </Text>
            {report.lastRunStatus ? <Text style={styles.reportMeta}>lastRunStatus: {report.lastRunStatus}</Text> : null}
          </View>

          {report.sections.length > 0 ? (
            <View style={styles.sectionList}>
              {report.sections.map((section) => (
                <View key={section.id} style={styles.sectionCard}>
                  <Text style={styles.sectionCardTitle}>{section.title}</Text>
                  <Text style={styles.sectionCardBody}>{section.body}</Text>
                </View>
              ))}
            </View>
          ) : null}
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
  tone?: 'default' | 'blue' | 'red';
}) {
  return (
    <View
      style={[
        styles.stateCard,
        tone === 'blue' && styles.stateCardBlue,
        tone === 'red' && styles.stateCardRed,
      ]}
    >
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, marginTop: 18 },
  hero: {
    borderWidth: 1,
    borderColor: '#44c3f3',
    backgroundColor: '#44c3f3',
    padding: 14,
    gap: 8,
  },
  eyebrow: { fontSize: 10, color: '#111', fontWeight: '900', letterSpacing: 0.8 },
  title: { fontSize: 20, lineHeight: 27, color: '#111', fontWeight: '900' },
  body: { fontSize: 12, lineHeight: 18, color: '#1d1d1d' },
  actionCard: {
    borderWidth: 1,
    borderColor: '#44c3f3',
    backgroundColor: '#fff',
    padding: 14,
    gap: 10,
  },
  sectionLabel: { fontSize: 11, color: '#111', fontWeight: '900' },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#dde7ec',
    backgroundColor: '#f6fbfd',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  stepIndex: { fontSize: 10, color: '#5a6770', fontWeight: '900' },
  stepText: { fontSize: 12, color: '#222', fontWeight: '700' },
  generateButton: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  generateButtonDisabled: { opacity: 0.6 },
  generateButtonText: { fontSize: 13, color: '#44c3f3', fontWeight: '900' },
  stateCard: {
    borderWidth: 1,
    borderColor: '#44c3f3',
    backgroundColor: '#fff',
    padding: 14,
    gap: 8,
  },
  stateCardBlue: { backgroundColor: '#eaf9ff' },
  stateCardRed: { backgroundColor: '#fff0f0' },
  stateTitle: { fontSize: 16, lineHeight: 22, color: '#111', fontWeight: '900' },
  stateBody: { fontSize: 12, lineHeight: 18, color: '#4c4c4c' },
  reportCard: {
    borderWidth: 1,
    borderColor: '#44c3f3',
    backgroundColor: '#fff',
    padding: 14,
    gap: 8,
  },
  reportHeadline: { fontSize: 18, lineHeight: 24, color: '#111', fontWeight: '900' },
  reportSummary: { fontSize: 13, lineHeight: 20, color: '#333' },
  reportMeta: { fontSize: 10, color: '#66737c' },
  sectionList: { gap: 10 },
  sectionCard: {
    borderWidth: 1,
    borderColor: '#44c3f3',
    backgroundColor: '#fff',
    padding: 14,
    gap: 6,
  },
  sectionCardTitle: { fontSize: 14, color: '#111', fontWeight: '800' },
  sectionCardBody: { fontSize: 12, lineHeight: 19, color: '#404040' },
});
