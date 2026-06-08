import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FreeReadingReportResult } from '../model/freeReadingReport.types';

type Props = {
  report: FreeReadingReportResult;
};

export function FreeReadingReportResultView({ report }: Props) {
  return (
    <View style={styles.resultWrap}>
      <Text style={styles.description}>
        {'• 지금의 나에게 맞는 독서 해석을 먼저 보여줘요\n'}
        {'• 어떤 흐름이 반복되는지, 무엇이 달라졌는지 한 번에 볼 수 있어요\n'}
        {'• 다음 읽을 책이나 읽는 방식의 참고점으로 활용할 수 있어요'}
      </Text>

      <View style={styles.reportCard}>
        <Text style={styles.sectionLabel}>리포트 요약</Text>
        <Text style={styles.reportHeadline}>{report.headline}</Text>
        <Text style={styles.reportSummary}>{report.summary || '당신의 독서 흐름을 더 잘 이해할 수 있도록 정리해드려요.'}</Text>
        <Text style={styles.reportMeta}>
          리포트 번호 #{report.reportId} · 리포트 기간 {report.reportPeriod} · {report.status}
        </Text>
        {report.lastRunStatus ? <Text style={styles.reportMeta}>마지막 실행: {report.lastRunStatus}</Text> : null}
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
    </View>
  );
}

const styles = StyleSheet.create({
  resultWrap: { gap: 12 },
  description: { fontSize: 12, lineHeight: 18, color: '#66707a' },
  reportCard: {
    borderWidth: 1,
    borderColor: '#44c3f3',
    backgroundColor: '#fff',
    padding: 14,
    gap: 8,
  },
  sectionLabel: { fontSize: 11, color: '#111', fontWeight: '900' },
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
