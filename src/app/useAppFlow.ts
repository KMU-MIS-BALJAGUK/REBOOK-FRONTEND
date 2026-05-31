import { useMemo, useState } from 'react';
import { HomeTabKey, RegisterType, ScreenKey, StepKey } from './types';
import { AuthSession } from '../features/onboarding/model/auth.types';

const TOTAL_STEPS = 5;

export function useAppFlow() {
  const [screen, setScreen] = useState<ScreenKey>('onboarding');
  const [step, setStep] = useState<number>(0);
  const [nickname, setNickname] = useState<string>('');
  const [bookTitle, setBookTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [selectedRecordOption, setSelectedRecordOption] = useState<string>('now');
  const [selectedMood, setSelectedMood] = useState<string>('cozy');
  const [homeTab, setHomeTab] = useState<HomeTabKey>('all');
  const [registerType, setRegisterType] = useState<RegisterType>('manual');
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);

  const stepKey = useMemo<StepKey>(() => {
    if (step === 0) return 'intro';
    if (step === 1) return 'nickname';
    if (step === 2) return 'book';
    if (step === 3) return 'mood';
    return 'done';
  }, [step]);

  const isNextDisabled =
    (stepKey === 'nickname' && nickname.trim().length < 2) ||
    (stepKey === 'book' && selectedRecordOption === 'now' && (!bookTitle.trim() || !author.trim()));

  const goNext = () => {
    if (step === TOTAL_STEPS - 1) {
      setScreen('home');
      return;
    }
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
  };

  const goPrev = () => setStep((prev) => Math.max(prev - 1, 0));

  return {
    state: {
      screen,
      step,
      stepKey,
      nickname,
      bookTitle,
      author,
      selectedRecordOption,
      selectedMood,
      homeTab,
      registerType,
      authSession,
      isNextDisabled,
      totalSteps: TOTAL_STEPS,
    },
    actions: {
      setScreen,
      setNickname,
      setBookTitle,
      setAuthor,
      setSelectedRecordOption,
      setSelectedMood,
      setHomeTab,
      setRegisterType,
      setAuthSession,
      goNext,
      goPrev,
    },
  };
}
