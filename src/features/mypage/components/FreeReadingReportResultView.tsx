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
        {report.subheadline ? <Text style={styles.reportSubheadline}>{report.subheadline}</Text> : null}
        {report.openingMessage ? <Text style={styles.reportOpening}>{report.openingMessage}</Text> : null}
        <Text style={styles.reportSummary}>{report.summary || '당신의 독서 흐름을 더 잘 이해할 수 있도록 정리해드려요.'}</Text>
      </View>

      {report.readingPatternSummary ? (
        <SectionCard title={report.readingPatternSummary.title} body={report.readingPatternSummary.body} />
      ) : null}

      {report.topThemes.length > 0 ? (
        <View style={styles.sectionList}>
          <Text style={styles.sectionGroupTitle}>주요 테마</Text>
          {report.topThemes.map((theme, index) => (
            <View key={`${theme.theme}-${index}`} style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>{theme.theme}</Text>
              <Text style={styles.sectionCardBody}>{theme.description}</Text>
              {theme.relatedQuotes.length > 0 ? (
                <View style={styles.quotePills}>
                  {theme.relatedQuotes.map((quote, quoteIndex) => (
                    <View key={`${quote}-${quoteIndex}`} style={styles.quotePill}>
                      <Text style={styles.quotePillText}>{quote}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {report.emotionProfile ? (
        <View style={styles.sectionList}>
          <Text style={styles.sectionGroupTitle}>{report.emotionProfile.title}</Text>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionCardBody}>{report.emotionProfile.body}</Text>
            <View style={styles.emotionTagRow}>
              {report.emotionProfile.mainEmotions.map((emotion) => (
                <View key={emotion} style={styles.emotionTag}>
                  <Text style={styles.emotionTagText}>{emotion}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : null}

      {report.representativeQuotes.length > 0 ? (
        <View style={styles.sectionList}>
          <Text style={styles.sectionGroupTitle}>대표 문장</Text>
          {report.representativeQuotes.map((item, index) => (
            <View key={`${item.bookTitle}-${index}`} style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>{item.bookTitle}</Text>
              <Text style={styles.sectionCardBody}>{item.quote}</Text>
              <Text style={styles.sectionCardMeta}>{item.reason}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {report.personalInsights.length > 0 ? (
        <View style={styles.sectionList}>
          <Text style={styles.sectionGroupTitle}>개인 인사이트</Text>
          {report.personalInsights.map((item) => (
            <View key={item.title} style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>{item.title}</Text>
              <Text style={styles.sectionCardBody}>{item.body}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {report.reflectionQuestions.length > 0 ? (
        <View style={styles.sectionList}>
          <Text style={styles.sectionGroupTitle}>되돌아볼 질문</Text>
          {report.reflectionQuestions.map((question, index) => (
            <View key={`${question}-${index}`} style={styles.questionCard}>
              <Text style={styles.questionText}>{question}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {report.shareCard ? (
        <View style={styles.shareCard}>
          <Text style={styles.sectionGroupTitle}>공유 카드</Text>
          <Text style={styles.shareHeadline}>{report.shareCard.headline}</Text>
          <Text style={styles.shareSubtext}>{report.shareCard.subtext}</Text>
        </View>
      ) : null}

      {report.closingMessage ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardBody}>{report.closingMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

function SectionCard({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.sectionList}>
      <Text style={styles.sectionGroupTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionCardBody}>{body}</Text>
      </View>
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
  reportSubheadline: { fontSize: 13, lineHeight: 20, color: '#3f4b55', fontWeight: '700' },
  reportOpening: { fontSize: 12, lineHeight: 18, color: '#66707a' },
  reportSummary: { fontSize: 13, lineHeight: 20, color: '#333' },
  reportMeta: { fontSize: 10, color: '#66737c' },
  sectionList: { gap: 10 },
  sectionGroupTitle: { fontSize: 12, color: '#111', fontWeight: '900' },
  sectionCard: {
    borderWidth: 1,
    borderColor: '#44c3f3',
    backgroundColor: '#fff',
    padding: 14,
    gap: 6,
  },
  sectionCardTitle: { fontSize: 14, color: '#111', fontWeight: '800' },
  sectionCardBody: { fontSize: 12, lineHeight: 19, color: '#404040' },
  sectionCardMeta: { fontSize: 11, color: '#66707a' },
  quotePills: { gap: 6, marginTop: 2 },
  quotePill: {
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#f9fcfe',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  quotePillText: { fontSize: 11, lineHeight: 17, color: '#111' },
  emotionTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  emotionTag: {
    borderWidth: 1,
    borderColor: '#44c3f3',
    backgroundColor: '#44c3f3',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  emotionTagText: { fontSize: 11, color: '#111', fontWeight: '800' },
  questionCard: {
    borderWidth: 1,
    borderColor: '#dbe3ea',
    backgroundColor: '#fff',
    padding: 12,
  },
  questionText: { fontSize: 12, lineHeight: 18, color: '#111' },
  shareCard: {
    borderWidth: 1,
    borderColor: '#44c3f3',
    backgroundColor: '#eef8fd',
    padding: 14,
    gap: 8,
  },
  shareHeadline: { fontSize: 16, color: '#111', fontWeight: '900' },
  shareSubtext: { fontSize: 12, color: '#404040', lineHeight: 18 },
});
